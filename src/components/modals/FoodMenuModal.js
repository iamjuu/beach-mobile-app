import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { X, Phone, Utensils, AlertCircle } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { formatCurrency } from '../../utils/formatters';

export default function FoodMenuModal({ visible, onClose, restaurant }) {
  if (!restaurant) return null;

  const menuItems = restaurant.menuItems || restaurant.menu || [];
  const phone = restaurant.phone || restaurant.contactNumber;

  const handleCallOrder = () => {
    if (!phone) {
      Alert.alert('No Phone', 'No contact number available for this restaurant.');
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };

  const getDietBadge = (type) => {
    const t = (type || '').toUpperCase();
    if (t === 'VEG') {
      return { label: 'VEG', bg: 'rgba(16, 185, 129, 0.2)', text: '#10b981', border: '#10b981' };
    }
    if (t === 'SEAFOOD') {
      return { label: 'SEAFOOD', bg: 'rgba(14, 165, 233, 0.2)', text: '#0ea5e9', border: '#0ea5e9' };
    }
    return { label: 'NON-VEG', bg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444', border: '#ef4444' };
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleArea}>
              <Text style={styles.title}>{restaurant.name || 'Restaurant Menu'}</Text>
              <Text style={styles.subtitle}>
                {restaurant.cuisine || 'Local Beach Cuisines'} • {menuItems.length} Dishes
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Menu Items List */}
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {menuItems.length === 0 ? (
              <View style={styles.emptyBox}>
                <Utensils size={40} color={colors.textDark} />
                <Text style={styles.emptyText}>No live menu items listed currently.</Text>
                <Text style={styles.emptySubtext}>Call the restaurant directly for daily specials!</Text>
              </View>
            ) : (
              menuItems.map((item, idx) => {
                const diet = getDietBadge(item.dietaryType || item.type);
                const isAvailable = item.isAvailable !== false && item.inStock !== false;

                return (
                  <View key={item._id || item.id || idx} style={styles.menuItemCard}>
                    <View style={styles.itemHeader}>
                      <View style={styles.itemNameCol}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        {item.description ? (
                          <Text style={styles.itemDesc}>{item.description}</Text>
                        ) : null}
                      </View>
                      <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
                    </View>

                    <View style={styles.itemFooter}>
                      <View style={styles.badgesRow}>
                        <View style={[styles.dietBadge, { borderColor: diet.border, backgroundColor: diet.bg }]}>
                          <Text style={[styles.dietBadgeText, { color: diet.text }]}>{diet.label}</Text>
                        </View>

                        <View
                          style={[
                            styles.stockBadge,
                            isAvailable ? styles.inStockBadge : styles.soldOutBadge,
                          ]}
                        >
                          <Text
                            style={[
                              styles.stockBadgeText,
                              isAvailable ? styles.inStockText : styles.soldOutText,
                            ]}
                          >
                            {isAvailable ? 'In Stock' : 'Sold Out'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Call to Order Footer */}
          {phone ? (
            <View style={styles.footer}>
              <TouchableOpacity style={styles.callButton} onPress={handleCallOrder} activeOpacity={0.8}>
                <Phone size={18} color="#ffffff" />
                <Text style={styles.callButtonText}>Call to Order ({phone})</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: colors.surfaceGlassBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  titleArea: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyBox: {
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  menuItemCard: {
    backgroundColor: colors.cardSecondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemNameCol: {
    flex: 1,
    paddingRight: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  itemDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryLight,
  },
  itemFooter: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dietBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  dietBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  inStockBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  soldOutBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  stockBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  inStockText: {
    color: colors.success,
  },
  soldOutText: {
    color: colors.danger,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  callButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  callButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
