import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useLanguage } from '../../context/LanguageContext';
import { User } from '../../types';

interface ProfileHeaderProps {
  user: User | null;
  style?: ViewStyle;
  onEditPress?: () => void;
  navigation?: any; // Para navegação
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  style,
  onEditPress,
  navigation,
}) => {
  const ds = useDesignSystem();
  const { t } = useLanguage();

  // Formatar data de criação
  const formatCreationDate = () => {
    if (!user?.createdAt) return t('common.notAvailable');
    const date = new Date(user.createdAt);
    return date.toLocaleDateString();
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
    <View style={[styles.container, style]}>
      {/* Foto do Perfil */}
      <View style={styles.avatarContainer}>
        {user?.photoURL ? (
          <Image
            source={{ uri: user.photoURL }}
            style={[styles.avatar, { backgroundColor: ds.colors.surfaceVariant }]}
          />
        ) : (
          <View style={[styles.avatar, { backgroundColor: ds.colors.primary }]}>
            <Text style={[styles.avatarText, { color: 'white' }]}>
              {getInitials()}
            </Text>
          </View>
        )}
        
        {/* Indicador de Status Online */}
        <View style={[styles.statusIndicator, { backgroundColor: '#10B981' }]} />
      </View>

      {/* Informações do Usuário */}
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: ds.colors.text.primary }]}>
          {user?.displayName || user?.email?.split('@')[0] || t('common.user')}
        </Text>
        
        <View style={styles.infoRow}>
          <Ionicons name="mail" size={14} color={ds.colors.text.secondary} />
          <Text style={[styles.userEmail, { color: ds.colors.text.secondary }]}>
            {user?.email || 'email@example.com'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={14} color={ds.colors.text.secondary} />
          <Text style={[styles.memberSince, { color: ds.colors.text.secondary }]}>
            {t('profile.memberSince')} {formatCreationDate()}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="checkmark-circle" size={14} color="#10B981" />
          <Text style={[styles.statusText, { color: '#10B981' }]}>
            {t('friends.status.online')}
          </Text>
        </View>
      </View>

      {/* Botão de Editar */}
      <TouchableOpacity 
        style={styles.editContainer} 
        onPress={() => {
          if (onEditPress) {
            onEditPress();
          } else if (navigation) {
            navigation.navigate('EditProfile');
          }
        }}
      >
        <Ionicons 
          name="create" 
          size={20} 
          color={ds.colors.text.secondary}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 20,
    backgroundColor: 'transparent',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginLeft: 6,
  },
  memberSince: {
    fontSize: 14,
    marginLeft: 6,
  },
  statusText: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
  editContainer: {
    padding: 8,
  },
});
