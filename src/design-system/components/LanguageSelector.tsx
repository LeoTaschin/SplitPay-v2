import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useLanguage } from '../../context/LanguageContext';

// Tipos
interface LanguageOption {
  code: string;
  name: string;
  flag: string;
  nativeName: string;
}

interface LanguageSelectorProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'outline' | 'filled' | 'ghost';
  style?: any;
  showNativeName?: boolean;
  showText?: boolean; // Nova prop para controlar se mostra texto
}

// Dados dos idiomas
const LANGUAGES: LanguageOption[] = [
  {
    code: 'pt',
    name: 'Português',
    flag: '🇧🇷',
    nativeName: 'Português',
  },
  {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    nativeName: 'English',
  },
  {
    code: 'es',
    name: 'Español',
    flag: '🇪🇸',
    nativeName: 'Español',
  },
  {
    code: 'fr',
    name: 'Français',
    flag: '🇫🇷',
    nativeName: 'Français',
  },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  size = 'medium',
  variant = 'outline',
  style,
  showNativeName = false,
  showText = false, // Por padrão, não mostra texto
}) => {
  const ds = useDesignSystem();
  const { language, setLanguage, isLoading, t } = useLanguage();
  const [modalVisible, setModalVisible] = useState(false);

  const currentLanguage = LANGUAGES.find(lang => lang.code === language) || LANGUAGES[0];

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { 
            height: 36, 
            paddingHorizontal: showText ? 12 : 8,
            width: showText ? 'auto' : 44,
            justifyContent: 'center',
          },
          text: { fontSize: 14 },
          flag: { fontSize: 18 },
        };
      case 'large':
        return {
          container: { 
            height: 56, 
            paddingHorizontal: showText ? 20 : 12,
            width: showText ? 'auto' : 64,
            justifyContent: 'center',
          },
          text: { fontSize: 18 },
          flag: { fontSize: 28 },
        };
      default: // medium
        return {
          container: { 
            height: 44, 
            paddingHorizontal: showText ? 16 : 10,
            width: showText ? 'auto' : 52,
            justifyContent: 'center',
          },
          text: { fontSize: 16 },
          flag: { fontSize: 22 },
        };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: ds.colors.primary,
          borderColor: ds.colors.primary,
          textColor: '#FFFFFF',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          textColor: ds.colors.text.primary,
        };
      default: // outline
        return {
          backgroundColor: ds.colors.surface,
          borderColor: ds.colors.border,
          textColor: ds.colors.text.primary,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await setLanguage(languageCode);
      setModalVisible(false);
    } catch (error) {
      console.error('Erro ao mudar idioma:', error);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.container,
          sizeStyles.container,
          {
            backgroundColor: variantStyles.backgroundColor,
            borderColor: variantStyles.borderColor,
            borderRadius: ds.getBorderRadius('button'),
            ...ds.getShadow('button'),
          },
          style,
        ]}
        onPress={() => setModalVisible(true)}
        disabled={isLoading}
      >
        <Text style={[styles.flag, sizeStyles.flag]}>
          {currentLanguage.flag}
        </Text>
        
        {showText && (
          <>
            <Text
              style={[
                styles.languageText,
                sizeStyles.text,
                { color: variantStyles.textColor },
              ]}
            >
              {showNativeName ? currentLanguage.nativeName : currentLanguage.name}
            </Text>
            <Ionicons
              name="chevron-down"
              size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
              color={variantStyles.textColor}
              style={styles.chevron}
            />
          </>
        )}
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: ds.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: ds.colors.text.primary }]}>
                {t('language.selectLanguage')}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={ds.colors.text.secondary}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.languageList} showsVerticalScrollIndicator={false}>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageOption,
                    {
                      backgroundColor: language === lang.code ? ds.colors.primary + '10' : 'transparent',
                      borderColor: language === lang.code ? ds.colors.primary + '30' : 'transparent',
                    },
                  ]}
                  onPress={() => handleLanguageChange(lang.code)}
                >
                  <Text style={[styles.languageFlag, { fontSize: size === 'large' ? 28 : 24 }]}>
                    {lang.flag}
                  </Text>
                  <View style={styles.languageInfo}>
                    <Text style={[styles.languageName, { color: ds.colors.text.secondary }]}>
                      {lang.name}
                    </Text>
                    {showNativeName && (
                      <Text style={[styles.languageNative, { color: ds.colors.text.secondary }]}>
                        {lang.nativeName}
                      </Text>
                    )}
                  </View>
                  {language === lang.code && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={ds.colors.primary}
                      style={styles.checkIcon}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    justifyContent: 'center', // Centraliza quando só tem bandeira
  },
  flag: {
    textAlign: 'center', // Centraliza a bandeira
  },
  languageText: {
    fontWeight: '600',
    flex: 1,
    marginLeft: 8,
  },
  chevron: {
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 350,
    borderRadius: 16,
    maxHeight: '80%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.15)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  languageList: {
    padding: 8,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  languageFlag: {
    marginRight: 16,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  languageNative: {
    fontSize: 14,
  },
  checkIcon: {
    marginLeft: 8,
  },
}); 