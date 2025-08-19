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
import { useDesignSystem, Loading, FriendItem, BalanceCard, Card, FriendSearchModal } from '../design-system';
import { getPendingFriendRequests } from '../services/friendService';
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
  const [hasPendingRequests, setHasPendingRequests] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  
  // Modal state
  const [isAddFriendModalVisible, setIsAddFriendModalVisible] = useState(false);

  const fetchFriends = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      console.log('🔄 Friends: Iniciando carregamento de amigos...');
      
      // Executar ambas as chamadas em paralelo para melhor performance
      const [friendsWithDebts, allFriends] = await Promise.all([
        getFriendsWithOpenDebts(user.id),
        getUserFriends(user.id)
      ]);
      
      console.log(`📊 Friends: Dados carregados - ${allFriends.length} amigos, ${friendsWithDebts.friends.length} com dívidas`);
      
      // Criar um Map para busca O(1) em vez de O(n) para cada amigo
      const debtMap = new Map(
        friendsWithDebts.friends.map(friend => [friend.id, friend.balance])
      );
      
      // Combinar os dados de forma otimizada
      const friendsWithBalances: FriendWithBalance[] = allFriends.map(friend => ({
        id: friend.id,
        username: friend.username,
        email: friend.email,
        photoURL: friend.photoURL || undefined,
        balance: debtMap.get(friend.id) || 0
      }));

      // Ordenar por saldo (maior dívida primeiro)
      const sortedFriends = friendsWithBalances.sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));
      
      // Log resumido dos dados processados
      const withDebts = sortedFriends.filter(f => f.balance !== 0).length;
      const totalBalance = sortedFriends.reduce((sum, f) => sum + f.balance, 0);
      console.log(`✅ Friends: Processamento concluído - ${sortedFriends.length} amigos, ${withDebts} com dívidas, saldo total: R$ ${totalBalance.toFixed(2)}`);
      
      setFriends(sortedFriends);
      setLastFetchTime(Date.now());
    } catch (error) {
      console.error('❌ Friends: Erro ao carregar amigos:', error);
      Alert.alert(t('common.error'), t('friends.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const checkPendingRequests = async () => {
    try {
      console.log('🔍 Friends: Verificando solicitações pendentes...');
      const requests = await getPendingFriendRequests();
      console.log(`📋 Friends: ${requests.length} solicitação${requests.length !== 1 ? 'ões' : 'ão'} pendente${requests.length !== 1 ? 's' : ''}`);
      setHasPendingRequests(requests.length > 0);
    } catch (error) {
      console.error('❌ Friends: Erro ao verificar solicitações pendentes:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    console.log('🔄 Friends: Iniciando refresh manual...');
    try {
      // Atualizar tanto a lista de amigos quanto as solicitações pendentes
      await Promise.all([
        fetchFriends(),
        checkPendingRequests()
      ]);
      console.log('✅ Friends: Refresh concluído com sucesso');
    } catch (error) {
      console.error('❌ Friends: Erro ao atualizar dados:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleFriendPress = (friend: FriendWithBalance) => {
    // TODO: Implementar navegação para chat ou detalhes do amigo
    console.log(`👤 Friends: Amigo selecionado - ${friend.username} (ID: ${friend.id})`);
  };

  const handleFriendLongPress = (friend: FriendWithBalance) => {
    // TODO: Implementar menu de opções (remover amigo, etc.)
    console.log(`🔧 Friends: Long press em ${friend.username} - Abrindo menu de opções`);
  };

  const handleSwipeToSettle = (friend: FriendWithBalance) => {
    console.log(`💰 Friends: Swipe para acertar dívida - ${friend.username} | Saldo: R$ ${Math.abs(friend.balance).toFixed(2)} | Tipo: ${friend.balance > 0 ? 'Credor' : 'Devedor'}`);
    
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
        console.log('💾 Friends: Informações de acerto salvas no AsyncStorage:', {
          friendId: settleInfo.friendId,
          friendName: settleInfo.friendName,
          amount: settleInfo.amount,
          isCreditor: settleInfo.isCreditor
        });
        // TODO: Navegar para tela de criar dívida com os dados pré-preenchidos
        Alert.alert(
          'Acertar Dívida',
          `Preparando para acertar dívida com ${friend.username}...`,
          [{ text: 'OK' }]
        );
      })
      .catch(error => {
        console.error('❌ Friends: Erro ao salvar informações de acerto:', error);
      });
  };

  const handleAddFriendPress = () => {
    console.log('➕ Friends: Abrindo modal de adicionar amigo');
    setIsAddFriendModalVisible(true);
  };

  const handleCloseModal = () => {
    console.log('❌ Friends: Fechando modal de adicionar amigo');
    setIsAddFriendModalVisible(false);
    // Não recarregar dados automaticamente - apenas fechar o modal
  };

  const handleSearchUsers = async (query: string) => {
    // This function is no longer needed as we're using the real Firebase search
    // The FriendSearchModal now uses searchUsers directly
    return [];
  };

  const handleAddFriend = async (selectedUser: any) => {
    try {
      console.log('👥 Friends: Processando adição de amigo:', {
        id: selectedUser.id,
        username: selectedUser.username,
        hasPhoto: !!selectedUser.photoURL
      });
      
      // Se o selectedUser tem photoURL, significa que foi aceito uma solicitação
      if (selectedUser.photoURL !== undefined) {
        console.log('✅ Friends: Amigo aceito -', selectedUser.username);
        // Amigo foi aceito - não recarregar automaticamente
        Alert.alert(
          'Amigo Adicionado',
          `${selectedUser.username} foi adicionado à sua lista de amigos!`,
          [{ text: 'OK' }]
        );
      } else {
        console.log('📤 Friends: Solicitação enviada -', selectedUser.username);
        // Nova solicitação enviada
        Alert.alert(
          'Solicitação Enviada',
          `Solicitação de amizade enviada para ${selectedUser.username}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Friends: Erro ao adicionar amigo:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o amigo');
    }
  };

  useEffect(() => {
    if (user?.id) {
      const now = Date.now();
      const cacheExpiry = 30000; // 30 segundos de cache
      
      console.log('🔄 Friends: useEffect executado -', {
        hasFriends: friends.length > 0,
        cacheAge: now - lastFetchTime,
        cacheExpired: (now - lastFetchTime) > cacheExpiry
      });
      
      // Só recarregar se não há dados ou se o cache expirou
      if (friends.length === 0 || (now - lastFetchTime) > cacheExpiry) {
        console.log('📡 Friends: Cache expirado ou sem dados - carregando...');
        fetchFriends();
        checkPendingRequests();
      } else {
        console.log('⚡ Friends: Usando cache - dados ainda válidos');
        // Se há dados em cache, apenas mostrar sem loading
        setLoading(false);
      }
    }
  }, [user?.id]);

  // Calcular balanço geral
  const calculateOverallBalance = () => {
    const totalBalance = friends.reduce((sum, friend) => sum + friend.balance, 0);
    const positiveBalance = friends.reduce((sum, friend) => sum + Math.max(0, friend.balance), 0);
    const negativeBalance = friends.reduce((sum, friend) => sum + Math.min(0, friend.balance), 0);
    
    return {
      total: totalBalance,
      positive: positiveBalance,
      negative: Math.abs(negativeBalance),
      isPositive: totalBalance >= 0
    };
  };

  const overallBalance = calculateOverallBalance();

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
      {/* Balanço Geral */}
      {friends.length > 0 && (
        <View style={styles.balanceContainer}>
          <BalanceCard 
            balance={overallBalance.total}
            title="Balanço Geral"
            style={styles.balanceCard}
          />
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
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
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddFriendPress}
        >
          <View style={styles.addButtonContainer}>
            <Ionicons name="add" size={24} color={ds.colors.primary} />
            {hasPendingRequests && (
              <View style={[styles.pendingBadge, { backgroundColor: ds.colors.primary + '90' }]} />
            )}
          </View>
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
              onPress={handleAddFriendPress}
            >
              <Ionicons name="person-add" size={20} color="white" />
              <Text style={styles.addFriendButtonText}>
                {t('friends.addFriend')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add Friend Modal */}
      <FriendSearchModal
        visible={isAddFriendModalVisible}
        onClose={handleCloseModal}
        onAddFriend={handleAddFriend}
        existingFriends={friends.map(friend => friend.id)}
        onSearchUsers={handleSearchUsers}
        hasPendingRequests={hasPendingRequests}
      />
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
  addButtonContainer: {
    position: 'relative',
  },
  pendingBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  balanceContainer: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 8,
  },
  balanceCard: {
    marginBottom: 0,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  friendsList: {
    gap: 0,
    paddingHorizontal: 0,
    paddingBottom: 30,
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