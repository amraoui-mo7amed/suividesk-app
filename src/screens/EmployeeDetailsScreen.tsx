import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert
} from 'react-native';
import {
  ArrowLeft,
  Plus,
  Search,
  ClipboardList,
  User,
  Calendar,
  Clock,
  MapPin,
  Pencil,
  Trash2,
  FileText
} from 'lucide-react-native';
import { Employee, TaskItem } from '../types';
import { COLORS } from '../constants/theme';

interface EmployeeDetailsScreenProps {
  employee: Employee;
  tasks: TaskItem[];
  onBack: () => void;
  onAddTask: () => void;
  onEditTask: (task: TaskItem) => void;
  onDeleteTask: (task: TaskItem) => void;
}

export const EmployeeDetailsScreen: React.FC<EmployeeDetailsScreenProps> = ({
  employee,
  tasks,
  onBack,
  onAddTask,
  onEditTask,
  onDeleteTask
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'details'>('tasks');
  const [taskSearch, setTaskSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Tous');

  const filteredTasks = useMemo(() => {
    const q = taskSearch.trim().toLowerCase();
    return tasks.filter((t) => {
      if (statusFilter !== 'Tous' && t.etat_courrier !== statusFilter) {
        return false;
      }
      if (q) {
        const hay = [
          t.titre,
          t.sujet,
          t.personne_cible,
          t.reference_dossier,
          t.wilaya,
          t.note
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [tasks, taskSearch, statusFilter]);

  const getInitials = () => {
    const clean = (employee.full_name || '').trim();
    if (!clean) return '#';
    const parts = clean.split(/\s+/);
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : clean.slice(0, 2).toUpperCase();
  };

  const confirmDelete = (task: TaskItem) => {
    Alert.alert(
      'Supprimer la tâche',
      `Voulez-vous vraiment supprimer « ${task.titre} » ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => onDeleteTask(task) }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
            <ArrowLeft size={18} color={COLORS.primaryDark} />
          </TouchableOpacity>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.empTitle}>
              {employee.civilite ? `${employee.civilite} ` : ''}
              {employee.full_name}
            </Text>
            <Text style={styles.empSub}>ID #{employee.id} • Fiche Collaborateur</Text>
          </View>
        </View>

        {/* Add Task Button */}
        <TouchableOpacity style={styles.addTaskBtn} onPress={onAddTask} activeOpacity={0.8}>
          <Plus size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.addTaskBtnText}>Ajouter une Tâche</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tasks' && styles.tabActive]}
          onPress={() => setActiveTab('tasks')}
        >
          <ClipboardList
            size={16}
            color={activeTab === 'tasks' ? COLORS.primary : COLORS.textMuted}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.tabText, activeTab === 'tasks' && styles.tabTextActive]}>
            Tâches Assignées ({tasks.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'details' && styles.tabActive]}
          onPress={() => setActiveTab('details')}
        >
          <User
            size={16}
            color={activeTab === 'details' ? COLORS.primary : COLORS.textMuted}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.tabText, activeTab === 'details' && styles.tabTextActive]}>
            Fiche Agent
          </Text>
        </TouchableOpacity>
      </View>

      {/* TAB 1: Tasks */}
      {activeTab === 'tasks' ? (
        <View style={{ gap: 12 }}>
          {/* Search & Filter */}
          <View style={styles.searchBox}>
            <Search size={16} color={COLORS.primary} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher par titre, dossier, wilaya..."
              placeholderTextColor={COLORS.textMuted}
              value={taskSearch}
              onChangeText={setTaskSearch}
            />
          </View>

          {/* Status Filter Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusFilterRow}>
            {[
              { key: 'Tous', label: 'Tous' },
              { key: 'traite', label: 'Traités' },
              { key: 'en_cours', label: 'En cours' },
              { key: 'non_traite', label: 'Non traités' }
            ].map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterPill, statusFilter === f.key && styles.filterPillSelected]}
                onPress={() => setStatusFilter(f.key)}
              >
                <Text style={[styles.filterPillText, statusFilter === f.key && styles.filterPillTextSelected]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Task Cards List */}
          {filteredTasks.length === 0 ? (
            <View style={styles.emptyCard}>
              <ClipboardList size={34} color={COLORS.primary} style={{ marginBottom: 8 }} />
              <Text style={styles.emptyTitle}>Aucune tâche correspondante</Text>
              <Text style={styles.emptySubtitle}>Appuyez sur « Ajouter une Tâche » ci-dessus.</Text>
            </View>
          ) : (
            filteredTasks.map((task) => {
              const isTraite = task.etat_courrier === 'traite';
              const isEnCours = task.etat_courrier === 'en_cours';

              return (
                <View key={task.id} style={styles.taskCard}>
                  {/* Status & Priority Row */}
                  <View style={styles.taskTopRow}>
                    <View
                      style={[
                        styles.statusBadge,
                        isTraite && { backgroundColor: COLORS.traiteBg, borderColor: COLORS.traiteBorder },
                        isEnCours && { backgroundColor: COLORS.enCoursBg, borderColor: COLORS.enCoursBorder },
                        !isTraite && !isEnCours && { backgroundColor: COLORS.nonTraiteBg, borderColor: COLORS.nonTraiteBorder }
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          isTraite && { color: COLORS.traiteText },
                          isEnCours && { color: COLORS.enCoursText },
                          !isTraite && !isEnCours && { color: COLORS.nonTraiteText }
                        ]}
                      >
                        {isTraite ? '✓ Traité' : isEnCours ? 'En cours' : 'Non traité'}
                      </Text>
                    </View>

                    {task.priorite ? (
                      <View
                        style={[
                          styles.prioriteBadge,
                          task.priorite === 'Urgente' && { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
                          task.priorite === 'Haute' && { backgroundColor: '#FFEDD5', borderColor: '#F97316' }
                        ]}
                      >
                        <Text
                          style={[
                            styles.prioriteBadgeText,
                            task.priorite === 'Urgente' && { color: '#B91C1C' },
                            task.priorite === 'Haute' && { color: '#C2410C' }
                          ]}
                        >
                          {task.priorite.toUpperCase()}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Task Titre */}
                  <Text style={styles.taskTitre}>{task.titre}</Text>

                  {/* Task Sujet / Objet */}
                  {task.sujet ? (
                    <Text style={styles.taskSujet}>
                      <Text style={{ fontWeight: '800' }}>Objet : </Text>
                      {task.sujet}
                    </Text>
                  ) : null}

                  {/* Destinataire Badge */}
                  {task.personne_cible ? (
                    <View style={styles.destinataireBadge}>
                      <User size={12} color={COLORS.primary} style={{ marginRight: 4 }} />
                      <Text style={styles.destinataireText}>
                        Destinataire : {task.personne_cible}
                      </Text>
                    </View>
                  ) : null}

                  {/* Badges: Dossier & Wilaya */}
                  <View style={styles.tagsRow}>
                    {task.reference_dossier ? (
                      <View style={styles.tag}>
                        <FileText size={11} color={COLORS.primary} style={{ marginRight: 4 }} />
                        <Text style={styles.tagText}>{task.reference_dossier}</Text>
                      </View>
                    ) : null}

                    {task.wilaya ? (
                      <View style={styles.tag}>
                        <MapPin size={11} color={COLORS.primary} style={{ marginRight: 4 }} />
                        <Text style={styles.tagText}>{task.wilaya}</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Dates Box */}
                  <View style={styles.datesBox}>
                    <View style={styles.dateCol}>
                      <Text style={styles.dateColLabel}>DATE COURRIER</Text>
                      <Text style={styles.dateColValue}>{task.date_courrier || '—'}</Text>
                    </View>
                    <View style={styles.dateCol}>
                      <Text style={styles.dateColLabel}>DISTRIBUTION</Text>
                      <Text style={styles.dateColValue}>{task.date_distribution || '—'}</Text>
                    </View>
                    <View style={styles.dateCol}>
                      <Text style={styles.dateColLabel}>DATE DÉBUT</Text>
                      <Text style={styles.dateColValue}>{task.date_debut || '—'}</Text>
                    </View>
                    <View style={styles.dateCol}>
                      <Text style={styles.dateColLabel}>DATE FINALE</Text>
                      <Text style={styles.dateColValue}>{task.date_finale || '—'}</Text>
                    </View>
                  </View>

                  {/* Treatment Duration Badge */}
                  {task.duree_traitement_jours !== null && task.duree_traitement_jours !== undefined ? (
                    <View style={styles.durationCard}>
                      <Clock size={13} color={COLORS.primary} style={{ marginRight: 6 }} />
                      <Text style={styles.durationLabel}>Durée de traitement :</Text>
                      <View style={styles.durationBadge}>
                        <Text style={styles.durationBadgeText}>{task.duree_traitement_jours} jours</Text>
                      </View>
                    </View>
                  ) : null}

                  {/* Note */}
                  {task.note ? (
                    <View style={styles.noteBox}>
                      <Text style={styles.noteTitle}>Note :</Text>
                      <Text style={styles.noteText}>{task.note}</Text>
                    </View>
                  ) : null}

                  {/* Task Card Footer Actions */}
                  <View style={styles.taskFooter}>
                    <Text style={styles.taskFooterId}>#{task.id}</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        style={styles.taskEditBtn}
                        onPress={() => onEditTask(task)}
                      >
                        <Pencil size={14} color={COLORS.primaryDark} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.taskDeleteBtn}
                        onPress={() => confirmDelete(task)}
                      >
                        <Trash2 size={14} color="#991B1B" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      ) : (
        /* TAB 2: Employee Details */
        <View style={styles.detailsCard}>
          <Text style={styles.detailsSectionTitle}>Informations Collaborateur</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Civilité :</Text>
            <Text style={styles.detailValue}>{employee.civilite || 'Non spécifié'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Nom complet :</Text>
            <Text style={styles.detailValue}>{employee.full_name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Identifiant unique :</Text>
            <Text style={[styles.detailValue, { fontFamily: 'monospace', fontSize: 11 }]}>
              {employee.sync_uuid}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date d’enregistrement :</Text>
            <Text style={styles.detailValue}>
              {employee.created_at ? new Date(employee.created_at).toLocaleDateString('fr-FR') : '—'}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg
  },
  content: {
    padding: 16,
    paddingBottom: 30
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 14,
    gap: 12,
    elevation: 1
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900'
  },
  empTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primaryDark
  },
  empSub: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted
  },
  addTaskBtn: {
    height: 42,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  addTaskBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 4,
    marginBottom: 14
  },
  tab: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabActive: {
    backgroundColor: COLORS.primaryLight
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted
  },
  tabTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '900'
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 42
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMain
  },
  statusFilterRow: {
    flexDirection: 'row',
    gap: 6
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF'
  },
  filterPillSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted
  },
  filterPillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800'
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginTop: 8
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 4
  },
  emptySubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center'
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 14,
    gap: 8,
    elevation: 1
  },
  taskTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800'
  },
  prioriteBadge: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  prioriteBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primary
  },
  taskTitre: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.primaryDark,
    lineHeight: 18
  },
  taskSujet: {
    fontSize: 12,
    color: COLORS.textSub,
    lineHeight: 16
  },
  destinataireBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  destinataireText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap'
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSub
  },
  datesBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 8
  },
  dateCol: {
    alignItems: 'center'
  },
  dateColLabel: {
    fontSize: 7,
    fontWeight: '800',
    color: COLORS.textMuted,
    marginBottom: 2
  },
  dateColValue: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryDark
  },
  durationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  durationLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
    flex: 1
  },
  durationBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  durationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800'
  },
  noteBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 8
  },
  noteTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 2
  },
  noteText: {
    fontSize: 11,
    color: COLORS.textSub
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  taskFooterId: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted
  },
  taskEditBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  taskDeleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center'
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 16,
    gap: 12
  },
  detailsSectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.primaryDark,
    textTransform: 'uppercase',
    marginBottom: 6
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMain
  }
});
