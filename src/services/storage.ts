import AsyncStorage from '@react-native-async-storage/async-storage';
import { Employee, EmployeeInput, TaskItem, SecurityState } from '../types';

const STORAGE_KEYS = {
  EMPLOYEES: '@suividesk_employees',
  TASKS: '@suividesk_tasks',
  SECURITY: '@suividesk_security',
  LAST_PC_IP: '@suividesk_last_pc_ip',
  DEVICE_ID: '@suividesk_device_id',
  INITIALIZED: '@suividesk_initialized_v1'
};

export function generateUUID(): string {
  let d = new Date().getTime();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export async function getDeviceId(): Promise<string> {
  let id = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
  if (!id) {
    id = generateUUID();
    await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, id);
  }
  return id;
}

export async function getLastPcIp(): Promise<string> {
  const ip = await AsyncStorage.getItem(STORAGE_KEYS.LAST_PC_IP);
  return ip || '192.168.1.45';
}

export async function saveLastPcIp(ip: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.LAST_PC_IP, ip.trim());
}

// Initial mock data
const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 1,
    sync_uuid: 'emp-001-cnas',
    civilite: 'Monsieur',
    full_name: 'Ahmed Benali',
    file_name: 'attestation_ahmed.pdf',
    created_at: '2026-11-20T08:00:00Z',
    updated_at: '2026-11-24T10:00:00Z',
    is_deleted: 0
  },
  {
    id: 2,
    sync_uuid: 'emp-002-cnas',
    civilite: 'Madame',
    full_name: 'Samira Khelifi',
    file_name: 'fiche_recrutement.pdf',
    created_at: '2026-11-21T09:00:00Z',
    updated_at: '2026-11-24T11:00:00Z',
    is_deleted: 0
  },
  {
    id: 3,
    sync_uuid: 'emp-003-cnas',
    civilite: 'Monsieur',
    full_name: 'Karim Mansouri',
    file_name: 'decision_affectation.pdf',
    created_at: '2026-11-22T08:30:00Z',
    updated_at: '2026-11-24T14:00:00Z',
    is_deleted: 0
  }
];

const INITIAL_TASKS: TaskItem[] = [
  {
    id: 1,
    sync_uuid: 'task-001-cnas',
    agent_id: 1,
    titre: 'Contrôle employeur et apurement cotisations',
    sujet: 'Vérification bordereaux trimestriels CNAS',
    personne_cible: 'Entreprise Nationale Travaux BTP',
    reference_dossier: 'CNAS-ALG-2026-4412',
    wilaya: 'Alger',
    priorite: 'Haute',
    date_courrier: '2026-11-20',
    date_distribution: '2026-11-21',
    date_debut: '2026-11-21',
    date_finale: '2026-11-25',
    etat_courrier: 'traite',
    duree_traitement_jours: 4,
    note: 'Dossier validé et transmis au chef de centre.',
    note_finale: 'Approbation finale reçue.',
    created_at: '2026-11-20T08:30:00Z',
    updated_at: '2026-11-24T09:00:00Z',
    is_deleted: 0
  },
  {
    id: 2,
    sync_uuid: 'task-002-cnas',
    agent_id: 1,
    titre: 'Instruction recours prestation maladie',
    sujet: 'Examen pièces complémentaires feuille de soins',
    personne_cible: 'Assuré social M. Bouzid',
    reference_dossier: 'CNAS-MED-8819',
    wilaya: 'Oran',
    priorite: 'Moyenne',
    date_courrier: '2026-11-22',
    date_distribution: '2026-11-23',
    date_debut: '2026-11-23',
    date_finale: '2026-11-28',
    etat_courrier: 'en_cours',
    note: 'En attente de la prescription médicale conforme.',
    created_at: '2026-11-22T09:00:00Z',
    updated_at: '2026-11-24T12:00:00Z',
    is_deleted: 0
  },
  {
    id: 3,
    sync_uuid: 'task-003-cnas',
    agent_id: 2,
    titre: 'Audit trimestriel centre de paiement',
    sujet: 'Rapprochement des bordereaux de remboursement',
    personne_cible: 'Centre de paiement Bab Ezzouar',
    reference_dossier: 'AUDIT-2026-T4',
    wilaya: 'Constantine',
    priorite: 'Urgente',
    date_courrier: '2026-11-23',
    date_distribution: '2026-11-24',
    date_debut: '2026-11-24',
    date_finale: '2026-11-26',
    etat_courrier: 'non_traite',
    note: 'Dossier prioritaire reçu ce matin.',
    created_at: '2026-11-23T10:00:00Z',
    updated_at: '2026-11-24T15:00:00Z',
    is_deleted: 0
  },
  {
    id: 4,
    sync_uuid: 'task-004-cnas',
    agent_id: 3,
    titre: 'Mise à jour carte Chifa & ayants droit',
    sujet: 'Renouvellement annuel des droits assurés',
    personne_cible: 'Guichet Unique Agence',
    reference_dossier: 'CHIFA-99120',
    wilaya: 'Sétif',
    priorite: 'Moyenne',
    date_courrier: '2026-11-21',
    date_distribution: '2026-11-22',
    date_debut: '2026-11-22',
    date_finale: '2026-11-29',
    etat_courrier: 'traite',
    duree_traitement_jours: 3,
    note: 'Délivrance de la carte effectuée.',
    created_at: '2026-11-21T11:00:00Z',
    updated_at: '2026-11-24T16:00:00Z',
    is_deleted: 0
  }
];

