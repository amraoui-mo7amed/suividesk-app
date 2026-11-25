import * as Network from 'expo-network';
import {
  getEmployees,
  getTasks,
  getRawTasks,
  saveRawEmployees,
  saveRawTasks,
  getDeviceId,
  saveLastPcIp,
  getLastPcIp
} from './storage';
import { SyncPreviewData, SyncResult, Employee, TaskItem, DiscoveredPeer } from '../types';

/**
 * Checks a specific host IP on port 4850 for an active SuiviDesk Sync service.
 */
export async function checkPeer(ip: string, port = 4850, timeoutMs = 800): Promise<DiscoveredPeer | null> {
  const cleanIp = ip.trim();
  if (!cleanIp) return null;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`http://${cleanIp}:${port}/api/sync/info`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal
    });
    clearTimeout(id);
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.deviceId) {
      return {
        ip: cleanIp,
        port,
        name: data.workstationName || `PC-${cleanIp}`,
        deviceId: data.deviceId,
        version: data.version
      };
    }
    return null;
  } catch {
    clearTimeout(id);
    return null;
  }
}

/**
 * Automatically discovers all active SuiviDesk PCs connected within the same Wi-Fi / local network.
 * Calls onPeerDiscovered progressively as each PC is found so the UI updates instantly.
 */
export async function scanLanForPcs(
  onPeerDiscovered?: (peer: DiscoveredPeer) => void
): Promise<DiscoveredPeer[]> {
  const peers: DiscoveredPeer[] = [];
  const seenIps = new Set<string>();

  const registerPeer = (peer: DiscoveredPeer) => {
    if (!seenIps.has(peer.ip)) {
      seenIps.add(peer.ip);
      peers.push(peer);
      if (onPeerDiscovered) onPeerDiscovered(peer);
    }
  };

  // 1. Check priority candidates first for ultra-fast response
  const priorityList = ['10.0.2.2', '127.0.0.1'];
  try {
    const lastIp = await getLastPcIp();
    if (lastIp && !priorityList.includes(lastIp)) {
      priorityList.unshift(lastIp);
    }
  } catch {}

  await Promise.all(
    priorityList.map(async (ip) => {
      const peer = await checkPeer(ip, 4850, 700);
      if (peer) registerPeer(peer);
    })
  );

  // 2. Discover local subnet using expo-network
  const subnets: string[] = [];
  try {
    const localIp = await Network.getIpAddressAsync();
    if (localIp && localIp !== '0.0.0.0' && !localIp.startsWith('127.')) {
      const parts = localIp.split('.');
      if (parts.length === 4) {
        subnets.push(`${parts[0]}.${parts[1]}.${parts[2]}`);
      }
    }
  } catch (err) {
    console.warn('Impossible de récupérer l’IP locale du mobile:', err);
  }

  // Include subnet from last saved PC IP if available
  for (const prio of priorityList) {
    const parts = prio.split('.');
    if (parts.length === 4 && parts[0] === '192' && parts[1] === '168') {
      const s = `${parts[0]}.${parts[1]}.${parts[2]}`;
      if (!subnets.includes(s)) subnets.push(s);
    }
  }

  if (subnets.length === 0) {
    subnets.push('192.168.1', '192.168.0');
  }

  // 3. Scan the subnet in parallel batches
  for (const subnet of subnets) {
    const allIps: string[] = [];
    for (let i = 1; i <= 254; i++) {
      const targetIp = `${subnet}.${i}`;
      if (!seenIps.has(targetIp)) {
        allIps.push(targetIp);
      }
    }

    // Process in chunks of 28 concurrent requests
    const CHUNK_SIZE = 28;
    for (let i = 0; i < allIps.length; i += CHUNK_SIZE) {
      const chunk = allIps.slice(i, i + CHUNK_SIZE);
      await Promise.all(
        chunk.map(async (ip) => {
          const peer = await checkPeer(ip, 4850, 800);
          if (peer) registerPeer(peer);
        })
      );
    }
  }

  return peers;
}

export async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err: any) {
    clearTimeout(id);
    if (err.name === 'AbortError') {
      throw new Error('Délai d’attente dépassé (PC inaccessible).');
    }
    throw err;
  }
}

