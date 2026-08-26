import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Initialize i18n
import './src/i18n/i18n';

// Providers
import { AuthProvider } from './src/context/AuthContext';
import { FeatureProvider } from './src/context/FeatureContext';
import { EmergencyProvider } from './src/context/EmergencyContext';

// Navigation
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#020617" />
      <AuthProvider>
        <FeatureProvider>
          <EmergencyProvider>
            <RootNavigator />
          </EmergencyProvider>
        </FeatureProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
