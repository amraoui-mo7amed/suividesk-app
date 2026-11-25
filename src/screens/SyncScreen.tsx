import React, { useState, useEffect, useCallback } from 'react';
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
  Check,
  Wifi,
  ChevronDown,
  ChevronUp,
  Radio,
  ArrowRight,
  Monitor,
  X
} from 'lucide-react-native';
import { SyncPreviewData, SyncResult, DiscoveredPeer } from '../types';
import { getLastPcIp, saveLastPcIp } from '../services/storage';
import { getSyncPreview, executeSync, scanLanForPcs } from '../services/syncEngine';
import { COLORS } from '../constants/theme';

interface SyncScreenProps {
  onSyncComplete: () => Promise<void>;
}

export const SyncScreen: React.FC<SyncScreenProps> = ({ onSyncComplete }) => {
  const [pcIp, setPcIp] = useState('');
  const [discoveredPcs, setDiscoveredPcs] = useState<DiscoveredPeer[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [connectingIp, setConnectingIp] = useState<string | null>(null);
  const [showManualIp, setShowManualIp] = useState(false);

  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [preview, setPreview] = useState<SyncPreviewData | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = useCallback(async () => {
    try {
      setIsScanning(true);
      setError(null);
      const found = await scanLanForPcs((peer) => {
        setDiscoveredPcs((prev) => {
          if (prev.some((p) => p.ip === peer.ip)) return prev;
          return [...prev, peer];
        });
      });
      setDiscoveredPcs(found);
      if (found.length > 0) {
        setPcIp((current) => current || found[0].ip);
      }
    } catch (err: any) {
      console.warn('Erreur détection réseau:', err);
    } finally {
      setIsScanning(false);
    }
  }, []);

  useEffect(() => {
    getLastPcIp().then((ip) => {
      if (ip) setPcIp(ip);
    });
    handleScan();
  }, [handleScan]);

  const handleConnectPeer = async (targetIp: string) => {
    const cleanIp = targetIp.trim();
    if (!cleanIp) {
      setError('Veuillez spécifier une adresse IP valide.');
      return;
    }
    setPcIp(cleanIp);
    setConnectingIp(cleanIp);
    setIsLoadingPreview(true);
    setError(null);
    setSyncResult(null);

    try {
      const res = await getSyncPreview(cleanIp);
      if (res.success && res.preview) {
        setPreview(res.preview);
        await saveLastPcIp(cleanIp);
      } else {
        setError(res.error || 'Impossible de se connecter au PC.');
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur réseau.');
    } finally {
      setIsLoadingPreview(false);
      setConnectingIp(null);
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
          <AlertCircle size={16} color="#B91C1C" style={{ marginRight: 8, marginTop: 2 }} />
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
            onPress={() => {
              setSyncResult(null);
              handleScan();
            }}
          >
            <Text style={styles.doneButtonText}>Effectuer une nouvelle synchronisation</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Step 1: Discovered PCs & Connect Form */}
      {!syncResult?.success && !preview ? (
        <View style={styles.mainWrapper}>
          {/* Section: Discovered PCs */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderLeft}>
              <Wifi size={17} color={COLORS.primary} style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitle}>PC SuiviDesk sur le Réseau</Text>
            </View>

            <TouchableOpacity
              style={styles.rescanButton}
              onPress={handleScan}
              disabled={isScanning}
              activeOpacity={0.7}
            >
              {isScanning ? (
                <ActivityIndicator size="small" color={COLORS.primary} style={{ marginRight: 4 }} />
              ) : (
                <RefreshCw size={13} color={COLORS.primary} style={{ marginRight: 4 }} />
              )}
              <Text style={styles.rescanButtonText}>
                {isScanning ? 'Scan...' : 'Actualiser'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Scanning Status Banner */}
          {isScanning && (
            <View style={styles.scanningBanner}>
              <Radio size={14} color={COLORS.primaryDark} style={{ marginRight: 8 }} />
              <Text style={styles.scanningBannerText}>
                Recherche automatique des ordinateurs SuiviDesk connectés au Wi-Fi...
              </Text>
            </View>
          )}

          {/* List of Discovered PCs */}
          {discoveredPcs.length > 0 ? (
            <View style={styles.pcListContainer}>
              {discoveredPcs.map((peer) => {
                const isConnectingThis = connectingIp === peer.ip && isLoadingPreview;
                const isSelected = pcIp === peer.ip;

                return (
                  <TouchableOpacity
                    key={peer.ip}
                    style={[
                      styles.peerCard,
                      isSelected && styles.peerCardSelected
                    ]}
                    onPress={() => handleConnectPeer(peer.ip)}
                    disabled={isLoadingPreview}
                    activeOpacity={0.8}
                  >
                    <View style={styles.peerCardTop}>
                      <View style={styles.peerIconBadge}>
                        <Laptop size={20} color={COLORS.primary} />
                      </View>

                      <View style={styles.peerDetails}>
                        <View style={styles.peerNameRow}>
                          <Text style={styles.peerName} numberOfLines={1}>
                            {peer.name}
                          </Text>
                          {isSelected && (
                            <View style={styles.selectedBadge}>
                              <Check size={11} color="#FFFFFF" style={{ marginRight: 2 }} />
                              <Text style={styles.selectedBadgeText}>Sélectionné</Text>
                            </View>
                          )}
                        </View>

                        <View style={styles.peerSubRow}>
                          <View style={styles.onlineDot} />
                          <Text style={styles.peerIpText}>{peer.ip}:{peer.port}</Text>
                          <Text style={styles.peerStatusText}>• Prêt</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.peerCardBottom}>
                      <TouchableOpacity
                        style={[
                          styles.connectPeerBtn,
                          isSelected && styles.connectPeerBtnSelected
                        ]}
                        onPress={() => handleConnectPeer(peer.ip)}
                        disabled={isLoadingPreview}
                        activeOpacity={0.8}
                      >
                        {isConnectingThis ? (
                          <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 6 }} />
                        ) : (
                          <ArrowRight size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                        )}
                        <Text style={styles.connectPeerBtnText}>
                          {isConnectingThis ? 'Connexion en cours...' : 'Se connecter & Synchroniser'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : !isScanning ? (
            /* No PCs Found Card */
            <View style={styles.noPcCard}>
              <Monitor size={30} color={COLORS.textMuted} style={{ marginBottom: 8 }} />
              <Text style={styles.noPcTitle}>Aucun PC SuiviDesk Détecté</Text>
              <Text style={styles.noPcText}>
                Assurez-vous que SuiviDesk est ouvert sur votre ordinateur (onglet{' '}
                <Text style={{ fontWeight: '800' }}>Synchronisation</Text>) et que ce mobile est
                connecté au même réseau Wi-Fi.
              </Text>
              <TouchableOpacity
                style={styles.retryScanBtn}
                onPress={handleScan}
                activeOpacity={0.8}
              >
                <RefreshCw size={13} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.retryScanBtnText}>Relancer la recherche</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Manual IP Card / Toggle */}
          <View style={styles.manualCard}>
            <TouchableOpacity
              style={styles.manualToggleRow}
              onPress={() => setShowManualIp(!showManualIp)}
              activeOpacity={0.7}
            >
              <View style={styles.manualToggleLeft}>
                <Smartphone size={15} color={COLORS.primaryDark} style={{ marginRight: 6 }} />
                <Text style={styles.manualToggleTitle}>Saisie Manuelle d'Adresse IP</Text>
              </View>
              {showManualIp ? (
                <ChevronUp size={16} color={COLORS.textMuted} />
              ) : (
                <ChevronDown size={16} color={COLORS.textMuted} />
              )}
            </TouchableOpacity>

            {showManualIp && (
              <View style={styles.manualBody}>
                <Text style={styles.inputLabel}>Adresse IP du PC Bureau (Port 4850)</Text>
                <TextInput
                  style={styles.ipInput}
                  placeholder="ex: 192.168.1.146"
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
                  onPress={() => handleConnectPeer(pcIp)}
                  disabled={isLoadingPreview}
                  activeOpacity={0.8}
                >
                  {isLoadingPreview && !connectingIp ? (
                    <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                  ) : (
                    <RefreshCw size={15} color="#FFFFFF" style={{ marginRight: 8 }} />
                  )}
                  <Text style={styles.connectButtonText}>
                    {isLoadingPreview ? 'Connexion au PC...' : 'Se connecter & Comparer'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
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
              activeOpacity={0.7}
              accessibilityLabel="Annuler"
            >
              <X size={18} color={COLORS.textMuted} />
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
    alignItems: 'flex-start',
    marginBottom: 12
  },
  errorText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#B91C1C',
    lineHeight: 16
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
  mainWrapper: {
    gap: 12
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 2
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.primaryDark,
    letterSpacing: -0.2
  },
  rescanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  rescanButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary
  },
  scanningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  scanningBannerText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primaryDark,
    flex: 1
  },
  pcListContainer: {
    gap: 10
  },
  peerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 14,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3
  },
  peerCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F8FAFF'
  },
  peerCardTop: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  peerIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  peerDetails: {
    flex: 1
  },
  peerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  peerName: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.primaryDark,
    flex: 1
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6
  },
  selectedBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800'
  },
  peerSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6
  },
  peerIpText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    fontFamily: 'monospace'
  },
  peerStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#059669',
    marginLeft: 4
  },
  peerCardBottom: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10
  },
  connectPeerBtn: {
    height: 38,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  connectPeerBtnSelected: {
    backgroundColor: COLORS.primaryDark
  },
  connectPeerBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  },
  noPcCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 20,
    alignItems: 'center',
    textAlign: 'center'
  },
  noPcTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.primaryDark,
    marginBottom: 4
  },
  noPcText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 12
  },
  retryScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10
  },
  retryScanBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800'
  },
  manualCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    overflow: 'hidden'
  },
  manualToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#FAFBFD'
  },
  manualToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  manualToggleTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryDark
  },
  manualBody: {
    padding: 14,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 10
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginTop: 4
  },
  ipInput: {
    height: 44,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
    fontFamily: 'monospace'
  },
  connectButton: {
    height: 42,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  connectButtonText: {
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
    alignItems: 'center',
    gap: 10,
    marginTop: 4
  },
  cancelPreviewBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  confirmSyncBtn: {
    flex: 1,
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
