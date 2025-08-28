import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../hooks/useAuth';

interface SettingButtonProps {
  title: string;
  description: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'default' | 'danger';
}

const SettingButton: React.FC<SettingButtonProps> = ({
  title,
  description,
  onPress,
  icon,
  variant = 'default',
}) => {
  const ds = useDesignSystem();
  const isDanger = variant === 'danger';

  return (
    <TouchableOpacity 
      style={[
        styles.settingItem, 
        { 
          backgroundColor: ds.colors.surface,
          borderColor: isDanger ? '#EF4444' : 'transparent',
          borderWidth: isDanger ? 1 : 0,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingContent}>
        {icon && (
          <View style={[
            styles.iconContainer, 
            { 
              backgroundColor: isDanger 
                ? '#EF4444' + '15' 
                : ds.colors.primary + '15' 
            }
          ]}>
            <Ionicons 
              name={icon} 
              size={20} 
              color={isDanger ? '#EF4444' : ds.colors.primary} 
            />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={[
            styles.settingTitle, 
            { 
              color: isDanger ? '#EF4444' : ds.colors.text.primary 
            }
          ]}>
            {title}
          </Text>
          <Text style={[
            styles.settingDescription, 
            { 
              color: isDanger ? '#EF4444' + 'CC' : ds.colors.text.secondary 
            }
          ]}>
            {description}
          </Text>
        </View>
      </View>
      <Ionicons 
        name="chevron-forward" 
        size={20} 
        color={isDanger ? '#EF4444' : ds.colors.text.secondary} 
      />
    </TouchableOpacity>
  );
};

export const SettingsSecurity: React.FC = () => {
  const ds = useDesignSystem();
  const { t } = useLanguage();
  const { logout } = useAuth();

  const handleChangePassword = () => {
    Alert.alert(t('settings.sections.security.changePassword'), 'Funcionalidade em desenvolvimento...');
  };

  const handleVerifyEmail = () => {
    Alert.alert(t('settings.sections.security.verifyEmail'), 'Funcionalidade em desenvolvimento...');
  };

  const handleLogoutAll = () => {
    Alert.alert(
      t('settings.sections.security.logoutAll'),
      'Tem certeza que deseja sair de todos os dispositivos?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível fazer logout.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ ' + t('settings.sections.security.deleteAccount'),
      'Esta ação é irreversível. Tem certeza que deseja excluir sua conta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            Alert.alert(t('settings.sections.security.deleteAccount'), 'Funcionalidade em desenvolvimento...');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: ds.colors.text.primary }]}>
        {t('settings.sections.security.title')}
      </Text>
      <Text style={[styles.sectionDescription, { color: ds.colors.text.secondary }]}>
        {t('settings.sections.security.description')}
      </Text>

      <View style={styles.settingsContainer}>
        <SettingButton
          title={t('settings.sections.security.changePassword')}
          description={t('settings.sections.security.changePasswordDesc')}
          onPress={handleChangePassword}
          icon="key-outline"
        />

        <SettingButton
          title={t('settings.sections.security.verifyEmail')}
          description={t('settings.sections.security.verifyEmailDesc')}
          onPress={handleVerifyEmail}
          icon="mail-outline"
        />

        <SettingButton
          title={t('settings.sections.security.logoutAll')}
          description={t('settings.sections.security.logoutAllDesc')}
          onPress={handleLogoutAll}
          icon="log-out-outline"
        />

        <View style={styles.separator} />

        <SettingButton
          title={t('settings.sections.security.deleteAccount')}
          description={t('settings.sections.security.deleteAccountDesc')}
          onPress={handleDeleteAccount}
          icon="trash-outline"
          variant="danger"
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
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
});
