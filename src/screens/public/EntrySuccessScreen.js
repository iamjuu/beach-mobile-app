import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {
  Clock,
  CheckCircle,
  XCircle,
  ShieldCheck,
  ArrowLeft,
  Users,
  CreditCard,
  QrCode as QrIcon,
} from 'lucide-react-native';
import * as visitorApi from '../../api/visitorApi';
import { colors } from '../../theme/colors';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { triggerSuccessHaptic, triggerErrorHaptic } from '../../utils/vibrationUtils';

export default function EntrySuccessScreen({ route, navigation }) {
  const { entryId, entryData: initialData } = route.params || {};
  const [entry, setEntry] = useState(initialData || null);
  const [status, setStatus] = useState(initialData?.status || 'PENDING_APPROVAL');

  const fetchStatus = async () => {
    if (!entryId) return;
    try {
      const res = await visitorApi.getEntryStatus(entryId);
      const data = res.data?.data?.entry || res.data?.data || res.data;
      if (data) {
        setEntry(data);
        if (data.status !== status) {
          setStatus(data.status);
          if (data.status === 'APPROVED') triggerSuccessHaptic();
          if (data.status === 'REJECTED') triggerErrorHaptic();
        }
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchStatus();
    // Poll every 3 seconds while pending
    const interval = setInterval(() => {
      if (status === 'PENDING_APPROVAL' || status === 'PENDING') {
        fetchStatus();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [status, entryId]);

  const isApproved = status === 'APPROVED';
  const isRejected = status === 'REJECTED';
  const isPending = !isApproved && !isRejected;

  const qrToken = entry?.qrToken || entry?._id || entryId || 'VISITOR-PASS';

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Visitor Gate Pass</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          {isPending && (
            <View style={styles.pendingHeader}>
              <View style={styles.pendingIconBox}>
                <Clock size={36} color="#f59e0b" />
              </View>
              <Text style={styles.statusTitle}>Awaiting Gate Officer Approval</Text>
              <Text style={styles.statusSub}>
                Please proceed to the entry gate booth. Pay cash or show your booking to the security admin.
              </Text>
              <ActivityIndicator size="small" color="#f59e0b" style={{ marginTop: 14 }} />
            </View>
          )}

          {isApproved && (
            <View style={styles.approvedHeader}>
              <View style={styles.approvedIconBox}>
                <CheckCircle size={40} color="#10b981" />
              </View>
              <Text style={styles.statusTitle}>Gate Pass Approved! 🟢</Text>
              <Text style={styles.statusSub}>
                Scan your QR code at the gate scanner to enter the drive-in beach.
              </Text>
            </View>
          )}

          {isRejected && (
            <View style={styles.rejectedHeader}>
              <View style={styles.rejectedIconBox}>
                <XCircle size={40} color="#ef4444" />
              </View>
              <Text style={styles.statusTitle}>Pass Rejected 🔴</Text>
              <Text style={styles.statusSub}>
                Your entry request was declined by the gate officer. Please contact security.
              </Text>
            </View>
          )}
        </View>

        {/* QR Code Card when Approved */}
        {isApproved && (
          <View style={styles.qrCard}>
            <View style={styles.qrWrapper}>
              <QRCode value={qrToken} size={210} color="#020617" backgroundColor="#ffffff" />
            </View>
            <Text style={styles.qrNotice}>Present to Gate Scanner</Text>
          </View>
        )}

        {/* Ticket Details Summary */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsHeader}>PASS DETAILS</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Primary Visitor</Text>
            <Text style={styles.infoValue}>{entry?.visitorName || 'Tourist'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Visitors Count</Text>
            <Text style={styles.infoValue}>{entry?.visitorCount || 1} Person(s)</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Gate Fee</Text>
            <Text style={styles.infoValue}>{formatCurrency(entry?.fee || 20)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Mode</Text>
            <Text style={styles.infoValue}>{entry?.paymentMode || 'CASH'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Pass Reference ID</Text>
            <Text style={styles.infoValue}>{entryId?.substring(0, 10) || 'N/A'}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <Text style={styles.doneBtnText}>Return to Login / Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: 20,
  },
  statusCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceGlassBorder,
    marginBottom: 16,
  },
  pendingHeader: {
    alignItems: 'center',
  },
  pendingIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  approvedHeader: {
    alignItems: 'center',
  },
  approvedIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  rejectedHeader: {
    alignItems: 'center',
  },
  rejectedIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  statusSub: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  qrCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceGlassBorder,
    marginBottom: 16,
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 12,
  },
  qrNotice: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  detailsCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.surfaceGlassBorder,
    marginBottom: 20,
  },
  detailsHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  doneBtn: {
    backgroundColor: colors.cardSecondary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 30,
  },
  doneBtnText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
});
