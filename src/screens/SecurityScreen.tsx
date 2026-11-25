import React, { useState, useEffect } from 'react';
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
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  KeyRound,
  ShieldAlert
} from 'lucide-react-native';
import { SecurityState } from '../types';
import { getSecurity } from '../services/storage';
import { setAppPassword, disableAppPassword, setAutoLock } from '../services/security';
import { COLORS } from '../constants/theme';

interface SecurityScreenProps {
  onSecurityUpdated: () => Promise<void>;
}

export const SecurityScreen: React.FC<SecurityScreenProps> = ({ onSecurityUpdated }) => {
  const [security, setSecurity] = useState<SecurityState>({ enabled: false, autoLockMinutes: 0 });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadSecurity = async () => {
    const sec = await getSecurity();
    setSecurity(sec);
  };

  useEffect(() => {
    loadSecurity();
  }, []);

  const handleSetPassword = async () => {
    if (!newPassword.trim()) {
      setMessage({ type: 'error', text: 'Veuillez saisir un nouveau mot de passe.' });
      return;
    }
    if (newPassword.length < 4) {
      setMessage({ type: 'error', text: 'Le mot de passe doit comporter au moins 4 caractères.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Les deux mots de passe ne correspondent pas.' });
      return;
    }
    if (security.enabled && !currentPassword) {
      setMessage({ type: 'error', text: 'Veuillez saisir le mot de passe actuel.' });
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage(null);
      const res = await setAppPassword(newPassword.trim(), currentPassword ? currentPassword.trim() : undefined);
      if (res.success) {
        setMessage({ type: 'success', text: 'Mot de passe configuré avec succès !' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        await loadSecurity();
        await onSecurityUpdated();
      } else {
        setMessage({ type: 'error', text: res.error || 'Erreur lors de la configuration.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Erreur inattendue.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisablePassword = async () => {
    if (!currentPassword) {
      setMessage({ type: 'error', text: 'Veuillez saisir votre mot de passe actuel pour le désactiver.' });
      return;
    }
    Alert.alert(
      'Désactiver la protection',
      'Voulez-vous vraiment désactiver le verrouillage par mot de passe ? L’application s’ouvrira sans protection.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Désactiver',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSubmitting(true);
              const res = await disableAppPassword(currentPassword.trim());
              if (res.success) {
                setMessage({ type: 'success', text: 'Verrouillage désactivé.' });
                setCurrentPassword('');
                await loadSecurity();
                await onSecurityUpdated();
              } else {
                setMessage({ type: 'error', text: res.error || 'Mot de passe incorrect.' });
              }
            } catch (err: any) {
              setMessage({ type: 'error', text: err?.message || 'Erreur.' });
            } finally {
              setIsSubmitting(false);
            }
          }
        }
      ]
    );
  };

  const handleSetAutoLockMinutes = async (minutes: number) => {
    await setAutoLock(minutes);
    await loadSecurity();
    await onSecurityUpdated();
    setMessage({
      type: 'success',
      text: minutes === 0 ? 'Verrouillage automatique désactivé.' : `Verrouillage automatique réglé sur ${minutes} min.`
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Title Header */}
      <View style={styles.titleSection}>
        <Text style={styles.pageTitle}>Sécurité & Verrouillage</Text>
        <Text style={styles.pageSubtitle}>
          Protection d’accès aux données de suivi et verrouillage automatique
        </Text>
      </View>

      {/* Message Feedback */}
      {message ? (
        <View
          style={[
            styles.feedbackCard,
            message.type === 'success' ? styles.feedbackSuccess : styles.feedbackError
          ]}
        >
          {message.type === 'success' ? (
            <CheckCircle2 size={16} color="#047857" style={{ marginRight: 8 }} />
          ) : (
            <ShieldAlert size={16} color="#B91C1C" style={{ marginRight: 8 }} />
          )}
          <Text
            style={[
              styles.feedbackText,
              { color: message.type === 'success' ? '#047857' : '#B91C1C' }
            ]}
          >
            {message.text}
          </Text>
        </View>
      ) : null}

      {/* Status Card */}
      <View
        style={[
          styles.statusCard,
          security.enabled ? styles.statusCardActive : styles.statusCardInactive
        ]}
      >
        <View style={styles.statusCardTop}>
          <ShieldCheck
            size={22}
            color={security.enabled ? COLORS.traite : COLORS.textMuted}
            style={{ marginRight: 10 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.statusCardTitle}>
              {security.enabled ? 'Application Protégée' : 'Aucun Mot de Passe Configuré'}
            </Text>
            <Text style={styles.statusCardSubtitle}>
              {security.enabled
                ? 'L’accès à l’application nécessite un mot de passe ou un code PIN.'
                : 'L’application s’ouvre directement sans authentification.'}
            </Text>
          </View>
        </View>
      </View>

      {/* Form: Set / Change Password */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <KeyRound size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
          <Text style={styles.cardHeaderTitle}>
            {security.enabled ? 'Modifier le Mot de Passe' : 'Définir un Mot de Passe'}
          </Text>
        </View>

        {security.enabled ? (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe actuel *</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="Votre mot de passe actuel..."
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showCurrent}
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowCurrent(!showCurrent)}
              >
                {showCurrent ? <EyeOff size={16} color={COLORS.textMuted} /> : <Eye size={16} color={COLORS.textMuted} />}
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nouveau mot de passe (min 4 car.) *</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Minimum 4 caractères..."
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry={!showNew}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowNew(!showNew)}
            >
              {showNew ? <EyeOff size={16} color={COLORS.textMuted} /> : <Eye size={16} color={COLORS.textMuted} />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirmer le mot de passe *</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Répétez le mot de passe..."
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry={!showConfirm}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <EyeOff size={16} color={COLORS.textMuted} /> : <Eye size={16} color={COLORS.textMuted} />}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSetPassword}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          <Lock size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.saveBtnText}>
            {security.enabled ? 'Mettre à jour le mot de passe' : 'Activer le verrouillage'}
          </Text>
        </TouchableOpacity>

        {security.enabled ? (
          <TouchableOpacity
            style={styles.disableBtn}
            onPress={handleDisablePassword}
            disabled={isSubmitting}
          >
            <Text style={styles.disableBtnText}>Désactiver la protection</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Auto-Lock Settings */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Clock size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
          <Text style={styles.cardHeaderTitle}>Verrouillage Automatique</Text>
        </View>

        <Text style={styles.autoLockDesc}>
          Verrouille automatiquement l’écran en cas d’inactivité :
        </Text>

        <View style={styles.autoLockRow}>
          {[
            { label: 'Jamais', value: 0 },
            { label: '5 min', value: 5 },
            { label: '15 min', value: 15 },
            { label: '30 min', value: 30 }
          ].map((item) => (
            <TouchableOpacity
              key={item.value}
              style={[
                styles.autoLockPill,
                security.autoLockMinutes === item.value && styles.autoLockPillSelected
              ]}
              onPress={() => handleSetAutoLockMinutes(item.value)}
            >
              <Text
                style={[
                  styles.autoLockPillText,
                  security.autoLockMinutes === item.value && styles.autoLockPillTextSelected
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
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
    marginBottom: 14
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
  feedbackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1
  },
  feedbackSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0'
  },
  feedbackError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5'
  },
  feedbackText: {
    fontSize: 11,
    fontWeight: '700',
    flex: 1
  },
  statusCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 14,
    elevation: 1
  },
  statusCardActive: {
    backgroundColor: '#F0FDF4',
    borderColor: COLORS.traiteBorder
  },
  statusCardInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: COLORS.border
  },
  statusCardTop: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statusCardTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.primaryDark
  },
  statusCardSubtitle: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.textMuted,
    marginTop: 2
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 14,
    gap: 12,
    elevation: 1
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  cardHeaderTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.primaryDark
  },
  inputGroup: {
    gap: 4
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryDark,
    textTransform: 'uppercase'
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12
  },
  textInput: {
    flex: 1,
    height: 42,
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMain
  },
  eyeBtn: {
    padding: 10
  },
  saveBtn: {
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  },
  disableBtn: {
    height: 40,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  disableBtnText: {
    color: '#991B1B',
    fontSize: 12,
    fontWeight: '800'
  },
  autoLockDesc: {
    fontSize: 11,
    color: COLORS.textMuted
  },
  autoLockRow: {
    flexDirection: 'row',
    gap: 8
  },
  autoLockPill: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center'
  },
  autoLockPillSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  autoLockPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted
  },
  autoLockPillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '900'
  }
});
