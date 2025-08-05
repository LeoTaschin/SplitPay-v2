import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage, getCurrentLanguage, getAvailableLanguages } from '../locales';

// Tipos
interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => Promise<void>;
  t: (key: string) => string;
  availableLanguages: string[];
  isLoading: boolean;
}

// Contexto
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Props do Provider
interface LanguageProviderProps {
  children: ReactNode;
}

// Provider do contexto
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [language, setLanguageState] = useState<string>('en');
  const [isLoading, setIsLoading] = useState(true);

  // Carregar idioma inicial
  useEffect(() => {
    const loadInitialLanguage = async () => {
      try {
        const currentLanguage = getCurrentLanguage();
        setLanguageState(currentLanguage);
      } catch (error) {
        console.error('Erro ao carregar idioma inicial:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialLanguage();
  }, []);

  // Função para mudar idioma
  const setLanguage = async (newLanguage: string): Promise<void> => {
    try {
      setIsLoading(true);
      await changeLanguage(newLanguage);
      setLanguageState(newLanguage);
    } catch (error) {
      console.error('Erro ao mudar idioma:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Obter idiomas disponíveis
  const availableLanguages = getAvailableLanguages();

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    availableLanguages,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook para usar o contexto
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage deve ser usado dentro de um LanguageProvider');
  }
  return context;
}; 