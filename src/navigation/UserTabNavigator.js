import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Sparkles, History, AlertTriangle, User } from 'lucide-react-native';
import { colors } from '../theme/colors';

import UserHomeScreen from '../screens/user/UserHomeScreen';
import UserServicesScreen from '../screens/user/UserServicesScreen';
import UserVisitsScreen from '../screens/user/UserVisitsScreen';
import UserReportScreen from '../screens/user/UserReportScreen';
import UserProfileScreen from '../screens/user/UserProfileScreen';
import BeachRulesScreen from '../screens/user/BeachRulesScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserHomeMain" component={UserHomeScreen} />
      <Stack.Screen name="BeachRules" component={BeachRulesScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserProfileMain" component={UserProfileScreen} />
      <Stack.Screen name="BeachRules" component={BeachRulesScreen} />
    </Stack.Navigator>
  );
}

export default function UserTabNavigator() {
  return (
    <Tab.Navigator
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
        name="UserHome"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home & Pass',
          tabBarIcon: ({ color, size }) => <Home size={size || 22} color={color} />,
        }}
      />
      <Tab.Screen
        name="UserServices"
        component={UserServicesScreen}
        options={{
          tabBarLabel: 'Services',
          tabBarIcon: ({ color, size }) => <Sparkles size={size || 22} color={color} />,
        }}
      />
      <Tab.Screen
        name="UserVisits"
        component={UserVisitsScreen}
        options={{
          tabBarLabel: 'Visits',
          tabBarIcon: ({ color, size }) => <History size={size || 22} color={color} />,
        }}
      />
      <Tab.Screen
        name="UserReport"
        component={UserReportScreen}
        options={{
          tabBarLabel: 'Report',
          tabBarIcon: ({ color, size }) => <AlertTriangle size={size || 22} color={color} />,
        }}
      />
      <Tab.Screen
        name="UserProfile"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size || 22} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
