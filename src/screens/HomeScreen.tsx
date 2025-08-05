import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Text,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

// Importar Design System
import { useDesignSystem } from '../design-system';

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

// Componente da Toolbar Customizada
const BottomToolbar: React.FC<{ 
  activeTab: string; 
  onTabChange: (tab: string) => void;
}> = ({ 
  activeTab, 
  onTabChange
}) => {
  const ds = useDesignSystem();
  const navigation = useNavigation<NavigationProp>();

  const menuItems = [
    {
      name: 'Amigos',
      icon: 'person',
      tab: 'friends',
      onPress: () => {
        console.log('Clicou em Amigos');
        onTabChange('friends');
      },
    },
    {
      name: 'Grupos',
      icon: 'people',
      tab: 'groups',
      onPress: () => {
        console.log('Clicou em Grupos');
        onTabChange('groups');
      },
    },
    {
      name: 'Novo',
      icon: 'add-sharp',
      tab: 'new',
      isCenter: true,
      onPress: () => navigation.navigate('NewDebt'),
    },
    {
      name: 'Atividade',
      icon: 'pulse',
      tab: 'activity',
      onPress: () => {
        console.log('Clicou em Atividade');
        onTabChange('activity');
      },
    },
    {
      name: 'Perfil',
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
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('friends');

  const handleTabChange = useCallback((tab: string) => {
    console.log('Mudando para tab:', tab);
    setActiveTab(tab);
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: ds.colors.background }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header com nome do usuário */}
      <View style={[styles.header, { backgroundColor: ds.colors.surface }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.welcomeText, { color: ds.colors.text.primary }]}>
            Olá, {user?.displayName || user?.email?.split('@')[0] || 'Usuário'}!
          </Text>
          <Text style={[styles.subtitleText, { color: ds.colors.text.secondary }]}>
            Bem-vindo ao SplitPay
          </Text>
        </View>
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerContent: {
    flexDirection: 'column',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    opacity: 0.8,
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
}); 