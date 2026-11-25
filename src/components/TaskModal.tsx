import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { ClipboardList, X, Check, MapPin } from 'lucide-react-native';
import { TaskItem, TaskPriority, TaskState } from '../types';
import { COLORS, WILAYAS } from '../constants/theme';

interface TaskModalProps {
  visible: boolean;
  taskToEdit: TaskItem | null;
  agentId: number;
  agentName: string;
  onClose: () => void;
  onSave: (taskData: Partial<TaskItem>) => Promise<void>;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  visible,
  taskToEdit,
  agentId,
  agentName,
  onClose,
  onSave
}) => {
  const [titre, setTitre] = useState('');
  const [sujet, setSujet] = useState('');
  const [personneCible, setPersonneCible] = useState('');
  const [referenceDossier, setReferenceDossier] = useState('');
  const [wilaya, setWilaya] = useState('Alger');
  const [priorite, setPriorite] = useState<TaskPriority>('Moyenne');
  const [etatCourrier, setEtatCourrier] = useState<TaskState>('non_traite');
  const [dateCourrier, setDateCourrier] = useState('');
  const [dateDistribution, setDateDistribution] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFinale, setDateFinale] = useState('');
  const [note, setNote] = useState('');

  const [showWilayaPicker, setShowWilayaPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      if (taskToEdit) {
        setTitre(taskToEdit.titre || '');
        setSujet(taskToEdit.sujet || '');
        setPersonneCible(taskToEdit.personne_cible || '');
        setReferenceDossier(taskToEdit.reference_dossier || '');
        setWilaya(taskToEdit.wilaya || 'Alger');
        setPriorite((taskToEdit.priorite as TaskPriority) || 'Moyenne');
        setEtatCourrier((taskToEdit.etat_courrier as TaskState) || 'non_traite');
        setDateCourrier(taskToEdit.date_courrier || '');
        setDateDistribution(taskToEdit.date_distribution || '');
        setDateDebut(taskToEdit.date_debut || '');
        setDateFinale(taskToEdit.date_finale || '');
        setNote(taskToEdit.note || '');
      } else {
        const today = new Date().toISOString().split('T')[0];
        setTitre('');
        setSujet('');
        setPersonneCible('');
        setReferenceDossier('');
        setWilaya('Alger');
        setPriorite('Moyenne');
        setEtatCourrier('non_traite');
        setDateCourrier(today);
        setDateDistribution(today);
        setDateDebut(today);
        setDateFinale('');
        setNote('');
      }
      setError(null);
    }
  }, [visible, taskToEdit]);

  const handleSubmit = async () => {
    if (!titre.trim()) {
      setError('Veuillez renseigner le nom ou le titre de la tâche.');
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      await onSave({
        agent_id: agentId,
        titre: titre.trim(),
        sujet: sujet.trim(),
        personne_cible: personneCible.trim(),
        reference_dossier: referenceDossier.trim(),
        wilaya,
        priorite,
        etat_courrier: etatCourrier,
        date_courrier: dateCourrier,
        date_distribution: dateDistribution,
        date_debut: dateDebut,
        date_finale: dateFinale,
        note: note.trim()
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de l’enregistrement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <ClipboardList size={18} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.headerTitle}>
                  {taskToEdit ? 'Modifier la Tâche' : 'Ajouter une Tâche'}
                </Text>
                <Text style={styles.headerSubtitle}>Assignée à : {agentName}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Form ScrollView */}
          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Titre */}
            <Text style={styles.label}>Titre / Nom de la Tâche *</Text>
            <TextInput
              style={styles.input}
              placeholder="ex: Vérification déclaration cotisations"
              placeholderTextColor={COLORS.textMuted}
              value={titre}
              onChangeText={setTitre}
            />

            {/* Sujet */}
            <Text style={styles.label}>Objet / Sujet</Text>
            <TextInput
              style={styles.input}
              placeholder="ex: Recours indemnités journalières"
              placeholderTextColor={COLORS.textMuted}
              value={sujet}
              onChangeText={setSujet}
            />

            {/* Destinataire */}
            <Text style={styles.label}>Destinataire (Personne Cible)</Text>
            <TextInput
              style={styles.input}
              placeholder="ex: Assuré social M. Bouzid"
              placeholderTextColor={COLORS.textMuted}
              value={personneCible}
              onChangeText={setPersonneCible}
            />

            {/* Référence Dossier */}
            <Text style={styles.label}>Référence Dossier</Text>
            <TextInput
              style={styles.input}
              placeholder="ex: CNAS-ALG-2026-4412"
              placeholderTextColor={COLORS.textMuted}
              value={referenceDossier}
              onChangeText={setReferenceDossier}
            />

            {/* Wilaya Picker Trigger */}
            <Text style={styles.label}>Wilaya</Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => setShowWilayaPicker(true)}
              activeOpacity={0.7}
            >
              <MapPin size={16} color={COLORS.primary} style={{ marginRight: 8 }} />
              <Text style={styles.pickerTriggerText}>{wilaya}</Text>
            </TouchableOpacity>

            {/* Priorité */}
            <Text style={styles.label}>Priorité</Text>
            <View style={styles.pillsRow}>
              {(['Urgente', 'Haute', 'Moyenne', 'Basse'] as TaskPriority[]).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.pill,
                    priorite === p && styles.pillSelected,
                    priorite === p && p === 'Urgente' && { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
                    priorite === p && p === 'Haute' && { backgroundColor: '#FFEDD5', borderColor: '#F97316' }
                  ]}
                  onPress={() => setPriorite(p)}
                >
                  <Text
                    style={[
                      styles.pillText,
                      priorite === p && styles.pillTextSelected,
                      priorite === p && p === 'Urgente' && { color: '#B91C1C' },
                      priorite === p && p === 'Haute' && { color: '#C2410C' }
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* État Courrier */}
            <Text style={styles.label}>État du Courrier</Text>
            <View style={styles.pillsRow}>
              {[
                { key: 'non_traite', label: 'Non traité', color: COLORS.nonTraite, bg: COLORS.nonTraiteBg },
                { key: 'en_cours', label: 'En cours', color: COLORS.enCours, bg: COLORS.enCoursBg },
                { key: 'traite', label: 'Traité', color: COLORS.traite, bg: COLORS.traiteBg }
              ].map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.pill,
                    etatCourrier === item.key && {
                      backgroundColor: item.bg,
                      borderColor: item.color,
                      borderWidth: 1.5
                    }
                  ]}
                  onPress={() => setEtatCourrier(item.key as TaskState)}
                >
                  <Text
                    style={[
                      styles.pillText,
                      etatCourrier === item.key && { color: item.color, fontWeight: '900' }
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Dates row 1 */}
            <View style={styles.datesRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Date Courrier</Text>
                <TextInput
                  style={styles.dateInput}
                  placeholder="AAAA-MM-JJ"
                  placeholderTextColor={COLORS.textMuted}
                  value={dateCourrier}
                  onChangeText={setDateCourrier}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Distribution</Text>
                <TextInput
                  style={styles.dateInput}
                  placeholder="AAAA-MM-JJ"
                  placeholderTextColor={COLORS.textMuted}
                  value={dateDistribution}
                  onChangeText={setDateDistribution}
                />
              </View>
            </View>

            {/* Dates row 2 */}
            <View style={styles.datesRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Date Début</Text>
                <TextInput
                  style={styles.dateInput}
                  placeholder="AAAA-MM-JJ"
                  placeholderTextColor={COLORS.textMuted}
                  value={dateDebut}
                  onChangeText={setDateDebut}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Date Finale</Text>
                <TextInput
                  style={styles.dateInput}
                  placeholder="AAAA-MM-JJ"
                  placeholderTextColor={COLORS.textMuted}
                  value={dateFinale}
                  onChangeText={setDateFinale}
                />
              </View>
            </View>

            {/* Note */}
            <Text style={styles.label}>Observations & Notes</Text>
            <TextInput
              style={[styles.input, { height: 70, textAlignVertical: 'top', paddingTop: 8 }]}
              placeholder="Instructions de traitement, visa..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={3}
              value={note}
              onChangeText={setNote}
            />

            {/* Action buttons */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <Check size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.saveBtnText}>
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* Nested Wilaya Picker Modal */}
      <Modal visible={showWilayaPicker} transparent animationType="fade">
        <View style={styles.wilayaModalBackdrop}>
          <View style={styles.wilayaModalCard}>
            <View style={styles.wilayaHeader}>
              <Text style={styles.wilayaTitle}>Sélectionnez une Wilaya</Text>
              <TouchableOpacity onPress={() => setShowWilayaPicker(false)}>
                <X size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 350 }}>
              {WILAYAS.map((w, index) => (
                <TouchableOpacity
                  key={w}
                  style={[styles.wilayaItem, wilaya === w && styles.wilayaItemSelected]}
                  onPress={() => {
                    setWilaya(w);
                    setShowWilayaPicker(false);
                  }}
                >
                  <Text style={[styles.wilayaItemText, wilaya === w && styles.wilayaItemTextSelected]}>
                    {index + 1}. {w}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16
  },
  card: {
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    overflow: 'hidden',
    elevation: 10
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.primaryDark
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted
  },
  closeBtn: {
    padding: 6
  },
  body: {
    padding: 16
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 11,
    fontWeight: '700'
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 4,
    textTransform: 'uppercase'
  },
  input: {
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMain,
    marginBottom: 10
  },
  pickerTrigger: {
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 10
  },
  pickerTriggerText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#F8FAFC'
  },
  pillSelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted
  },
  pillTextSelected: {
    color: COLORS.primaryDark,
    fontWeight: '900'
  },
  datesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10
  },
  dateInput: {
    height: 38,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMain
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    marginBottom: 10
  },
  cancelBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted
  },
  saveBtn: {
    flex: 1.4,
    height: 42,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  saveBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  wilayaModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24
  },
  wilayaModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    overflow: 'hidden'
  },
  wilayaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: COLORS.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  wilayaTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark
  },
  wilayaItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  wilayaItemSelected: {
    backgroundColor: COLORS.primaryLight
  },
  wilayaItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMain
  },
  wilayaItemTextSelected: {
    fontWeight: '900',
    color: COLORS.primary
  }
});
