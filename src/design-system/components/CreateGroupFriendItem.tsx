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
import { Avatar } from './Avatar';

interface Friend {
  id: string;
  username: string;
  email: string;
  photoURL?: string | null;
}

interface CreateGroupFriendItemProps {
  friend: Friend;
  isSelected: boolean;
  onPress: (friend: Friend) => void;
  style?: ViewStyle;
}

export const CreateGroupFriendItem: React.FC<CreateGroupFriendItemProps> = ({
  friend,
  isSelected,
  onPress,
  style,
}) => {
  const ds = useDesignSystem();

  const handlePress = () => {
    onPress(friend);
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          backgroundColor: isSelected ? ds.colors.primary + '20' : ds.colors.surface,
          borderColor: isSelected ? ds.colors.primary : ds.colors.border.primary
        },
        style
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Profile Photo */}
      <View style={styles.avatarContainer}>
        <Avatar
          source={friend.photoURL || undefined}
          name={friend.username}
          size="medium"
          variant="circle"
        />
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: ds.colors.text.primary }]}>
          {friend.username}
        </Text>
        <Text style={[styles.userEmail, { color: ds.colors.text.secondary }]}>
          {friend.email}
        </Text>
      </View>

      {/* Selection Checkbox */}
      <View style={styles.checkboxContainer}>
        <View style={[
          styles.checkbox,
          { 
            backgroundColor: isSelected ? ds.colors.primary : 'transparent',
            borderColor: isSelected ? ds.colors.primary : ds.colors.border.primary
          }
        ]}>
          {isSelected && (
            <Ionicons name="checkmark" size={16} color="white" />
          )}
        </View>
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
    borderWidth: 1,
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
  },
  checkboxContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
