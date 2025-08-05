import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

// Importar telas
import { HomeScreen } from '../screens/HomeScreen';
import { NewDebtScreen } from '../screens/NewDebtScreen';
import { DebtDetailsScreen } from '../screens/DebtDetailsScreen';
import { GroupDetailScreen } from '../screens/GroupDetailScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="NewDebt" component={NewDebtScreen} />
      <Stack.Screen name="DebtDetails" component={DebtDetailsScreen} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
}; 