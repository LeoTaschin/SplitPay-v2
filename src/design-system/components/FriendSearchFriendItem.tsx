import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useLanguage } from '../../context/LanguageContext';
import { Avatar } from './Avatar';
import { SearchableUser } from '../../services/userSearchService';

interface FriendSearchFriendItemProps {
  user: SearchableUser;
  isAlreadyFriend: boolean;
  onPress: (user: SearchableUser) => void;
  style?: ViewStyle;
}

export const FriendSearchFriendItem: React.FC<FriendSearchFriendItemProps> = ({
  user,
  isAlreadyFriend,
  onPress,
  style,
}) => {
  const ds = useDesignSystem();
  const { t } = useLanguage();

  const handlePress = () => {
    onPress(user);
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: ds.colors.surface },
        style
      ]}
      onPress={handlePress}
      disabled={isAlreadyFriend}
      activeOpacity={0.7}
    >
      {/* Profile Photo */}
      <View style={styles.avatarContainer}>
        <Avatar
          source={user.photoURL}
          name={user.username}
          size="medium"
          variant="circle"
        />
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: ds.colors.text.primary }]}>
          {user.username}
        </Text>
        <Text style={[styles.userEmail, { color: ds.colors.text.secondary }]}>
          {user.email}
        </Text>
        {user.displayName && user.displayName !== user.username && (
          <Text style={[styles.displayName, { color: ds.colors.text.secondary }]}>
            {user.displayName}
          </Text>
        )}
      </View>

      {/* Action Button */}
      <View style={styles.actionContainer}>
        {isAlreadyFriend ? (
          <View style={[
            styles.alreadyFriendBadge,
            { 
              backgroundColor: ds.isDark ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)' 
            }
          ]}>
            <Ionicons name="checkmark-circle" size={20} color={ds.colors.feedback.success} />
            <Text style={[styles.alreadyFriendText, { color: ds.colors.feedback.success }]}>
              {t('friends.alreadyFriend')}
            </Text>
          </View>
        ) : (
          <View style={styles.addButton}>
            <Ionicons name="person-add" size={20} color={ds.colors.primary} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarContainer: {
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 2,
  },
  displayName: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  actionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  alreadyFriendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  alreadyFriendText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '500',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
});
