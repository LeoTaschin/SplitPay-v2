import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  Modal, 
  View, 
  Text, 
  StyleSheet,
  Alert,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useLanguage } from '../../context/LanguageContext';

interface LogoutButtonProps {
  onLogout: () => void;
  size?: number;
  style?: any;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  onLogout, 
  size = 24,
  style 
}) => {
  const ds = useDesignSystem();
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);

  const handleLogoutPress = () => {
    setShowModal(true);
  };

  const handleConfirmLogout = () => {
    setShowModal(false);
    onLogout();
  };

  const handleCancelLogout = () => {
    setShowModal(false);
  };

  return (
    <>
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: ds.colors.surface }, style]}
        onPress={handleLogoutPress}
      >
        <Ionicons 
          name="log-out-outline" 
          size={size} 
          color={ds.colors.text.secondary}
        />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelLogout}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: ds.colors.surface }]}>
            <View style={styles.modalHeader}>
              <View style={[styles.iconContainer, { backgroundColor: ds.colors.feedback.error + '20' }]}>
                <Ionicons 
                  name="log-out-outline" 
                  size={32} 
                  color={ds.colors.feedback.error}
                />
              </View>
              <Text style={[styles.modalTitle, { color: ds.colors.text.primary }]}>
                {t('auth.logout')}
              </Text>
            </View>

            <Text style={[styles.modalMessage, { color: ds.colors.text.secondary }]}>
              {t('profile.logoutConfirm')}
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton, { borderColor: ds.colors.border.primary }]}
                onPress={handleCancelLogout}
              >
                <Text style={[styles.actionButtonText, { color: ds.colors.text.secondary }]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.confirmButton, { backgroundColor: ds.colors.feedback.error }]}
                onPress={handleConfirmLogout}
              >
                <Text style={[styles.actionButtonText, { color: ds.colors.text.inverse }]}>
                  {t('auth.logout')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 12,
    backgroundColor: 'transparent', // Será sobrescrito pelo design system
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.20)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  confirmButton: {
    borderWidth: 0,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 