import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useDesignSystem } from '../design-system';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { getDebtsAsCreditor, getDebtsAsDebtor } from '../services/debtService';
import { Debt } from '../types';
import { auth } from '../config/firebase';

type FriendTransactionsRouteProp = RouteProp<RootStackParamList, 'FriendTransactions'>;
type TabType = 'all' | 'pending' | 'paid' | 'personal' | 'group';

interface TransactionItem {
  id: string;
  type: 'personal' | 'group';
  status: 'pending' | 'paid';
  amount: number;
  description?: string;
  createdAt: Date | string | number; // Mais flexível para diferentes formatos de data
  isCreditor: boolean; // true se o usuário atual é o credor
  otherParty: {
    id: string;
    username: string;
    photoURL?: string;
  };
  category?: string;
}

export const FriendTransactionsScreen: React.FC = () => {
  const { theme, isDark } = useTheme();
  const ds = useDesignSystem();
  const { t } = useLanguage();
  const navigation = useNavigation();
  const route = useRoute<FriendTransactionsRouteProp>();
  const { friendId, friendData } = route.params;
  
  // Verificar se os parâmetros estão corretos
  if (!friendId) {
    console.error('FriendTransactionsScreen: friendId não encontrado');
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: ds.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: ds.colors.text.primary }]}>
            Erro: ID do amigo não encontrado
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionItem[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  const tabs = [
    { id: 'all' as TabType, icon: 'list-outline', label: 'Todas' },
    { id: 'pending' as TabType, icon: 'time-outline', label: 'Pendentes' },
    { id: 'paid' as TabType, icon: 'checkmark-circle-outline', label: 'Pagas' },
    { id: 'personal' as TabType, icon: 'person-outline', label: 'Pessoal' },
    { id: 'group' as TabType, icon: 'people-outline', label: 'Grupo' },
  ];

  useEffect(() => {
    loadTransactions();
  }, [friendId]);

  useEffect(() => {
    filterTransactions();
  }, [transactions, activeTab]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      
      // Obter o ID do usuário atual
      const currentUserId = auth.currentUser?.uid;
      if (!currentUserId) {
        console.error('FriendTransactionsScreen: Usuário não autenticado');
        return;
      }
      
      // Buscar dívidas onde o usuário atual é credor e o amigo é devedor
      const creditorDebts = await getDebtsAsCreditor(currentUserId, true); // incluir pagas
      const debtorDebts = await getDebtsAsDebtor(currentUserId, true); // incluir pagas
      
      // Filtrar apenas dívidas relacionadas ao amigo específico
      const friendCreditorDebts = creditorDebts.filter(debt => 
        debt.debtorId === friendId || debt.payerId === friendId
      );
      
      const friendDebtorDebts = debtorDebts.filter(debt => 
        debt.creditorId === friendId || debt.receiverId === friendId
      );
      


      // Converter para formato de transações
      const allTransactions: TransactionItem[] = [
        ...friendCreditorDebts.map(debt => {
          // Garantir que a data seja válida
          let validCreatedAt: Date | string | number;
          try {
            if (debt.createdAt instanceof Date) {
              validCreatedAt = debt.createdAt;
            } else if (typeof debt.createdAt === 'string') {
              validCreatedAt = debt.createdAt;
            } else if (typeof debt.createdAt === 'number') {
              validCreatedAt = debt.createdAt;
            } else {
              validCreatedAt = new Date();
            }
          } catch (error) {
            console.error('Erro ao processar data do credor:', error, debt.createdAt);
            validCreatedAt = new Date();
          }
          
          return {
            id: debt.id,
            type: (debt.type || 'personal') as 'personal' | 'group',
            status: (debt.paid ? 'paid' : 'pending') as 'pending' | 'paid',
            amount: debt.type === 'group' ? (debt.amountPerPerson || 0) : (debt.amount || 0),
            description: debt.description,
            createdAt: validCreatedAt,
            isCreditor: true,
            otherParty: {
              id: friendId,
              username: friendData?.username || 'Amigo',
              photoURL: friendData?.photoURL,
            },
            category: debt.category,
          };
        }),
        ...friendDebtorDebts.map(debt => {
          // Garantir que a data seja válida
          let validCreatedAt: Date | string | number;
          try {
            if (debt.createdAt instanceof Date) {
              validCreatedAt = debt.createdAt;
            } else if (typeof debt.createdAt === 'string') {
              validCreatedAt = debt.createdAt;
            } else if (typeof debt.createdAt === 'number') {
              validCreatedAt = debt.createdAt;
            } else {
              validCreatedAt = new Date();
            }
          } catch (error) {
            console.error('Erro ao processar data do devedor:', error, debt.createdAt);
            validCreatedAt = new Date();
          }
          
          return {
            id: debt.id,
            type: (debt.type || 'personal') as 'personal' | 'group',
            status: (debt.paid ? 'paid' : 'pending') as 'pending' | 'paid',
            amount: debt.type === 'group' ? (debt.amountPerPerson || 0) : (debt.amount || 0),
            description: debt.description,
            createdAt: validCreatedAt,
            isCreditor: false,
            otherParty: {
              id: friendId,
              username: friendData?.username || 'Amigo',
              photoURL: friendData?.photoURL,
            },
            category: debt.category,
          };
        })
      ];

      // Ordenar por data (mais recente primeiro)
      allTransactions.sort((a, b) => {
        try {
          let dateA: Date;
          let dateB: Date;
          
          if (a.createdAt instanceof Date) {
            dateA = a.createdAt;
          } else if (typeof a.createdAt === 'string') {
            dateA = new Date(a.createdAt);
          } else if (typeof a.createdAt === 'number') {
            dateA = new Date(a.createdAt);
          } else {
            dateA = new Date();
          }
          
          if (b.createdAt instanceof Date) {
            dateB = b.createdAt;
          } else if (typeof b.createdAt === 'string') {
            dateB = new Date(b.createdAt);
          } else if (typeof b.createdAt === 'number') {
            dateB = new Date(b.createdAt);
          } else {
            dateB = new Date();
          }
          
          // Verificar se as datas são válidas
          if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
            return 0; // Manter ordem original se alguma data for inválida
          }
          
          return dateB.getTime() - dateA.getTime();
        } catch (error) {
          console.error('Erro ao ordenar transações por data:', error);
          return 0;
        }
      });

      setTransactions(allTransactions);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    switch (activeTab) {
      case 'pending':
        filtered = transactions.filter(t => t.status === 'pending');
        break;
      case 'paid':
        filtered = transactions.filter(t => t.status === 'paid');
        break;
      case 'personal':
        filtered = transactions.filter(t => t.type === 'personal');
        break;
      case 'group':
        filtered = transactions.filter(t => t.type === 'group');
        break;
      default:
        filtered = transactions;
    }

    setFilteredTransactions(filtered);
  };

  const scrollToTab = (tabIndex: number) => {
    const tabWidth = 98;
    const scrollPosition = tabIndex * tabWidth;
    
    scrollViewRef.current?.scrollTo({
      x: scrollPosition,
      animated: true,
    });
  };

  const handlePreviousTab = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
    const newTab = tabs[previousIndex].id;
    
    setActiveTab(newTab);
    scrollToTab(previousIndex);
  };

  const handleNextTab = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
    const newTab = tabs[nextIndex].id;
    
    setActiveTab(newTab);
    scrollToTab(nextIndex);
  };

  const handleTabPress = (tabId: TabType) => {
    const tabIndex = tabs.findIndex(tab => tab.id === tabId);
    setActiveTab(tabId);
    scrollToTab(tabIndex);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const formatDate = (date: Date | string | number) => {
    try {
      let validDate: Date;
      
      if (date instanceof Date) {
        validDate = date;
      } else if (typeof date === 'string') {
        validDate = new Date(date);
      } else if (typeof date === 'number') {
        validDate = new Date(date);
      } else {
        validDate = new Date();
      }
      
      // Verificar se a data é válida
      if (isNaN(validDate.getTime())) {
        return 'Data inválida';
      }
      
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(validDate);
    } catch (error) {
      console.error('Erro ao formatar data:', error, date);
      return 'Data inválida';
    }
  };

  const getTransactionIcon = (transaction: TransactionItem) => {
    if (transaction.type === 'group') {
      return 'people-outline';
    }
    return transaction.isCreditor ? 'arrow-up-outline' : 'arrow-down-outline';
  };

  const getTransactionColor = (transaction: TransactionItem) => {
    if (transaction.status === 'paid') {
      return ds.colors.feedback.success;
    }
    return transaction.isCreditor ? ds.colors.primary : ds.colors.feedback.error;
  };

  const renderTransactionItem = (transaction: TransactionItem) => (
    <View key={transaction.id} style={[styles.transactionItem, { backgroundColor: ds.colors.surface }]}>
      <View style={styles.transactionHeader}>
        <View style={[styles.iconContainer, { backgroundColor: getTransactionColor(transaction) + '15' }]}>
          <Ionicons 
            name={getTransactionIcon(transaction) as any} 
            size={20} 
            color={getTransactionColor(transaction)} 
          />
        </View>
        
        <View style={styles.transactionInfo}>
          <Text style={[styles.transactionTitle, { color: ds.colors.text.primary }]}>
            {transaction.description || 'Transação'}
          </Text>
          <Text style={[styles.transactionDate, { color: ds.colors.text.secondary }]}>
            {formatDate(transaction.createdAt)}
          </Text>
        </View>
        
        <View style={styles.transactionAmount}>
          <Text style={[
            styles.amountText, 
            { 
              color: getTransactionColor(transaction),
              fontWeight: transaction.isCreditor ? '600' : '500'
            }
          ]}>
            {transaction.isCreditor ? '+' : '-'} {formatCurrency(transaction.amount)}
          </Text>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: transaction.status === 'paid' ? ds.colors.feedback.success + '20' : ds.colors.feedback.warning + '20' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: transaction.status === 'paid' ? ds.colors.feedback.success : ds.colors.feedback.warning }
            ]}>
              {transaction.status === 'paid' ? 'Paga' : 'Pendente'}
            </Text>
          </View>
        </View>
      </View>
      
      {transaction.category && (
        <View style={styles.categoryContainer}>
          <Ionicons name="pricetag-outline" size={14} color={ds.colors.text.secondary} />
          <Text style={[styles.categoryText, { color: ds.colors.text.secondary }]}>
            {transaction.category}
          </Text>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={64} color={ds.colors.text.secondary} />
      <Text style={[styles.emptyTitle, { color: ds.colors.text.primary }]}>
        Nenhuma transação encontrada
      </Text>
      <Text style={[styles.emptySubtitle, { color: ds.colors.text.secondary }]}>
        {activeTab === 'all' 
          ? 'Você ainda não tem transações com este amigo'
          : `Nenhuma transação ${activeTab === 'pending' ? 'pendente' : activeTab === 'paid' ? 'paga' : activeTab === 'personal' ? 'pessoal' : 'de grupo'} encontrada`
        }
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: ds.colors.background }]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={ds.colors.background}
      />
      

      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: ds.colors.background }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="chevron-back" 
            size={24} 
            color={ds.colors.text.primary} 
          />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: ds.colors.text.primary }]}>
            Transações
          </Text>
          <Text style={[styles.headerSubtitle, { color: ds.colors.text.secondary }]}>
            {friendData?.username || 'Amigo'}
          </Text>
        </View>
        
        <View style={styles.headerSpacer} />
      </View>

      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { backgroundColor: ds.colors.surface }]}>
        <TouchableOpacity 
          style={[styles.scrollIndicator, styles.leftIndicator, { backgroundColor: ds.colors.surface }]}
          onPress={handlePreviousTab}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={16} color={ds.colors.text.secondary} />
        </TouchableOpacity>
        
        <ScrollView 
          ref={scrollViewRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
          style={styles.tabScrollView}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && { 
                  backgroundColor: ds.colors.primary,
                  shadowColor: ds.colors.primary,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 4,
                }
              ]}
              onPress={() => handleTabPress(tab.id)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={tab.icon as any}
                size={18}
                color={activeTab === tab.id ? 'white' : ds.colors.text.secondary}
              />
              <Text style={[
                styles.tabLabel,
                { 
                  color: activeTab === tab.id ? 'white' : ds.colors.text.secondary,
                  fontWeight: activeTab === tab.id ? '600' : '500'
                }
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <TouchableOpacity 
          style={[styles.scrollIndicator, styles.rightIndicator, { backgroundColor: ds.colors.surface }]}
          onPress={handleNextTab}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-forward" size={16} color={ds.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.contentScrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={ds.colors.primary} />
            <Text style={[styles.loadingText, { color: ds.colors.text.secondary }]}>
              Carregando transações...
            </Text>
          </View>
        ) : filteredTransactions.length > 0 ? (
          <>
            <View style={styles.statsContainer}>
              <View style={[styles.statCard, { backgroundColor: ds.colors.surface }]}>
                <Text style={[styles.statLabel, { color: ds.colors.text.secondary }]}>
                  Total de Transações
                </Text>
                <Text style={[styles.statValue, { color: ds.colors.text.primary }]}>
                  {filteredTransactions.length}
                </Text>
              </View>
              
              <View style={[styles.statCard, { backgroundColor: ds.colors.surface }]}>
                <Text style={[styles.statLabel, { color: ds.colors.text.secondary }]}>
                  Valor Total
                </Text>
                <Text style={[styles.statValue, { color: ds.colors.text.primary }]}>
                  {formatCurrency(filteredTransactions.reduce((sum, t) => sum + t.amount, 0))}
                </Text>
              </View>
            </View>
            
            {filteredTransactions.map(renderTransactionItem)}
          </>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
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
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scrollIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    opacity: 0.6,
  },
  leftIndicator: {
    marginLeft: 4,
  },
  rightIndicator: {
    marginRight: 4,
  },
  tabScrollView: {
    flex: 1,
  },
  tabScrollContent: {
    paddingHorizontal: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 25,
    minWidth: 90,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  tabLabel: {
    fontSize: 13,
    marginLeft: 6,
  },
  contentScrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  transactionItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 14,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  categoryText: {
    fontSize: 12,
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
