import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
  RefreshControl,
} from 'react-native';
import {
  AlertTriangle,
  MapPin,
  Clock,
  CheckCircle,
  Navigation,
  User,
  EyeOff,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react-native';
import * as adminApi from '../../api/adminApi';
import { colors } from '../../theme/colors';
import { formatDateTime } from '../../utils/formatters';
import { triggerSuccessHaptic } from '../../utils/vibrationUtils';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminReportsScreen() {
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'RESIDENT' | 'PUBLIC'
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getReports();
      const list = res.data?.data?.reports || res.data?.data || [];
      setReports(list);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      setUpdatingId(reportId);
      await adminApi.updateReportStatus(reportId, newStatus);
      triggerSuccessHaptic();
      setReports((prev) =>
        prev.map((r) => ((r._id || r.id) === reportId ? { ...r, status: newStatus } : r))
      );
      Alert.alert('Status Updated', `Report status marked as ${newStatus}.`);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update report status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenDirections = (report) => {
    if (report.coordinates) {
      const coords = typeof report.coordinates === 'string' ? JSON.parse(report.coordinates) : report.coordinates;
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`);
    } else {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=Muzhappilangad+Drive-In+Beach`);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (activeTab === 'RESIDENT') return !!r.user || !!r.residentName;
    if (activeTab === 'PUBLIC') return !r.user && !r.residentName;
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gate Incident Management</Text>
        <Text style={styles.subtitle}>Manage safety hazards and public beach reports</Text>

        {/* Tab Filters */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'ALL' && styles.tabActive]}
            onPress={() => setActiveTab('ALL')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'ALL' && styles.tabTextActive]}>
              All Reports ({reports.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'RESIDENT' && styles.tabActive]}
            onPress={() => setActiveTab('RESIDENT')}
            activeOpacity={0.8}
          >
            <User size={14} color={activeTab === 'RESIDENT' ? '#ffffff' : colors.textMuted} />
            <Text style={[styles.tabText, activeTab === 'RESIDENT' && styles.tabTextActive]}>
              Resident
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'PUBLIC' && styles.tabActive]}
            onPress={() => setActiveTab('PUBLIC')}
            activeOpacity={0.8}
          >
            <EyeOff size={14} color={activeTab === 'PUBLIC' ? '#ffffff' : colors.textMuted} />
            <Text style={[styles.tabText, activeTab === 'PUBLIC' && styles.tabTextActive]}>
              Public / Guest
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchReports();
            }}
            tintColor={colors.primary}
          />
        }
      >
        {loading ? (
          <LoadingSpinner message="Fetching incident reports..." />
        ) : filteredReports.length === 0 ? (
          <View style={styles.emptyCard}>
            <ShieldAlert size={40} color={colors.textDark} />
            <Text style={styles.emptyTitle}>No Reports in this Category</Text>
            <Text style={styles.emptySub}>All reported incidents have been addressed.</Text>
          </View>
        ) : (
          filteredReports.map((report, idx) => {
            const reportId = report._id || report.id || idx;
            const isUpdating = updatingId === reportId;
            const isResolved = report.status === 'RESOLVED';
            const isInProgress = report.status === 'IN_PROGRESS';

            return (
              <View key={reportId} style={styles.reportCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.categoryPill}>
                    <Text style={styles.categoryPillText}>{report.category || 'INCIDENT'}</Text>
                  </View>
                  <StatusBadge status={report.status || 'OPEN'} />
                </View>

                <Text style={styles.description}>{report.description}</Text>

                {report.photoUrl ? (
                  <Image source={{ uri: report.photoUrl }} style={styles.reportPhoto} />
                ) : null}

                <View style={styles.metaSection}>
                  <View style={styles.metaRow}>
                    <MapPin size={12} color={colors.textMuted} />
                    <Text style={styles.metaText} numberOfLines={1}>
                      {report.location || 'Muzhappilangad Beach'}
                    </Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Clock size={12} color={colors.textMuted} />
                    <Text style={styles.metaText}>{formatDateTime(report.createdAt || new Date())}</Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.directionsBtn}
                    onPress={() => handleOpenDirections(report)}
                    activeOpacity={0.8}
                  >
                    <Navigation size={14} color="#ffffff" />
                    <Text style={styles.directionsText}>Directions</Text>
                  </TouchableOpacity>

                  {!isInProgress && !isResolved && (
                    <TouchableOpacity
                      style={styles.progressBtn}
                      onPress={() => handleUpdateStatus(reportId, 'IN_PROGRESS')}
                      disabled={isUpdating}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.progressBtnText}>Investigate</Text>
                    </TouchableOpacity>
                  )}

                  {!isResolved && (
                    <TouchableOpacity
                      style={styles.resolveBtn}
                      onPress={() => handleUpdateStatus(reportId, 'RESOLVED')}
                      disabled={isUpdating}
                      activeOpacity={0.8}
                    >
                      <CheckCircle size={14} color="#ffffff" />
                      <Text style={styles.resolveBtnText}>Resolve</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.cardSecondary,
    borderRadius: 14,
    padding: 4,
    marginTop: 12,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceGlassBorder,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  reportCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceGlassBorder,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryPill: {
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryPillText: {
    color: colors.primaryLight,
    fontSize: 11,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: 10,
  },
  reportPhoto: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 10,
  },
  metaSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardSecondary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  directionsText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  progressBtn: {
    flex: 1,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  progressBtnText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '700',
  },
  resolveBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  resolveBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});
