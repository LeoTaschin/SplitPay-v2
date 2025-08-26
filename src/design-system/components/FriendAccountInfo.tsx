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
import { usePresence } from '../../hooks/usePresence';
import { Card } from './Card';
import { Avatar } from './Avatar';
import { OnlineIndicator } from './OnlineIndicator';
import { User } from '../../types';

interface FriendAccountInfoProps {
  friend: User | null;
  friendData?: {
    id: string;
    username: string;
    email: string;
    photoURL?: string;
    balance: number;
  };
  style?: ViewStyle;
}

export const FriendAccountInfo: React.FC<FriendAccountInfoProps> = ({
  friend,
  friendData,
  style,
}) => {
  const ds = useDesignSystem();
  const { t } = useLanguage();
  
  // Obter presença do amigo
  const friendId = friend?.uid || friendData?.id;
  const { presence } = usePresence(friendId || '');

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Math.abs(value));
  };

  // Obter status do balanço
  const getBalanceStatus = () => {
    if (!friendData) return null;
    
    if (friendData.balance === 0) {
      return {
        icon: 'checkmark-circle',
        color: '#10B981',
        text: t('friends.accountsSettled'),
        amountColor: '#10B981'
      };
    } else if (friendData.balance > 0) {
      return {
        icon: 'arrow-up-circle',
        color: '#10B981',
        text: t('friends.owesYou'),
        amountColor: '#10B981'
      };
    } else {
      return {
        icon: 'arrow-down-circle',
        color: '#EF4444',
        text: t('friends.youOwe'),
        amountColor: '#EF4444'
      };
    }
  };

  // Obter iniciais do nome
  const getInitials = () => {
    if (!friend?.displayName) return friend?.email?.charAt(0).toUpperCase() || 'U';
    return friend.displayName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const balanceStatus = getBalanceStatus();

  return (
    <Card variant="elevated" style={[styles.container, style]}>
      {/* Header do Card com ícones */}
      <View style={styles.cardHeader}>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="star-outline" size={20} color={ds.colors.text.secondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="notifications-outline" size={20} color={ds.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Avatar Centralizado */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          {friend?.photoURL || friendData?.photoURL ? (
            <Image
              source={{ uri: friend?.photoURL || friendData?.photoURL }}
              style={[styles.avatar, { backgroundColor: ds.colors.surfaceVariant }]}
            />
          ) : (
            <Avatar 
              name={friend?.displayName || friendData?.username || friend?.email || t('common.user')}
              size="xlarge"
              style={styles.avatar}
            />
          )}
          {/* Indicador Online */}
          <OnlineIndicator 
            presence={presence}
            size="large"
            style={styles.onlineIndicator}
          />
        </View>
      </View>

      {/* Informações do Amigo */}
      <View style={styles.userInfoSection}>
        <Text style={[styles.userName, { color: ds.colors.text.primary }]}>
          {friend?.displayName || friendData?.username || friend?.email?.split('@')[0] || t('common.user')}
        </Text>
        
        <Text style={[styles.userEmail, { color: ds.colors.text.secondary }]}>
          {friend?.email || friendData?.email || 'email@example.com'}
        </Text>
        
        {/* Status do Balanço */}
        {balanceStatus && (
          <View style={styles.balanceSection}>
            <Ionicons name={balanceStatus.icon as any} size={16} color={balanceStatus.color} />
            <Text style={[styles.balanceText, { color: balanceStatus.amountColor }]}>
              {balanceStatus.text}: {formatCurrency(friendData?.balance || 0)}
            </Text>
          </View>
        )}
      </View>

      {/* Botão de Acertar Dívida */}
      <View style={styles.actionButtonSection}>
        <TouchableOpacity 
          style={[
            styles.actionButton, 
            { 
              backgroundColor: balanceStatus?.color === '#EF4444' ? '#EF4444' : ds.colors.primary,
              opacity: friendData?.balance === 0 ? 0.5 : 1,
            }
          ]}
          disabled={friendData?.balance === 0}
        >
          <Ionicons 
            name="cash-outline" 
            size={20} 
            color="white" 
          />
          <Text style={styles.actionButtonText}>
            {friendData?.balance === 0 ? t('friends.accountsSettled') : t('friends.settleDebt')}
          </Text>
        </TouchableOpacity>
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
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
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
  balanceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  balanceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonSection: {
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 200,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
