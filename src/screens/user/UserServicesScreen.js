import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Linking,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Search,
  Car,
  Utensils,
  Hotel,
  Phone,
  Clock,
  MapPin,
  Tag,
  Sparkles,
  ChevronRight,
} from 'lucide-react-native';
import * as serviceApi from '../../api/serviceApi';
import { colors } from '../../theme/colors';
import { formatCurrency } from '../../utils/formatters';
import { useFeatureSettings } from '../../context/FeatureContext';
import TabMaintenanceOverlay from '../../components/common/TabMaintenanceOverlay';
import FoodMenuModal from '../../components/modals/FoodMenuModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CATEGORY_TABS = [
  { id: 'ALL', label: 'All Services', icon: Sparkles },
  { id: 'TAXI', label: 'Auto & Taxi', icon: Car },
  { id: 'RESTAURANT', label: 'Food & Cafes', icon: Utensils },
  { id: 'RESORT', label: 'Resorts & Stays', icon: Hotel },
];

export default function UserServicesScreen() {
  const { getTabMaintenance } = useFeatureSettings();
  const tabMaintenance = getTabMaintenance('/user/services');

  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeTab !== 'ALL') params.category = activeTab;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await serviceApi.getServices(params);
      const list = res.data?.services || res.data || [];
      setServices(list);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [activeTab]);

  const handleCall = (phoneNumber) => {
    if (!phoneNumber) {
      Alert.alert('No Phone', 'No contact number listed for this service.');
      return;
    }
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const filteredServices = services.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.driverName?.toLowerCase().includes(q) ||
      s.vehicleNumber?.toLowerCase().includes(q) ||
      s.cuisine?.toLowerCase().includes(q) ||
      s.standLocation?.toLowerCase().includes(q)
    );
  });

  return (
    <View style={styles.container}>
      <TabMaintenanceOverlay maintenanceData={tabMaintenance} />

      {/* Search Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Beach Services Directory</Text>
        <Text style={styles.headerSubtitle}>Verified local drivers, fresh seafood & coastal stays</Text>

        <View style={styles.searchBar}>
          <Search size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search auto, restaurant, resort..."
            placeholderTextColor={colors.textDark}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={fetchServices}
          />
        </View>

        {/* Category Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {CATEGORY_TABS.map((tab) => {
            const isSelected = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabPill, isSelected && styles.tabPillActive]}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.8}
              >
                <Icon size={16} color={isSelected ? '#ffffff' : colors.textMuted} />
                <Text style={[styles.tabPillText, isSelected && styles.tabPillTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Services List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchServices();
            }}
            tintColor={colors.primary}
          />
        }
      >
        {loading ? (
          <LoadingSpinner message="Loading beach services..." />
        ) : filteredServices.length === 0 ? (
          <View style={styles.emptyState}>
            <Car size={48} color={colors.textDark} />
            <Text style={styles.emptyTitle}>No Services Found</Text>
            <Text style={styles.emptySubtitle}>Try changing category filter or search query.</Text>
          </View>
        ) : (
          filteredServices.map((item, idx) => {
            const isTaxi = item.category === 'TAXI' || item.type === 'TAXI';
            const isRestaurant = item.category === 'RESTAURANT' || item.type === 'RESTAURANT';
            const isResort = item.category === 'RESORT' || item.type === 'RESORT';

            return (
              <View key={item._id || item.id || idx} style={styles.serviceCard}>
                {/* Taxi / Auto Card */}
                {isTaxi && (
                  <View style={styles.cardInner}>
                    <View style={styles.serviceTop}>
                      <View style={styles.taxiAvatar}>
                        <Car size={24} color={colors.primaryLight} />
                      </View>
                      <View style={styles.serviceMeta}>
                        <View style={styles.nameRow}>
                          <Text style={styles.serviceName}>{item.driverName || item.name}</Text>
                          <View style={styles.vehiclePill}>
                            <Text style={styles.vehiclePillText}>{item.vehicleType || 'Auto Rickshaw'}</Text>
                          </View>
                        </View>
                        <Text style={styles.vehicleNumber}>{item.vehicleNumber || 'KL-13-AB-XXXX'}</Text>
                        <View style={styles.locationRow}>
                          <MapPin size={12} color={colors.textMuted} />
                          <Text style={styles.locationText}>{item.standLocation || 'Muzhappilangad Beach Stand'}</Text>
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.callBtn}
                      onPress={() => handleCall(item.phone || item.contactNumber)}
                      activeOpacity={0.8}
                    >
                      <Phone size={16} color="#ffffff" />
                      <Text style={styles.callBtnText}>Call Driver</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Restaurant Card */}
                {isRestaurant && (
                  <View style={styles.cardInner}>
                    <View style={styles.serviceTop}>
                      {item.photoUrl ? (
                        <Image source={{ uri: item.photoUrl }} style={styles.restaurantImage} />
                      ) : (
                        <View style={styles.restaurantPlaceholder}>
                          <Utensils size={24} color={colors.primaryLight} />
                        </View>
                      )}
                      <View style={styles.serviceMeta}>
                        <Text style={styles.serviceName}>{item.name}</Text>
                        <Text style={styles.cuisineText}>{item.cuisine || 'Kerala Seafood & Snacks'}</Text>
                        <View style={styles.timingRow}>
                          <Clock size={12} color={colors.textMuted} />
                          <Text style={styles.timingText}>{item.operatingHours || '10:00 AM - 10:00 PM'}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.restaurantActions}>
                      <TouchableOpacity
                        style={styles.menuBtn}
                        onPress={() => setSelectedRestaurant(item)}
                        activeOpacity={0.8}
                      >
                        <Utensils size={15} color={colors.primaryLight} />
                        <Text style={styles.menuBtnText}>
                          View Live Menu ({(item.menuItems || item.menu || []).length} Dishes)
                        </Text>
                        <ChevronRight size={14} color={colors.primaryLight} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.callBtnSmall}
                        onPress={() => handleCall(item.phone || item.contactNumber)}
                        activeOpacity={0.8}
                      >
                        <Phone size={15} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Resort Card */}
                {isResort && (
                  <View style={styles.cardInner}>
                    <View style={styles.serviceTop}>
                      {item.photoUrl ? (
                        <Image source={{ uri: item.photoUrl }} style={styles.restaurantImage} />
                      ) : (
                        <View style={styles.restaurantPlaceholder}>
                          <Hotel size={24} color={colors.primaryLight} />
                        </View>
                      )}
                      <View style={styles.serviceMeta}>
                        <Text style={styles.serviceName}>{item.name}</Text>
                        <Text style={styles.tariffText}>
                          Tariff: {formatCurrency(item.tariffPerNight || 2500)} / night
                        </Text>
                        <Text style={styles.amenitiesText}>
                          {Array.isArray(item.amenities) ? item.amenities.join(' • ') : 'Sea View • AC • Free Wifi'}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.callBtn}
                      onPress={() => handleCall(item.phone || item.contactNumber)}
                      activeOpacity={0.8}
                    >
                      <Phone size={16} color="#ffffff" />
                      <Text style={styles.callBtnText}>Call Reception & Book</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Live Menu Modal */}
      <FoodMenuModal
        visible={!!selectedRestaurant}
        restaurant={selectedRestaurant}
        onClose={() => setSelectedRestaurant(null)}
      />
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
    paddingBottom: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  headerSubtitle: {
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
    marginTop: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 14,
  },
  tabsRow: {
    paddingTop: 12,
    paddingBottom: 4,
    gap: 8,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.cardSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  tabPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
  },
  tabPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabPillTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  serviceCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceGlassBorder,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  cardInner: {
    gap: 12,
  },
  serviceTop: {
    flexDirection: 'row',
    gap: 12,
  },
  taxiAvatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.cardSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: 14,
  },
  restaurantPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: colors.cardSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceMeta: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  vehiclePill: {
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  vehiclePillText: {
    fontSize: 10,
    color: colors.primaryLight,
    fontWeight: '700',
  },
  vehicleNumber: {
    fontSize: 13,
    color: colors.primaryLight,
    fontWeight: '600',
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  cuisineText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  timingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  timingText: {
    fontSize: 11,
    color: colors.textDark,
  },
  tariffText: {
    fontSize: 13,
    color: colors.primaryLight,
    fontWeight: '700',
    marginTop: 2,
  },
  amenitiesText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  callBtn: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  callBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  restaurantActions: {
    flexDirection: 'row',
    gap: 8,
  },
  menuBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardSecondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuBtnText: {
    fontSize: 12,
    color: colors.primaryLight,
    fontWeight: '700',
  },
  callBtnSmall: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
