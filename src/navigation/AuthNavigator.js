import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import VisitorEntryScreen from '../screens/public/VisitorEntryScreen';
import EntrySuccessScreen from '../screens/public/EntrySuccessScreen';
import PublicReportScreen from '../screens/public/PublicReportScreen';
import BeachRulesScreen from '../screens/user/BeachRulesScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="VisitorEntry" component={VisitorEntryScreen} />
      <Stack.Screen name="EntrySuccess" component={EntrySuccessScreen} />
      <Stack.Screen name="PublicReport" component={PublicReportScreen} />
      <Stack.Screen name="BeachRules" component={BeachRulesScreen} />
    </Stack.Navigator>
  );
}
