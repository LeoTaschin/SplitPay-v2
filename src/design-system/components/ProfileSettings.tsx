import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from './Card';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
}) => {
  const ds = useDesignSystem();
  const { t } = useLanguage();

  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={20} color={ds.colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: ds.colors.text.primary }]}>
          {title}
        </Text>
        <Text style={[styles.settingSubtitle, { color: ds.colors.text.secondary }]}>
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={ds.colors.text.secondary} />
    </TouchableOpacity>
  );
};

interface ProfileSettingsProps {
  style?: ViewStyle;
  onEditProfile?: () => void;
  onChangePassword?: () => void;
  onNotifications?: () => void;
  onPrivacy?: () => void;
  onHelp?: () => void;
  onAbout?: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  style,
  onEditProfile,
  onChangePassword,
  onNotifications,
  onPrivacy,
  onHelp,
  onAbout,
}) => {
  const { t } = useLanguage();
  
  return (
    <View style={[styles.container, style]}>
      {/* Configurações de Segurança */}
      <Card title={t('profile.security')} variant="elevated" style={styles.section}>
        {onChangePassword && (
          <SettingItem
            icon="lock-closed"
            title={t('profile.changePassword')}
            subtitle={t('profile.changePasswordDesc')}
            onPress={onChangePassword}
          />
        )}
        
        {onPrivacy && (
          <SettingItem
            icon="shield-checkmark"
            title={t('profile.privacy')}
            subtitle={t('profile.privacyDesc')}
            onPress={onPrivacy}
          />
        )}
      </Card>

      {/* Configurações de Notificações */}
      <Card title={t('profile.notifications')} variant="elevated" style={styles.section}>
        {onNotifications && (
          <SettingItem
            icon="notifications"
            title={t('profile.notifications')}
            subtitle={t('profile.notificationsDesc')}
            onPress={onNotifications}
          />
        )}
      </Card>

      {/* Ajuda e Suporte */}
      <Card title={t('profile.help')} variant="elevated" style={styles.section}>
        {onHelp && (
          <SettingItem
            icon="help-circle"
            title={t('profile.help')}
            subtitle={t('profile.helpDesc')}
            onPress={onHelp}
          />
        )}
        
        {onAbout && (
          <SettingItem
            icon="information-circle"
            title={t('profile.about')}
            subtitle={t('profile.aboutDesc')}
            onPress={onAbout}
          />
        )}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
});
