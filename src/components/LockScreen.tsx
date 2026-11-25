import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Lock, Eye, EyeOff, Shield } from 'lucide-react-native';
import { verifyPassword } from '../services/security';
import { COLORS } from '../constants/theme';

interface LockScreenProps {
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = async () => {
    if (!password.trim()) {
      setError('Veuillez saisir votre mot de passe.');
      return;
    }
    const isValid = await verifyPassword(password);
    if (isValid) {
      setPassword('');
      setError(null);
      onUnlock();
    } else {
      setError('Mot de passe incorrect.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.overlay}
    >
      <View style={styles.card}>
        {/* CNAS Logo Circle */}
        <View style={styles.logoBadge}>
          <Image
            source={require('../../assets/CNAS_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.lockIconBadge}>
            <Lock size={14} color="#FFFFFF" />
          </View>
        </View>

        {/* Security Tag */}
        <View style={styles.secureTag}>
          <Shield size={13} color={COLORS.primary} style={{ marginRight: 5 }} />
          <Text style={styles.secureTagText}>Accès Sécurisé — CNAS</Text>
        </View>

        <Text style={styles.title}>SuiviDesk Verrouillé</Text>
        <Text style={styles.subtitle}>
          Veuillez saisir votre mot de passe pour accéder à la base de données.
        </Text>

        {/* Error Message */}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Mot de passe ou code PIN"
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(txt) => {
              setPassword(txt);
              setError(null);
            }}
            onSubmitEditing={handleUnlock}
            autoFocus
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={18} color={COLORS.textMuted} />
            ) : (
              <Eye size={18} color={COLORS.textMuted} />
            )}
          </TouchableOpacity>
        </View>

        {/* Unlock Button */}
        <TouchableOpacity
          style={styles.unlockButton}
          onPress={handleUnlock}
          activeOpacity={0.8}
        >
          <Lock size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.unlockButtonText}>Déverrouiller la session</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Système de Suivi Opérationnel & Échéances • CNAS
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F2744FA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 9999
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 14
  },
  logo: {
    width: 54,
    height: 54
  },
  lockIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  secureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 10
  },
  secureTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryDark
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primaryDark,
    marginBottom: 6,
    letterSpacing: -0.3
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 17
  },
  errorBox: {
    width: '100%',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 8,
    borderRadius: 10,
    marginBottom: 12
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center'
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    marginBottom: 16
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain
  },
  eyeButton: {
    padding: 12
  },
  unlockButton: {
    width: '100%',
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 2
  },
  unlockButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  },
  footerText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted
  }
});
