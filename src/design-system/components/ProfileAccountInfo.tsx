import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from './Card';
import { User } from '../../types';

interface ProfileAccountInfoProps {
  user: User | null;
  style?: ViewStyle;
}

export const ProfileAccountInfo: React.FC<ProfileAccountInfoProps> = ({
  user,
  style,
}) => {
  const ds = useDesignSystem();
  const { t } = useLanguage();

  return (
    <Card title={t('profile.accountInfo')} variant="elevated" style={styles.container}>
      <View style={styles.infoRow}>
        <Ionicons name="person" size={24} color={ds.colors.text.secondary} />
        <Text style={[styles.infoLabel, { color: ds.colors.text.secondary }]}>
          {t('common.name')}:
        </Text>
        <Text style={[styles.infoValue, { color: ds.colors.text.primary }]}>
          {user?.displayName || t('common.notDefined')}
        </Text>
      </View>
      
      <View style={styles.infoRow}>
        <Ionicons name="mail" size={24} color={ds.colors.text.secondary} />
        <Text style={[styles.infoLabel, { color: ds.colors.text.secondary }]}>
          {t('auth.email')}:
        </Text>
        <Text style={[styles.infoValue, { color: ds.colors.text.primary }]}>
          {user?.email || t('common.notDefined')}
        </Text>
      </View>
      
      <View style={styles.infoRow}>
        <Ionicons name="calendar" size={24} color={ds.colors.text.secondary} />
        <Text style={[styles.infoLabel, { color: ds.colors.text.secondary }]}>
          {t('profile.memberSince')}:
        </Text>
        <Text style={[styles.infoValue, { color: ds.colors.text.primary }]}>
          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : t('common.notAvailable')}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="phone-portrait" size={24} color={ds.colors.text.secondary} />
        <Text style={[styles.infoLabel, { color: ds.colors.text.secondary }]}>
          {t('profile.version')}:
        </Text>
        <Text style={[styles.infoValue, { color: ds.colors.text.primary }]}>
          1.0.0
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    marginRight: 8,
    minWidth: 80,
  },
  infoValue: {
    fontSize: 16,
    flex: 1,
  },
});
