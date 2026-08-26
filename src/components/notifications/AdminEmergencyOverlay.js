import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { AlertCircle, Phone, Navigation, ShieldCheck, PhoneCall } from 'lucide-react-native';
import { useEmergency } from '../../context/EmergencyContext';
import { colors } from '../../theme/colors';

export default function AdminEmergencyOverlay() {
  const { activeEmergencies, claimEmergency, startCall } = useEmergency();

  const emergencyIds = Object.keys(activeEmergencies);
  if (emergencyIds.length === 0) return null;

  // Show the latest emergency
  const currentId = emergencyIds[0];
  const emergency = activeEmergencies[currentId];

  const handleOpenMaps = () => {
    if (emergency.coordinates) {
      const { latitude, longitude } = emergency.coordinates;
      const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      Linking.openURL(url);
    } else {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=Muzhappilangad+Drive-In+Beach`);
    }
  };

  const handleCallPhone = () => {
    if (emergency.userPhone) {
      Linking.openURL(`tel:${emergency.userPhone}`);
    }
  };

  const handleStartVoiceCall = () => {
    startCall(emergency.emergencyId, emergency.userId, emergency.userName || 'Distressed Resident');
  };

  return (
    <Modal visible={true} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Flashing Alert Header */}
          <View style={styles.alertHeader}>
            <AlertCircle size={32} color="#ffffff" />
            <Text style={styles.alertTitle}>EMERGENCY SOS ALERT</Text>
            <Text style={styles.alertSub}>Immediate Security Response Required</Text>
          </View>

          {/* Victim Details */}
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Victim / User:</Text>
              <Text style={styles.infoVal}>{emergency.userName || 'Beach Visitor'}</Text>
            </View>
            {emergency.userPhone ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone Number:</Text>
                <Text style={styles.infoVal}>{emergency.userPhone}</Text>
              </View>
            ) : null}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location:</Text>
              <Text style={styles.infoVal}>{emergency.location || 'Muzhappilangad Beach'}</Text>
            </View>
            {emergency.coordinates && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>GPS Coordinates:</Text>
                <Text style={styles.infoVal}>
                  {emergency.coordinates.latitude?.toFixed(5)}, {emergency.coordinates.longitude?.toFixed(5)}
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.mapBtn} onPress={handleOpenMaps} activeOpacity={0.8}>
              <Navigation size={18} color="#ffffff" />
              <Text style={styles.btnText}>Open in Google Maps</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.voiceBtn} onPress={handleStartVoiceCall} activeOpacity={0.8}>
              <PhoneCall size={18} color="#ffffff" />
              <Text style={styles.btnText}>Start Security Voice Call</Text>
            </TouchableOpacity>

            {emergency.userPhone ? (
              <TouchableOpacity style={styles.phoneBtn} onPress={handleCallPhone} activeOpacity={0.8}>
                <Phone size={18} color="#ffffff" />
                <Text style={styles.btnText}>Direct Cellular Call</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={styles.claimBtn}
              onPress={() => claimEmergency(currentId)}
              activeOpacity={0.8}
            >
              <ShieldCheck size={20} color="#ffffff" />
              <Text style={styles.claimText}>Claim & Stop Siren</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.card,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.danger,
    elevation: 12,
  },
  alertHeader: {
    backgroundColor: colors.danger,
    padding: 20,
    alignItems: 'center',
  },
  alertTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 6,
  },
  alertSub: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  infoBox: {
    padding: 20,
    backgroundColor: colors.cardSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },
  infoVal: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
    marginLeft: 10,
  },
  actions: {
    padding: 16,
    gap: 10,
  },
  mapBtn: {
    flexDirection: 'row',
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  voiceBtn: {
    flexDirection: 'row',
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  phoneBtn: {
    flexDirection: 'row',
    backgroundColor: colors.cardSecondary,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  claimBtn: {
    flexDirection: 'row',
    backgroundColor: colors.danger,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  claimText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});
