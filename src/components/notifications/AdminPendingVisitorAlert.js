import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ticket, CheckCircle, XCircle } from 'lucide-react-native';
import * as adminApi from '../../api/adminApi';
import { colors } from '../../theme/colors';
import { formatCurrency } from '../../utils/formatters';
import { triggerSuccessHaptic, triggerErrorHaptic } from '../../utils/vibrationUtils';

export default function AdminPendingVisitorAlert() {
  const [pendingEntries, setPendingEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPending = async () => {
    try {
      const res = await adminApi.getPendingVisitorEntries();
      const list = res.data?.data?.entries || res.data?.data || [];
      setPendingEntries(list);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchPending();
    const interval = setInterval(fetchPending, 10000);
    return () => clearInterval(interval);
  }, []);

  if (pendingEntries.length === 0) return null;

  const current = pendingEntries[0];
  const fee = current.fee || current.visitorCount * 20 || 20;

  const handleReview = async (status) => {
    try {
      setLoading(true);
      await adminApi.reviewVisitorEntry(current._id || current.id, status);
      if (status === 'APPROVED') {
        triggerSuccessHaptic();
      } else {
        triggerErrorHaptic();
      }
      setPendingEntries((prev) => prev.filter((e) => (e._id || e.id) !== (current._id || current.id)));
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update entry status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ticket size={18} color="#ffffff" />
        </View>
        <View style={styles.titleCol}>
          <Text style={styles.title}>Visitor Arrival at Gate</Text>
          <Text style={styles.subtitle}>
            {current.visitorName || 'Tourist'} • {current.visitorCount || 1} Person(s) •{' '}
            <Text style={styles.feeText}>{formatCurrency(fee)}</Text>
          </Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.btn, styles.rejectBtn]}
          onPress={() => handleReview('REJECTED')}
          disabled={loading}
          activeOpacity={0.8}
        >
          <XCircle size={16} color="#ef4444" />
          <Text style={styles.rejectText}>Reject</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.approveBtn]}
          onPress={() => handleReview('APPROVED')}
          disabled={loading}
          activeOpacity={0.8}
        >
          <CheckCircle size={16} color="#ffffff" />
          <Text style={styles.approveText}>Approve & Collect Cash</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleCol: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  feeText: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  rejectText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '700',
  },
  approveBtn: {
    flex: 2,
    backgroundColor: '#10b981',
  },
  approveText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
