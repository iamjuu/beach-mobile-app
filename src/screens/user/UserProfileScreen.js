import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  User,
  ShieldCheck,
  Globe,
  FileText,
  LogOut,
  ChevronRight,
  Phone,
  MapPin,
  Home,
  Hash,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { changeLanguage } from '../../i18n/i18n';
import { colors } from '../../theme/colors';
import BeachBanner from '../../components/common/BeachBanner';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
];

export default function UserProfileScreen({ navigation }) {
  const { i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');

  const handleLanguageChange = async (langCode) => {
    await changeLanguage(langCode);
    setCurrentLang(langCode);
    Alert.alert('Language Updated', `App language set to ${LANGUAGES.find((l) => l.code === langCode)?.label}`);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of your resident account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <BeachBanner
          type="profile"
          title="Resident Profile"
          subtitle="Account settings, language preferences & beach conduct"
          showBadge={false}
        />

        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <User size={32} color={colors.primaryLight} />
            </View>
            <View style={styles.profileText}>
              <Text style={styles.name}>{user?.name || 'Local Resident'}</Text>
              <Text style={styles.roleBadge}>{user?.role || 'RESIDENT'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Phone size={16} color={colors.textMuted} />
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoVal}>{user?.phone || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Hash size={16} color={colors.textMuted} />
            <Text style={styles.infoLabel}>Voter / SEC ID:</Text>
            <Text style={styles.infoVal}>{user?.secId || user?.voterId || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <MapPin size={16} color={colors.textMuted} />
            <Text style={styles.infoLabel}>Ward:</Text>
            <Text style={styles.infoVal}>Ward {user?.ward || '1'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Home size={16} color={colors.textMuted} />
            <Text style={styles.infoLabel}>House:</Text>
            <Text style={styles.infoVal}>{user?.houseName || user?.address || 'Muzhappilangad'}</Text>
          </View>
        </View>

        {/* Language Selection */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Globe size={18} color={colors.primaryLight} />
            <Text style={styles.sectionTitle}>SELECT APP LANGUAGE</Text>
          </View>

          <View style={styles.langList}>
            {LANGUAGES.map((lang) => {
              const isSelected = currentLang.startsWith(lang.code);
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.langOption, isSelected && styles.langOptionActive]}
                  onPress={() => handleLanguageChange(lang.code)}
                  activeOpacity={0.8}
                >
                  <View>
                    <Text style={[styles.langLabel, isSelected && styles.langLabelActive]}>
                      {lang.native}
                    </Text>
                    <Text style={styles.langSub}>{lang.label}</Text>
                  </View>
                  {isSelected && (
                    <View style={styles.activeDot} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Beach Rules & Conduct Shortcut */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('BeachRules')}
          activeOpacity={0.8}
        >
          <View style={styles.menuLeft}>
            <FileText size={20} color={colors.primaryLight} />
            <Text style={styles.menuText}>Beach Code of Conduct & Guidelines</Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <LogOut size={18} color="#ef4444" />
          <Text style={styles.logoutText}>Log Out</Text>
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
    paddingBottom: 30,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.surfaceGlassBorder,
    marginBottom: 14,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.cardSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  profileText: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  roleBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryLight,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 14,
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
    width: 100,
  },
  infoVal: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
  },
  langList: {
    gap: 8,
  },
  langOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.cardSecondary,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  langOptionActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(14, 165, 233, 0.12)',
  },
  langLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  langLabelActive: {
    color: colors.primaryLight,
  },
  langSub: {
    fontSize: 11,
    color: colors.textMuted,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.surfaceGlassBorder,
    marginBottom: 14,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  logoutBtn: {
    flexDirection: 'row',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginTop: 4,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '700',
  },
});
