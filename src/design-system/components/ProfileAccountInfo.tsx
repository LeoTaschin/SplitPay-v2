import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from './Card';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { User } from '../../types';

interface ProfileAccountInfoProps {
  user: User | null;
  style?: ViewStyle;
  onEditPress?: () => void;
  onQRCodePress?: () => void;
  navigation?: any;
}

export const ProfileAccountInfo: React.FC<ProfileAccountInfoProps> = ({
  user,
  style,
  onEditPress,
  onQRCodePress,
  navigation,
}) => {
  const ds = useDesignSystem();
  const { t } = useLanguage();

  const handleEditPress = () => {
    if (onEditPress) {
      onEditPress();
    } else if (navigation) {
      navigation.navigate('EditProfile');
    }
  };

  const handleQRCodePress = () => {
    if (onQRCodePress) {
      onQRCodePress();
    } else {
      // Implementar lógica padrão para mostrar QR code
      console.log('Show QR Code for adding friends');
    }
  };

  // Formatar data de criação da conta
  const formatCreatedAt = (createdAt: string) => {
    try {
      const date = new Date(createdAt);
      if (isNaN(date.getTime())) {
        return 'Data não disponível';
      }
      
      return date.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return 'Data não disponível';
    }
  };

  // Obter iniciais do nome
  const getInitials = () => {
    if (!user?.displayName) return user?.email?.charAt(0).toUpperCase() || 'U';
    return user.displayName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card variant="elevated" style={styles.container}>
      {/* Header do Card com ícones */}
      <View style={styles.cardHeader}>
        <TouchableOpacity style={styles.headerIcon} onPress={handleQRCodePress}>
          <Ionicons name="qr-code" size={20} color={ds.colors.text.secondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="share-outline" size={20} color={ds.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Avatar Centralizado */}
      <View style={styles.avatarSection}>
        {user?.photoURL ? (
          <Image
            source={{ uri: user.photoURL }}
            style={[styles.avatar, { backgroundColor: ds.colors.surfaceVariant }]}
          />
        ) : (
          <Avatar 
            name={user?.displayName || user?.email || t('common.user')}
            size="xlarge"
            style={styles.avatar}
          />
        )}
      </View>

      {/* Informações do Usuário */}
      <View style={styles.userInfoSection}>
        <Text style={[styles.userName, { color: ds.colors.text.primary }]}>
          {user?.displayName || user?.email?.split('@')[0] || t('common.user')}
        </Text>
        
        <Text style={[styles.userEmail, { color: ds.colors.text.secondary }]}>
          {user?.email || 'email@example.com'}
        </Text>
        
        {/* Data de Criação da Conta */}
        <View style={styles.createdAtSection}>
          <Ionicons name="calendar-outline" size={16} color={ds.colors.text.secondary} />
          <Text style={[styles.createdAtText, { color: ds.colors.text.secondary }]}>
            Membro desde {user?.createdAt ? formatCreatedAt(user.createdAt) : 'Data não disponível'}
          </Text>
        </View>
      </View>

      {/* Botão de Editar */}
      <View style={styles.editButtonSection}>
        <Button
          title={t('profile.editProfile')}
          variant="primary"
          size="medium"
          onPress={handleEditPress}
          style={styles.editButton}
          fullWidth
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    paddingVertical: 24,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 8,
  },
  createdAtSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  createdAtText: {
    fontSize: 14,
    opacity: 0.7,
  },
  editButtonSection: {
    alignItems: 'center',
  },
  editButton: {
    minWidth: 200,
    borderRadius: 25,
  },
});
