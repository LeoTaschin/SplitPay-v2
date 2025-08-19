import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useLanguage } from '../../context/LanguageContext';
import { StatCard } from './StatCard';
import { User } from '../../types';

interface ProfileStatsProps {
  user: User | null;
  style?: ViewStyle;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({
  user,
  style,
}) => {
  const ds = useDesignSystem();
  const { t } = useLanguage();

  // Calcular dias desde a criação da conta
  const getDaysSinceCreation = () => {
    if (!user?.createdAt) return 0;
    const now = new Date();
    const created = new Date(user.createdAt);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, { color: ds.colors.text.primary }]}>
        {t('profile.statistics')}
      </Text>
      <View style={styles.statsGrid}>
        <StatCard
          title={t('dashboard.totalUnpaid')}
          value="R$ 0,00"
          subtitle={t('dashboard.totalUnpaidSubtext')}
          icon="wallet"
          color="#EF4444"
          width={160}
        />
        <StatCard
          title={t('friends.title')}
          value="0"
          subtitle={t('friends.friends')}
          icon="people"
          color="#3B82F6"
          width={160}
        />
        <StatCard
          title={t('groups.title')}
          value="0"
          subtitle={t('groups.participants')}
          icon="folder"
          color="#8B5CF6"
          width={160}
        />
        <StatCard
          title={t('profile.memberSince')}
          value={`${getDaysSinceCreation()}`}
          subtitle={t('common.days')}
          icon="time"
          color="#F59E0B"
          width={160}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
});
