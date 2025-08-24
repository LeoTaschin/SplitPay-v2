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

interface ProfileActivityProps {
  style?: ViewStyle;
}

export const ProfileActivity: React.FC<ProfileActivityProps> = ({
  style,
}) => {
  const ds = useDesignSystem();
  const { t } = useLanguage();

  return (
    <Card title={t('dashboard.recentDebts')} variant="elevated" style={styles.container}>
      <View style={styles.emptyState}>
        <Ionicons name="receipt" size={48} color={ds.colors.text.secondary} />
        <Text style={[styles.emptyStateText, { color: ds.colors.text.secondary }]}>
          {t('dashboard.noRecentDebts')}
        </Text>
        <Text style={[styles.emptyStateSubtext, { color: ds.colors.text.secondary }]}>
          {t('dashboard.noRecentDebtsSubtext')}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
});
