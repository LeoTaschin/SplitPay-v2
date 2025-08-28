import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../types';

// Importar telas
import { HomeScreen } from '../screens/HomeScreen';
import { NewDebtScreen } from '../screens/NewDebtScreen';
import { DebtDetailsScreen } from '../screens/DebtDetailsScreen';
import { GroupDetailScreen } from '../screens/GroupDetailScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { FriendProfileScreen } from '../screens/FriendProfileScreen';
import { FriendTransactionsScreen } from '../screens/FriendTransactionsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const MainNavigator: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        // Forçar re-renderização quando o tema mudar
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        key={`home-${isDark}`} // Forçar re-renderização
      />
      <Stack.Screen 
        name="NewDebt" 
        component={NewDebtScreen}
        key={`new-debt-${isDark}`}
      />
      <Stack.Screen 
        name="DebtDetails" 
        component={DebtDetailsScreen}
        key={`debt-details-${isDark}`}
      />
      <Stack.Screen 
        name="GroupDetail" 
        component={GroupDetailScreen}
        key={`group-detail-${isDark}`}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        key={`settings-${isDark}`}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        key={`edit-profile-${isDark}`}
      />
      <Stack.Screen 
        name="FriendProfile" 
        component={FriendProfileScreen}
        key={`friend-profile-${isDark}`}
      />
      <Stack.Screen 
        name="FriendTransactions" 
        component={FriendTransactionsScreen}
        key={`friend-transactions-${isDark}`}
      />
    </Stack.Navigator>
  );
}; 