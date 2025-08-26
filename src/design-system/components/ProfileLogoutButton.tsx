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

interface ProfileLogoutButtonProps {
  onPress: () => void;
  loading?: boolean;
  style?: ViewStyle;
}

export const ProfileLogoutButton: React.FC<ProfileLogoutButtonProps> = ({
  onPress,
  loading = false,
  style,
}) => {
  const ds = useDesignSystem();
  const { t } = useLanguage();

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity 
        style={[styles.touchable, { backgroundColor: ds.colors.surface }]}
        onPress={onPress}
        disabled={loading}
        activeOpacity={0.7}
      >
        {/* Header com Ícone */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <View style={[
              styles.iconBackground, 
              { 
                backgroundColor: loading 
                  ? ds.colors.surfaceVariant 
                  : ds.colors.primary + '15' 
              }
            ]}>
              <Ionicons 
                name={loading ? "hourglass-outline" : "log-out-outline"} 
                size={24} 
                color={loading ? ds.colors.text.secondary : ds.colors.primary} 
              />
            </View>
          </View>
          
          <View style={styles.info}>
            <Text style={[
              styles.title, 
              { color: loading ? ds.colors.text.secondary : ds.colors.text.primary }
            ]}>
              {loading ? t('common.loading') : t('auth.logout')}
            </Text>
            <Text style={[
              styles.subtitle, 
              { color: ds.colors.text.secondary }
            ]}>
              {loading ? t('common.loading') : t('profile.logoutConfirm')}
            </Text>
          </View>
          
          {!loading && (
            <View style={styles.arrowContainer}>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={ds.colors.text.secondary} 
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  touchable: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  iconBackground: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  arrowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
