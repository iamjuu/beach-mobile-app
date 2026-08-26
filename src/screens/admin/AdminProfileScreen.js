import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  ShieldCheck,
  UserCheck,
  LogOut,
  MapPin,
  Clock,
  Phone,
  Award,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';

export default function AdminProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to end your security shift and log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <ShieldCheck size={40} color="#10b981" />
          </View>
          <Text style={styles.officerName}>{user?.name || 'Gate Security Officer'}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.rolePill}>
              <Text style={styles.roleText}>GATE SECURITY ADMIN</Text>
            </View>
          </View>
        </View>

        {/* Station Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>CURRENT GATE STATION</Text>

          <View style={styles.infoRow}>
            <MapPin size={16} color={colors.primaryLight} />
            <Text style={styles.infoLabel}>Assigned Post:</Text>
            <Text style={styles.infoVal}>Main North Gate Checkpoint</Text>
          </View>

          <View style={styles.infoRow}>
            <Clock size={16} color={colors.primaryLight} />
            <Text style={styles.infoLabel}>Active Shift:</Text>
            <Text style={styles.infoVal}>06:00 AM – 02:00 PM (Day Shift)</Text>
          </View>

          <View style={styles.infoRow}>
            <Phone size={16} color={colors.primaryLight} />
            <Text style={styles.infoLabel}>Contact Number:</Text>
            <Text style={styles.infoVal}>{user?.phone || '0497-2820250'}</Text>
          </View>
        </View>

        {/* Quick Duty Summary */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>OFFICER INSTRUCTIONS</Text>
          <Text style={styles.instructionText}>
            1. Ensure all tourist vehicles have collected cash receipt before authorizing gate arm.
          </Text>
          <Text style={styles.instructionText}>
            2. Match the resident digital pass photo on the verification sheet with the driver before wave-through.
          </Text>
          <Text style={styles.instructionText}>
            3. In case of high tide sirens, immediately close entry gates and prioritize emergency beach evacuations.
          </Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <LogOut size={18} color="#ef4444" />
          <Text style={styles.logoutText}>End Shift & Sign Out</Text>
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
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10b981',
    marginBottom: 12,
  },
  officerName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  badgeRow: {
    marginTop: 6,
  },
  rolePill: {
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  roleText: {
    color: colors.primaryLight,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.surfaceGlassBorder,
    marginBottom: 16,
  },
  cardHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textMuted,
    width: 120,
  },
  infoVal: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  instructionText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  logoutBtn: {
    flexDirection: 'row',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginTop: 10,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '700',
  },
});
