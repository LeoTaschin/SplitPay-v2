import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../design-system/hooks/useDesignSystem';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import { 
  FriendBadges, 
  FriendAccountInfo, 
  FriendRemoveButton, 
  FriendTransactionsButton,
  RemoveFriendsModal
} from '../design-system';
import { User, Badge } from '../types';
import { badgeService } from '../services/badgeService';
import { getUserData, removeFriend } from '../services/userService';

interface FriendProfileScreenParams {
  friendId: string;
  friendData?: {
    id: string;
    username: string;
    email: string;
    photoURL?: string;
    balance: number;
  };
}

export const FriendProfileScreen: React.FC = () => {
  const ds = useDesignSystem();
  const { t } = useLanguage();
  const navigation = useNavigation();
  const route = useRoute();
  const { user: currentUser } = useAuth();
  
  const { friendId, friendData } = route.params as FriendProfileScreenParams;
  
  const [friend, setFriend] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  useEffect(() => {
    loadFriendData();
  }, [friendId]);

  const loadFriendData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados completos do amigo
      const friendUserData = await getUserData(friendId);
      setFriend(friendUserData);
    } catch (error) {
      console.error('Erro ao carregar dados do amigo:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do amigo');
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSettleDebt = () => {
    Alert.alert('Acertar Dívida', 'Funcionalidade de acerto em desenvolvimento');
  };

  const handleViewTransactions = () => {
    // Removido - agora o botão navega diretamente
  };

  const handleRemoveFriend = () => {
    setShowRemoveModal(true);
  };

  const handleConfirmRemove = async () => {
    if (!currentUser?.uid || !friendId) {
      Alert.alert('Erro', 'Dados insuficientes para remover o amigo');
      return;
    }

    try {
      setRemoveLoading(true);
      
      const result = await removeFriend(currentUser.uid, friendId);
      
      if (result.success) {
        Alert.alert(
          t('common.success'), 
          t('friends.removedSuccessfully'),
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        let errorMessage = t('friends.removeError');
        
        if (result.error === 'PENDING_DEBTS') {
          const balance = result.finalBalance || 0;
          const absBalance = Math.abs(balance);
          const isPositive = balance > 0;
          
          errorMessage = t('friends.cannotRemoveWithDebts')
            .replace('{{name}}', friend?.displayName || friendData?.username || '')
            .replace('{{amount}}', `R$ ${absBalance.toFixed(2)}`)
            .replace('{{type}}', isPositive ? t('friends.owesYou') : t('friends.youOwe'));
        } else if (result.error === 'USER_NOT_FOUND') {
          errorMessage = t('friends.userNotFound');
        } else if (result.error === 'FRIEND_NOT_FOUND') {
          errorMessage = t('friends.friendNotFound');
        }
        
        Alert.alert(t('common.error'), errorMessage);
      }
    } catch (error) {
      console.error('Erro ao remover amigo:', error);
      Alert.alert(t('common.error'), t('friends.removeError'));
    } finally {
      setRemoveLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: ds.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: ds.colors.text.primary }]}>
            {t('friends.loadingProfile')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: ds.colors.background }]}>
      {/* Header com botão voltar */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBackPress}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={ds.colors.text.primary} 
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: ds.colors.text.primary }]}>
          {t('friends.profile')}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card Principal do Amigo */}
        <FriendAccountInfo 
          friend={friend}
          friendData={friendData}
        />

        {/* Badges do Amigo */}
        <FriendBadges 
          userId={friendId}
          style={styles.badgesSection}
        />

        {/* Botão de Ver Transações */}
        <FriendTransactionsButton 
          friendId={friendId}
          friendData={friendData}
        />



        {/* Botão de Remover Amigo */}
        <FriendRemoveButton onPress={handleRemoveFriend} loading={removeLoading} />

      </ScrollView>

      {/* Modal de Remoção */}
      <RemoveFriendsModal
        visible={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        onConfirm={handleConfirmRemove}
        friend={friend}
        friendData={friendData}
        loading={removeLoading}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  badgesSection: {
    marginBottom: 24,
  },

});
