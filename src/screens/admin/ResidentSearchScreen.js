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
} from 'react-native';
import {
  Search,
  UserCheck,
  MapPin,
  CheckCircle,
  Hash,
  Home,
  User,
} from 'lucide-react-native';
import * as adminApi from '../../api/adminApi';
import { colors } from '../../theme/colors';
import { triggerSuccessHaptic } from '../../utils/vibrationUtils';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ResidentSearchScreen() {
  const [query, setQuery] = useState('');
  const [residents, setResidents] = useState([]);
  const [searching, setSearching] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      Alert.alert('Search Required', 'Enter resident name, SEC ID or ward.');
      return;
    }

    try {
      setSearching(true);
      const res = await adminApi.searchResidents({ query: query.trim() });
      const list = res.data?.data?.residents || res.data?.data || [];
      setResidents(list);
      if (list.length === 0) {
        Alert.alert('No Records', 'No matching resident found in Panchayat database.');
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to search residents.');
    } finally {
      setSearching(false);
    }
  };

  const handleManualVerify = async (resident) => {
    try {
      setVerifyingId(resident._id || resident.id || resident.secId);
      // Simulate/call manual entry verification
      const token = resident.qrToken || resident.secId || resident.voterId;
      await adminApi.scanResident(token);
      triggerSuccessHaptic();
      Alert.alert('Entry Approved 🟢', `Resident ${resident.name} (Ward ${resident.ward}) has been verified and logged.`);
    } catch (err) {
      Alert.alert('Verification Error', err.response?.data?.message || 'Failed to log manual entry.');
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Resident Manual Lookup</Text>
        <Text style={styles.subtitle}>Verify residents without phone or physical QR pass</Text>

        <View style={styles.searchBar}>
          <Search size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Name, SEC ID, or Ward..."
            placeholderTextColor={colors.textDark}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={handleSearch}
            disabled={searching}
            activeOpacity={0.8}
          >
            {searching ? <LoadingSpinner message="" /> : <Text style={styles.searchBtnText}>Search</Text>}
          </TouchableOpacity>
        </View>
      </View>

      {/* Results List */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {residents.length === 0 ? (
          <View style={styles.emptyCard}>
            <UserCheck size={40} color={colors.textDark} />
            <Text style={styles.emptyTitle}>Electoral Registry Lookup</Text>
            <Text style={styles.emptySub}>
              Search the Panchayat voter database to manually check-in residents.
            </Text>
          </View>
        ) : (
          residents.map((item, idx) => {
            const isVerifying = verifyingId === (item._id || item.id || item.secId);
            return (
              <View key={item._id || item.secId || idx} style={styles.residentCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatarCircle}>
                    {item.photoUrl ? (
                      <Image source={{ uri: item.photoUrl }} style={styles.avatarImg} />
                    ) : (
                      <User size={24} color={colors.primaryLight} />
                    )}
                  </View>

                  <View style={styles.metaCol}>
                    <Text style={styles.residentName}>{item.name}</Text>
                    <Text style={styles.secText}>SEC ID: {item.secId || item.voterId || 'N/A'}</Text>
                  </View>
                </View>

                <View style={styles.detailsRow}>
                  <View style={styles.detailItem}>
                    <MapPin size={13} color={colors.textMuted} />
                    <Text style={styles.detailText}>Ward {item.ward || '1'}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Home size={13} color={colors.textMuted} />
                    <Text style={styles.detailText}>{item.houseName || 'Muzhappilangad'}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.verifyBtn}
                  onPress={() => handleManualVerify(item)}
                  disabled={isVerifying}
                  activeOpacity={0.8}
                >
                  {isVerifying ? (
                    <LoadingSpinner message="" />
                  ) : (
                    <>
                      <CheckCircle size={16} color="#ffffff" />
                      <Text style={styles.verifyBtnText}>Verify & Authorize Gate Entry</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            );
          })
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
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardSecondary,
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 14,
  },
  searchBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  searchBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceGlassBorder,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  residentCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceGlassBorder,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.cardSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  metaCol: {
    flex: 1,
  },
  residentName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  secText: {
    fontSize: 12,
    color: colors.primaryLight,
    fontWeight: '600',
    marginTop: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 14,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  verifyBtn: {
    flexDirection: 'row',
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  verifyBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
