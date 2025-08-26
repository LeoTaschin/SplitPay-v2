import React, { useState } from 'react';
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
  icon?: keyof typeof Ionicons.glyphMap;
}

const SettingRadio: React.FC<SettingRadioProps> = ({
  title,
  value,
  selectedValue,
  onSelect,
  icon,
}) => {
  const ds = useDesignSystem();
  const isSelected = selectedValue === value;

  return (
    <TouchableOpacity 
      style={[
        styles.settingItem, 
        { 
          backgroundColor: ds.colors.surface,
          borderColor: isSelected ? ds.colors.primary : 'transparent',
          borderWidth: isSelected ? 2 : 0,
        }
      ]}
      onPress={() => onSelect(value)}
      activeOpacity={0.7}
    >
      <View style={styles.settingContent}>
        {icon && (
          <View style={[
            styles.iconContainer, 
            { 
              backgroundColor: isSelected 
                ? ds.colors.primary + '15' 
                : ds.colors.surfaceVariant 
            }
          ]}>
            <Ionicons 
              name={icon} 
              size={20} 
              color={isSelected ? ds.colors.primary : ds.colors.text.secondary} 
            />
          </View>
        )}
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
        styles.radioButton,
        {
          borderColor: isSelected ? ds.colors.primary : ds.colors.text.secondary,
          backgroundColor: isSelected ? ds.colors.primary : 'transparent',
        }
      ]}>
        {isSelected && (
          <View style={[styles.radioInner, { backgroundColor: 'white' }]} />
        )}
      </View>
    </TouchableOpacity>
  );
};

export const SettingsLanguage: React.FC = () => {
  const ds = useDesignSystem();
  const { t } = useLanguage();
  
  const [selectedLanguage, setSelectedLanguage] = useState('pt-BR');
  const [selectedCurrency, setSelectedCurrency] = useState('BRL');

  const languages = [
    { value: 'pt-BR', title: 'Português (Brasil)', icon: 'flag' },
    { value: 'en-US', title: 'English', icon: 'flag' },
    { value: 'es-ES', title: 'Español', icon: 'flag' },
    { value: 'fr-FR', title: 'Français', icon: 'flag' },
  ];

  const currencies = [
    { value: 'BRL', title: 'Real (R$)', icon: 'cash' },
    { value: 'USD', title: 'Dólar (US$)', icon: 'cash' },
    { value: 'EUR', title: 'Euro (€)', icon: 'cash' },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: ds.colors.text.primary }]}>
        🌍 Idioma
      </Text>
      <Text style={[styles.sectionDescription, { color: ds.colors.text.secondary }]}>
        Escolha seu idioma e formato regional
      </Text>

      <View style={styles.settingsContainer}>
        <Text style={[styles.sectionLabel, { color: ds.colors.text.primary }]}>
          Idioma
        </Text>
        {languages.map((language) => (
          <SettingRadio
            key={language.value}
            title={language.title}
            value={language.value}
            selectedValue={selectedLanguage}
            onSelect={setSelectedLanguage}
            icon={language.icon as any}
          />
        ))}

        <View style={styles.separator} />

        <Text style={[styles.sectionLabel, { color: ds.colors.text.primary }]}>
          Moeda
        </Text>
        {currencies.map((currency) => (
          <SettingRadio
            key={currency.value}
            title={currency.title}
            value={currency.value}
            selectedValue={selectedCurrency}
            onSelect={setSelectedCurrency}
            icon={currency.icon as any}
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionDescription: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    opacity: 0.8,
  },
  settingsContainer: {
    gap: 16,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 16,
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
    marginBottom: 4,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
