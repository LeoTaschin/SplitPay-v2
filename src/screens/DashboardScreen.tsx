import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import { useDesignSystem, Avatar, Loading, StatCard, StatsGrid, RecentDebtItem, RecentDebtsList, EditButton, EmptyStatCard, StatCardSelector, GridInfo, StatsCarousel } from '../design-system';
import { Dimensions } from 'react-native';
import { getUserBalance, getDebtsAsCreditor, getDebtsAsDebtor } from '../services/debtService';
import { 
  getMonthlyAverage, 
  getBiggestDebt, 
  getMostActiveFriend, 
  getGroupActivity, 
  getPaymentTrend, 
  getDebtDistribution 
} from '../services/analyticsService';
import { Debt } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BalanceData {
  totalOwed: number;
  totalToReceive: number;
  netBalance: number;
}

interface DashboardStats {
  unpaidDebts: number;
  totalUnpaidAmount: number;
  friendWithMostDebt: string;
  friendWithMostDebtAmount: number;
  friendWithMostDebtPhoto: string;
  oldestUnpaidDebt: string;
  oldestUnpaidDebtDays: number;
  // Novos campos
  monthlyAverage: number;
  biggestDebt: number;
  biggestDebtDescription: string;
  mostActiveFriend: string;
  mostActiveFriendTransactions: number;
  mostActiveFriendPhoto: string;
  groupCount: number;
  groupActiveTransactions: number;
  paymentTrendDays: number;
  personalDebtPercentage: number;
  groupDebtPercentage: number;
}

interface StatCardConfig {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  color: string;
  customIcon?: React.ReactNode;
}

interface StatCardOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  category: string;
}

