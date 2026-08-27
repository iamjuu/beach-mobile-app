import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { ScanLine } from 'lucide-react-native';
import { colors } from '../../theme/colors';

export default function AdminScanFab() {
  const navigation = useNavigation();
  const state = useNavigationState((s) => s);
  const currentRoute = state?.routes?.[state?.index]?.name;

  if (currentRoute === 'AdminScan') {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={() => navigation.navigate('AdminScan')}
      activeOpacity={0.85}
    >
      <ScanLine size={24} color="#ffffff" strokeWidth={2.4} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
    zIndex: 999,
  },
});
