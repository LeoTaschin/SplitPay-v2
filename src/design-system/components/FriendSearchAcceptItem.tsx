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
import { FriendRequest } from '../../services/friendService';

interface FriendSearchAcceptItemProps {
  request: FriendRequest;
  onAccept: (request: FriendRequest) => void;
  onReject: (request: FriendRequest) => void;
  style?: ViewStyle;
}

export const FriendSearchAcceptItem: React.FC<FriendSearchAcceptItemProps> = ({
  request,
  onAccept,
  onReject,
  style,
}) => {
  const ds = useDesignSystem();
  const { t } = useLanguage();

  const handleAccept = () => {
    onAccept(request);
  };

  const handleReject = () => {
    onReject(request);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: ds.colors.surface },
        style
      ]}
    >
      {/* Profile Photo */}
      <View style={styles.avatarContainer}>
        <Avatar
          source={request.fromPhotoURL}
          name={request.fromUsername}
          size="medium"
          variant="circle"
        />
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: ds.colors.text.primary }]}>
          {request.fromUsername}
        </Text>
        <Text style={[styles.requestText, { color: ds.colors.text.secondary }]}>
          {t('friends.wantsToBeFriend')}
        </Text>
        <Text style={[styles.dateText, { color: ds.colors.text.secondary }]}>
          {formatRequestDate(request.createdAt)}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.acceptButton, { backgroundColor: ds.colors.feedback.success }]}
          onPress={handleAccept}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark" size={18} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.rejectButton, { backgroundColor: ds.colors.feedback.error }]}
          onPress={handleReject}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const formatRequestDate = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Agora mesmo';
  if (minutes < 60) return `Há ${minutes} min`;
  if (hours < 24) return `Há ${hours}h`;
  if (days < 7) return `Há ${days} dias`;
  return date.toLocaleDateString('pt-BR');
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
  requestText: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    opacity: 0.6,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  acceptButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
