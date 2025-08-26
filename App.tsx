import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { presenceService } from './src/services/presenceService';
import { auth } from './src/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AppContent = () => {
  const { isDark } = useTheme();
  
  useEffect(() => {
    // Initialize presence service when user is authenticated
    console.log('🔍 App: Setting up auth state listener');
    console.log('🔍 App: Auth object available:', !!auth);
    
    const unsubscribe = onAuthStateChanged(auth, async (user: any) => {
      console.log('🔍 App: Auth state changed:', user?.uid);
      console.log('🔍 App: User email:', user?.email);
      if (user) {
        console.log('🔍 App: Initializing presence service for user:', user.uid);
        try {
          await presenceService.initialize();
          console.log('✅ App: Presence service initialized successfully');
        } catch (error) {
          console.error('❌ App: Failed to initialize presence service:', error);
        }
      } else {
        console.log('🔍 App: Cleaning up presence service');
        presenceService.cleanup();
      }
    });

    return () => {
      unsubscribe();
      presenceService.cleanup();
    };
  }, []);
  
  return (
    <>
      <StatusBar 
        style={isDark ? 'light' : 'dark'} 
        backgroundColor={isDark ? '#121212' : '#F5F5F5'}
        translucent={false}
      />
      <AppNavigator />
    </>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
} 