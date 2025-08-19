import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';

interface Friend {
  id: string;
  username: string;
  email: string;
  photoURL?: string | null;
}

interface GroupConfirmationItemProps {
  friend: Friend;
  style?: ViewStyle;
  onRemove?: (friendId: string) => void;
}

export const GroupConfirmationItem: React.FC<GroupConfirmationItemProps> = ({
  friend,
  style,
  onRemove,
}) => {
  const ds = useDesignSystem();

  const handleRemove = () => {
    if (onRemove) {
      onRemove(friend.id);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.avatarContainer}>
        {friend.photoURL ? (
          <Image source={{ uri: friend.photoURL }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: ds.colors.primary }]}>
            <Text style={styles.avatarInitial}>
              {friend.username.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={[styles.name, { color: ds.colors.text.primary }]} numberOfLines={1}>
          {friend.username}
        </Text>
        <Text style={[styles.email, { color: ds.colors.text.secondary }]} numberOfLines={1}>
          {friend.email}
        </Text>
      </View>

      {onRemove && (
        <TouchableOpacity
          style={[styles.removeButton, { backgroundColor: ds.colors.feedback.error}]}
          onPress={handleRemove}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={16} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    lineHeight: 18,
  },
  removeButton: {
    width: 16,
    height: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});