export async function initializeData(): Promise<void> {
  const isInit = await AsyncStorage.getItem(STORAGE_KEYS.INITIALIZED);
  if (!isInit) {
    await AsyncStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
    await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
    await AsyncStorage.setItem(
      STORAGE_KEYS.SECURITY,
      JSON.stringify({ enabled: false, autoLockMinutes: 0 })
    );
    await AsyncStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }
}

// --- Employees CRUD ---
export async function getEmployees(): Promise<Employee[]> {
  await initializeData();
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.EMPLOYEES);
  const list: Employee[] = raw ? JSON.parse(raw) : [];
  const tasks = await getTasks();

  return list
    .filter((e) => !e.is_deleted)
    .map((emp) => {
      const empTasks = tasks.filter((t) => t.agent_id === emp.id && !t.is_deleted);
      return {
        ...emp,
        tasks_count: empTasks.length,
        traite_count: empTasks.filter((t) => t.etat_courrier === 'traite').length,
        en_cours_count: empTasks.filter((t) => t.etat_courrier === 'en_cours').length,
        non_traite_count: empTasks.filter((t) => t.etat_courrier === 'non_traite').length
      };
    });
}

export async function saveRawEmployees(employees: Employee[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
}

export async function createEmployee(data: EmployeeInput): Promise<Employee> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.EMPLOYEES);
  const list: Employee[] = raw ? JSON.parse(raw) : [];
  const nextId = list.length > 0 ? Math.max(...list.map((e) => e.id)) + 1 : 1;
  const now = new Date().toISOString();

  const newEmp: Employee = {
    id: nextId,
    sync_uuid: generateUUID(),
    civilite: data.civilite || '',
    full_name: data.full_name.trim(),
    created_at: now,
    updated_at: now,
    is_deleted: 0
  };

  list.push(newEmp);
  await saveRawEmployees(list);
  return newEmp;
}

export async function updateEmployee(id: number, data: EmployeeInput): Promise<boolean> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.EMPLOYEES);
  const list: Employee[] = raw ? JSON.parse(raw) : [];
  const idx = list.findIndex((e) => e.id === id);
  if (idx === -1) return false;

  list[idx] = {
    ...list[idx],
    civilite: data.civilite ?? list[idx].civilite,
    full_name: data.full_name ? data.full_name.trim() : list[idx].full_name,
    updated_at: new Date().toISOString()
  };

  await saveRawEmployees(list);
  return true;
}

export async function deleteEmployee(id: number): Promise<boolean> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.EMPLOYEES);
  const list: Employee[] = raw ? JSON.parse(raw) : [];
  const idx = list.findIndex((e) => e.id === id);
  if (idx !== -1) {
    list[idx].is_deleted = 1;
    list[idx].updated_at = new Date().toISOString();
    await saveRawEmployees(list);
  }

  // Also soft-delete tasks of this employee
  const tasks = await getRawTasks();
  for (const t of tasks) {
    if (t.agent_id === id) {
      t.is_deleted = 1;
      t.updated_at = new Date().toISOString();
    }
  }
  await saveRawTasks(tasks);
  return true;
}

