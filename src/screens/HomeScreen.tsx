import React, { useState, useCallback, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Text,
  Platform,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { signOut } from '../services/auth';
import { getUserBalance } from '../services/debtService';

// Importar Design System
import { useDesignSystem, Logo, LogoutButton } from '../design-system';

// Importar telas
import { DashboardScreen } from './DashboardScreen';
import { FriendsScreen } from './FriendsScreen';
import { GroupsScreen } from './GroupsScreen';
import { ProfileScreen } from './ProfileScreen';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Componente principal das janelas
const MainTabs: React.FC<{ 
  activeTab: string;
  onTabChange: (tab: string) => void;
}> = ({ activeTab, onTabChange }) => {
  const renderTabContent = () => {
    switch (activeTab) {
      case 'friends':
        return <FriendsScreen />;
      case 'groups':
        return <GroupsScreen />;
      case 'activity':
        return <DashboardScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <FriendsScreen />;
    }
  };

  return (
    <View style={styles.tabsContainer}>
      {renderTabContent()}
    </View>
  );
};

// Componente de Balanço Compacto
const BalanceSection: React.FC = () => {
  const ds = useDesignSystem();
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const [balanceData, setBalanceData] = useState({
    totalOwed: 0,
    totalToReceive: 0,
    netBalance: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchBalance = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const balance = await getUserBalance(user.id);
        
        // Verificar se o componente ainda está montado
        if (isMounted) {
          setBalanceData(balance);
        }
      } catch (error) {
        console.error('Erro ao buscar balanço:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBalance();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getBalanceStatus = () => {
    if (balanceData.netBalance > 0) {
      return {
        text: t('home.youAreOwed'),
        color: '#10B981',
        icon: 'trending-up',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
      };
    } else if (balanceData.netBalance < 0) {
      return {
        text: t('home.youOwe'),
        color: '#EF4444',
        icon: 'trending-down',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
      };
    } else {
      return {
        text: t('home.balanced'),
        color: '#F59E0B',
        icon: 'checkmark-circle',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
      };
    }
  };

  // Não mostrar nada enquanto a autenticação está carregando
  if (authLoading) {
    return null;
  }

  if (loading) {
    return (
      <View style={[styles.balanceContainer, { backgroundColor: ds.colors.surface }]}>
        <View style={styles.balanceLoading}>
          <View style={styles.loadingSpinner}>
            <Ionicons name="refresh" size={16} color={ds.colors.text.secondary} />
          </View>
          <Text style={[styles.loadingText, { color: ds.colors.text.secondary }]}>
            {t('common.loading')}...
          </Text>
        </View>
      </View>
    );
  }

  const status = getBalanceStatus();

  return (
    <View style={[styles.balanceContainer, { backgroundColor: ds.colors.surface }]}>
      <View style={styles.balanceCompactContent}>
        {/* Primeira linha: Apenas o valor */}
        <View style={styles.balanceCompactRow}>
          <Text style={[styles.balanceCompactAmount, { color: status.color }]}>
            {formatCurrency(Math.abs(balanceData.netBalance))}
          </Text>
        </View>
        
        {/* Segunda linha: Subtitle */}
        <Text style={[styles.balanceCompactSubtitle, { color: ds.colors.text.secondary }]}>
          {balanceData.netBalance > 0 
            ? t('home.netBalancePositive')
            : balanceData.netBalance < 0 
            ? t('home.netBalanceNegative')
            : t('home.netBalanceNeutral')
          }
        </Text>
      </View>
    </View>
  );
};

// Componente da Toolbar Customizada
const BottomToolbar: React.FC<{ 
  activeTab: string; 
  onTabChange: (tab: string) => void;
}> = ({ 
  activeTab, 
  onTabChange
}) => {
  const ds = useDesignSystem();
  const { t } = useLanguage();
  const navigation = useNavigation<NavigationProp>();

  const menuItems = [
    {
      name: t('navigation.friends'),
      icon: 'person',
      tab: 'friends',
      onPress: () => {
        console.log('Clicou em Amigos');
        onTabChange('friends');
      },
    },
    {
      name: t('navigation.groups'),
      icon: 'people',
      tab: 'groups',
      onPress: () => {
        console.log('Clicou em Grupos');
        onTabChange('groups');
      },
    },
    {
      name: t('navigation.new'),
      icon: 'add-sharp',
      tab: 'new',
      isCenter: true,
      onPress: () => navigation.navigate('NewDebt'),
    },
    {
      name: t('navigation.activity'),
      icon: 'pulse',
      tab: 'activity',
      onPress: () => {
        console.log('Clicou em Atividade');
        onTabChange('activity');
      },
    },
    {
      name: t('navigation.profile'),
      icon: 'person-circle',
      tab: 'profile',
      onPress: () => {
        console.log('Clicou em Perfil');
        onTabChange('profile');
      },
    },
  ];

  return (
    <View style={styles.mainContainer}>
      <View style={[
        styles.toolbarContainer,
        { 
          backgroundColor: ds.colors.surface,
          borderColor: Platform.OS === 'ios' ? 'rgba(150, 150, 150, 0.2)' : 'rgba(150, 150, 150, 0.3)',
        },
        Platform.OS === 'ios' && styles.iosShadow,
        Platform.OS === 'android' && styles.androidShadow,
      ]}>
        <View style={styles.toolbarContent}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                item.isCenter && styles.centerMenuItem
              ]}
              onPress={item.onPress}
            >
              {item.isCenter ? (
                <View style={styles.centerButtonWrapper}>
                  <View style={[styles.centerButton, { backgroundColor: ds.colors.primary }]}>
                    <Ionicons 
                      name={item.icon as any}
                      size={38} 
                      color={ds.colors.text.inverse}
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.iconContainer}>
                  {activeTab === item.tab && (
                    <View style={[styles.indicator, { backgroundColor: ds.colors.primary }]} />
                  )}
                  <Ionicons 
                    name={item.icon as any} 
                    size={28}
                    color={activeTab === item.tab ? ds.colors.primary : ds.colors.text.secondary}
                  />
                  <Text style={[
                    styles.menuText, 
                    { 
                      color: activeTab === item.tab ? ds.colors.primary : ds.colors.text.secondary
                    }
                  ]}>
                    {item.name}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

// Componente principal da Home
export const HomeScreen: React.FC = () => {
  const ds = useDesignSystem();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('friends');

  const handleTabChange = useCallback((tab: string) => {
    console.log('Mudando para tab:', tab);
    setActiveTab(tab);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert(t('common.error'), t('profile.logoutError'));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: ds.colors.background }]}>
      
      {/* Header Integrado com Logo, Balanço e SignOut */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Logo size={50} />
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={toggleTheme}
              style={[styles.themeToggle, { backgroundColor: ds.colors.surface }]}
            >
              <Ionicons 
                name={isDark ? 'sunny' : 'moon'} 
                size={20} 
                color={ds.colors.text.primary} 
              />
            </TouchableOpacity>
            <LogoutButton 
              onLogout={handleSignOut}
              size={24}
            />
          </View>
        </View>
        
        {/* Balanço Integrado */}
      </View>

      {/* Conteúdo principal */}
      <View style={styles.content}>
        {/* Janelas principais */}
        <MainTabs 
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </View>

      {/* Toolbar */}
      <BottomToolbar 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeToggle: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },


  balanceContainer: {
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  balanceLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  tabsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  mainContainer: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  toolbarContainer: {
    width: '100%',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    overflow: 'visible',
  },
  toolbarContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  menuItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: 60,
  },
  centerMenuItem: {
    height: 90,
    marginTop: -30,
  },
  centerButtonWrapper: {
    height: '100%',
    justifyContent: 'flex-start',
    paddingTop: 5,
  },
  centerButton: {
    width: 70,
    height: 70,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    position: 'relative',
    height: '100%',
  },
  menuText: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  indicator: {
    position: 'absolute',
    top: -15,
    width: 30,
    height: 4,
    borderRadius: 2,
  },
  iosShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  androidShadow: {
    elevation: 5,
  },
  // New styles for BalanceSection
  balanceCompactContent: {
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  balanceCompactRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceCompactAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  balanceCompactSubtitle: {
    fontSize: 12,
    opacity: 0.8,
    textAlign: 'left',
  },
  loadingSpinner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
}); 