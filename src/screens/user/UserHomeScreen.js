import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as ImagePicker from 'expo-image-picker';
import {
  ShieldAlert,
  ShieldCheck,
  Camera,
  Maximize2,
  AlertOctagon,
  XCircle,
  MapPin,
  Sparkles,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useEmergency } from '../../context/EmergencyContext';
import { useFeatureSettings } from '../../context/FeatureContext';
import * as residentPassApi from '../../api/residentPassApi';
import { colors } from '../../theme/colors';
import BeachBanner from '../../components/common/BeachBanner';
import StatusBadge from '../../components/common/StatusBadge';
import PassDetailsModal from '../../components/modals/PassDetailsModal';
import TabMaintenanceOverlay from '../../components/common/TabMaintenanceOverlay';

export default function UserHomeScreen({ navigation }) {
  const { user } = useAuth();
  const { triggerEmergency, userEmergencyState, cancelUserEmergency } = useEmergency();
  const { getTabMaintenance } = useFeatureSettings();

  const [passData, setPassData] = useState(null);
  const [qrToken, setQrToken] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [updatingPhoto, setUpdatingPhoto] = useState(false);

  const tabMaintenance = getTabMaintenance('/user/home') || getTabMaintenance('/user/my-pass');

  const fetchPass = async () => {
    try {
      setRefreshing(true);
      const res = await residentPassApi.getMyPass();
      const data = res.data?.data?.pass || res.data?.data;
      if (data) {
        setPassData(data);
      }
      const qrRes = await residentPassApi.getMyQr();
      if (qrRes.data?.data?.qrToken) {
        setQrToken(qrRes.data.data.qrToken);
      }
    } catch {
      // ignore
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPass();
  }, []);

  const handleUpdatePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera access is required to take a pass selfie.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setUpdatingPhoto(true);
        const photoUri = result.assets[0].uri;
        const filename = photoUri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        const formData = new FormData();
        formData.append('photo', {
          uri: photoUri,
          name: filename,
          type,
        });

        await residentPassApi.updateMyPhoto(formData);
        Alert.alert('Photo Updated', 'Your resident pass profile photo has been refreshed.');
        fetchPass();
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update photo.');
    } finally {
      setUpdatingPhoto(false);
    }
  };

  const handleTriggerSOS = () => {
    Alert.alert(
      '🚨 TRIGGER EMERGENCY SOS?',
      'This will broadcast high-priority audio sirens and your live GPS location to all Gate Security Officers.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'YES, TRIGGER SOS',
          style: 'destructive',
          onPress: () => triggerEmergency('Muzhappilangad Beach Shoreline'),
        },
      ]
    );
  };

  const resident = passData?.resident || user || {};
  const qrString = qrToken || passData?.qrToken || resident.secId || resident.voterId || 'MUZHA-RESIDENT-VALID';

  return (
    <View style={styles.container}>
      <TabMaintenanceOverlay maintenanceData={tabMaintenance} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchPass} tintColor={colors.primary} />}
      >
        {/* Hero Banner */}
        <BeachBanner
          type="home"
          title="Muzhappilangad Beach"
          subtitle="Resident Free Access Portal"
          onPressRules={() => navigation.navigate('BeachRules')}
        />

        {/* Emergency State Banner (if active) */}
        {userEmergencyState && (
          <View style={styles.emergencyBanner}>
            <View style={styles.emergencyIconBox}>
              <AlertOctagon size={24} color="#ffffff" />
            </View>
            <View style={styles.emergencyTextCol}>
              <Text style={styles.emergencyTitle}>EMERGENCY SOS ACTIVE</Text>
              <Text style={styles.emergencySub}>{userEmergencyState.message || 'Waiting for Gate Security Response...'}</Text>
            </View>
            <TouchableOpacity
              style={styles.cancelSosBtn}
              onPress={() => cancelUserEmergency(userEmergencyState.emergencyId)}
              activeOpacity={0.8}
            >
              <XCircle size={20} color="#ffffff" />
              <Text style={styles.cancelSosText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Resident Digital Pass Card */}
        <View style={styles.passCard}>
          <View style={styles.passHeader}>
            <View style={styles.passTitleRow}>
              <ShieldCheck size={20} color={colors.primary} />
              <Text style={styles.passCardTitle}>Official Resident Pass</Text>
            </View>
            <StatusBadge status={passData?.status || 'ACTIVE'} />
          </View>

          {/* Pass Body */}
          <View style={styles.passBody}>
            {/* Left Column: QR Code */}
            <TouchableOpacity
              style={styles.qrTouchable}
              onPress={() => setShowPassModal(true)}
              activeOpacity={0.85}
            >
              <View style={styles.qrFrame}>
                <QRCode value={qrString} size={110} color="#020617" backgroundColor="#ffffff" />
              </View>
              <View style={styles.tapToExpand}>
                <Maximize2 size={12} color={colors.primaryLight} />
                <Text style={styles.tapText}>Tap to Expand</Text>
              </View>
            </TouchableOpacity>

            {/* Right Column: Resident Details */}
            <View style={styles.detailsCol}>
              <View style={styles.photoRow}>
                <TouchableOpacity style={styles.avatarWrapper} onPress={handleUpdatePhoto} activeOpacity={0.8}>
                  {passData?.photoUrl || resident.photoUrl ? (
                    <Image source={{ uri: passData?.photoUrl || resident.photoUrl }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Camera size={18} color={colors.primaryLight} />
                    </View>
                  )}
                  <View style={styles.cameraIconBadge}>
                    <Camera size={10} color="#ffffff" />
                  </View>
                </TouchableOpacity>
                <View style={styles.nameBlock}>
                  <Text style={styles.residentName} numberOfLines={1}>
                    {resident.name || 'Resident Name'}
                  </Text>
                  <Text style={styles.secIdText}>SEC: {resident.secId || resident.voterId || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Ward:</Text>
                <Text style={styles.metaValue}>Ward {resident.ward || '1'}</Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>House:</Text>
                <Text style={styles.metaValue} numberOfLines={1}>
                  {resident.houseName || resident.address || 'Muzhappilangad'}
                </Text>
              </View>
            </View>
          </View>

          {/* Pass Footer */}
          <View style={styles.passFooter}>
            <Text style={styles.passNote}>
              Free entry for registered residents of Muzhappilangad Grama Panchayat.
            </Text>
          </View>
        </View>

        {/* Emergency SOS Alarm Button */}
        <TouchableOpacity
          style={styles.sosButton}
          onPress={handleTriggerSOS}
          activeOpacity={0.85}
        >
          <View style={styles.sosInner}>
            <View style={styles.sosIconCircle}>
              <ShieldAlert size={28} color="#ffffff" />
            </View>
            <View style={styles.sosTextCol}>
              <Text style={styles.sosTitle}>EMERGENCY SOS ALARM</Text>
              <Text style={styles.sosSubtitle}>
                Alert Gate Security & Dispatch Patrol Vehicle
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Full-Screen Pass Details Modal */}
      <PassDetailsModal
        visible={showPassModal}
        onClose={() => setShowPassModal(false)}
        passData={passData || { resident }}
        qrToken={qrString}
      />
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
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    borderRadius: 16,
    gap: 10,
  },
  emergencyIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyTextCol: {
    flex: 1,
  },
  emergencyTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  emergencySub: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    marginTop: 2,
  },
  cancelSosBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    gap: 4,
  },
  cancelSosText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  passCard: {
    marginHorizontal: 16,
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.surfaceGlassBorder,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  passHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: 12,
    marginBottom: 14,
  },
  passTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  passBody: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  qrTouchable: {
    alignItems: 'center',
  },
  qrFrame: {
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 16,
  },
  tapToExpand: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  tapText: {
    fontSize: 10,
    color: colors.primaryLight,
    fontWeight: '600',
  },
  detailsCol: {
    flex: 1,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cardSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameBlock: {
    flex: 1,
  },
  residentName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  secIdText: {
    fontSize: 11,
    color: colors.primaryLight,
    fontWeight: '600',
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  metaLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  metaValue: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  passFooter: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  passNote: {
    fontSize: 11,
    color: colors.textDark,
    textAlign: 'center',
  },
  sosButton: {
    marginHorizontal: 16,
    backgroundColor: colors.danger,
    borderRadius: 20,
    padding: 16,
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  sosInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  sosIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosTextCol: {
    flex: 1,
  },
  sosTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  sosSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    marginTop: 2,
  },
});
