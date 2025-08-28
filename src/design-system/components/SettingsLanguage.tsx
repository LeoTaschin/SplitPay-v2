import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useLanguage } from '../../context/LanguageContext';

interface SettingRadioProps {
  title: string;
  value: string;
  selectedValue: string;
  onSelect: (value: string) => void;
  flag?: string;
}

const SettingRadio: React.FC<SettingRadioProps> = ({
  title,
  value,
  selectedValue,
  onSelect,
  flag,
}) => {
  const ds = useDesignSystem();
  const isSelected = selectedValue === value;

  return (
    <TouchableOpacity 
      style={[
        styles.settingItem, 
        { 
          backgroundColor: isSelected ? ds.colors.primary + '20' : ds.colors.surface,
          borderColor: isSelected ? ds.colors.primary : ds.colors.border.primary,
          borderWidth: 1,
        }
      ]}
      onPress={() => onSelect(value)}
      activeOpacity={0.7}
    >
      <View style={styles.settingContent}>
        <View style={[
          styles.iconContainer, 
          { 
            backgroundColor: isSelected ? ds.colors.primary + '10' : ds.colors.surface,
            borderColor: isSelected ? ds.colors.primary + '30' : ds.colors.border.primary,
            borderWidth: 1,
          }
        ]}>
          <Text style={styles.flagText}>{flag}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={[
            styles.settingTitle, 
            { 
              color: isSelected ? ds.colors.primary : ds.colors.text.primary,
              fontWeight: isSelected ? '600' : '500'
            }
          ]}>
            {title}
          </Text>
        </View>
      </View>
      <View style={[
        styles.checkbox,
        { 
          backgroundColor: isSelected ? ds.colors.primary : 'transparent',
          borderColor: isSelected ? ds.colors.primary : ds.colors.border.primary
        }
      ]}>
        {isSelected && (
          <Ionicons name="checkmark" size={16} color="white" />
        )}
      </View>
    </TouchableOpacity>
  );
};

export const SettingsLanguage: React.FC = () => {
  const ds = useDesignSystem();
  const { t, language, setLanguage } = useLanguage();
  
  const [selectedLanguage, setSelectedLanguageState] = useState(language);

  const languages = [
    { value: 'pt-BR', title: 'Português', flag: '🇧🇷' },
    { value: 'en-US', title: 'English', flag: '🇺🇸' },
    { value: 'es-ES', title: 'Español', flag: '🇪🇸' },
    { value: 'fr-FR', title: 'Français', flag: '🇫🇷' },
  ];

  // Sincronizar estado local com idioma atual
  useEffect(() => {
    setSelectedLanguageState(language);
  }, [language]);

  const handleLanguageSelect = async (value: string) => {
    setSelectedLanguageState(value);
    await setLanguage(value);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: ds.colors.text.primary }]}>
          {t('settings.sections.language.title')}
        </Text>
        <Text style={[styles.sectionDescription, { color: ds.colors.text.secondary }]}>
          {t('settings.sections.language.description')}
        </Text>
      </View>

      <View style={styles.settingsContainer}>
        {languages.map((language) => (
          <SettingRadio
            key={language.value}
            title={language.title}
            value={language.value}
            selectedValue={selectedLanguage}
            onSelect={handleLanguageSelect}
            flag={language.flag}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
  },
  settingsContainer: {
    gap: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  flagText: {
    fontSize: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
