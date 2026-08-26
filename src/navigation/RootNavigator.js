import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

import AuthNavigator from './AuthNavigator';
import UserTabNavigator from './UserTabNavigator';
import AdminTabNavigator from './AdminTabNavigator';

import AdminEmergencyOverlay from '../components/notifications/AdminEmergencyOverlay';
import VoiceCallOverlay from '../components/notifications/VoiceCallOverlay';
import UserLocationTracker from '../components/user/UserLocationTracker';

const navigationTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.card,
    text: colors.textPrimary,
    border: colors.borderLight,
    primary: colors.primary,
  },
};

export default function RootNavigator() {
  const { user, token, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <View style={styles.container}>
        {/* Role-Based Screen Navigation */}
        {!token || !user ? (
          <AuthNavigator />
        ) : isAdmin ? (
          <AdminTabNavigator />
        ) : (
          <UserTabNavigator />
        )}

        {/* Global Overlays */}
        {isAdmin && <AdminEmergencyOverlay />}
        <VoiceCallOverlay />
        <UserLocationTracker />
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
