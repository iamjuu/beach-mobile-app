import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QrCode, Search, History, ShieldAlert, UserCheck } from 'lucide-react-native';
import { colors } from '../theme/colors';

import ScannerScreen from '../screens/admin/ScannerScreen';
import ResidentSearchScreen from '../screens/admin/ResidentSearchScreen';
import RecentEntriesScreen from '../screens/admin/RecentEntriesScreen';
import AdminReportsScreen from '../screens/admin/AdminReportsScreen';
import AdminProfileScreen from '../screens/admin/AdminProfileScreen';

const Tab = createBottomTabNavigator();

export default function AdminTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="AdminSearch"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.surfaceGlassBorder,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primaryLight,
        tabBarInactiveTintColor: colors.textDark,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="AdminScan"
        component={ScannerScreen}
        options={{
          tabBarLabel: 'QR Scanner',
          tabBarIcon: ({ color, size }) => <QrCode size={size || 22} color={color} />,
        }}
      />
      <Tab.Screen
        name="AdminSearch"
        component={ResidentSearchScreen}
        options={{
          tabBarLabel: 'Lookup',
          tabBarIcon: ({ color, size }) => <Search size={size || 22} color={color} />,
        }}
      />
      <Tab.Screen
        name="AdminRecent"
        component={RecentEntriesScreen}
        options={{
          tabBarLabel: 'Entries',
          tabBarIcon: ({ color, size }) => <History size={size || 22} color={color} />,
        }}
      />
      <Tab.Screen
        name="AdminReports"
        component={AdminReportsScreen}
        options={{
          tabBarLabel: 'Reports',
          tabBarIcon: ({ color, size }) => <ShieldAlert size={size || 22} color={color} />,
        }}
      />
      <Tab.Screen
        name="AdminProfile"
        component={AdminProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <UserCheck size={size || 22} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
