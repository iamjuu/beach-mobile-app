import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { History, ShieldCheck, Ticket, Clock, UserCheck, RefreshCw } from 'lucide-react-native';
import * as adminApi from '../../api/adminApi';
import { colors } from '../../theme/colors';
import { formatDateTime } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AdminScanFab from '../../components/common/AdminScanFab';

export default function RecentEntriesScreen() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getEntryLogs({ limit: 30 });
      const list = res.data?.data?.entries || res.data?.data || [];
      setEntries(list);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Gate Entry Activity</Text>
          <Text style={styles.subtitle}>Real-time log of authorized resident & visitor check-ins</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchEntries} activeOpacity={0.7}>
          <RefreshCw size={18} color={colors.primaryLight} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchEntries();
            }}
            tintColor={colors.primary}
          />
        }
      >
        {loading ? (
          <LoadingSpinner message="Fetching gate entries..." />
        ) : entries.length === 0 ? (
          <View style={styles.emptyCard}>
            <History size={40} color={colors.textDark} />
            <Text style={styles.emptyTitle}>No Entries Recorded Today</Text>
            <Text style={styles.emptySub}>Scanned resident and tourist passes will appear here.</Text>
          </View>
        ) : (
          entries.map((entry, idx) => {
            const isResident = entry.entryType === 'RESIDENT' || entry.residentName || !entry.visitorCount;

            return (
              <View key={entry._id || entry.id || idx} style={styles.entryCard}>
                <View style={styles.entryTop}>
                  <View style={styles.iconCircle}>
                    {isResident ? (
                      <UserCheck size={18} color="#10b981" />
                    ) : (
                      <Ticket size={18} color={colors.primaryLight} />
                    )}
                  </View>

                  <View style={styles.metaCol}>
                    <View style={styles.nameRow}>
                      <Text style={styles.visitorName}>
                        {entry.residentName || entry.visitorName || 'Beach Visitor'}
                      </Text>
                      <View style={[styles.typePill, isResident ? styles.resPill : styles.visPill]}>
                        <Text style={[styles.typePillText, isResident ? styles.resPillText : styles.visPillText]}>
                          {isResident ? 'RESIDENT' : 'TOURIST'}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.detailText}>
                      {isResident
                        ? `SEC ID: ${entry.secId || 'Verified'}`
                        : `${entry.visitorCount || 1} Person(s) • ₹${entry.fee || 20} Paid`}
                    </Text>
                  </View>
                </View>

                <View style={styles.entryFooter}>
                  <View style={styles.timeRow}>
                    <Clock size={12} color={colors.textMuted} />
                    <Text style={styles.timeText}>
                      {formatDateTime(entry.createdAt || entry.timestamp || new Date())}
                    </Text>
                  </View>
                  <Text style={styles.gateText}>{entry.gateName || 'North Gate'}</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <AdminScanFab />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardSecondary,
    justifyContent: 'center',
    alignItems: 'center',
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
  entryCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceGlassBorder,
    marginBottom: 12,
  },
  entryTop: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.cardSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  visitorName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  typePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  resPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  visPill: {
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
  },
  typePillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  resPillText: {
    color: '#10b981',
  },
  visPillText: {
    color: colors.primaryLight,
  },
  detailText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  gateText: {
    fontSize: 11,
    color: colors.primaryLight,
    fontWeight: '600',
  },
});
