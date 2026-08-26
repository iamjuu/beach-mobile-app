import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import {
  AlertTriangle,
  Camera,
  MapPin,
  Send,
  Trash2,
  Car,
  Volume2,
  ShieldAlert,
  HelpCircle,
  Clock,
  List,
  PlusCircle,
} from 'lucide-react-native';
import * as reportApi from '../../api/reportApi';
import { colors } from '../../theme/colors';
import { formatDateTime } from '../../utils/formatters';
import { useFeatureSettings } from '../../context/FeatureContext';
import TabMaintenanceOverlay from '../../components/common/TabMaintenanceOverlay';
import BeachBanner from '../../components/common/BeachBanner';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CATEGORIES = [
  { id: 'GARBAGE', label: 'Garbage / Litter', icon: Trash2 },
  { id: 'UNSAFE_DRIVING', label: 'Unsafe Driving', icon: Car },
  { id: 'DAMAGED_FACILITY', label: 'Damaged Facility', icon: ShieldAlert },
  { id: 'NOISE', label: 'Noise / Disturbance', icon: Volume2 },
  { id: 'SAFETY', label: 'Safety / Hazards', icon: AlertTriangle },
  { id: 'OTHER', label: 'Other Issue', icon: HelpCircle },
];

export default function UserReportScreen() {
  const { getTabMaintenance } = useFeatureSettings();
  const tabMaintenance = getTabMaintenance('/user/report');

  const [activeTab, setActiveTab] = useState('SUBMIT'); // 'SUBMIT' | 'MY_REPORTS'
  const [category, setCategory] = useState('GARBAGE');
  const [description, setDescription] = useState('');
  const [locationText, setLocationText] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [gpsCoords, setGpsCoords] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // My Reports list
  const [myReports, setMyReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCurrentLocation();
    fetchMyReports();
  }, []);

  const fetchCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setGpsCoords({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        setLocationText(`GPS: ${loc.coords.latitude.toFixed(5)}, ${loc.coords.longitude.toFixed(5)}`);
      }
    } catch {
      // ignore
    }
  };

  const fetchMyReports = async () => {
    try {
      setLoadingReports(true);
      const res = await reportApi.getMyReports();
      const list = res.data?.data?.reports || res.data?.data || [];
      setMyReports(list);
    } catch {
      // ignore
    } finally {
      setLoadingReports(false);
      setRefreshing(false);
    }
  };

  const handlePickPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission needed to attach incident photo.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setPhotoUri(result.assets[0].uri);
      }
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Required', 'Please describe the incident.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('category', category);
      formData.append('description', description.trim());
      formData.append('location', locationText || 'Muzhappilangad Beach Area');
      if (gpsCoords) {
        formData.append('coordinates', JSON.stringify(gpsCoords));
      }

      if (photoUri) {
        const filename = photoUri.split('/').pop() || 'report.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append('photo', {
          uri: photoUri,
          name: filename,
          type,
        });
      }

      await reportApi.createReport(formData);
      Alert.alert('Report Logged', 'Your report has been submitted to gate security authorities.');
      setDescription('');
      setPhotoUri(null);
      setActiveTab('MY_REPORTS');
      fetchMyReports();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit incident report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <TabMaintenanceOverlay maintenanceData={tabMaintenance} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchMyReports();
            }}
            tintColor={colors.primary}
          />
        }
      >
        <BeachBanner
          type="reports"
          title="Incident Management"
          subtitle="Report beach hazards, waste, and unsafe driving"
          showBadge={false}
        />

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'SUBMIT' && styles.activeTab]}
            onPress={() => setActiveTab('SUBMIT')}
            activeOpacity={0.8}
          >
            <PlusCircle size={16} color={activeTab === 'SUBMIT' ? '#ffffff' : colors.textMuted} />
            <Text style={[styles.tabText, activeTab === 'SUBMIT' && styles.activeTabText]}>
              Submit New Issue
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'MY_REPORTS' && styles.activeTab]}
            onPress={() => {
              setActiveTab('MY_REPORTS');
              fetchMyReports();
            }}
            activeOpacity={0.8}
          >
            <List size={16} color={activeTab === 'MY_REPORTS' ? '#ffffff' : colors.textMuted} />
            <Text style={[styles.tabText, activeTab === 'MY_REPORTS' && styles.activeTabText]}>
              My Reports ({myReports.length})
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'SUBMIT' ? (
          <View style={styles.formContainer}>
            {/* Category Pills */}
            <Text style={styles.sectionLabel}>ISSUE CATEGORY</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                const Icon = cat.icon;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryCard, isSelected && styles.categoryCardActive]}
                    onPress={() => setCategory(cat.id)}
                    activeOpacity={0.8}
                  >
                    <Icon size={18} color={isSelected ? '#ffffff' : colors.textMuted} />
                    <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Description */}
            <Text style={styles.sectionLabel}>ISSUE DETAILS</Text>
            <View style={styles.inputCard}>
              <TextInput
                style={styles.textArea}
                placeholder="Describe what happened, exact spot, vehicle registration..."
                placeholderTextColor={colors.textDark}
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
              />
            </View>

            {/* Location */}
            <Text style={styles.sectionLabel}>BEACH LOCATION</Text>
            <View style={styles.locationCard}>
              <MapPin size={18} color={colors.primaryLight} />
              <TextInput
                style={styles.locationInput}
                placeholder="Beach spot or landmark..."
                placeholderTextColor={colors.textDark}
                value={locationText}
                onChangeText={setLocationText}
              />
            </View>

            {/* Photo Attachment */}
            <Text style={styles.sectionLabel}>ATTACH PHOTO EVIDENCE</Text>
            <TouchableOpacity style={styles.photoBox} onPress={handlePickPhoto} activeOpacity={0.8}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Camera size={26} color={colors.primaryLight} />
                  <Text style={styles.photoText}>Tap to Capture / Choose Photo</Text>
                </View>
              )}
            </TouchableOpacity>

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
                  <Send size={18} color="#ffffff" />
                  <Text style={styles.submitBtnText}>Submit Incident Report</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          /* My Reports List */
          <View style={styles.myReportsList}>
            {loadingReports ? (
              <LoadingSpinner message="Loading your reports..." />
            ) : myReports.length === 0 ? (
              <View style={styles.emptyReports}>
                <ShieldAlert size={40} color={colors.textDark} />
                <Text style={styles.emptyReportsTitle}>No Submitted Reports</Text>
                <Text style={styles.emptyReportsSub}>
                  Any incident or safety hazard you report will appear here with live resolution status.
                </Text>
              </View>
            ) : (
              myReports.map((rep, idx) => (
                <View key={rep._id || rep.id || idx} style={styles.reportCard}>
                  <View style={styles.reportHeader}>
                    <View style={styles.reportCategoryPill}>
                      <Text style={styles.reportCategoryText}>{rep.category || 'INCIDENT'}</Text>
                    </View>
                    <StatusBadge status={rep.status || 'OPEN'} />
                  </View>

                  <Text style={styles.reportDesc}>{rep.description}</Text>

                  {rep.photoUrl ? (
                    <Image source={{ uri: rep.photoUrl }} style={styles.reportPhoto} />
                  ) : null}

                  <View style={styles.reportFooter}>
                    <View style={styles.metaRow}>
                      <MapPin size={12} color={colors.textMuted} />
                      <Text style={styles.metaText} numberOfLines={1}>
                        {rep.location || 'Muzhappilangad Beach'}
                      </Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Clock size={12} color={colors.textMuted} />
                      <Text style={styles.metaText}>{formatDateTime(rep.createdAt || new Date())}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.cardSecondary,
    borderRadius: 16,
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  activeTabText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  formContainer: {
    paddingHorizontal: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 6,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardSecondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  categoryCardActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
  },
  categoryText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  inputCard: {
    backgroundColor: colors.cardSecondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 14,
  },
  textArea: {
    color: colors.textPrimary,
    fontSize: 14,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardSecondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    marginBottom: 14,
    gap: 10,
  },
  locationInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    paddingVertical: 10,
  },
  photoBox: {
    width: '100%',
    height: 130,
    backgroundColor: colors.cardSecondary,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 20,
  },
  photoPlaceholder: {
    alignItems: 'center',
    gap: 6,
  },
  photoText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  myReportsList: {
    paddingHorizontal: 16,
  },
  emptyReports: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceGlassBorder,
  },
  emptyReportsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptyReportsSub: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  reportCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceGlassBorder,
    marginBottom: 12,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reportCategoryPill: {
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  reportCategoryText: {
    color: colors.primaryLight,
    fontSize: 11,
    fontWeight: '700',
  },
  reportDesc: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: 10,
  },
  reportPhoto: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    marginBottom: 10,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
