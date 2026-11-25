import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { User, X, Check } from 'lucide-react-native';
import { Employee } from '../types';
import { COLORS } from '../constants/theme';

interface EmployeeModalProps {
  visible: boolean;
  employeeToEdit: Employee | null;
  onClose: () => void;
  onSave: (civilite: string, fullName: string) => Promise<void>;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  visible,
  employeeToEdit,
  onClose,
  onSave
}) => {
  const [civilite, setCivilite] = useState<string>('Monsieur');
  const [fullName, setFullName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      if (employeeToEdit) {
        setCivilite(employeeToEdit.civilite || 'Monsieur');
        setFullName(employeeToEdit.full_name || '');
      } else {
        setCivilite('Monsieur');
        setFullName('');
      }
      setError(null);
    }
  }, [visible, employeeToEdit]);

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      setError('Veuillez saisir le nom complet de l’employé.');
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      await onSave(civilite, fullName.trim());
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
                <User size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.headerTitle}>
                {employeeToEdit ? 'Modifier Collaborateur' : 'Ajouter Collaborateur'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Civilité selector */}
            <Text style={styles.label}>Civilité</Text>
            <View style={styles.civiliteRow}>
              {['Monsieur', 'Madame'].map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.civiliteOption,
                    civilite === c && styles.civiliteOptionSelected
                  ]}
                  onPress={() => setCivilite(c)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.civiliteText,
                      civilite === c && styles.civiliteTextSelected
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Full Name input */}
            <Text style={styles.label}>Nom Complet *</Text>
            <TextInput
              style={styles.input}
              placeholder="ex: Ahmed Benali"
              placeholderTextColor={COLORS.textMuted}
              value={fullName}
              onChangeText={(t) => {
                setFullName(t);
                setError(null);
              }}
            />

            {/* Actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                disabled={isSubmitting}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSubmit}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                <Check size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.saveButtonText}>
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    overflow: 'hidden',
    elevation: 10
  },
  header: {
    paddingHorizontal: 18,
    paddingVertical: 14,
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
    marginRight: 10
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.primaryDark
  },
  closeBtn: {
    padding: 4
  },
  body: {
    padding: 18
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 11,
    fontWeight: '700'
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 6,
    textTransform: 'uppercase'
  },
  civiliteRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14
  },
  civiliteOption: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center'
  },
  civiliteOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight
  },
  civiliteText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted
  },
  civiliteTextSelected: {
    color: COLORS.primaryDark,
    fontWeight: '900'
  },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMain,
    marginBottom: 18
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10
  },
  cancelButton: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted
  },
  saveButton: {
    flex: 1.4,
    height: 42,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  saveButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF'
  }
});
