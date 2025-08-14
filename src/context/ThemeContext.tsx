import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from '../types';
import { lightTheme, darkTheme } from '../theme';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@theme_preference';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState<boolean>(systemColorScheme === 'dark');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Carregar preferência salva
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme !== null) {
          setIsDark(savedTheme === 'dark');
        } else {
          // Se não há preferência salva, usar o tema do sistema
          setIsDark(systemColorScheme === 'dark');
        }
      } catch (error) {
        console.error('Erro ao carregar preferência de tema:', error);
        setIsDark(systemColorScheme === 'dark');
      } finally {
        setIsLoaded(true);
      }
    };

    loadThemePreference();
  }, [systemColorScheme]);

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    // Salvar imediatamente
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Erro ao salvar preferência de tema:', error);
    }
  };

  const setTheme = async (dark: boolean) => {
    setIsDark(dark);
    
    // Salvar imediatamente
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, dark ? 'dark' : 'light');
    } catch (error) {
      console.error('Erro ao salvar preferência de tema:', error);
    }
  };

  // Salvar preferência quando mudar (backup)
  useEffect(() => {
    if (isLoaded) {
      const saveThemePreference = async () => {
        try {
          await AsyncStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
        } catch (error) {
          console.error('Erro ao salvar preferência de tema:', error);
        }
      };

      saveThemePreference();
    }
  }, [isDark, isLoaded]);

  const theme = isDark ? darkTheme : lightTheme;

  const value: ThemeContextType = {
    theme,
    isDark,
    toggleTheme,
    setTheme,
  };

  // Não renderizar até carregar a preferência
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
}; 