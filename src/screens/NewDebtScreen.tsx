import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView,
  StatusBar,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useDesignSystem } from '../design-system';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useFavorites } from '../hooks/useFavorites';
import { usePresence } from '../hooks/usePresence';
import { Friend, getPendingFriendRequests } from '../services/friendService';
import { Group, GroupService } from '../services/groupService';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

type TabType = 'individual' | 'group';

interface FriendWithData extends Friend {
  photoURL?: string;
}

// Componente para item do amigo com status em tempo real
const FriendItem: React.FC<{
  friend: FriendWithData;
  onPress: () => void;
}> = ({ friend, onPress }) => {
  const ds = useDesignSystem();
  const { t } = useLanguage();
  const { presence, getStatusText } = usePresence(friend.friendId);

  return (
    <TouchableOpacity
      style={[styles.listItem, { backgroundColor: ds.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.listItemContent}>
        <View style={[styles.avatar, { backgroundColor: ds.colors.primary }]}>
          {friend.photoURL ? (
            <Image 
              source={{ uri: friend.photoURL }} 
              style={styles.avatarImage}
              resizeMode="cover"
            />
          ) : (
            <Text style={[styles.avatarText, { color: 'white' }]}>
              {friend.friendUsername.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        
        <View style={styles.listItemInfo}>
          <Text style={[styles.listItemTitle, { color: ds.colors.text.primary }]}>
            {friend.friendUsername}
          </Text>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusDot, 
              { backgroundColor: presence.isOnline ? '#4CAF50' : '#9E9E9E' }
            ]} />
            <Text style={[styles.statusText, { color: ds.colors.text.secondary }]}>
              {presence.isOnline ? getStatusText() : t('friends.status.offline')}
            </Text>
          </View>
        </View>
        
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={ds.colors.text.secondary} 
        />
      </View>
    </TouchableOpacity>
  );
};

type NewDebtScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NewDebt'>;

export const NewDebtScreen: React.FC = () => {
  const { theme, isDark } = useTheme();
  const ds = useDesignSystem();
  const { t } = useLanguage();
  const navigation = useNavigation<NewDebtScreenNavigationProp>();
  const { user } = useAuth();
  const { favorites, loading: favoritesLoading } = useFavorites();
  const [activeTab, setActiveTab] = useState<TabType>('individual');
  const [friends, setFriends] = useState<FriendWithData[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  const tabs = [
    { id: 'individual' as TabType, icon: 'person-outline', label: t('debts.newDebtScreen.tabs.individual') },
    { id: 'group' as TabType, icon: 'people-outline', label: t('debts.newDebtScreen.tabs.group') },
  ];

  // Função de ordenação com favoritos (igual à FriendsScreen)
  const sortFriendsWithFavorites = (friends: FriendWithData[]) => {
    return friends.sort((a, b) => {
      const aIsFavorite = favorites.includes(a.friendId);
      const bIsFavorite = favorites.includes(b.friendId);
      
      // Favoritos primeiro
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      
      // Entre favoritos, manter ordem original
      if (aIsFavorite && bIsFavorite) {
        const aOrder = favorites.indexOf(a.friendId);
        const bOrder = favorites.indexOf(b.friendId);
        return aOrder - bOrder;
      }
      
      // Entre não-favoritos, ordenar por nome (o status online será mostrado pelo componente FriendItem)
      return a.friendUsername.localeCompare(b.friendUsername);
    });
  };

  // Carregar amigos
  useEffect(() => {
    const loadFriends = async () => {
      if (!user?.uid) return;
      
      try {
        setLoadingFriends(true);
        const friendsRef = collection(db, 'friends');
        const friendsQuery = query(
          friendsRef,
          where('userId', '==', user.uid)
        );
        
        const querySnapshot = await getDocs(friendsQuery);
        const friendsList: FriendWithData[] = [];
        
        for (const doc of querySnapshot.docs) {
          const friendData = doc.data() as Friend;
          
          // Buscar dados do amigo na coleção users
          const userRef = collection(db, 'users');
          const userQuery = query(
            userRef,
            where('uid', '==', friendData.friendId)
          );
          const userSnapshot = await getDocs(userQuery);
          
          if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data();
            friendsList.push({
              ...friendData,
              photoURL: userData.photoURL
            });
          }
        }
        
        // Ordenar com favoritos primeiro
        const sortedFriends = sortFriendsWithFavorites(friendsList);
        setFriends(sortedFriends);
      } catch (error) {
        console.error('Erro ao carregar amigos:', error);
      } finally {
        setLoadingFriends(false);
      }
    };

    loadFriends();
  }, [user?.uid]);

  // Carregar grupos
  useEffect(() => {
    const loadGroups = async () => {
      if (!user?.uid) return;
      
      try {
        setLoadingGroups(true);
        const groupsList = await GroupService.getUserGroups(user.uid);
        setGroups(groupsList);
      } catch (error) {
        console.error('Erro ao carregar grupos:', error);
      } finally {
        setLoadingGroups(false);
      }
    };

    loadGroups();
  }, [user?.uid]);

  // Reordenar amigos quando favoritos mudarem
  useEffect(() => {
    if (friends.length > 0 && !favoritesLoading) {
      const reorderedFriends = sortFriendsWithFavorites([...friends]);
      setFriends(reorderedFriends);
    }
  }, [favorites, favoritesLoading]);

  const scrollToTab = (tabIndex: number) => {
    const tabWidth = 120; // largura aproximada de cada aba
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

  const handleFriendPress = (friend: FriendWithData) => {
    navigation.navigate('NewDebtValue', {
      type: 'individual',
      friendId: friend.friendId,
      friendName: friend.friendUsername,
    });
  };

  const handleGroupPress = (group: Group) => {
    navigation.navigate('NewDebtValue', {
      type: 'group',
      groupId: group.id,
      groupName: group.name,
    });
  };

  const renderFriendItem = ({ item }: { item: FriendWithData }) => (
    <FriendItem
      friend={item}
      onPress={() => handleFriendPress(item)}
    />
  );

  const renderGroupItem = ({ item }: { item: Group }) => (
    <TouchableOpacity
      style={[styles.listItem, { backgroundColor: ds.colors.surface }]}
      onPress={() => handleGroupPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.listItemContent}>
        <View style={[styles.avatar, { backgroundColor: ds.colors.secondary }]}>
          {item.photoURL ? (
            <Image 
              source={{ uri: item.photoURL }} 
              style={styles.avatarImage}
              resizeMode="cover"
            />
          ) : (
            <Text style={[styles.avatarText, { color: 'white' }]}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        
        <View style={styles.listItemInfo}>
          <Text style={[styles.listItemTitle, { color: ds.colors.text.primary }]}>
            {item.name}
          </Text>
          <Text style={[styles.listItemSubtitle, { color: ds.colors.text.secondary }]}>
            {item.members.length} {item.members.length === 1 ? 'membro' : 'membros'}
          </Text>
        </View>
        
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={ds.colors.text.secondary} 
        />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = (type: 'friends' | 'groups') => (
    <View style={styles.emptyState}>
      <Ionicons 
        name={type === 'friends' ? 'people-outline' : 'people-outline'} 
        size={64} 
        color={ds.colors.text.secondary} 
      />
      <Text style={[styles.emptyStateTitle, { color: ds.colors.text.primary }]}>
        {type === 'friends' 
          ? t('debts.newDebtScreen.individual.noFriends')
          : t('debts.newDebtScreen.group.noGroups')
        }
      </Text>
      <Text style={[styles.emptyStateSubtitle, { color: ds.colors.text.secondary }]}>
        {type === 'friends' 
          ? t('debts.newDebtScreen.individual.noFriendsSubtitle')
          : t('debts.newDebtScreen.group.noGroupsSubtitle')
        }
      </Text>
    </View>
  );

  const renderTabContent = () => {
    if (activeTab === 'individual') {
      if (loadingFriends) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={ds.colors.primary} />
            <Text style={[styles.loadingText, { color: ds.colors.text.secondary }]}>
              Carregando amigos...
            </Text>
          </View>
        );
      }

      if (friends.length === 0) {
        return renderEmptyState('friends');
      }

      return (
        <FlatList
          data={friends}
          renderItem={renderFriendItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      );
    } else {
      if (loadingGroups) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={ds.colors.primary} />
            <Text style={[styles.loadingText, { color: ds.colors.text.secondary }]}>
              Carregando grupos...
            </Text>
          </View>
        );
      }

      if (groups.length === 0) {
        return renderEmptyState('groups');
      }

      return (
        <FlatList
          data={groups}
          renderItem={renderGroupItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      );
    }
  };

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
        
        <Text style={[styles.headerTitle, { color: ds.colors.text.primary }]}>
          {t('debts.newDebtScreen.title')}
        </Text>
        
        <View style={styles.headerSpacer} />
      </View>

      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { backgroundColor: ds.colors.surface }]}>
        {/* Indicador de Scroll à Esquerda */}
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
        
        {/* Indicador de Scroll à Direita */}
        <TouchableOpacity 
          style={[styles.scrollIndicator, styles.rightIndicator, { backgroundColor: ds.colors.surface }]}
          onPress={handleNextTab}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-forward" size={16} color={ds.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.contentContainer}>
        {renderTabContent()}
      </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
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
    minWidth: 110,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  tabLabel: {
    fontSize: 13,
    marginLeft: 6,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  listItem: {
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
  },
  listItemInfo: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  listItemSubtitle: {
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  statusText: {
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
}); 