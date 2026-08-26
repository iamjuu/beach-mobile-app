import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

const STATUS_CONFIGS = {
  ACTIVE: { label: 'Active', bg: colors.successBg, text: colors.success, border: 'rgba(16, 185, 129, 0.4)' },
  APPROVED: { label: 'Approved', bg: colors.successBg, text: colors.success, border: 'rgba(16, 185, 129, 0.4)' },
  INACTIVE: { label: 'Inactive', bg: colors.dangerBg, text: colors.danger, border: 'rgba(239, 68, 68, 0.4)' },
  REJECTED: { label: 'Rejected', bg: colors.dangerBg, text: colors.danger, border: 'rgba(239, 68, 68, 0.4)' },
  PENDING: { label: 'Pending', bg: colors.warningBg, text: colors.warning, border: 'rgba(245, 158, 11, 0.4)' },
  PENDING_APPROVAL: { label: 'Pending Approval', bg: colors.warningBg, text: colors.warning, border: 'rgba(245, 158, 11, 0.4)' },
  OPEN: { label: 'Open', bg: colors.warningBg, text: colors.warning, border: 'rgba(245, 158, 11, 0.4)' },
  IN_PROGRESS: { label: 'In Progress', bg: 'rgba(56, 189, 248, 0.15)', text: '#38bdf8', border: 'rgba(56, 189, 248, 0.4)' },
  RESOLVED: { label: 'Resolved', bg: colors.successBg, text: colors.success, border: 'rgba(16, 185, 129, 0.4)' },
};

export default function StatusBadge({ status = 'ACTIVE', customLabel }) {
  const config = STATUS_CONFIGS[status] || {
    label: status,
    bg: colors.cardSecondary,
    text: colors.textSecondary,
    border: colors.border,
  };

  return (
    <View style={[styles.badge, { backgroundColor: config.bg, borderColor: config.border }]}>
      <View style={[styles.dot, { backgroundColor: config.text }]} />
      <Text style={[styles.text, { color: config.text }]}>
        {customLabel || config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 5,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
