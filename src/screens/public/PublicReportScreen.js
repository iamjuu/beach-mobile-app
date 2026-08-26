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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import {
  AlertTriangle,
  Camera,
  MapPin,
  ArrowLeft,
  Send,
  Trash2,
  Car,
  Volume2,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react-native';
import * as reportApi from '../../api/reportApi';
import { colors } from '../../theme/colors';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CATEGORIES = [
  { id: 'GARBAGE', label: 'Garbage / Litter', icon: Trash2 },
  { id: 'UNSAFE_DRIVING', label: 'Unsafe Driving / Speeding', icon: Car },
  { id: 'DAMAGED_FACILITY', label: 'Damaged Gate / Lighting', icon: ShieldAlert },
  { id: 'NOISE', label: 'Noise / Disturbance', icon: Volume2 },
  { id: 'SAFETY', label: 'Safety / High Tide Hazard', icon: AlertTriangle },
  { id: 'OTHER', label: 'Other Issue', icon: HelpCircle },
];

export default function PublicReportScreen({ navigation }) {
  const [category, setCategory] = useState('GARBAGE');
  const [description, setDescription] = useState('');
  const [locationText, setLocationText] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [gpsCoords, setGpsCoords] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  const fetchCurrentLocation = async () => {
    try {
      setGettingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setGpsCoords({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        setLocationText(`GPS: ${loc.coords.latitude.toFixed(5)}, ${loc.coords.longitude.toFixed(5)} (Muzhappilangad Beach)`);
      }
    } catch {
      // ignore
    } finally {
      setGettingLocation(false);
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
      // fallback to gallery
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
      Alert.alert('Required', 'Please describe the incident or issue.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('category', category);
      formData.append('description', description.trim());
      formData.append('location', locationText || 'Muzhappilangad Beach');
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
      Alert.alert('Report Submitted', 'Thank you! Gate security and local authorities have received your report.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Submission Error', err.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Nav */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Report Beach Incident</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <AlertTriangle size={28} color="#f59e0b" />
          <Text style={styles.headerTitle}>Public Safety & Issue Reporter</Text>
          <Text style={styles.headerSub}>Help keep Muzhappilangad Beach safe and pristine</Text>
        </View>

        {/* Category Pills */}
        <Text style={styles.sectionLabel}>SELECT ISSUE CATEGORY</Text>
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
                <Icon size={20} color={isSelected ? '#ffffff' : colors.textMuted} />
                <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Description */}
        <Text style={styles.sectionLabel}>DESCRIPTION</Text>
        <View style={styles.inputCard}>
          <TextInput
            style={styles.textArea}
            placeholder="Describe the problem, exact spot, vehicle numbers if any..."
            placeholderTextColor={colors.textDark}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Location Box */}
        <Text style={styles.sectionLabel}>BEACH LOCATION</Text>
        <View style={styles.locationCard}>
          <MapPin size={18} color={colors.primaryLight} />
          <TextInput
            style={styles.locationInput}
            placeholder="Enter beach landmark or GPS coordinates..."
            placeholderTextColor={colors.textDark}
            value={locationText}
            onChangeText={setLocationText}
          />
        </View>

        {/* Photo Upload */}
        <Text style={styles.sectionLabel}>ATTACH PHOTO EVIDENCE</Text>
        <TouchableOpacity style={styles.photoBox} onPress={handlePickPhoto} activeOpacity={0.8}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Camera size={28} color={colors.primaryLight} />
              <Text style={styles.photoText}>Tap to Capture / Choose Incident Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Submit Button */}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 6,
  },
  headerSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 10,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardSecondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
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
    marginBottom: 16,
  },
  textArea: {
    color: colors.textPrimary,
    fontSize: 14,
    minHeight: 80,
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
    marginBottom: 16,
    gap: 10,
  },
  locationInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    paddingVertical: 12,
  },
  photoBox: {
    width: '100%',
    height: 140,
    backgroundColor: colors.cardSecondary,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 24,
  },
  photoPlaceholder: {
    alignItems: 'center',
    gap: 6,
  },
  photoText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 30,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
