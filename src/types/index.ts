export type Civilite = 'Monsieur' | 'Madame' | '';
export type TaskPriority = 'Urgente' | 'Haute' | 'Moyenne' | 'Basse' | '';
export type TaskState = 'non_traite' | 'en_cours' | 'traite' | '';

export interface Employee {
  id: number;
  sync_uuid: string;
  civilite: Civilite | string;
  full_name: string;
  file_name?: string;
  file_path?: string;
  file_type?: string;
  created_at?: string;
  updated_at?: string;
  is_deleted?: number;
  tasks_count?: number;
  traite_count?: number;
  en_cours_count?: number;
  non_traite_count?: number;
}

export interface EmployeeInput {
  civilite: string;
  full_name: string;
}

export interface TaskItem {
  id: number;
  sync_uuid: string;
  agent_id: number | null;
  agent_sync_uuid?: string;
  agent_full_name?: string;
  agent_civilite?: string;
  titre: string;
  sujet?: string;
  personne_cible?: string;
  reference_dossier?: string;
  wilaya?: string;
  priorite?: TaskPriority | string;
  date_courrier?: string;
  date_distribution?: string;
  date_debut?: string;
  date_finale?: string;
  etat_courrier: TaskState | string;
  duree_traitement_jours?: number | null;
  note?: string;
  note_finale?: string;
  created_at?: string;
  updated_at?: string;
  is_deleted?: number;
}

export interface DiscoveredPeer {
  ip: string;
  port: number;
  name: string;
  deviceId: string;
  version?: string;
}

export interface SyncStatus {
  deviceId: string;
  workstationName: string;
  port: number;
}

export interface SyncPreviewData {
  remoteDeviceId: string;
  remoteWorkstation: string;
  remoteIp: string;
  incoming: {
    newEmployees: number;
    updatedEmployees: number;
    deletedEmployees: number;
    newTasks: number;
    updatedTasks: number;
    deletedTasks: number;
    missingDocuments: any[];
  };
  outgoing: {
    newEmployees: number;
    updatedEmployees: number;
    newTasks: number;
    updatedTasks: number;
  };
}

export interface SyncResult {
  success: boolean;
  appliedCount?: number;
  conflictCount?: number;
  error?: string;
}

export interface SecurityState {
  enabled: boolean;
  passwordHash?: string;
  salt?: string;
  autoLockMinutes: number;
}

export type MainTab = 'dashboard' | 'suivi' | 'sync' | 'security';
