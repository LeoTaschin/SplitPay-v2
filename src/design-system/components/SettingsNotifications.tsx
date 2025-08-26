import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
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

export const SettingsNotifications: React.FC = () => {
  const ds = useDesignSystem();
  const { t } = useLanguage();
  
  const [pushNotifications, setPushNotifications] = useState(true);
  const [soundVibration, setSoundVibration] = useState(true);
  const [debtReminders, setDebtReminders] = useState(true);
  const [newFriends, setNewFriends] = useState(true);

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: ds.colors.text.primary }]}>
        🔔 Notificações
      </Text>
      <Text style={[styles.sectionDescription, { color: ds.colors.text.secondary }]}>
        Configure como você recebe notificações
      </Text>

      <View style={styles.settingsContainer}>
        <SettingToggle
          title="Notificações Push"
          description="Receber notificações no celular"
          value={pushNotifications}
          onValueChange={setPushNotifications}
          icon="notifications-outline"
        />

        <SettingToggle
          title="Som e Vibração"
          description="Tocar som nas notificações"
          value={soundVibration}
          onValueChange={setSoundVibration}
          icon="volume-high-outline"
        />

        <SettingToggle
          title="Lembretes de Dívidas"
          description="Alertas de dívidas pendentes"
          value={debtReminders}
          onValueChange={setDebtReminders}
          icon="alert-circle-outline"
        />

        <SettingToggle
          title="Novos Amigos"
          description="Solicitações de amizade"
          value={newFriends}
          onValueChange={setNewFriends}
          icon="person-add-outline"
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
