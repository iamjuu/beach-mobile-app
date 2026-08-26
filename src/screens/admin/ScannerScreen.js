import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  Zap,
  ZapOff,
  SwitchCamera,
  CheckCircle,
  XCircle,
  User,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react-native';
import * as adminApi from '../../api/adminApi';
import { colors } from '../../theme/colors';
import { triggerSuccessHaptic, triggerErrorHaptic } from '../../utils/vibrationUtils';
import { playConfirmationChime } from '../../utils/soundUtils';
import StatusBadge from '../../components/common/StatusBadge';
import AdminPendingVisitorAlert from '../../components/notifications/AdminPendingVisitorAlert';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [torch, setTorch] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [scanResult, setScanResult] = useState(null); // { status: 'SUCCESS'|'INVALID', resident, message }

  const handleBarcodeScanned = async ({ data }) => {
    if (scanned || verifying || !data) return;
    setScanned(true);
    setVerifying(true);

    try {
      const res = await adminApi.scanResident(data);
      const resultData = res.data?.data || res.data;

      triggerSuccessHaptic();
      playConfirmationChime();

      setScanResult({
        status: 'SUCCESS',
        pass: resultData?.pass || resultData,
        resident: resultData?.pass?.resident || resultData?.resident || resultData,
        message: 'Pass Verified & Entry Logged! 🟢',
      });
    } catch (err) {
      triggerErrorHaptic();
      setScanResult({
        status: 'INVALID',
        message: err.response?.data?.message || 'Invalid or Expired Gate Pass',
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleDismissResult = () => {
    setScanResult(null);
    setScanned(false);
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <ShieldAlert size={48} color="#f59e0b" />
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionSub}>
          Gate Security requires camera access to scan Resident & Tourist QR passes.
        </Text>
        <TouchableOpacity style={styles.grantBtn} onPress={requestPermission} activeOpacity={0.8}>
          <Text style={styles.grantBtnText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Banner Alert for Incoming Tourists */}
      <View style={styles.topAlertArea}>
        <AdminPendingVisitorAlert />
      </View>

      {/* Camera Viewfinder */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing={facing}
        enableTorch={torch}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'code128', 'ean13'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      >
        {/* Scanner Overlay UI */}
        <View style={styles.cameraOverlay}>
          {/* Header Controls */}
          <View style={styles.topControls}>
            <TouchableOpacity
              style={[styles.controlBtn, torch && styles.controlBtnActive]}
              onPress={() => setTorch(!torch)}
              activeOpacity={0.8}
            >
              {torch ? <Zap size={20} color="#ffffff" /> : <ZapOff size={20} color="#ffffff" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => setFacing((prev) => (prev === 'back' ? 'front' : 'back'))}
              activeOpacity={0.8}
            >
              <SwitchCamera size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Central Target Reticle */}
          <View style={styles.reticleContainer}>
            <View style={styles.reticle}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Text style={styles.reticleHint}>Align QR Code within Frame</Text>
          </View>

          {/* Footer Status Bar */}
          <View style={styles.scannerFooter}>
            <View style={styles.officerBadge}>
              <ShieldCheck size={16} color="#10b981" />
              <Text style={styles.officerBadgeText}>Live Gate Scanner Active</Text>
            </View>
          </View>
        </View>
      </CameraView>

      {/* Verification Result Sheet Modal */}
      <Modal visible={!!scanResult} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {scanResult?.status === 'SUCCESS' ? (
              <>
                <View style={styles.resultHeaderSuccess}>
                  <CheckCircle size={32} color="#10b981" />
                  <Text style={styles.resultTitleSuccess}>VALID RESIDENT PASS</Text>
                </View>

                <View style={styles.residentProfile}>
                  {scanResult?.resident?.photoUrl ? (
                    <Image source={{ uri: scanResult.resident.photoUrl }} style={styles.residentPhoto} />
                  ) : (
                    <View style={styles.residentPhotoPlaceholder}>
                      <User size={32} color={colors.primaryLight} />
                    </View>
                  )}

                  <View style={styles.profileTextCol}>
                    <Text style={styles.residentNameText}>
                      {scanResult?.resident?.name || 'Registered Resident'}
                    </Text>
                    <Text style={styles.secText}>SEC: {scanResult?.resident?.secId || scanResult?.resident?.voterId || 'N/A'}</Text>
                    <Text style={styles.wardText}>
                      Ward {scanResult?.resident?.ward || '1'} • {scanResult?.resident?.houseName || 'Muzhappilangad'}
                    </Text>
                  </View>
                </View>

                <View style={styles.statusPillRow}>
                  <StatusBadge status="ACTIVE" customLabel="ENTRY AUTHORIZED" />
                </View>
              </>
            ) : (
              <>
                <View style={styles.resultHeaderError}>
                  <XCircle size={32} color="#ef4444" />
                  <Text style={styles.resultTitleError}>VERIFICATION FAILED</Text>
                </View>
                <Text style={styles.errorMessage}>{scanResult?.message}</Text>
              </>
            )}

            <TouchableOpacity style={styles.nextScanBtn} onPress={handleDismissResult} activeOpacity={0.8}>
              <Text style={styles.nextScanText}>Next Scan</Text>
              <ArrowRight size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topAlertArea: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 16,
  },
  permissionSub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  grantBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    marginTop: 24,
  },
  grantBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'space-between',
    paddingTop: 120,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  controlBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  controlBtnActive: {
    backgroundColor: colors.primary,
  },
  reticleContainer: {
    alignItems: 'center',
  },
  reticle: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderColor: colors.primaryLight,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  reticleHint: {
    marginTop: 20,
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  scannerFooter: {
    alignItems: 'center',
  },
  officerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  officerBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.surfaceGlassBorder,
  },
  resultHeaderSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  resultTitleSuccess: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10b981',
    letterSpacing: 0.5,
  },
  resultHeaderError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  resultTitleError: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ef4444',
  },
  errorMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  residentProfile: {
    flexDirection: 'row',
    backgroundColor: colors.cardSecondary,
    borderRadius: 18,
    padding: 14,
    gap: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
  },
  residentPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  residentPhotoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileTextCol: {
    flex: 1,
  },
  residentNameText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  secText: {
    fontSize: 13,
    color: colors.primaryLight,
    fontWeight: '600',
    marginTop: 2,
  },
  wardText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusPillRow: {
    marginBottom: 20,
  },
  nextScanBtn: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  nextScanText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
