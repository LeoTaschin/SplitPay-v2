import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useLanguage } from '../../context/LanguageContext';

interface SettingToggleProps {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

interface SettingButtonProps {
  title: string;
  description: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

const SettingToggle: React.FC<SettingToggleProps> = ({
  title,
  description,
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
          <Text style={[styles.settingDescription, { color: ds.colors.text.secondary }]}>
            {description}
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

const SettingButton: React.FC<SettingButtonProps> = ({
  title,
  description,
  onPress,
  icon,
}) => {
  const ds = useDesignSystem();

  return (
    <TouchableOpacity 
      style={[styles.settingItem, { backgroundColor: ds.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
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
          <Text style={[styles.settingDescription, { color: ds.colors.text.secondary }]}>
            {description}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={ds.colors.text.secondary} />
    </TouchableOpacity>
  );
};

export const SettingsPrivacy: React.FC = () => {
  const ds = useDesignSystem();
  const { t } = useLanguage();
  
  const [profileVisible, setProfileVisible] = useState(true);
  const [shareData, setShareData] = useState(false);

  const handlePrivacyPolicy = () => {
    Alert.alert('Política de Privacidade', 'Abrindo política de privacidade...');
  };

  const handleTermsOfService = () => {
    Alert.alert('Termos de Uso', 'Abrindo termos de uso...');
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: ds.colors.text.primary }]}>
        🛡️ Privacidade
      </Text>
      <Text style={[styles.sectionDescription, { color: ds.colors.text.secondary }]}>
        Gerencie suas configurações de privacidade
      </Text>

      <View style={styles.settingsContainer}>
        <SettingToggle
          title="Perfil Visível"
          description="Permitir que amigos vejam seu perfil"
          value={profileVisible}
          onValueChange={setProfileVisible}
          icon="eye-outline"
        />

        <SettingToggle
          title="Compartilhar Dados"
          description="Dados para melhorar o app"
          value={shareData}
          onValueChange={setShareData}
          icon="share-outline"
        />

        <SettingButton
          title="Política de Privacidade"
          description="Ler política completa"
          onPress={handlePrivacyPolicy}
          icon="document-text-outline"
        />

        <SettingButton
          title="Termos de Uso"
          description="Ler termos de uso"
          onPress={handleTermsOfService}
          icon="document-outline"
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
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
});