// --- Tasks CRUD ---
export async function getRawTasks(): Promise<TaskItem[]> {
  await initializeData();
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
  return raw ? JSON.parse(raw) : [];
}

export async function saveRawTasks(tasks: TaskItem[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

export async function getTasks(): Promise<TaskItem[]> {
  const tasks = await getRawTasks();
  const employeesRaw = await AsyncStorage.getItem(STORAGE_KEYS.EMPLOYEES);
  const employees: Employee[] = employeesRaw ? JSON.parse(employeesRaw) : [];

  return tasks
    .filter((t) => !t.is_deleted)
    .map((t) => {
      const emp = employees.find((e) => e.id === t.agent_id);
      return {
        ...t,
        agent_full_name: emp?.full_name || '',
        agent_civilite: emp?.civilite || ''
      };
    });
}

export async function createTask(data: Partial<TaskItem>): Promise<TaskItem> {
  const list = await getRawTasks();
  const nextId = list.length > 0 ? Math.max(...list.map((t) => t.id)) + 1 : 1;
  const now = new Date().toISOString();

  let treatmentDays: number | null = null;
  if (data.etat_courrier === 'traite' && data.date_distribution && data.date_finale) {
    const d1 = new Date(data.date_distribution).getTime();
    const d2 = new Date(data.date_finale).getTime();
    treatmentDays = Math.max(0, Math.round((d2 - d1) / (1000 * 3600 * 24)));
  }

  const newTask: TaskItem = {
    id: nextId,
    sync_uuid: generateUUID(),
    agent_id: data.agent_id ?? null,
    titre: data.titre?.trim() || '',
    sujet: data.sujet?.trim() || '',
    personne_cible: data.personne_cible?.trim() || '',
    reference_dossier: data.reference_dossier?.trim() || '',
    wilaya: data.wilaya || '',
    priorite: data.priorite || 'Moyenne',
    date_courrier: data.date_courrier || '',
    date_distribution: data.date_distribution || '',
    date_debut: data.date_debut || '',
    date_finale: data.date_finale || '',
    etat_courrier: data.etat_courrier || 'non_traite',
    duree_traitement_jours: treatmentDays,
    note: data.note?.trim() || '',
    note_finale: data.note_finale?.trim() || '',
    created_at: now,
    updated_at: now,
    is_deleted: 0
  };

  list.push(newTask);
  await saveRawTasks(list);
  return newTask;
}

export async function updateTask(id: number, data: Partial<TaskItem>): Promise<boolean> {
  const list = await getRawTasks();
  const idx = list.findIndex((t) => t.id === id);
  if (idx === -1) return false;

  let treatmentDays = list[idx].duree_traitement_jours;
  const etat = data.etat_courrier ?? list[idx].etat_courrier;
  const dist = data.date_distribution ?? list[idx].date_distribution;
  const fin = data.date_finale ?? list[idx].date_finale;

  if (etat === 'traite' && dist && fin) {
    const d1 = new Date(dist).getTime();
    const d2 = new Date(fin).getTime();
    treatmentDays = Math.max(0, Math.round((d2 - d1) / (1000 * 3600 * 24)));
  }

  list[idx] = {
    ...list[idx],
    ...data,
    duree_traitement_jours: treatmentDays,
    updated_at: new Date().toISOString()
  };

  await saveRawTasks(list);
  return true;
}

export async function deleteTask(id: number): Promise<boolean> {
  const list = await getRawTasks();
  const idx = list.findIndex((t) => t.id === id);
  if (idx !== -1) {
    list[idx].is_deleted = 1;
    list[idx].updated_at = new Date().toISOString();
    await saveRawTasks(list);
  }
  return true;
}

// --- Security CRUD ---
export async function getSecurity(): Promise<SecurityState> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.SECURITY);
  return raw ? JSON.parse(raw) : { enabled: false, autoLockMinutes: 0 };
}

export async function saveSecurity(state: SecurityState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.SECURITY, JSON.stringify(state));
}
