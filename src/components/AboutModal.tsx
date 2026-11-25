import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, ScrollView } from 'react-native';
import { X, ShieldCheck, Database } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

interface AboutModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header Banner */}
          <View style={styles.banner}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.logoBadge}>
              <Image
                source={require('../../assets/CNAS_logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.bannerTitle}>SuiviDesk — CNAS</Text>
            <Text style={styles.bannerOrgFr}>
              Caisse Nationale des Assurances Sociales des Travailleurs Salariés
            </Text>
            <Text style={styles.bannerOrgAr}>
              الصندوق الوطني للتأمينات الإجتماعية للعمال الأجراء
            </Text>

            <View style={styles.versionPill}>
              <Text style={styles.versionText}>Version 1.5.0 • Mobile (Expo & React Native)</Text>
            </View>
          </View>

          {/* Content Body */}
          <ScrollView contentContainerStyle={styles.body}>
            <Text style={styles.description}>
              <Text style={{ fontWeight: '800' }}>SuiviDesk Mobile</Text> est l’application officielle de la CNAS dédiée au suivi des collaborateurs et à la gestion des courriers administratifs lors de vos déplacements et missions sur le terrain.
            </Text>

            {/* Storage Info Card */}
            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <Database size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
                <Text style={styles.infoCardTitle}>Mode Hors-Ligne & Données Locales</Text>
              </View>
              <Text style={styles.infoCardText}>
                Toutes vos données sont stockées de façon sécurisée sur votre smartphone. Vous pouvez travailler en totale autonomie sans connexion internet, puis synchroniser avec votre PC de bureau en Wi-Fi.
              </Text>
            </View>

            <View style={styles.footerRow}>
              <ShieldCheck size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
              <Text style={styles.footerText}>Usage Interne CNAS • Tous droits réservés</Text>
            </View>

            <TouchableOpacity
              style={styles.okButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.okButtonText}>Fermer</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  card: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    elevation: 10
  },
  banner: {
    backgroundColor: COLORS.primaryDark,
    paddingTop: 24,
    paddingBottom: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative'
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  logo: {
    width: 46,
    height: 46
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4
  },
  bannerOrgFr: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DCEBFA',
    textAlign: 'center',
    marginBottom: 2
  },
  bannerOrgAr: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B9D7F4',
    textAlign: 'center',
    marginBottom: 8
  },
  versionPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12
  },
  versionText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800'
  },
  body: {
    padding: 20
  },
  description: {
    fontSize: 12,
    color: COLORS.textMain,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 16
  },
  infoCard: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  infoCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryDark
  },
  infoCardText: {
    fontSize: 11,
    color: COLORS.textSub,
    lineHeight: 16
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14
  },
  footerText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted
  },
  okButton: {
    backgroundColor: COLORS.primary,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  okButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  }
});