export const DashboardScreen: React.FC = () => {
  const ds = useDesignSystem();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [balanceData, setBalanceData] = useState<BalanceData>({
    totalOwed: 0,
    totalToReceive: 0,
    netBalance: 0
  });
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    unpaidDebts: 0,
    totalUnpaidAmount: 0,
    friendWithMostDebt: '',
    friendWithMostDebtAmount: 0,
    friendWithMostDebtPhoto: '',
    oldestUnpaidDebt: '',
    oldestUnpaidDebtDays: 0,
    // Novos campos
    monthlyAverage: 0,
    biggestDebt: 0,
    biggestDebtDescription: '',
    mostActiveFriend: '',
    mostActiveFriendTransactions: 0,
    mostActiveFriendPhoto: '',
    groupCount: 0,
    groupActiveTransactions: 0,
    paymentTrendDays: 0,
    personalDebtPercentage: 0,
    groupDebtPercentage: 0
  });
  const [recentDebts, setRecentDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [visibleStatCards, setVisibleStatCards] = useState<string[]>([
    'unpaidDebts',
    'totalUnpaid',
    'friendWithMostDebt',
    'oldestUnpaidDebt'
  ]);
  const [cardOrder, setCardOrder] = useState<{ [key: string]: number }>({
    'unpaidDebts': 0,
    'totalUnpaid': 1,
    'friendWithMostDebt': 2,
    'oldestUnpaidDebt': 3
  });
  const [showCardSelector, setShowCardSelector] = useState(false);

  // Chave para salvar as predefinições
  const DASHBOARD_CARDS_KEY = `dashboard_cards_${user?.id || 'default'}`;
  const DASHBOARD_ORDER_KEY = `dashboard_order_${user?.id || 'default'}`;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Carregar predefinições salvas
  const loadSavedCards = async () => {
    try {
      const [savedCards, savedOrder] = await Promise.all([
        AsyncStorage.getItem(DASHBOARD_CARDS_KEY),
        AsyncStorage.getItem(DASHBOARD_ORDER_KEY)
      ]);
      
      if (savedCards) {
        const parsedCards = JSON.parse(savedCards);
        setVisibleStatCards(parsedCards);
      }
      
      if (savedOrder) {
        const parsedOrder = JSON.parse(savedOrder);
        setCardOrder(parsedOrder);
      }
    } catch (error) {
      console.error('Erro ao carregar cards salvos:', error);
    }
  };

  // Salvar predefinições
  const saveCards = async (cards: string[], order?: { [key: string]: number }) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(DASHBOARD_CARDS_KEY, JSON.stringify(cards)),
        AsyncStorage.setItem(DASHBOARD_ORDER_KEY, JSON.stringify(order || cardOrder))
      ]);
    } catch (error) {
      console.error('Erro ao salvar cards:', error);
    }
  };

  const calculateDashboardStats = (creditorDebts: Debt[], debtorDebts: Debt[]) => {
    // Dívidas não pagas
    const allUnpaidDebts = [...creditorDebts, ...debtorDebts].filter(debt => !debt.paid);
    const unpaidDebtsCount = allUnpaidDebts.length;
    
    // Valor total não pago
    const totalUnpaidAmount = allUnpaidDebts.reduce((sum, debt) => {
      const amount = debt.type === 'group' ? (debt.amountPerPerson || 0) : (debt.amount || 0);
      return sum + amount;
    }, 0);

    // Amigo com mais dívida (onde o usuário é credor)
    const creditorDebtsUnpaid = creditorDebts.filter(debt => !debt.paid);
    const debtByFriend: Record<string, { name: string; total: number; photoURL?: string }> = {};
    
    creditorDebtsUnpaid.forEach(debt => {
      const friendId = debt.debtorId;
      const amount = debt.type === 'group' ? (debt.amountPerPerson || 0) : (debt.amount || 0);

      if (friendId && typeof friendId === 'string' && !(friendId in debtByFriend)) {
        debtByFriend[friendId] = {
          name: debt.debtor?.username || debt.debtor?.name || 'Usuário',
          total: 0,
          photoURL: debt.debtor?.photoURL
        };
      }
      if (friendId && typeof friendId === 'string') {
        debtByFriend[friendId].total += amount;
      }
    });

    const friendWithMostDebt = Object.entries(debtByFriend)
      .sort(([, a], [, b]) => b.total - a.total)[0];

    // Dívida mais antiga não paga
    const oldestUnpaidDebt = allUnpaidDebts
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];

    const oldestUnpaidDebtDays = oldestUnpaidDebt 
      ? Math.floor((Date.now() - new Date(oldestUnpaidDebt.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      unpaidDebts: unpaidDebtsCount,
      totalUnpaidAmount,
      friendWithMostDebt: friendWithMostDebt?.[1]?.name || '',
      friendWithMostDebtAmount: friendWithMostDebt?.[1]?.total || 0,
      friendWithMostDebtPhoto: friendWithMostDebt?.[1]?.photoURL || '',
      oldestUnpaidDebt: oldestUnpaidDebt?.description || '',
      oldestUnpaidDebtDays,
      // Novos campos - serão preenchidos separadamente
      monthlyAverage: 0,
      biggestDebt: 0,
      biggestDebtDescription: '',
      mostActiveFriend: '',
      mostActiveFriendTransactions: 0,
      mostActiveFriendPhoto: '',
      groupCount: 0,
      groupActiveTransactions: 0,
      paymentTrendDays: 0,
      personalDebtPercentage: 0,
      groupDebtPercentage: 0
    };
  };

  const fetchDashboardData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Buscar dados básicos
      const [balance, creditorDebts, debtorDebts] = await Promise.all([
        getUserBalance(user.id),
        getDebtsAsCreditor(user.id),
        getDebtsAsDebtor(user.id)
      ]);

      setBalanceData(balance);
      
      // Calcular estatísticas básicas do dashboard
      const basicStats = calculateDashboardStats(creditorDebts, debtorDebts);
      
      // Buscar dados avançados de analytics
      const [
        monthlyAverage,
        biggestDebt,
        mostActiveFriend,
        groupActivity,
        paymentTrend,
        debtDistribution
      ] = await Promise.all([
        getMonthlyAverage(user.id),
        getBiggestDebt(user.id),
        getMostActiveFriend(user.id),
        getGroupActivity(user.id),
        getPaymentTrend(user.id),
        getDebtDistribution(user.id)
      ]);

      // Combinar todos os dados
      const completeStats: DashboardStats = {
        ...basicStats,
        monthlyAverage: monthlyAverage.average,
        biggestDebt: biggestDebt.amount,
        biggestDebtDescription: biggestDebt.description || '',
        mostActiveFriend: mostActiveFriend.name,
        mostActiveFriendTransactions: mostActiveFriend.transactionCount,
        mostActiveFriendPhoto: mostActiveFriend.photoURL || '',
        groupCount: groupActivity.groupCount,
        groupActiveTransactions: groupActivity.activeTransactions,
        paymentTrendDays: paymentTrend.averageDays,
        personalDebtPercentage: debtDistribution.personalPercentage,
        groupDebtPercentage: debtDistribution.groupPercentage
      };

      setDashboardStats(completeStats);
      
      // Combinar e ordenar dívidas recentes
      const allDebts = [...creditorDebts, ...debtorDebts];
      const sortedDebts = allDebts
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5); // Últimas 5 dívidas
      
      setRecentDebts(sortedDebts);
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      Alert.alert(t('common.error'), t('dashboard.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const removeStatCard = async (cardId: string) => {
    const newCards = visibleStatCards.filter(id => id !== cardId);
    const newOrder = { ...cardOrder };
    delete newOrder[cardId];
    
    setVisibleStatCards(newCards);
    setCardOrder(newOrder);
    await saveCards(newCards, newOrder);
  };

  const addStatCard = async (cardId: string) => {
    if (!visibleStatCards.includes(cardId)) {
      const newCards = [...visibleStatCards, cardId];
      const newOrder = { ...cardOrder };
      newOrder[cardId] = Math.max(...Object.values(cardOrder), -1) + 1;
      
      setVisibleStatCards(newCards);
      setCardOrder(newOrder);
      await saveCards(newCards, newOrder);
    }
    setShowCardSelector(false);
  };

  const getGridCardWidth = () => {
    const screenWidth = Dimensions.get('window').width;
    const paddingHorizontal = 24;
    const availableWidth = screenWidth - (paddingHorizontal * 2);
    const gap = 4; // Gap ainda menor
    
    // Sempre 3 colunas, mas com largura calculada
    return (availableWidth - (gap * 2)) / 3;
  };

  const getAvailableCards = (): StatCardOption[] => {
    const allCards: StatCardOption[] = [
      // Financeiro
      {
        id: 'unpaidDebts',
        title: t('dashboard.cardSelector.cards.unpaidDebts.title'),
        description: t('dashboard.cardSelector.cards.unpaidDebts.description'),
        icon: 'alert-circle',
        color: '#EF4444',
        category: 'financial'
      },
      {
        id: 'totalUnpaid',
        title: t('dashboard.cardSelector.cards.totalUnpaid.title'),
        description: t('dashboard.cardSelector.cards.totalUnpaid.description'),
        icon: 'cash-outline',
        color: '#F59E0B',
        category: 'financial'
      },
      {
        id: 'monthlyAverage',
        title: t('dashboard.cardSelector.cards.monthlyAverage.title'),
        description: t('dashboard.cardSelector.cards.monthlyAverage.description'),
        icon: 'trending-up',
        color: '#10B981',
        category: 'financial'
      },
      {
        id: 'biggestDebt',
        title: t('dashboard.cardSelector.cards.biggestDebt.title'),
        description: t('dashboard.cardSelector.cards.biggestDebt.description'),
        icon: 'diamond',
        color: '#8B5CF6',
        category: 'financial'
      },
      // Social
      {
        id: 'friendWithMostDebt',
        title: t('dashboard.cardSelector.cards.friendWithMostDebt.title'),
        description: t('dashboard.cardSelector.cards.friendWithMostDebt.description'),
        icon: 'person',
        color: '#10B981',
        category: 'social'
      },
      {
        id: 'mostActiveFriend',
        title: t('dashboard.cardSelector.cards.mostActiveFriend.title'),
        description: t('dashboard.cardSelector.cards.mostActiveFriend.description'),
        icon: 'people',
        color: '#3B82F6',
        category: 'social'
      },
      {
        id: 'groupActivity',
        title: t('dashboard.cardSelector.cards.groupActivity.title'),
        description: t('dashboard.cardSelector.cards.groupActivity.description'),
        icon: 'people-circle',
        color: '#EC4899',
        category: 'social'
      },
      // Analítico
      {
        id: 'oldestUnpaidDebt',
        title: t('dashboard.cardSelector.cards.oldestUnpaidDebt.title'),
        description: t('dashboard.cardSelector.cards.oldestUnpaidDebt.description'),
        icon: 'time-outline',
        color: '#8B5CF6',
        category: 'analytics'
      },
      {
        id: 'paymentTrend',
        title: t('dashboard.cardSelector.cards.paymentTrend.title'),
        description: t('dashboard.cardSelector.cards.paymentTrend.description'),
        icon: 'analytics',
        color: '#06B6D4',
        category: 'analytics'
      },
      {
        id: 'debtDistribution',
        title: t('dashboard.cardSelector.cards.debtDistribution.title'),
        description: t('dashboard.cardSelector.cards.debtDistribution.description'),
        icon: 'pie-chart',
        color: '#F97316',
        category: 'analytics'
      }
    ];

    return allCards.filter(card => !visibleStatCards.includes(card.id));
  };

  const getStatCards = (): StatCardConfig[] => {
    const allCards: StatCardConfig[] = [
      {
        id: 'unpaidDebts',
        title: t('dashboard.unpaidDebts'),
        value: dashboardStats.unpaidDebts.toString(),
        subtitle: `${dashboardStats.unpaidDebts} ${dashboardStats.unpaidDebts === 1 ? t('dashboard.debt') : t('dashboard.debts')}`,
        icon: 'alert-circle',
        color: '#EF4444'
      },
      {
        id: 'totalUnpaid',
        title: t('dashboard.totalUnpaid'),
        value: formatCurrency(dashboardStats.totalUnpaidAmount),
        subtitle: dashboardStats.totalUnpaidAmount > 0 ? t('dashboard.toReceive') : t('dashboard.balanced'),
        icon: 'cash-outline',
        color: '#F59E0B'
      },
      {
        id: 'monthlyAverage',
        title: t('dashboard.monthlyAverage'),
        value: formatCurrency(dashboardStats.monthlyAverage),
        subtitle: dashboardStats.monthlyAverage > 0 ? t('dashboard.last3Months') : t('dashboard.noData'),
        icon: 'trending-up',
        color: '#10B981'
      },
      {
        id: 'biggestDebt',
        title: t('dashboard.biggestDebt'),
        value: formatCurrency(dashboardStats.biggestDebt),
        subtitle: dashboardStats.biggestDebtDescription || t('dashboard.biggestDebtSubtext'),
        icon: 'diamond',
        color: '#8B5CF6'
      },
      {
        id: 'friendWithMostDebt',
        title: t('dashboard.friendWithMostDebt'),
        value: dashboardStats.friendWithMostDebt || t('dashboard.noFriends'),
        subtitle: dashboardStats.friendWithMostDebtAmount > 0 
          ? formatCurrency(dashboardStats.friendWithMostDebtAmount)
          : t('dashboard.noDebts'),
        icon: 'person',
        color: '#10B981',
        customIcon: dashboardStats.friendWithMostDebt ? (
          <Avatar
            source={dashboardStats.friendWithMostDebtPhoto}
            name={dashboardStats.friendWithMostDebt}
            size="medium"
            variant="circle"
          />
        ) : undefined
      },
      {
        id: 'mostActiveFriend',
        title: t('dashboard.mostActiveFriend'),
        value: dashboardStats.mostActiveFriend || t('dashboard.noFriends'),
        subtitle: `${dashboardStats.mostActiveFriendTransactions} ${dashboardStats.mostActiveFriendTransactions === 1 ? t('dashboard.transaction') : t('dashboard.transactions')}`,
        icon: 'people',
        color: '#3B82F6',
        customIcon: dashboardStats.mostActiveFriendPhoto ? (
          <Avatar
            source={dashboardStats.mostActiveFriendPhoto}
            name={dashboardStats.mostActiveFriend}
            size="medium"
            variant="circle"
          />
        ) : undefined
      },
      {
        id: 'groupActivity',
        title: t('dashboard.groupActivity'),
        value: dashboardStats.groupCount.toString(),
        subtitle: `${dashboardStats.groupActiveTransactions} ${dashboardStats.groupActiveTransactions === 1 ? t('dashboard.activeTransaction') : t('dashboard.activeTransactions')}`,
        icon: 'people-circle',
        color: '#EC4899'
      },
      {
        id: 'oldestUnpaidDebt',
        title: t('dashboard.oldestUnpaidDebt'),
        value: dashboardStats.oldestUnpaidDebtDays > 0 
          ? `${dashboardStats.oldestUnpaidDebtDays} ${t('dashboard.days')}`
          : t('dashboard.noOldDebts'),
        subtitle: dashboardStats.oldestUnpaidDebt || t('dashboard.noDescription'),
        icon: 'time-outline',
        color: '#8B5CF6'
      },
      {
        id: 'paymentTrend',
        title: t('dashboard.paymentTrend'),
        value: dashboardStats.paymentTrendDays > 0 
          ? `${dashboardStats.paymentTrendDays} ${t('dashboard.days')}`
          : t('dashboard.noData'),
        subtitle: t('dashboard.paymentTrendSubtext'),
        icon: 'analytics',
        color: '#06B6D4'
      },
      {
        id: 'debtDistribution',
        title: t('dashboard.debtDistribution'),
        value: `${dashboardStats.personalDebtPercentage}%`,
        subtitle: `${dashboardStats.groupDebtPercentage}% ${t('dashboard.groups')}`,
        icon: 'pie-chart',
        color: '#F97316'
      }
    ];

    // Filtrar cards visíveis e ordenar pela ordem de adição
    const visibleCards = allCards.filter(card => visibleStatCards.includes(card.id));
    
    return visibleCards.sort((a, b) => {
      const orderA = cardOrder[a.id] ?? 999;
      const orderB = cardOrder[b.id] ?? 999;
      return orderA - orderB;
    });
  };

  useEffect(() => {
    if (user?.id) {
      loadSavedCards();
      fetchDashboardData();
    }
  }, [user?.id]);





  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: ds.colors.background }]}>
        <Loading 
          variant="spinner"
          size="large"
        />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: ds.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={[styles.subtitle, { color: ds.colors.text.secondary }]}>
            {t('dashboard.subtitle')}
          </Text>
        </View>
        <EditButton
          isEditing={isEditing}
          onToggle={toggleEditMode}
        />
      </View>

      {/* Grid Info */}
      <GridInfo
        currentCount={getStatCards().length}
        maxCount={9}
        isEditing={isEditing}
        availableSlots={10 - getStatCards().length}
      />

      {/* Stats Carousel */}
      <StatsCarousel
        data={getStatCards().map((card) => ({
          id: card.id,
          title: card.title,
          value: card.value,
          subtitle: card.subtitle,
          icon: card.icon as any,
          color: card.color,
          customIcon: card.customIcon,
        }))}
        isEditing={isEditing}
        onRemove={removeStatCard}
        onAdd={() => setShowCardSelector(true)}
      />

      {/* Card Selector Modal */}
      <StatCardSelector
        visible={showCardSelector}
        onClose={() => setShowCardSelector(false)}
        onSelect={addStatCard}
        availableCards={getAvailableCards()}
      />

      {/* Recent Debts */}
      <RecentDebtsList
        title={t('dashboard.recentDebts')}
        onViewAll={() => console.log('Ver todas as dívidas')}
        emptyState={{
          icon: 'document-outline',
          title: t('dashboard.noRecentDebts'),
          subtitle: t('dashboard.noRecentDebtsSubtext'),
        }}
      >
        {recentDebts.map((debt) => {
          console.log('DashboardScreen - debt.createdAt:', debt.createdAt, 'type:', typeof debt.createdAt);
          const isCreditor = debt.creditorId === user?.id;
          const amount = debt.type === 'group' ? (debt.amountPerPerson || 0) : (debt.amount || 0);
          const otherPerson = isCreditor ? debt.debtor : debt.creditor;
          
          return (
            <RecentDebtItem
              key={debt.id}
              personName={otherPerson?.username || otherPerson?.name || 'Usuário'}
              personPhoto={otherPerson?.photoURL}
              description={debt.description || t('dashboard.noDescription')}
              amount={amount}
              isCreditor={isCreditor}
              date={debt.createdAt}
              isGroup={debt.type === 'group'}
            />
          );
        })}
      </RecentDebtsList>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingRight: 0,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 22,
  },
  cardsContainer: {
    flexDirection: 'row',
    paddingRight: 24,
    gap: 16,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  cardAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 24,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: 10,
    textAlign: 'center',
    opacity: 0.7,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingRight: 24,
    marginBottom: 24,
    gap: 12,
  },
}); 