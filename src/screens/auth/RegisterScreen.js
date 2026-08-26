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
  FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  Search,
  UserCheck,
  Camera,
  CheckCircle,
  Phone,
  Lock,
  ArrowLeft,
  Shield,
  MapPin,
  Home,
} from 'lucide-react-native';
import * as publicApi from '../../api/publicApi';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function RegisterScreen({ navigation }) {
  const { registerResident } = useAuth();

  // Search Step
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState(null);

  // Form Step
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Search Required', 'Enter your name or voter ID to search.');
      return;
    }

    try {
      setSearching(true);
      const res = await publicApi.searchResidents(searchQuery.trim());
      const list = res.data?.data?.residents || res.data?.data || [];
      setSearchResults(list);
      if (list.length === 0) {
        Alert.alert('No Match Found', 'No voter record found. Please verify spelling or contact local Panchayat office.');
      }
    } catch (err) {
      Alert.alert('Search Error', err.response?.data?.message || 'Failed to search voter registry.');
    } finally {
      setSearching(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to capture your pass photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch {
      // fallback to gallery
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setPhotoUri(result.assets[0].uri);
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedVoter) {
      Alert.alert('Selection Required', 'Please select your voter record first.');
      return;
    }
    if (!phone) {
      Alert.alert('Phone Required', 'Please enter your phone number.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('name', selectedVoter.name);
      formData.append('secId', selectedVoter.secId || selectedVoter.voterId);
      formData.append('ward', String(selectedVoter.ward || ''));
      formData.append('houseName', selectedVoter.houseName || selectedVoter.address || '');
      formData.append('phone', phone);
      formData.append('password', password || '123456');

      if (photoUri) {
        const filename = photoUri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append('photo', {
          uri: photoUri,
          name: filename,
          type,
        });
      }

      await registerResident(formData);
      Alert.alert('Pass Created!', 'Your resident digital pass is ready.', [
        { text: 'Continue', onPress: () => {} },
      ]);
    } catch (err) {
      Alert.alert('Registration Failed', err.response?.data?.message || 'Failed to create resident pass.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Register Resident Pass</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!selectedVoter ? (
          <>
            {/* Step 1: Search Voter Roll */}
            <View style={styles.stepHeader}>
              <Text style={styles.stepBadge}>STEP 1 OF 2</Text>
              <Text style={styles.stepTitle}>Find Official Voter Record</Text>
              <Text style={styles.stepDesc}>
                Search Muzhappilangad Panchayat electoral roll by resident name or voter ID.
              </Text>
            </View>

            <View style={styles.searchBox}>
              <TextInput
                style={styles.searchInput}
                placeholder="Enter Resident Name or SEC ID..."
                placeholderTextColor={colors.textDark}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity
                style={styles.searchBtn}
                onPress={handleSearch}
                disabled={searching}
                activeOpacity={0.8}
              >
                {searching ? <LoadingSpinner message="" /> : <Search size={18} color="#ffffff" />}
              </TouchableOpacity>
            </View>

            {/* Results list */}
            {searchResults.map((item, idx) => (
              <TouchableOpacity
                key={item._id || item.secId || idx}
                style={styles.voterCard}
                onPress={() => {
                  setSelectedVoter(item);
                  if (item.phone) setPhone(item.phone);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.voterInfo}>
                  <Text style={styles.voterName}>{item.name}</Text>
                  <View style={styles.voterMeta}>
                    <Text style={styles.voterMetaText}>SEC ID: {item.secId || item.voterId}</Text>
                    <Text style={styles.voterMetaText}>• Ward {item.ward}</Text>
                  </View>
                  <Text style={styles.voterAddress}>{item.houseName || item.address || 'Muzhappilangad'}</Text>
                </View>
                <View style={styles.selectBtn}>
                  <Text style={styles.selectBtnText}>Select</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <>
            {/* Step 2: Confirmation & Photo */}
            <View style={styles.stepHeader}>
              <Text style={styles.stepBadge}>STEP 2 OF 2</Text>
              <Text style={styles.stepTitle}>Verify & Complete Pass</Text>
            </View>

            {/* Selected Voter Banner */}
            <View style={styles.selectedBanner}>
              <View style={styles.selectedTop}>
                <CheckCircle size={20} color={colors.success} />
                <Text style={styles.selectedName}>{selectedVoter.name}</Text>
              </View>
              <Text style={styles.selectedDetail}>
                SEC ID: {selectedVoter.secId || selectedVoter.voterId} • Ward {selectedVoter.ward}
              </Text>
              <TouchableOpacity
                style={styles.changeLink}
                onPress={() => setSelectedVoter(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.changeLinkText}>Change Record</Text>
              </TouchableOpacity>
            </View>

            {/* Photo Capture */}
            <View style={styles.photoSection}>
              <Text style={styles.inputLabel}>Resident Pass Photo (Selfie)</Text>
              <TouchableOpacity style={styles.photoBox} onPress={handlePickImage} activeOpacity={0.8}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.previewImage} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Camera size={32} color={colors.primaryLight} />
                    <Text style={styles.photoPrompt}>Take Selfie / Upload ID Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Phone & Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number for Gate Pass Access</Text>
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

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pass Access Password (Optional)</Text>
              <View style={styles.inputWrapper}>
                <Lock size={18} color={colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="Set a password for login"
                  placeholderTextColor={colors.textDark}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

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
                  <Shield size={18} color="#ffffff" />
                  <Text style={styles.submitBtnText}>Generate Free Resident Pass</Text>
                </>
              )}
            </TouchableOpacity>
          </>
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
  stepHeader: {
    marginBottom: 20,
  },
  stepBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryLight,
    letterSpacing: 1,
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  stepDesc: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  searchBox: {
    flexDirection: 'row',
    backgroundColor: colors.cardSecondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 15,
  },
  searchBtn: {
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 10,
  },
  voterCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  voterInfo: {
    flex: 1,
  },
  voterName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  voterMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  voterMetaText: {
    fontSize: 12,
    color: colors.primaryLight,
    fontWeight: '600',
  },
  voterAddress: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  selectBtn: {
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  selectBtnText: {
    color: colors.primaryLight,
    fontWeight: '700',
    fontSize: 13,
  },
  selectedBanner: {
    backgroundColor: colors.cardSecondary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    marginBottom: 20,
  },
  selectedTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  selectedDetail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  changeLink: {
    marginTop: 8,
  },
  changeLinkText: {
    fontSize: 12,
    color: colors.primaryLight,
    fontWeight: '600',
  },
  photoSection: {
    marginBottom: 16,
  },
  photoBox: {
    width: '100%',
    height: 160,
    backgroundColor: colors.cardSecondary,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photoPlaceholder: {
    alignItems: 'center',
    gap: 8,
  },
  photoPrompt: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: '100%',
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
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
