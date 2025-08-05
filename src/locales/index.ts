import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';

// Importar arquivos de tradução
import pt from './pt.json';
import en from './en.json';
import es from './es.json';
import fr from './fr.json';

// Recursos de tradução
const resources = {
  pt: {
    translation: pt,
  },
  en: {
    translation: en,
  },
  es: {
    translation: es,
  },
  fr: {
    translation: fr,
  },
};

// Chave para salvar idioma no AsyncStorage
const LANGUAGE_KEY = '@SplitPay:language';

// Função para obter idioma salvo ou detectar do sistema
const getStoredLanguage = async (): Promise<string> => {
  try {
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (storedLanguage) {
      return storedLanguage;
    }
    
    // Detectar idioma do sistema
    const deviceLocales = getLocales();
    const deviceLanguage = deviceLocales[0]?.languageCode || 'en';
    
    // Mapear códigos de idioma para nossos códigos
    const languageMap: { [key: string]: string } = {
      'pt': 'pt',
      'pt-BR': 'pt',
      'en': 'en',
      'en-US': 'en',
      'es': 'es',
      'es-ES': 'es',
      'fr': 'fr',
      'fr-FR': 'fr',
    };
    
    return languageMap[deviceLanguage] || 'en';
  } catch (error) {
    console.error('Erro ao obter idioma:', error);
    return 'en';
  }
};

// Função para salvar idioma
export const saveLanguage = async (language: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  } catch (error) {
    console.error('Erro ao salvar idioma:', error);
  }
};

// Configuração do i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Idioma padrão (será sobrescrito)
    fallbackLng: 'en',
    compatibilityJSON: 'v4',
    interpolation: {
      escapeValue: false, // React já escapa valores
    },
    react: {
      useSuspense: false, // Importante para React Native
    },
  });

// Inicializar com idioma correto
getStoredLanguage().then((language) => {
  i18n.changeLanguage(language);
});

// Função para mudar idioma
export const changeLanguage = async (language: string): Promise<void> => {
  await saveLanguage(language);
  await i18n.changeLanguage(language);
};

// Função para obter idioma atual
export const getCurrentLanguage = (): string => {
  return i18n.language;
};

// Função para obter idiomas disponíveis
export const getAvailableLanguages = (): string[] => {
  return Object.keys(resources);
};

export default i18n; 