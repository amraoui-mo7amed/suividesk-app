import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl
} from 'react-native';
import {
  Search,
  Plus,
  Briefcase,
  Pencil,
  Eye,
  Trash2,
  Users
} from 'lucide-react-native';
import { Employee } from '../types';
import { COLORS } from '../constants/theme';

interface SuiviScreenProps {
  employees: Employee[];
  onSelectEmployee: (employeeId: number) => void;
  onAddEmployee: () => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employee: Employee) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const SuiviScreen: React.FC<SuiviScreenProps> = ({
  employees,
  onSelectEmployee,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onRefresh,
  isRefreshing
}) => {
  const [search, setSearch] = useState('');
  const [civiliteFilter, setCiviliteFilter] = useState<'Tous' | 'Monsieur' | 'Madame'>('Tous');

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employees
      .filter((emp) => {
        if (q) {
          const matchName = (emp.full_name || '').toLowerCase().includes(q);
          const matchCiv = (emp.civilite || '').toLowerCase().includes(q);
          if (!matchName && !matchCiv) return false;
        }
        if (civiliteFilter !== 'Tous' && emp.civilite !== civiliteFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
  }, [employees, search, civiliteFilter]);

  const getInitials = (emp: Employee) => {
    const clean = (emp.full_name || '').trim();
    if (!clean) return '#';
    const parts = clean.split(/\s+/);
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : clean.slice(0, 2).toUpperCase();
  };

  const confirmDelete = (emp: Employee) => {
    Alert.alert(
      'Supprimer l’employé',
      `Voulez-vous vraiment supprimer « ${emp.full_name} » ainsi que toutes ses tâches ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => onDeleteEmployee(emp) }
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
    >
      {/* Page Title */}
      <View style={styles.titleSection}>
        <Text style={styles.pageTitle}>Tableau de Suivi</Text>
        <Text style={styles.pageSubtitle}>
          {filteredEmployees.length} collaborateur(s) affiché(s) sur {employees.length} au total
        </Text>
      </View>

      {/* Add Employee Button (Prominent & Full Width) */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={onAddEmployee}
        activeOpacity={0.8}
      >
        <Plus size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
        <Text style={styles.addButtonText}>Ajouter un Collaborateur</Text>
      </TouchableOpacity>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <Search size={16} color={COLORS.primary} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par nom, civilité..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearSearchText}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter Tabs (Civilité) */}
      <View style={styles.filtersRow}>
        {(['Tous', 'Monsieur', 'Madame'] as const).map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[
              styles.filterPill,
              civiliteFilter === opt && styles.filterPillSelected
            ]}
            onPress={() => setCiviliteFilter(opt)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterPillText,
                civiliteFilter === opt && styles.filterPillTextSelected
              ]}
            >
              {opt === 'Tous' ? 'Tous les collaborateurs' : opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Employee Cards List */}
      {filteredEmployees.length === 0 ? (
        <View style={styles.emptyCard}>
          <Users size={36} color={COLORS.primary} style={{ marginBottom: 10 }} />
          <Text style={styles.emptyTitle}>Aucun collaborateur trouvé</Text>
          <Text style={styles.emptySubtitle}>
            Modifiez vos critères de recherche ou ajoutez un nouvel employé.
          </Text>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {filteredEmployees.map((emp) => {
            const total = emp.tasks_count || 0;
            const traites = emp.traite_count || 0;
            const enCours = emp.en_cours_count || 0;
            const nonTraites = emp.non_traite_count || 0;

            return (
              <View key={emp.id} style={styles.card}>
                {/* Card Top: Initials Avatar + Name + Civilite */}
                <TouchableOpacity
                  style={styles.cardHeader}
                  onPress={() => onSelectEmployee(emp.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{getInitials(emp)}</Text>
                  </View>
                  <View style={styles.empInfo}>
                    {emp.civilite ? (
                      <View style={styles.civBadge}>
                        <Text style={styles.civBadgeText}>{emp.civilite.toUpperCase()}</Text>
                      </View>
                    ) : null}
                    <Text style={styles.empName}>{emp.full_name}</Text>
                  </View>
                </TouchableOpacity>

                {/* Status Pills */}
                <View style={styles.pillsRow}>
                  <View style={[styles.pill, { backgroundColor: COLORS.traiteBg, borderColor: COLORS.traiteBorder }]}>
                    <Text style={[styles.pillCount, { color: COLORS.traiteText }]}>{traites}</Text>
                    <Text style={[styles.pillLabel, { color: COLORS.traiteText }]}>Traités</Text>
                  </View>
                  <View style={[styles.pill, { backgroundColor: COLORS.enCoursBg, borderColor: COLORS.enCoursBorder }]}>
                    <Text style={[styles.pillCount, { color: COLORS.enCoursText }]}>{enCours}</Text>
                    <Text style={[styles.pillLabel, { color: COLORS.enCoursText }]}>En cours</Text>
                  </View>
                  <View style={[styles.pill, { backgroundColor: COLORS.nonTraiteBg, borderColor: COLORS.nonTraiteBorder }]}>
                    <Text style={[styles.pillCount, { color: COLORS.nonTraiteText }]}>{nonTraites}</Text>
                    <Text style={[styles.pillLabel, { color: COLORS.nonTraiteText }]}>Non traités</Text>
                  </View>
                </View>

                {/* Footer: Tasks Count & 3 Action Buttons */}
                <View style={styles.cardFooter}>
                  <View style={styles.taskCountBadge}>
                    <Briefcase size={13} color={COLORS.primary} style={{ marginRight: 4 }} />
                    <Text style={styles.taskCountText}>
                      {total} tâche{total > 1 ? 's' : ''}
                    </Text>
                  </View>

                  <View style={styles.actionButtonsRow}>
                    <TouchableOpacity
                      style={styles.btnSecondary}
                      onPress={() => onEditEmployee(emp)}
                      accessibilityLabel="Modifier"
                    >
                      <Pencil size={15} color={COLORS.primaryDark} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.btnPrimary}
                      onPress={() => onSelectEmployee(emp.id)}
                      accessibilityLabel="Voir Détails"
                    >
                      <Eye size={15} color="#FFFFFF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.btnDanger}
                      onPress={() => confirmDelete(emp)}
                      accessibilityLabel="Supprimer"
                    >
                      <Trash2 size={15} color="#991B1B" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
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
  titleSection: {
    marginBottom: 12
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primaryDark,
    letterSpacing: -0.4
  },
  pageSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2
  },
  addButton: {
    height: 46,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    elevation: 2
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 10
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMain
  },
  clearSearchText: {
    fontSize: 14,
    color: COLORS.textMuted,
    paddingHorizontal: 6
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14
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
    marginTop: 10
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 4
  },
  emptySubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center'
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 14,
    elevation: 1,
    gap: 12
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900'
  },
  empInfo: {
    flex: 1
  },
  civBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 3
  },
  civBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.primary
  },
  empName: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.primaryDark
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8
  },
  pill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1
  },
  pillCount: {
    fontSize: 13,
    fontWeight: '900'
  },
  pillLabel: {
    fontSize: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginTop: 1
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  taskCountBadge: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  taskCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSub
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8
  },
  btnSecondary: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnPrimary: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnDanger: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
