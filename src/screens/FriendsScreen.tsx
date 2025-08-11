import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  RefreshControl,
  Alert,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import { useDesignSystem, Loading, FriendItem } from '../design-system';
import { getUserFriends } from '../services/userService';
import { getFriendsWithOpenDebts } from '../services/debtService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FriendWithBalance {
  id: string;
  username: string;
  email: string;
  photoURL?: string;
  balance: number;
}

export const FriendsScreen: React.FC = () => {
  const ds = useDesignSystem();
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [friends, setFriends] = useState<FriendWithBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFriends = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Buscar amigos com saldos de dívidas
      const friendsWithDebts = await getFriendsWithOpenDebts(user.id);
      
      // Buscar todos os amigos (incluindo os sem dívidas)
      const allFriends = await getUserFriends(user.id);
      
      // Combinar os dados
      const friendsWithBalances: FriendWithBalance[] = allFriends.map(friend => {
        const friendWithDebt = friendsWithDebts.friends.find(f => f.id === friend.id);
        const balance = friendWithDebt?.balance || 0;
        
        return {
          id: friend.id,
          username: friend.username,
          email: friend.email,
          photoURL: friend.photoURL,
          balance: balance
        };
      });

      // Ordenar por saldo (maior dívida primeiro)
      const sortedFriends = friendsWithBalances.sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));
      
      // Log resumido dos amigos
      const withDebts = sortedFriends.filter(f => f.balance !== 0).length;
      const total = sortedFriends.length;
      console.log(`Friends: ${total} amigos carregados (${withDebts} com dívidas)`);
      
      setFriends(sortedFriends);
    } catch (error) {
      console.error('Friends: Erro ao carregar amigos:', error);
      Alert.alert(t('common.error'), t('friends.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFriends();
    setRefreshing(false);
  };

  const handleFriendPress = (friend: FriendWithBalance) => {
    // TODO: Implementar navegação para chat ou detalhes do amigo
    console.log(`Friends: Clicou em ${friend.username}`);
  };

  const handleFriendLongPress = (friend: FriendWithBalance) => {
    // TODO: Implementar menu de opções (remover amigo, etc.)
    console.log(`Friends: Long press em ${friend.username}`);
  };

  const handleSwipeToSettle = (friend: FriendWithBalance) => {
    console.log(`Friends: Swipe para acertar dívida com ${friend.username} - Saldo: R$ ${Math.abs(friend.balance).toFixed(2)}`);
    
    // TODO: Navegar para tela de acertar dívida
    // Por enquanto, vamos armazenar as informações para usar depois
    const settleInfo = {
      friendId: friend.id,
      friendName: friend.username,
      friendEmail: friend.email,
      friendPhoto: friend.photoURL,
      balance: friend.balance,
      isCreditor: friend.balance > 0, // true se o amigo deve para você
      amount: Math.abs(friend.balance),
      timestamp: new Date().toISOString()
    };
    
    // Armazenar no AsyncStorage para usar na tela de criar dívida
    AsyncStorage.setItem('pendingSettleInfo', JSON.stringify(settleInfo))
      .then(() => {
        console.log('Friends: Informações de acerto salvas:', settleInfo);
        // TODO: Navegar para tela de criar dívida com os dados pré-preenchidos
        Alert.alert(
          'Acertar Dívida',
          `Preparando para acertar dívida com ${friend.username}...`,
          [{ text: 'OK' }]
        );
      })
      .catch(error => {
        console.error('Friends: Erro ao salvar informações de acerto:', error);
      });
  };

  useEffect(() => {
    if (user?.id) {
      fetchFriends();
    }
  }, [user?.id]);

  if (loading) {
    return (
          <SafeAreaView style={[styles.container, { backgroundColor: ds.colors.background }]}>
      <View style={styles.loadingContainer}>
        <Loading 
          variant="spinner"
          size="large"
        />
      </View>
    </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: ds.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: ds.colors.surface }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: ds.colors.text.primary }]}>
            {t('friends.title')}
          </Text>
          <Text style={[styles.subtitle, { color: ds.colors.text.secondary }]}>
            {friends.length > 0 
              ? `${friends.length} ${friends.length === 1 ? t('friends.friend') : t('friends.friends')}`
              : t('friends.noFriends')
            }
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color={ds.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {friends.length > 0 ? (
          <View style={styles.friendsList}>
            {friends.map((friend) => (
              <FriendItem
                key={friend.id}
                friend={friend}
                onPress={() => handleFriendPress(friend)}
                onLongPress={() => handleFriendLongPress(friend)}
                onSwipeToSettle={() => handleSwipeToSettle(friend)}
                style={styles.friendItem}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: ds.colors.surface }]}>
              <Ionicons 
                name="people-outline" 
                size={48} 
                color={ds.colors.text.secondary} 
              />
            </View>
            <Text style={[styles.emptyTitle, { color: ds.colors.text.primary }]}>
              {t('friends.noFriends')}
            </Text>
            <Text style={[styles.emptySubtitle, { color: ds.colors.text.secondary }]}>
              {t('friends.addFirstFriend')}
            </Text>
            <TouchableOpacity 
              style={[styles.addFriendButton, { backgroundColor: ds.colors.primary }]}
            >
              <Ionicons name="person-add" size={20} color="white" />
              <Text style={styles.addFriendButtonText}>
                {t('friends.addFriend')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  friendsList: {
    gap: 12,
  },
  friendItem: {
    marginBottom: 0,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  addFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addFriendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 