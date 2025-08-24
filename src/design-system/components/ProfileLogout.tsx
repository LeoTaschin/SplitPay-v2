import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from './Card';
import { Button } from './Button';

interface ProfileLogoutProps {
  onLogout: () => void;
  loading?: boolean;
  style?: ViewStyle;
}

export const ProfileLogout: React.FC<ProfileLogoutProps> = ({
  onLogout,
  loading = false,
  style,
}) => {
  const { t } = useLanguage();
  
  return (
    <Card variant="elevated" style={styles.container}>
      <Button
        title={t('auth.logout')}
        variant="danger"
        size="large"
        leftIcon="log-out"
        onPress={onLogout}
        loading={loading}
        fullWidth
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
});
