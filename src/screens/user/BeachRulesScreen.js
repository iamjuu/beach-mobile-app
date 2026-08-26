import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {
  ArrowLeft,
  ShieldAlert,
  Gauge,
  Waves,
  Trash2,
  PhoneCall,
  Clock,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';

const RULES = [
  {
    icon: Gauge,
    title: 'Strict Speed Limit: 30 km/h',
    description:
      'Vehicles must never exceed 30 km/h on the hard sand track. Dangerous driving or drifting is strictly prohibited and subject to police impound.',
    color: '#0ea5e9',
  },
  {
    icon: Waves,
    title: 'High Tide Driving Prohibited',
    description:
      'Driving is permitted exclusively during safe low-tide windows. Obey warning sirens and immediate evacuation orders when tide approaches.',
    color: '#f59e0b',
  },
  {
    icon: ShieldAlert,
    title: 'Designated Driving Corridor',
    description:
      'Drive solely on the firmly packed wet sand zone. Avoid soft sand shoulders and preserve pedestrian swimmer zones along the shore.',
    color: '#10b981',
  },
  {
    icon: Trash2,
    title: 'Zero Plastic & Littering Fine',
    description:
      'Muzhappilangad is an eco-protected coastal habitat. Dispose of all bottles and waste in designated Panchayat bins at gate exits.',
    color: '#ef4444',
  },
  {
    icon: Clock,
    title: 'Operating Gate Timings',
    description:
      'Gate passes are valid from 6:00 AM to 7:00 PM daily. Night beach driving is restricted for coastal security and sea turtle nesting.',
    color: '#8b5cf6',
  },
];

export default function BeachRulesScreen({ navigation }) {
  const handleEmergencyCall = (num) => {
    Linking.openURL(`tel:${num}`);
  };

  return (
    <View style={styles.container}>
      {/* Nav */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Beach Rules & Safety</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <ShieldAlert size={36} color={colors.primaryLight} />
          <Text style={styles.heroTitle}>Muzhappilangad Code of Conduct</Text>
          <Text style={styles.heroSub}>
            Safety protocols approved by District Administration & Tourism Dept.
          </Text>
        </View>

        {/* Rules Cards */}
        {RULES.map((rule, idx) => {
          const Icon = rule.icon;
          return (
            <View key={idx} style={styles.ruleCard}>
              <View style={[styles.iconCircle, { backgroundColor: `${rule.color}25` }]}>
                <Icon size={22} color={rule.color} />
              </View>
              <View style={styles.ruleContent}>
                <Text style={styles.ruleTitle}>{rule.title}</Text>
                <Text style={styles.ruleDesc}>{rule.description}</Text>
              </View>
            </View>
          );
        })}

        {/* Emergency Helplines Box */}
        <View style={styles.helplineCard}>
          <Text style={styles.helplineHeader}>EMERGENCY CONTACTS</Text>

          <TouchableOpacity
            style={styles.helplineRow}
            onPress={() => handleEmergencyCall('112')}
            activeOpacity={0.8}
          >
            <View style={styles.helplineLeft}>
              <PhoneCall size={18} color="#ef4444" />
              <Text style={styles.helplineName}>Police & Emergency Services</Text>
            </View>
            <Text style={styles.helplineNum}>112</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.helplineRow}
            onPress={() => handleEmergencyCall('108')}
            activeOpacity={0.8}
          >
            <View style={styles.helplineLeft}>
              <PhoneCall size={18} color="#10b981" />
              <Text style={styles.helplineName}>Ambulance Emergency</Text>
            </View>
            <Text style={styles.helplineNum}>108</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.helplineRow}
            onPress={() => handleEmergencyCall('04972820250')}
            activeOpacity={0.8}
          >
            <View style={styles.helplineLeft}>
              <PhoneCall size={18} color={colors.primaryLight} />
              <Text style={styles.helplineName}>Gate Security Outpost</Text>
            </View>
            <Text style={styles.helplineNum}>0497-2820250</Text>
          </TouchableOpacity>
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
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 8,
  },
  heroSub: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  ruleCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceGlassBorder,
    marginBottom: 12,
    gap: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ruleContent: {
    flex: 1,
  },
  ruleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  ruleDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  helplineCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.surfaceGlassBorder,
    marginTop: 10,
    marginBottom: 20,
  },
  helplineHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 14,
  },
  helplineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  helplineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  helplineName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  helplineNum: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primaryLight,
  },
});
