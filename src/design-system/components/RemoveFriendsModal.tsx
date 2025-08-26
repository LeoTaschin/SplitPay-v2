import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useLanguage } from '../../context/LanguageContext';
import { User } from '../../types';

interface RemoveFriendsModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  friend: User | null;
  friendData?: {
    id: string;
    username: string;
    email: string;
    photoURL?: string;
    balance: number;
  };
  loading?: boolean;
}

export const RemoveFriendsModal: React.FC<RemoveFriendsModalProps> = ({
  visible,
  onClose,
  onConfirm,
  friend,
  friendData,
  loading = false,
}) => {
  const ds = useDesignSystem();
  const { t } = useLanguage();
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const friendName = friend?.displayName || friendData?.username || friend?.email?.split('@')[0] || t('common.user');
  const friendPhoto = friend?.photoURL || friendData?.photoURL;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleImageLoadStart = () => {
    setImageLoading(true);
    setImageError(false);
  };

  const handleImageLoadEnd = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[styles.modalContainer, { backgroundColor: ds.colors.surface }]}>
              {/* Header */}
              <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: '#EF4444' }]}>
                  <Ionicons 
                    name="person-remove" 
                    size={32} 
                    color="white" 
                  />
                </View>
                <Text style={[styles.title, { color: ds.colors.text.primary }]}>
                  {t('friends.removeFriend')}
                </Text>
              </View>

              {/* Content */}
              <View style={styles.content}>
                <Text style={[styles.message, { color: ds.colors.text.secondary }]}>
                  {t('friends.removeConfirm').replace('{{name}}', friendName)}
                </Text>
                
                <View style={styles.friendInfo}>
                  <View style={[styles.avatar, { backgroundColor: ds.colors.surfaceVariant }]}>
                    {friendPhoto && !imageError ? (
                      <Image
                        source={{ uri: friendPhoto }}
                        style={styles.avatarImage}
                        resizeMode="cover"
                        onLoadStart={handleImageLoadStart}
                        onLoadEnd={handleImageLoadEnd}
                        onError={handleImageError}
                        progressiveRenderingEnabled={true}
                        fadeDuration={0}
                      />
                    ) : (
                      <Text style={[styles.avatarText, { color: ds.colors.text.primary }]}>
                        {friendName.charAt(0).toUpperCase()}
                      </Text>
                    )}
                    {imageLoading && (
                      <View style={styles.imageLoadingOverlay}>
                        <Ionicons name="refresh" size={16} color={ds.colors.text.secondary} style={styles.spinning} />
                      </View>
                    )}
                  </View>
                  <Text style={[styles.friendName, { color: ds.colors.text.primary }]}>
                    {friendName}
                  </Text>
                </View>

                <View style={styles.warningContainer}>
                  <Ionicons name="warning" size={20} color="#EF4444" />
                  <Text style={[styles.warningText, { color: ds.colors.text.secondary }]}>
                    {t('friends.removeFriendSubtext')}
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton, { borderColor: ds.colors.border.primary }]}
                  onPress={handleClose}
                  disabled={loading}
                >
                  <Text style={[styles.buttonText, { color: ds.colors.text.secondary }]}>
                    {t('common.cancel')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button, 
                    styles.confirmButton, 
                    { 
                      backgroundColor: '#EF4444',
                      opacity: loading ? 0.6 : 1
                    }
                  ]}
                  onPress={handleConfirm}
                  disabled={loading}
                >
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <Ionicons name="refresh" size={16} color="white" style={styles.spinning} />
                      <Text style={styles.buttonText}>
                        {t('common.loading')}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.buttonText}>
                      {t('friends.removeFriend')}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    marginBottom: 24,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  friendName: {
    fontSize: 18,
    fontWeight: '600',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    gap: 8,
  },
  warningText: {
    fontSize: 14,
    textAlign: 'center',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {
    // backgroundColor definido dinamicamente
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  spinning: {
    transform: [{ rotate: '0deg' }],
  },
});
