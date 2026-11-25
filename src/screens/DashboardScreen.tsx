import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import {
  Layers,
  CheckCircle2,
  Activity,
  AlertCircle,
  Clock,
  Users,
  MapPin,
  ChevronRight
} from 'lucide-react-native';
import { Employee, TaskItem } from '../types';
import { COLORS } from '../constants/theme';

interface DashboardScreenProps {
  employees: Employee[];
  tasks: TaskItem[];
  onSelectEmployee: (employeeId: number) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  employees,
  tasks,
  onSelectEmployee,
  onRefresh,
  isRefreshing
}) => {
  const totalTasks = tasks.length;
  const traiteCount = tasks.filter((t) => t.etat_courrier === 'traite').length;
  const enCoursCount = tasks.filter((t) => t.etat_courrier === 'en_cours').length;
  const nonTraiteCount = tasks.filter((t) => t.etat_courrier === 'non_traite').length;
  const completionRate = totalTasks > 0 ? Math.round((traiteCount / totalTasks) * 100) : 0;

  const tasksWithDays = tasks.filter(
    (t) => t.duree_traitement_jours !== null && t.duree_traitement_jours !== undefined
  );
  const avgDays =
    tasksWithDays.length > 0
      ? Math.round(
          tasksWithDays.reduce((acc, t) => acc + (t.duree_traitement_jours || 0), 0) /
            tasksWithDays.length
        )
      : 0;

  // Wilaya counts
  const wilayaMap = new Map<string, number>();
  for (const t of tasks) {
    if (t.wilaya && t.wilaya.trim()) {
      wilayaMap.set(t.wilaya, (wilayaMap.get(t.wilaya) || 0) + 1);
    }
  }
  const topWilayas = Array.from(wilayaMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
    >
      {/* Title Header */}
      <View style={styles.titleSection}>
        <Text style={styles.pageTitle}>Tableau de Bord CNAS</Text>
        <Text style={styles.pageSubtitle}>
          Analytique globale des collaborateurs, flux de courriers et durées de traitement
        </Text>
      </View>

      {/* KPI Cards (2x2 Grid + 1 Full Width) */}
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <View style={styles.kpiTop}>
            <Text style={styles.kpiLabel}>Total Tâches</Text>
            <Layers size={16} color={COLORS.primary} />
          </View>
          <Text style={styles.kpiValue}>{totalTasks}</Text>
          <Text style={styles.kpiSub}>{employees.length} collaborateurs</Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={styles.kpiTop}>
            <Text style={[styles.kpiLabel, { color: COLORS.traiteText }]}>Traités</Text>
            <CheckCircle2 size={16} color={COLORS.traite} />
          </View>
          <Text style={[styles.kpiValue, { color: COLORS.traite }]}>{traiteCount}</Text>
          <Text style={[styles.kpiSub, { color: COLORS.traiteText, fontWeight: '700' }]}>
            {completionRate}% du total
          </Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={styles.kpiTop}>
            <Text style={[styles.kpiLabel, { color: COLORS.primaryDark }]}>En cours</Text>
            <Activity size={16} color={COLORS.primary} />
          </View>
          <Text style={[styles.kpiValue, { color: COLORS.primary }]}>{enCoursCount}</Text>
          <Text style={styles.kpiSub}>Dossiers actifs</Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={styles.kpiTop}>
            <Text style={[styles.kpiLabel, { color: COLORS.nonTraiteText }]}>Non traités</Text>
            <AlertCircle size={16} color={COLORS.nonTraite} />
          </View>
          <Text style={[styles.kpiValue, { color: COLORS.nonTraite }]}>{nonTraiteCount}</Text>
          <Text style={[styles.kpiSub, { color: COLORS.nonTraiteText, fontWeight: '700' }]}>
            En attente
          </Text>
        </View>
      </View>

      {/* Average Treatment Duration Card */}
      <View style={styles.avgCard}>
        <View style={styles.avgCardLeft}>
          <View style={styles.avgIcon}>
            <Clock size={20} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.avgLabel}>Délai Moyen de Traitement</Text>
            <Text style={styles.avgSub}>Calculé sur l’ensemble des dossiers traités</Text>
          </View>
        </View>
        <Text style={styles.avgValue}>{avgDays} j</Text>
      </View>

      {/* Distribution by Status Progress Bars */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Distribution par État</Text>
          <Text style={styles.sectionBadge}>{totalTasks} total</Text>
        </View>

        <View style={styles.statusBarsContainer}>
          {/* Traités Bar */}
          <View style={styles.statusBarItem}>
            <View style={styles.statusBarLabelRow}>
              <View style={styles.colorDotRow}>
                <View style={[styles.colorDot, { backgroundColor: COLORS.traite }]} />
                <Text style={styles.statusBarName}>Traités</Text>
              </View>
              <Text style={styles.statusBarCount}>
                {traiteCount} ({completionRate}%)
              </Text>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    backgroundColor: COLORS.traite,
                    width: totalTasks > 0 ? `${(traiteCount / totalTasks) * 100}%` : '0%'
                  }
                ]}
              />
            </View>
          </View>

          {/* En cours Bar */}
          <View style={styles.statusBarItem}>
            <View style={styles.statusBarLabelRow}>
              <View style={styles.colorDotRow}>
                <View style={[styles.colorDot, { backgroundColor: COLORS.enCours }]} />
                <Text style={styles.statusBarName}>En cours</Text>
              </View>
              <Text style={styles.statusBarCount}>
                {enCoursCount} ({totalTasks > 0 ? Math.round((enCoursCount / totalTasks) * 100) : 0}%)
              </Text>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    backgroundColor: COLORS.enCours,
                    width: totalTasks > 0 ? `${(enCoursCount / totalTasks) * 100}%` : '0%'
                  }
                ]}
              />
            </View>
          </View>

          {/* Non traités Bar */}
          <View style={styles.statusBarItem}>
            <View style={styles.statusBarLabelRow}>
              <View style={styles.colorDotRow}>
                <View style={[styles.colorDot, { backgroundColor: COLORS.nonTraite }]} />
                <Text style={styles.statusBarName}>Non traités</Text>
              </View>
              <Text style={styles.statusBarCount}>
                {nonTraiteCount} ({totalTasks > 0 ? Math.round((nonTraiteCount / totalTasks) * 100) : 0}%)
              </Text>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    backgroundColor: COLORS.nonTraite,
                    width: totalTasks > 0 ? `${(nonTraiteCount / totalTasks) * 100}%` : '0%'
                  }
                ]}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Top Wilayas */}
      {topWilayas.length > 0 && (
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MapPin size={15} color={COLORS.primary} style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitle}>Top Wilayas les plus Fréquentes</Text>
            </View>
          </View>

          <View style={styles.wilayaList}>
            {topWilayas.map(([wName, wCount]) => (
              <View key={wName} style={styles.wilayaRow}>
                <Text style={styles.wilayaRowName}>{wName}</Text>
                <View style={styles.wilayaBadge}>
                  <Text style={styles.wilayaBadgeText}>{wCount} dossier{wCount > 1 ? 's' : ''}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Employee Workload Cards */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Users size={15} color={COLORS.primary} style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Charge de Travail par Collaborateur</Text>
          </View>
        </View>

        <View style={{ gap: 10 }}>
          {employees.map((emp) => {
            const empTotal = emp.tasks_count || 0;
            const empTraites = emp.traite_count || 0;
            const empEnCours = emp.en_cours_count || 0;
            const empNonTraites = emp.non_traite_count || 0;
            const rate = empTotal > 0 ? Math.round((empTraites / empTotal) * 100) : 0;

            return (
              <TouchableOpacity
                key={emp.id}
                style={styles.empCard}
                onPress={() => onSelectEmployee(emp.id)}
                activeOpacity={0.7}
              >
                <View style={styles.empCardTop}>
                  <Text style={styles.empCardName}>{emp.full_name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.empCardTaskCount}>{empTotal} tâche{empTotal > 1 ? 's' : ''}</Text>
                    <ChevronRight size={14} color={COLORS.textMuted} style={{ marginLeft: 4 }} />
                  </View>
                </View>

                {/* Status Pills */}
                <View style={styles.empPillsRow}>
                  <View style={[styles.empPill, { backgroundColor: COLORS.traiteBg }]}>
                    <Text style={[styles.empPillCount, { color: COLORS.traiteText }]}>{empTraites}</Text>
                    <Text style={[styles.empPillLabel, { color: COLORS.traiteText }]}>TRAITÉS</Text>
                  </View>
                  <View style={[styles.empPill, { backgroundColor: COLORS.enCoursBg }]}>
                    <Text style={[styles.empPillCount, { color: COLORS.enCoursText }]}>{empEnCours}</Text>
                    <Text style={[styles.empPillLabel, { color: COLORS.enCoursText }]}>EN COURS</Text>
                  </View>
                  <View style={[styles.empPill, { backgroundColor: COLORS.nonTraiteBg }]}>
                    <Text style={[styles.empPillCount, { color: COLORS.nonTraiteText }]}>{empNonTraites}</Text>
                    <Text style={[styles.empPillLabel, { color: COLORS.nonTraiteText }]}>NON TRAITÉS</Text>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={styles.empProgressRow}>
                  <View style={styles.empProgressBar}>
                    <View style={[styles.empProgressFill, { width: `${rate}%` }]} />
                  </View>
                  <Text style={styles.empProgressText}>{rate}%</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
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
    marginBottom: 16
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
    marginTop: 2,
    lineHeight: 16
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12
  },
  kpiCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    elevation: 1
  },
  kpiTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    textTransform: 'uppercase'
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primaryDark
  },
  kpiSub: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2
  },
  avgCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    elevation: 1
  },
  avgCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  avgIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  avgLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryDark
  },
  avgSub: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.textMuted
  },
  avgValue: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primaryDark
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: 14,
    elevation: 1
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.3
  },
  sectionBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  statusBarsContainer: {
    gap: 12
  },
  statusBarItem: {
    gap: 4
  },
  statusBarLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  colorDotRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6
  },
  statusBarName: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMain
  },
  statusBarCount: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSub
  },
  barTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden'
  },
  barFill: {
    height: '100%',
    borderRadius: 4
  },
  wilayaList: {
    gap: 8
  },
  wilayaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  wilayaRowName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMain
  },
  wilayaBadge: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  wilayaBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryDark
  },
  empCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 12,
    gap: 8
  },
  empCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  empCardName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark
  },
  empCardTaskCount: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted
  },
  empPillsRow: {
    flexDirection: 'row',
    gap: 6
  },
  empPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: 8
  },
  empPillCount: {
    fontSize: 12,
    fontWeight: '900'
  },
  empPillLabel: {
    fontSize: 8,
    fontWeight: '800'
  },
  empProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  empProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden'
  },
  empProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3
  },
  empProgressText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    width: 28,
    textAlign: 'right'
  }
});
