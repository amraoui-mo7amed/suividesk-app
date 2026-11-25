import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import {
  RefreshCw,
  Smartphone,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
  ShieldCheck,
  Check
} from 'lucide-react-native';
import { SyncPreviewData, SyncResult } from '../types';
import { getLastPcIp, saveLastPcIp } from '../services/storage';
import { getSyncPreview, executeSync } from '../services/syncEngine';
import { COLORS } from '../constants/theme';

interface SyncScreenProps {
  onSyncComplete: () => Promise<void>;
}

export const SyncScreen: React.FC<SyncScreenProps> = ({ onSyncComplete }) => {
  const [pcIp, setPcIp] = useState('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [preview, setPreview] = useState<SyncPreviewData | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLastPcIp().then((ip) => {
      if (ip) setPcIp(ip);
    });
  }, []);

  const handleConnectAndPreview = async () => {
    if (!pcIp.trim()) {
      setError('Veuillez saisir l’adresse IP de votre PC SuiviDesk.');
      return;
    }
    try {
      setIsLoadingPreview(true);
      setError(null);
      setSyncResult(null);
      const res = await getSyncPreview(pcIp);
      if (res.success && res.preview) {
        setPreview(res.preview);
        await saveLastPcIp(pcIp);
      } else {
        setError(res.error || 'Impossible de se connecter au PC.');
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur réseau.');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleExecuteSync = async () => {
    try {
      setIsSyncing(true);
      setError(null);
      const res = await executeSync(pcIp);
      if (res.success) {
        setSyncResult(res);
        setPreview(null);
        await onSyncComplete();
      } else {
        setError(res.error || 'Erreur lors de la synchronisation.');
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la synchronisation.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Page Title */}
      <View style={styles.titleSection}>
        <Text style={styles.pageTitle}>Synchronisation Wi-Fi</Text>
        <Text style={styles.pageSubtitle}>
          Liaison bidirectionnelle décentralisée entre ce smartphone et le PC bureau
        </Text>
      </View>

      {/* Error Message */}
      {error ? (
        <View style={styles.errorCard}>
          <AlertCircle size={16} color="#B91C1C" style={{ marginRight: 8 }} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Sync Success Card */}
      {syncResult?.success ? (
        <View style={styles.successCard}>
          <View style={styles.successHeader}>
            <CheckCircle2 size={20} color={COLORS.traite} style={{ marginRight: 8 }} />
            <Text style={styles.successTitle}>Synchronisation Réussie !</Text>
          </View>
          <Text style={styles.successText}>
            Toutes les modifications du bureau et du terrain ont été fusionnées avec succès.
          </Text>
          <View style={styles.successStats}>
            <Text style={styles.successStatItem}>
              • Éléments synchronisés :{' '}
              <Text style={{ fontWeight: '900' }}>{syncResult.appliedCount ?? 0}</Text>
            </Text>
            <Text style={styles.successStatItem}>• Conflits résolus (LWW) : 0</Text>
            <Text style={[styles.successStatItem, { color: COLORS.textMuted, fontSize: 10 }]}>
              Base locale à jour et prête pour vos déplacements.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => setSyncResult(null)}
          >
            <Text style={styles.doneButtonText}>Effectuer une nouvelle synchronisation</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Step 1: Connect Form */}
      {!syncResult?.success && !preview ? (
        <View style={styles.card}>
          {/* Guidance Card */}
          <View style={styles.guideCard}>
            <View style={styles.guideTop}>
              <Smartphone size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
              <Text style={styles.guideTitle}>Liaison Mobile ↔ PC Bureau</Text>
            </View>
            <Text style={styles.guideText}>
              1. Assurez-vous que ce smartphone et votre PC sont connectés au <Text style={{ fontWeight: '800' }}>même réseau Wi-Fi</Text>.{'\n'}
              2. Ouvrez SuiviDesk sur le PC et cliquez sur <Text style={{ fontWeight: '800' }}>Synchronisation</Text>.{'\n'}
              3. Notez l’<Text style={{ fontWeight: '800' }}>Adresse IP</Text> affichée en bleu sur l’écran de votre ordinateur.{'\n'}
              4. Saisissez cette adresse IP ci-dessous puis lancez la connexion.
            </Text>
          </View>

          {/* IP Input */}
          <Text style={styles.inputLabel}>Adresse IP du PC Bureau (Port 4850)</Text>
          <TextInput
            style={styles.ipInput}
            placeholder="ex: 192.168.1.45"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="numeric"
            value={pcIp}
            onChangeText={(txt) => {
              setPcIp(txt);
              setError(null);
            }}
          />

          <TouchableOpacity
            style={styles.connectButton}
            onPress={handleConnectAndPreview}
            disabled={isLoadingPreview}
            activeOpacity={0.8}
          >
            {isLoadingPreview ? (
              <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
            ) : (
              <RefreshCw size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
            )}
            <Text style={styles.connectButtonText}>
              {isLoadingPreview ? 'Connexion au PC...' : 'Se connecter & Comparer'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Step 2: Pre-Sync Diff Preview */}
      {!syncResult?.success && preview ? (
        <View style={styles.card}>
          <View style={styles.previewHeader}>
            <Laptop size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
            <View>
              <Text style={styles.previewWorkstation}>{preview.remoteWorkstation}</Text>
              <Text style={styles.previewIp}>{preview.remoteIp}:4850</Text>
            </View>
          </View>

          <Text style={styles.previewHelp}>
            Vérifiez ci-dessous les modifications à appliquer entre votre smartphone et le PC bureau :
          </Text>

          {/* Diff Cards Grid */}
          <View style={styles.diffGrid}>
            {/* Incoming Card (From PC to Phone) */}
            <View style={[styles.diffCard, { borderColor: COLORS.traiteBorder, backgroundColor: '#F0FDF4' }]}>
              <View style={styles.diffCardTop}>
                <Download size={15} color={COLORS.traite} style={{ marginRight: 6 }} />
                <Text style={[styles.diffCardTitle, { color: COLORS.traiteText }]}>À Récupérer du PC</Text>
              </View>
              <Text style={styles.diffItem}>
                • Nouveaux collaborateurs : <Text style={{ fontWeight: '800', color: COLORS.traiteText }}>+{preview.incoming.newEmployees}</Text>
              </Text>
              <Text style={styles.diffItem}>
                • Collaborateurs modifiés : <Text style={{ fontWeight: '800', color: COLORS.primary }}>~{preview.incoming.updatedEmployees}</Text>
              </Text>
              <Text style={styles.diffItem}>
                • Nouvelles tâches : <Text style={{ fontWeight: '800', color: COLORS.traiteText }}>+{preview.incoming.newTasks}</Text>
              </Text>
              <Text style={styles.diffItem}>
                • Tâches modifiées : <Text style={{ fontWeight: '800', color: COLORS.primary }}>~{preview.incoming.updatedTasks}</Text>
              </Text>
            </View>

            {/* Outgoing Card (From Phone to PC) */}
            <View style={[styles.diffCard, { borderColor: COLORS.enCoursBorder, backgroundColor: '#EFF6FF' }]}>
              <View style={styles.diffCardTop}>
                <Upload size={15} color={COLORS.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.diffCardTitle, { color: COLORS.primaryDark }]}>À Envoyer au PC</Text>
              </View>
              <Text style={styles.diffItem}>
                • Nouveaux collaborateurs : <Text style={{ fontWeight: '800', color: COLORS.traiteText }}>+{preview.outgoing.newEmployees}</Text>
              </Text>
              <Text style={styles.diffItem}>
                • Collaborateurs modifiés : <Text style={{ fontWeight: '800', color: COLORS.primary }}>~{preview.outgoing.updatedEmployees}</Text>
              </Text>
              <Text style={styles.diffItem}>
                • Nouvelles tâches : <Text style={{ fontWeight: '800', color: COLORS.traiteText }}>+{preview.outgoing.newTasks}</Text>
              </Text>
              <Text style={styles.diffItem}>
                • Tâches modifiées : <Text style={{ fontWeight: '800', color: COLORS.primary }}>~{preview.outgoing.updatedTasks}</Text>
              </Text>
            </View>
          </View>

          {/* Safety Notice */}
          <View style={styles.safetyBox}>
            <ShieldCheck size={14} color="#047857" style={{ marginRight: 6 }} />
            <Text style={styles.safetyText}>
              Fusion intelligente Last-Write-Wins (LWW). Aucune donnée locale n'est perdue.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.previewActions}>
            <TouchableOpacity
              style={styles.cancelPreviewBtn}
              onPress={() => setPreview(null)}
              disabled={isSyncing}
            >
              <Text style={styles.cancelPreviewText}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmSyncBtn}
              onPress={handleExecuteSync}
              disabled={isSyncing}
              activeOpacity={0.8}
            >
              {isSyncing ? (
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
              ) : (
                <Check size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
              )}
              <Text style={styles.confirmSyncText}>
                {isSyncing ? 'Synchronisation...' : 'Confirmer & Synchroniser'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
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
  errorCard: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  errorText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#B91C1C'
  },
  successCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: COLORS.traiteBorder,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    gap: 8
  },
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  successTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.traiteText
  },
  successText: {
    fontSize: 11,
    color: COLORS.traiteText,
    lineHeight: 16
  },
  successStats: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.traiteBorder,
    padding: 10,
    gap: 4
  },
  successStatItem: {
    fontSize: 11,
    color: COLORS.textMain
  },
  doneButton: {
    height: 40,
    backgroundColor: COLORS.traite,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 16,
    gap: 12,
    elevation: 1
  },
  guideCard: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
    gap: 6
  },
  guideTop: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  guideTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.primaryDark
  },
  guideText: {
    fontSize: 11,
    color: COLORS.textSub,
    lineHeight: 17
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryDark,
    textTransform: 'uppercase'
  },
  ipInput: {
    height: 46,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    fontFamily: 'monospace'
  },
  connectButton: {
    height: 46,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  previewWorkstation: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.primaryDark
  },
  previewIp: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    fontFamily: 'monospace'
  },
  previewHelp: {
    fontSize: 11,
    color: COLORS.textMuted
  },
  diffGrid: {
    gap: 10
  },
  diffCard: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 12,
    gap: 4
  },
  diffCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  diffCardTitle: {
    fontSize: 12,
    fontWeight: '800'
  },
  diffItem: {
    fontSize: 11,
    color: COLORS.textSub
  },
  safetyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 10,
    padding: 10
  },
  safetyText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#065F46',
    flex: 1
  },
  previewActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4
  },
  cancelPreviewBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelPreviewText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted
  },
  confirmSyncBtn: {
    flex: 1.6,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  confirmSyncText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF'
  }
});
