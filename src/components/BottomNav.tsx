import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LayoutDashboard, ClipboardList, RefreshCw, ShieldCheck, Lock } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { MainTab } from '../types';

interface BottomNavProps {
  currentTab: MainTab;
  onChangeTab: (tab: MainTab) => void;
  isPasswordConfigured: boolean;
  onLockApp: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
  isPasswordConfigured,
  onLockApp
}) => {
  return (
    <View style={styles.navBar}>
      {/* Tab: Dashboard */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onChangeTab('dashboard')}
        activeOpacity={0.7}
      >
        <LayoutDashboard
          size={20}
          color={currentTab === 'dashboard' ? COLORS.primary : COLORS.textMuted}
        />
        <Text
          style={[
            styles.tabLabel,
            currentTab === 'dashboard' && styles.tabLabelActive
          ]}
        >
          Tableau
        </Text>
      </TouchableOpacity>

      {/* Tab: Suivi */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onChangeTab('suivi')}
        activeOpacity={0.7}
      >
        <ClipboardList
          size={20}
          color={currentTab === 'suivi' ? COLORS.primary : COLORS.textMuted}
        />
        <Text
          style={[
            styles.tabLabel,
            currentTab === 'suivi' && styles.tabLabelActive
          ]}
        >
          Suivi
        </Text>
      </TouchableOpacity>

      {/* Tab: Sync */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onChangeTab('sync')}
        activeOpacity={0.7}
      >
        <RefreshCw
          size={20}
          color={currentTab === 'sync' ? COLORS.primary : COLORS.textMuted}
        />
        <Text
          style={[
            styles.tabLabel,
            currentTab === 'sync' && styles.tabLabelActive
          ]}
        >
          Sync
        </Text>
      </TouchableOpacity>

      {/* Tab: Security */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onChangeTab('security')}
        activeOpacity={0.7}
      >
        <ShieldCheck
          size={20}
          color={currentTab === 'security' ? COLORS.primary : COLORS.textMuted}
        />
        <Text
          style={[
            styles.tabLabel,
            currentTab === 'security' && styles.tabLabelActive
          ]}
        >
          Sécurité
        </Text>
      </TouchableOpacity>

      {/* Button: Lock (if configured) */}
      {isPasswordConfigured && (
        <TouchableOpacity
          style={styles.tabItem}
          onPress={onLockApp}
          activeOpacity={0.7}
        >
          <Lock size={20} color="#D97706" />
          <Text style={[styles.tabLabel, { color: '#B45309' }]}>Verrouiller</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    height: 60,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 3
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '900'
  }
});
