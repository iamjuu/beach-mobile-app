import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { History, ShieldCheck, MapPin, Calendar, Clock } from 'lucide-react-native';
import * as residentPassApi from '../../api/residentPassApi';
import { colors } from '../../theme/colors';
import { formatDateTime } from '../../utils/formatters';
import { useFeatureSettings } from '../../context/FeatureContext';
import TabMaintenanceOverlay from '../../components/common/TabMaintenanceOverlay';
import BeachBanner from '../../components/common/BeachBanner';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function UserVisitsScreen() {
  const { getTabMaintenance } = useFeatureSettings();
  const tabMaintenance = getTabMaintenance('/user/my-visits');

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await residentPassApi.getMyEntries();
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
      <TabMaintenanceOverlay maintenanceData={tabMaintenance} />

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
        <BeachBanner
          type="visits"
          title="Gate Visit History"
          subtitle="Record of verified resident drive-in beach entries"
          showBadge={false}
        />

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>MY RECENT BEACH SCANS</Text>

          {loading ? (
            <LoadingSpinner message="Fetching entry logs..." />
          ) : entries.length === 0 ? (
            <View style={styles.emptyCard}>
              <History size={40} color={colors.textDark} />
              <Text style={styles.emptyTitle}>No Entry Scans Yet</Text>
              <Text style={styles.emptySub}>
                Your gate check-in timeline will appear here each time your pass is scanned at the security booth.
              </Text>
            </View>
          ) : (
            entries.map((entry, idx) => (
              <View key={entry._id || entry.id || idx} style={styles.timelineItem}>
                <View style={styles.timelineIcon}>
                  <ShieldCheck size={18} color="#10b981" />
                </View>
                <View style={styles.timelineCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.gateName}>{entry.gateName || 'Main North Gate'}</Text>
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedText}>Verified 🟢</Text>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <Clock size={12} color={colors.textMuted} />
                    <Text style={styles.timestampText}>
                      {formatDateTime(entry.createdAt || entry.timestamp || new Date())}
                    </Text>
                  </View>

                  {entry.officerName ? (
                    <Text style={styles.officerText}>Officer: {entry.officerName}</Text>
                  ) : null}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  content: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 14,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceGlassBorder,
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
    lineHeight: 18,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  timelineIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginTop: 4,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surfaceGlassBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  gateName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10b981',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  timestampText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  officerText: {
    fontSize: 11,
    color: colors.textDark,
    marginTop: 6,
  },
});
