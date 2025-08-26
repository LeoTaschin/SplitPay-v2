import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface SettingRadioProps {
  title: string;
  value: string;
  selectedValue: string;
  onSelect: (value: string) => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

interface SettingToggleProps {
  title: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
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

const SettingToggle: React.FC<SettingToggleProps> = ({
  title,
  value,
  onValueChange,
  icon,
}) => {
  const ds = useDesignSystem();

  return (
    <View style={[styles.settingItem, { backgroundColor: ds.colors.surface }]}>
      <View style={styles.settingContent}>
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: ds.colors.primary + '15' }]}>
            <Ionicons name={icon} size={20} color={ds.colors.primary} />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={[styles.settingTitle, { color: ds.colors.text.primary }]}>
            {title}
          </Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: ds.colors.surfaceVariant, true: ds.colors.primary + '40' }}
        thumbColor={value ? ds.colors.primary : ds.colors.text.secondary}
      />
    </View>
  );
};

export const SettingsTheme: React.FC = () => {
  const ds = useDesignSystem();
  const { t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  
  const [selectedTheme, setSelectedTheme] = useState(isDark ? 'dark' : 'light');
  const [selectedFontSize, setSelectedFontSize] = useState('normal');
  const [animations, setAnimations] = useState(true);

  const themes = [
    { value: 'light', title: 'Tema Claro', icon: 'sunny-outline' },
    { value: 'dark', title: 'Tema Escuro', icon: 'moon-outline' },
    { value: 'system', title: 'Seguir Sistema', icon: 'settings-outline' },
  ];

  const fontSizes = [
    { value: 'small', title: 'Pequeno', icon: 'text-outline' },
    { value: 'normal', title: 'Normal', icon: 'text-outline' },
    { value: 'large', title: 'Grande', icon: 'text-outline' },
  ];

  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme);
    if (theme === 'dark' && !isDark) {
      toggleTheme();
    } else if (theme === 'light' && isDark) {
      toggleTheme();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: ds.colors.text.primary }]}>
        🎨 Aparência
      </Text>
      <Text style={[styles.sectionDescription, { color: ds.colors.text.secondary }]}>
        Personalize a aparência do app
      </Text>

      <View style={styles.settingsContainer}>
        <Text style={[styles.sectionLabel, { color: ds.colors.text.primary }]}>
          Tema
        </Text>
        {themes.map((theme) => (
          <SettingRadio
            key={theme.value}
            title={theme.title}
            value={theme.value}
            selectedValue={selectedTheme}
            onSelect={handleThemeChange}
            icon={theme.icon as any}
          />
        ))}

        <View style={styles.separator} />

        <Text style={[styles.sectionLabel, { color: ds.colors.text.primary }]}>
          Tamanho da Fonte
        </Text>
        {fontSizes.map((fontSize) => (
          <SettingRadio
            key={fontSize.value}
            title={fontSize.title}
            value={fontSize.value}
            selectedValue={selectedFontSize}
            onSelect={setSelectedFontSize}
            icon={fontSize.icon as any}
          />
        ))}

        <View style={styles.separator} />

        <SettingToggle
          title="Animações"
          value={animations}
          onValueChange={setAnimations}
          icon="flash-outline"
        />
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
