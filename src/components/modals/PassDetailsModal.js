import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { X, ShieldCheck, User, Home, MapPin, Hash } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import StatusBadge from '../common/StatusBadge';

export default function PassDetailsModal({ visible, onClose, passData, qrToken }) {
  if (!passData) return null;

  const resident = passData.resident || passData;
  const qrString = qrToken || passData.qrToken || passData.secId || passData.voterId || 'MUZHA-PASS-VALID';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerTitle}>
              <ShieldCheck size={22} color={colors.primary} />
              <Text style={styles.title}>Resident Gate Pass</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {/* High-res QR Area */}
            <View style={styles.qrCard}>
              <View style={styles.qrWrapper}>
                <QRCode
                  value={qrString}
                  size={200}
                  color="#020617"
                  backgroundColor="#ffffff"
                />
              </View>
              <Text style={styles.qrNotice}>Present this QR at Gate for Instant Scan</Text>
              <View style={styles.badgeRow}>
                <StatusBadge status={passData.status || 'ACTIVE'} />
              </View>
            </View>

            {/* Resident Details Details */}
            <View style={styles.detailsSection}>
              <Text style={styles.sectionHeader}>VOTER & RESIDENT INFO</Text>

              <View style={styles.infoRow}>
                <User size={18} color={colors.primaryLight} />
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Full Name</Text>
                  <Text style={styles.infoValue}>{resident.name || 'Resident'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Hash size={18} color={colors.primaryLight} />
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>SEC / Voter ID</Text>
                  <Text style={styles.infoValue}>{resident.secId || resident.voterId || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <MapPin size={18} color={colors.primaryLight} />
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Ward Number</Text>
                  <Text style={styles.infoValue}>Ward {resident.ward || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Home size={18} color={colors.primaryLight} />
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>House Name / Address</Text>
                  <Text style={styles.infoValue}>{resident.houseName || resident.address || 'Muzhappilangad'}</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.88)',
    justifyContent: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: colors.card,
    borderRadius: 24,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: colors.surfaceGlassBorder,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.cardSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  qrCard: {
    backgroundColor: colors.cardSecondary,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 20,
  },
  qrWrapper: {
    padding: 14,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
  },
  qrNotice: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'center',
  },
  badgeRow: {
    alignItems: 'center',
  },
  detailsSection: {
    backgroundColor: colors.cardSecondary,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '700',
    marginTop: 1,
  },
});
