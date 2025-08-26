import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useLanguage } from '../../context/LanguageContext';

interface FriendRemoveButtonProps {
  onPress: () => void;
  loading?: boolean;
  style?: any;
}

export const FriendRemoveButton: React.FC<FriendRemoveButtonProps> = ({
  onPress,
  loading = false,
  style,
}) => {
  const ds = useDesignSystem();
  const { t } = useLanguage();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: ds.colors.surface },
        style,
      ]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: '#EF4444' + '15' }]}>
          <Ionicons name="person-remove" size={24} color="#EF4444" />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: ds.colors.text.primary }]}>
            {t('friends.removeFriend')}
          </Text>
          <Text style={[styles.subtitle, { color: ds.colors.text.secondary }]}>
            {t('friends.removeFriendSubtext')}
          </Text>
        </View>
        
        {loading ? (
          <ActivityIndicator size="small" color="#EF4444" />
        ) : (
          <Ionicons name="chevron-forward" size={20} color={ds.colors.text.secondary} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
});
