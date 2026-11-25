import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Info } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

interface HeaderProps {
  onOpenAbout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAbout }) => {
  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/CNAS_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.brandText}>
          <View style={styles.titleRow}>
            <Text style={styles.brandTitle}>SuiviDesk</Text>
            <View style={styles.cnasBadge}>
              <Text style={styles.cnasBadgeText}>CNAS</Text>
            </View>
          </View>
          <Text style={styles.brandSubtitle}>Système de Suivi Opérationnel</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.aboutButton}
        onPress={onOpenAbout}
        activeOpacity={0.7}
        accessibilityLabel="À propos"
      >
        <Info size={20} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 64,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#003A6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  logoContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 10
  },
  logo: {
    width: 32,
    height: 32
  },
  brandText: {
    justifyContent: 'center'
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primaryDark,
    letterSpacing: -0.3
  },
  cnasBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5,
    marginLeft: 6
  },
  cnasBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900'
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted
  },
  aboutButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
