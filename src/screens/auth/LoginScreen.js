import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, UserCheck, Phone, Lock, Ticket, ArrowRight, Sparkles } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function LoginScreen({ navigation }) {
  const { t } = useTranslation();
  const { login, loginResident } = useAuth();

  const [role, setRole] = useState('RESIDENT'); // 'RESIDENT' | 'ADMIN'
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [secId, setSecId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone) {
      Alert.alert('Required Field', 'Please enter your registered phone number.');
      return;
    }

    try {
      setLoading(true);
      if (role === 'RESIDENT') {
        if (secId) {
          await loginResident(phone, secId);
        } else {
          await login({ phone, password, role: 'RESIDENT' });
        }
      } else {
        if (!password) {
          Alert.alert('Required Field', 'Please enter your admin password.');
          return;
        }
        await login({ phone, password, role: 'ADMIN' });
      }
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Invalid login credentials. Please verify and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header Branding */}
        <View style={styles.header}>
          <Image source={require('../../assets/images/hero.png')} style={styles.logo} resizeMode="cover" />
          <Text style={styles.brandTitle}>Muzhappilangad Beach</Text>
          <Text style={styles.brandSubtitle}>Management & Gate Verification System</Text>
        </View>

        {/* Role Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, role === 'RESIDENT' && styles.activeTab]}
            onPress={() => setRole('RESIDENT')}
            activeOpacity={0.8}
          >
            <UserCheck size={18} color={role === 'RESIDENT' ? '#ffffff' : colors.textMuted} />
            <Text style={[styles.tabText, role === 'RESIDENT' && styles.activeTabText]}>
              Local Resident
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, role === 'ADMIN' && styles.activeTab]}
            onPress={() => setRole('ADMIN')}
            activeOpacity={0.8}
          >
            <ShieldCheck size={18} color={role === 'ADMIN' ? '#ffffff' : colors.textMuted} />
            <Text style={[styles.tabText, role === 'ADMIN' && styles.activeTabText]}>
              Gate Security
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Box */}
        <View style={styles.formCard}>
          <Text style={styles.formHeader}>
            {role === 'RESIDENT' ? 'Resident Digital Pass Sign-in' : 'Gate Security Officer Sign-in'}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Registered Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Phone size={18} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="e.g. 9876543210"
                placeholderTextColor={colors.textDark}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          </View>

          {role === 'RESIDENT' ? (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Voter / SEC ID (or Password)</Text>
              <View style={styles.inputWrapper}>
                <Lock size={18} color={colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. SEC123456 or Password"
                  placeholderTextColor={colors.textDark}
                  value={secId || password}
                  onChangeText={(val) => {
                    setSecId(val);
                    setPassword(val);
                  }}
                  autoCapitalize="characters"
                />
              </View>
            </View>
          ) : (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Officer Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={18} color={colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textDark}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <LoadingSpinner message="" />
            ) : (
              <>
                <Text style={styles.loginBtnText}>
                  {role === 'RESIDENT' ? 'Access Resident Pass' : 'Gate Admin Login'}
                </Text>
                <ArrowRight size={18} color="#ffffff" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Public & Registration Shortcuts */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.7}
          >
            <Sparkles size={16} color={colors.primaryLight} />
            <Text style={styles.registerLinkText}>New Resident? Register Voter ID for Free Pass</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.visitorBtn}
            onPress={() => navigation.navigate('VisitorEntry')}
            activeOpacity={0.8}
          >
            <Ticket size={18} color="#ffffff" />
            <Text style={styles.visitorBtnText}>Tourist / Public Visitor Entry Pass</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    width: 84,
    height: 84,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.surfaceGlassBorder,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  brandSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.cardSecondary,
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  activeTabText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.surfaceGlassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  formHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: colors.textPrimary,
    fontSize: 15,
  },
  loginBtn: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  quickActions: {
    marginTop: 24,
    alignItems: 'center',
    gap: 16,
  },
  registerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  registerLinkText: {
    color: colors.primaryLight,
    fontSize: 13,
    fontWeight: '600',
  },
  visitorBtn: {
    flexDirection: 'row',
    backgroundColor: colors.cardSecondary,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  visitorBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
