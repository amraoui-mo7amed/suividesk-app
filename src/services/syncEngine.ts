import {
  getEmployees,
  getTasks,
  getRawTasks,
  saveRawEmployees,
  saveRawTasks,
  getDeviceId,
  saveLastPcIp
} from './storage';
import { SyncPreviewData, SyncResult, Employee, TaskItem } from '../types';

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
    return { success: false, error: err.message || 'Impossible de contacter le PC SuiviDesk.' };
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
    return { success: false, error: err.message || 'Erreur lors de la synchronisation.' };
  }
}
