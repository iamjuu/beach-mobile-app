import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Wrench, AlertTriangle, Shield, Clock, Lock, Sparkles, Bell, Car, Utensils, Info, Flame } from 'lucide-react-native';
import { colors } from '../../theme/colors';

const ICON_MAP = {
  Wrench,
  AlertTriangle,
  Shield,
  Clock,
  Lock,
  Sparkles,
  Bell,
  Car,
  Utensils,
  Info,
  Flame,
};

export default function TabMaintenanceOverlay({ maintenanceData, onDismiss }) {
  if (!maintenanceData || !maintenanceData.isBlocked) return null;

  const IconComponent = ICON_MAP[maintenanceData.icon] || Wrench;

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <IconComponent size={36} color={colors.primary} />
        </View>
        <Text style={styles.title}>{maintenanceData.title || 'Under Scheduled Maintenance'}</Text>
        <Text style={styles.message}>
          {maintenanceData.description ||
            'This feature is temporarily unavailable while our team performs scheduled upgrades. Please check back shortly.'}
        </Text>
        {onDismiss && (
          <TouchableOpacity style={styles.dismissButton} onPress={onDismiss} activeOpacity={0.8}>
            <Text style={styles.dismissText}>Back to Home</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 6, 23, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 999,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceGlassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.3)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  dismissButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  dismissText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
