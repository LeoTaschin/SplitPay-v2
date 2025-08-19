import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useLanguage } from '../../context/LanguageContext';

interface Group {
  id: string;
  name: string;
  photoURL?: string;
  participantsCount: number;
}

interface GroupItemProps {
  group: Group;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: any;
}

export const GroupItem: React.FC<GroupItemProps> = ({
  group,
  onPress,
  onLongPress,
  style
}) => {
  const ds = useDesignSystem();
  const { t } = useLanguage();

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity 
        style={[
          styles.container,
          { backgroundColor: ds.colors.surface },
          style
        ]}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.7}
      >
        {/* Header com Avatar */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {group.photoURL ? (
              <Image 
                source={{ uri: group.photoURL }} 
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.defaultAvatar, { backgroundColor: ds.colors.primary }]}>
                <Ionicons name="people" size={24} color="white" />
              </View>
            )}
          </View>
          
          <View style={styles.info}>
            <Text 
              style={[styles.name, { color: ds.colors.text.primary }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {group.name}
            </Text>
            <Text 
              style={[styles.participantsText, { color: ds.colors.text.secondary }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {group.participantsCount} {group.participantsCount === 1 ? t('groups.participant') : t('groups.participants')}
            </Text>
          </View>
          
          <View style={styles.onlineContainer}>
            <View style={styles.onlineIndicator}>
              <Ionicons name="radio-button-on" size={12} color={ds.colors.primary} />
              <Text style={[styles.onlineText, { color: ds.colors.text.secondary }]}>
                {Math.floor(group.participantsCount * 0.6)} online
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 12,
  },
  container: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  defaultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  participantsText: {
    fontSize: 14,
    lineHeight: 18,
  },
  onlineContainer: {
    alignItems: 'flex-end',
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  onlineText: {
    fontSize: 12,
  },
});
