import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { RootStackParamList } from '../types';

// Importar telas (serão criadas depois)
import { SplashScreen } from '../screens/SplashScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { MainNavigator } from './MainNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [isReadyToHideSplash, setIsReadyToHideSplash] = useState(false);

  // Quando o carregamento terminar, inicia o fade-out
  useEffect(() => {
    if (!loading) {
      setIsReadyToHideSplash(true);
    }
  }, [loading]);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {user ? (
          // Usuário autenticado - mostrar navegação principal
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          // Usuário não autenticado - mostrar telas de auth
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        )}
      </Stack.Navigator>

      {showSplash && (
        <SplashScreen
          isReady={isReadyToHideSplash}
          onFadeOutComplete={() => setShowSplash(false)}
        />
      )}
    </NavigationContainer>
  );
}; 