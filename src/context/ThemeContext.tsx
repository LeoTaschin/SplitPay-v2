import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from '../types';
import { lightTheme, darkTheme } from '../theme';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  themeMode: ThemeMode;
  systemColorScheme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
  isLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@splitpay_theme_preference';

interface ThemeProviderProps {
  children: ReactNode;
}

// Função helper para detectar tema do sistema de forma mais robusta
const getSystemTheme = (): 'light' | 'dark' => {
  try {
    // Primeiro tenta com Appearance.getColorScheme()
    const colorScheme = Appearance.getColorScheme();
    if (colorScheme === 'dark' || colorScheme === 'light') {
      return colorScheme;
    }
    
    // Fallback para useColorScheme hook
    return 'light'; // Default seguro
  } catch (error) {
    console.warn('Erro ao detectar tema do sistema:', error);
    return 'light';
  }
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Estados principais
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isDark, setIsDark] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [systemColorScheme, setSystemColorScheme] = useState<'light' | 'dark'>('light');
  
  // Hook do React Native para detectar mudanças
  const reactNativeColorScheme = useColorScheme();
  


  // Função para detectar tema do sistema
  const detectSystemTheme = (): 'light' | 'dark' => {
    try {
      // Prioridade 1: useColorScheme hook
      if (reactNativeColorScheme === 'dark' || reactNativeColorScheme === 'light') {
        return reactNativeColorScheme;
      }
      
      // Prioridade 2: Appearance.getColorScheme() (fallback)
      const appearanceScheme = Appearance.getColorScheme();
      if (appearanceScheme === 'dark' || appearanceScheme === 'light') {
        return appearanceScheme;
      }
      
      // Fallback seguro
      return 'light';
    } catch (error) {
      console.warn('Erro ao detectar tema do sistema:', error);
      return 'light';
    }
  };

  // Listener para mudanças do sistema usando Appearance
  useEffect(() => {
    const subscription = Appearance.addChangeListener(() => {
      const detectedTheme = detectSystemTheme();
      if (detectedTheme !== systemColorScheme) {
        setSystemColorScheme(detectedTheme);
      }
    });

    return () => subscription?.remove();
  }, [systemColorScheme]);

  // Listener para mudanças do useColorScheme (backup)
  useEffect(() => {
    const detectedTheme = detectSystemTheme();
    if (detectedTheme !== systemColorScheme) {
      setSystemColorScheme(detectedTheme);
    }
  }, [reactNativeColorScheme, systemColorScheme]);

  // Aplicar tema baseado no modo e sistema
  useEffect(() => {
    if (!isLoaded) return;
    
    if (themeMode === 'system') {
      const shouldBeDark = systemColorScheme === 'dark';
      if (isDark !== shouldBeDark) {
        setIsDark(shouldBeDark);
      }
    }
  }, [themeMode, systemColorScheme, isLoaded, isDark]);

  // Carregar preferências salvas (executar apenas uma vez)
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        // Detectar tema atual do sistema
        const currentSystemTheme = detectSystemTheme();
        setSystemColorScheme(currentSystemTheme);
        
        // Carregar preferência salva
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
          setThemeModeState(savedTheme as ThemeMode);
          
          if (savedTheme === 'system') {
            setIsDark(currentSystemTheme === 'dark');
          } else {
            setIsDark(savedTheme === 'dark');
          }
        } else {
          // Primeira vez - usar sistema
          setThemeModeState('system');
          setIsDark(currentSystemTheme === 'dark');
        }
      } catch (error) {
        console.error('Erro ao carregar preferência de tema:', error);
        const fallbackTheme = detectSystemTheme();
        setSystemColorScheme(fallbackTheme);
        setThemeModeState('system');
        setIsDark(fallbackTheme === 'dark');
      } finally {
        setIsLoaded(true);
      }
    };

    loadThemePreference();
  }, []); // Executar apenas uma vez

  // Função para alternar tema (para compatibilidade)
  const toggleTheme = async () => {
    const newMode: ThemeMode = isDark ? 'light' : 'dark';
    await handleSetThemeMode(newMode);
    
  };

  // Função para definir tema específico (para compatibilidade)
  const setTheme = async (dark: boolean) => {
    const newMode: ThemeMode = dark ? 'dark' : 'light';
    await handleSetThemeMode(newMode);
  };

  // Função principal para definir modo de tema
  const handleSetThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      
      if (mode === 'system') {
        const shouldBeDark = systemColorScheme === 'dark';
        setIsDark(shouldBeDark);
      } else {
        const shouldBeDark = mode === 'dark';
        setIsDark(shouldBeDark);
      }
      
      // Salvar preferência
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Erro ao definir tema:', error);
    }
  };



  // Calcular tema baseado no estado
  const theme = isDark ? darkTheme : lightTheme;

  // Valor do contexto
  const value: ThemeContextType = {
    theme,
    isDark,
    themeMode,
    systemColorScheme,
    toggleTheme,
    setTheme,
    setThemeMode: handleSetThemeMode,
    isLoaded,
  };

  // Não renderizar até carregar as preferências
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