export async function getSyncPreview(remoteIp: string, remotePort = 4850): Promise<{ success: boolean; preview?: SyncPreviewData; error?: string }> {
  try {
    const cleanIp = remoteIp.trim();
    if (!cleanIp) throw new Error('Adresse IP invalide.');

    const localEmps = await getEmployees();
    const localTasks = await getRawTasks();
    const deviceId = await getDeviceId();

    const tasksWithAgentUuid = localTasks.map((t) => {
      const emp = localEmps.find((e) => e.id === t.agent_id);
      return {
        ...t,
        agent_sync_uuid: emp?.sync_uuid || ''
      };
    });

    const res = await fetchWithTimeout(`http://${cleanIp}:${remotePort}/api/sync/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId,
        workstationName: 'SuiviDesk Mobile (Expo)',
        timestamp: new Date().toISOString(),
        employees: localEmps,
        tasks: tasksWithAgentUuid,
        documents: []
      })
    });

    if (!res.ok) throw new Error(`Erreur serveur PC: HTTP ${res.status}`);
    const preview = (await res.json()) as SyncPreviewData;
    await saveLastPcIp(cleanIp);
    return { success: true, preview };
  } catch (err: any) {
    const rawMsg = err?.message || '';
    let friendlyError = rawMsg;
    const target = remoteIp ? remoteIp.trim() : 'PC';
    if (
      rawMsg.includes('fetch failed') ||
      rawMsg.includes('Network request failed') ||
      rawMsg.includes('unreachable') ||
      rawMsg.includes('Délai')
    ) {
      friendlyError = `PC inaccessible à l'adresse ${target}:4850.\n\nVeuillez vérifier que :\n1. SuiviDesk est lancé sur le PC dans l'onglet 'Synchronisation'.\n2. L'adresse IP correspond exactement à celle affichée sur votre PC.\n3. Le smartphone et le PC sont sur le même réseau Wi-Fi.\n4. Le pare-feu Windows autorise les connexions entrantes sur le port 4850.`;
    }
    return { success: false, error: friendlyError };
  }
}

export async function executeSync(remoteIp: string, remotePort = 4850): Promise<SyncResult> {
  try {
    const cleanIp = remoteIp.trim();
    const localEmps = await getEmployees();
    const localTasks = await getRawTasks();
    const deviceId = await getDeviceId();

    const tasksWithAgentUuid = localTasks.map((t) => {
      const emp = localEmps.find((e) => e.id === t.agent_id);
      return {
        ...t,
        agent_sync_uuid: emp?.sync_uuid || ''
      };
    });

    // 1. Send mobile deltas to desktop PC
    const pushRes = await fetchWithTimeout(`http://${cleanIp}:${remotePort}/api/sync/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId,
        workstationName: 'SuiviDesk Mobile (Expo)',
        timestamp: new Date().toISOString(),
        employees: localEmps,
        tasks: tasksWithAgentUuid,
        documents: []
      })
    });
    if (!pushRes.ok) throw new Error(`Erreur transmission vers PC: HTTP ${pushRes.status}`);

    // 2. Fetch PC deltas to merge onto mobile
    const pullRes = await fetchWithTimeout(`http://${cleanIp}:${remotePort}/api/sync/deltas`);
    if (!pullRes.ok) throw new Error(`Erreur réception depuis PC: HTTP ${pullRes.status}`);
    const remoteDeltas = await pullRes.json();

    // 3. Bidirectional merge on mobile (LWW)
    const empMap = new Map<string, Employee>();
    localEmps.forEach((e) => { if (e.sync_uuid) empMap.set(e.sync_uuid, e); });
    for (const rem of remoteDeltas.employees || []) {
      if (!rem.sync_uuid) continue;
      const loc = empMap.get(rem.sync_uuid);
      if (!loc || new Date(rem.updated_at || 0) >= new Date(loc.updated_at || 0)) {
        empMap.set(rem.sync_uuid, { ...rem, id: loc ? loc.id : (empMap.size + 1) });
      }
    }
    const mergedEmployees = Array.from(empMap.values());
    await saveRawEmployees(mergedEmployees);

    const taskMap = new Map<string, TaskItem>();
    localTasks.forEach((t) => { if (t.sync_uuid) taskMap.set(t.sync_uuid, t); });
    for (const rem of remoteDeltas.tasks || []) {
      if (!rem.sync_uuid) continue;
      const loc = taskMap.get(rem.sync_uuid);
      let resolvedAgentId = rem.agent_id;
      if (rem.agent_sync_uuid) {
        const foundEmp = mergedEmployees.find((e) => e.sync_uuid === rem.agent_sync_uuid);
        if (foundEmp) resolvedAgentId = foundEmp.id;
      }
      if (!loc || new Date(rem.updated_at || 0) >= new Date(loc.updated_at || 0)) {
        taskMap.set(rem.sync_uuid, {
          ...rem,
          id: loc ? loc.id : (taskMap.size + 1),
          agent_id: resolvedAgentId
        });
      }
    }
    await saveRawTasks(Array.from(taskMap.values()));
    await saveLastPcIp(cleanIp);

    const appliedCount = (remoteDeltas.employees?.length || 0) + (remoteDeltas.tasks?.length || 0);

    return {
      success: true,
      appliedCount,
      conflictCount: 0
    };
  } catch (err: any) {
    const rawMsg = err?.message || '';
    let friendlyError = rawMsg;
    const target = remoteIp ? remoteIp.trim() : 'PC';
    if (
      rawMsg.includes('fetch failed') ||
      rawMsg.includes('Network request failed') ||
      rawMsg.includes('unreachable') ||
      rawMsg.includes('Délai')
    ) {
      friendlyError = `PC inaccessible à l'adresse ${target}:4850 pendant la synchronisation. Vérifiez la connexion Wi-Fi et que SuiviDesk reste ouvert sur le PC.`;
    }
    return { success: false, error: friendlyError };
  }
}
