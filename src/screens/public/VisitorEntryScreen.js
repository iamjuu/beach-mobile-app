import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ticket, Users, CreditCard, ArrowLeft, ArrowRight, ShieldCheck, Plus, Minus } from 'lucide-react-native';
import * as visitorApi from '../../api/visitorApi';
import { colors } from '../../theme/colors';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const RATE_PER_PERSON = 20;

export default function VisitorEntryScreen({ navigation }) {
  const [visitorCount, setVisitorCount] = useState(1);
  const [visitorName, setVisitorName] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMode, setPaymentMode] = useState('CASH'); // 'CASH' | 'ONLINE'
  const [submitting, setSubmitting] = useState(false);

  const totalFee = visitorCount * RATE_PER_PERSON;

  const handleSubmit = async () => {
    if (!visitorName.trim()) {
      Alert.alert('Required', 'Please enter primary visitor name.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Required', 'Please enter your contact phone number.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await visitorApi.submitEntry({
        visitorName: visitorName.trim(),
        phone: phone.trim(),
        visitorCount,
        paymentMode,
        fee: totalFee,
      });

      const entryData = res.data?.data?.entry || res.data?.data || res.data;
      const entryId = entryData._id || entryData.id || entryData.entryId;

      navigation.replace('EntrySuccess', {
        entryId,
        entryData,
      });
    } catch (err) {
      Alert.alert('Booking Error', err.response?.data?.message || 'Failed to submit visitor ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Public Tourist Pass</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ticket size={28} color="#ffffff" />
          </View>
          <Text style={styles.headerTitle}>Drive-In Beach Entry Ticket</Text>
          <Text style={styles.headerSubtitle}>
            Official entry pass for tourists and visiting vehicles
          </Text>
        </View>

        {/* Counter Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>NUMBER OF VISITORS</Text>
          <View style={styles.counterRow}>
            <TouchableOpacity
              style={[styles.countBtn, visitorCount <= 1 && styles.countBtnDisabled]}
              onPress={() => setVisitorCount(Math.max(1, visitorCount - 1))}
              disabled={visitorCount <= 1}
              activeOpacity={0.8}
            >
              <Minus size={20} color="#ffffff" />
            </TouchableOpacity>

            <View style={styles.countDisplay}>
              <Text style={styles.countText}>{visitorCount}</Text>
              <Text style={styles.countSub}>Person(s)</Text>
            </View>

            <TouchableOpacity
              style={styles.countBtn}
              onPress={() => setVisitorCount(visitorCount + 1)}
              activeOpacity={0.8}
            >
              <Plus size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Pricing summary */}
          <View style={styles.feeSummary}>
            <Text style={styles.feeLabel}>Rate: ₹{RATE_PER_PERSON} / person</Text>
            <Text style={styles.totalFeeText}>Total: {formatCurrency(totalFee)}</Text>
          </View>
        </View>

        {/* Visitor Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>PRIMARY CONTACT INFO</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Visitor Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Rahul Sharma"
              placeholderTextColor={colors.textDark}
              value={visitorName}
              onChangeText={setVisitorName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mobile Phone Number</Text>
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

        {/* Payment Mode Selector */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>PAYMENT METHOD AT GATE</Text>
          <View style={styles.paymentOptions}>
            <TouchableOpacity
              style={[styles.payOpt, paymentMode === 'CASH' && styles.payOptActive]}
              onPress={() => setPaymentMode('CASH')}
              activeOpacity={0.8}
            >
              <ShieldCheck size={20} color={paymentMode === 'CASH' ? '#ffffff' : colors.textMuted} />
              <Text style={[styles.payOptText, paymentMode === 'CASH' && styles.payOptTextActive]}>
                Cash at Gate
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.payOpt, paymentMode === 'ONLINE' && styles.payOptActive]}
              onPress={() => setPaymentMode('ONLINE')}
              activeOpacity={0.8}
            >
              <CreditCard size={20} color={paymentMode === 'ONLINE' ? '#ffffff' : colors.textMuted} />
              <Text style={[styles.payOptText, paymentMode === 'ONLINE' && styles.payOptTextActive]}>
                UPI / Online
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <LoadingSpinner message="" />
          ) : (
            <>
              <Text style={styles.submitBtnText}>Submit for Gate Approval ({formatCurrency(totalFee)})</Text>
              <ArrowRight size={18} color="#ffffff" />
            </>
          )}
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
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.surfaceGlassBorder,
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 12,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  countBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.cardSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  countBtnDisabled: {
    opacity: 0.4,
  },
  countDisplay: {
    alignItems: 'center',
  },
  countText: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  countSub: {
    fontSize: 12,
    color: colors.textMuted,
  },
  feeSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  feeLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  totalFeeText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryLight,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.cardSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 15,
  },
  paymentOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  payOpt: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardSecondary,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  payOptActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
  },
  payOptText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  payOptTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 30,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
