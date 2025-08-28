import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Easing,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useLanguage } from '../../context/LanguageContext';
import { searchUsers, SearchableUser } from '../../services/userSearchService';
import { sendFriendRequest, getPendingFriendRequests, acceptFriendRequest, rejectFriendRequest, FriendRequest } from '../../services/friendService';
import { DEBUG_CONFIG } from '../../config/debug';
import { FriendSearchFriendItem } from './FriendSearchFriendItem';
import { FriendSearchAcceptItem } from './FriendSearchAcceptItem';

interface User extends SearchableUser {}

interface FriendSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onAddFriend: (user: User) => void;
  existingFriends: string[]; // Array de IDs dos amigos existentes
  onSearchUsers: (query: string) => Promise<User[]>; // Função para buscar usuários
  hasPendingRequests?: boolean; // Indica se há solicitações pendentes
}

export const FriendSearchModal: React.FC<FriendSearchModalProps> = ({
  visible,
  onClose,
  onAddFriend,
  existingFriends,
  onSearchUsers,
  hasPendingRequests = false,
}) => {
  const ds = useDesignSystem();
  const { t, language } = useLanguage();

  const formatSearchResults = (count: number) => {
    switch (language) {
      case 'pt':
        return `${count} usuário${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}`;
      case 'en':
        return `${count} user${count !== 1 ? 's' : ''} found`;
      case 'es':
        return `${count} usuario${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}`;
      case 'fr':
        return `${count} utilisateur${count !== 1 ? 's' : ''} trouvé${count !== 1 ? 's' : ''}`;
      default:
        return `${count} usuário${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}`;
    }
  };

  const formatRequestsCount = (count: number) => {
    switch (language) {
      case 'pt':
        return `${count} solicitação${count !== 1 ? 'ões' : ''} pendente${count !== 1 ? 's' : ''}`;
      case 'en':
        return `${count} request${count !== 1 ? 's' : ''} pending`;
      case 'es':
        return `${count} solicitud${count !== 1 ? 'es' : ''} pendiente${count !== 1 ? 's' : ''}`;
      case 'fr':
        return `${count} demande${count !== 1 ? 's' : ''} en attente`;
      default:
        return `${count} solicitação${count !== 1 ? 'ões' : ''} pendente${count !== 1 ? 's' : ''}`;
    }
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [currentMode, setCurrentMode] = useState<'search' | 'requests'>('search');
  const slideAnim = useState(new Animated.Value(0))[0];

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.in(Easing.cubic),
    }).start(() => {
      onClose();
      setSearchQuery('');
      setSearchResults([]);
      setCurrentMode('search');
    });
  };

  const loadPendingRequests = async () => {
    try {
      setLoadingRequests(true);
      const requests = await getPendingFriendRequests();
      setPendingRequests(requests);
    } catch (error) {
      console.error('Error loading pending requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleAcceptRequest = async (request: FriendRequest) => {
    try {
      await acceptFriendRequest(request.id);
      // Remove the request from the list
      setPendingRequests(prev => prev.filter(r => r.id !== request.id));
      // Notify parent to refresh friends list and pending requests
      onAddFriend({ 
        id: request.fromUserId, 
        username: request.fromUsername, 
        email: '', 
        photoURL: request.fromPhotoURL 
      });
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleRejectRequest = async (request: FriendRequest) => {
    try {
      await rejectFriendRequest(request.id);
      // Remove the request from the list
      setPendingRequests(prev => prev.filter(r => r.id !== request.id));
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  const switchToRequests = () => {
    setCurrentMode('requests');
    loadPendingRequests();
  };

  const switchToSearch = () => {
    setCurrentMode('search');
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      DEBUG_CONFIG.log('SEARCH', `Modal buscando "${query}"`, { amigosExistentes: existingFriends.length });
      
      // Use the real Firebase search service - don't exclude existing friends
      // so removed friends can be found again
      const results = await searchUsers(query, []);
      DEBUG_CONFIG.log('INFO', `Modal: ${results.length} resultados encontrados`);
      
      setSearchResults(results);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleUserPress = async (user: User) => {
    if (!isUserAlreadyFriend(user.id)) {
      try {
        await sendFriendRequest(user.id, user.username);
      onAddFriend(user);
      } catch (error: any) {
        console.error('Error sending friend request:', error);
        // You can show an alert here if needed
        if (error.message === 'Friend request already sent') {
          // Show different message for already sent request
          console.log('Friend request already sent to this user');
        } else if (error.message === 'Already friends') {
          console.log('Already friends with this user');
        }
      }
    }
  };

  const isUserAlreadyFriend = (userId: string) => {
    const isFriend = existingFriends.includes(userId);
    DEBUG_CONFIG.log('VERIFICATION', `${userId.slice(-4)} é amigo?`, { resultado: isFriend ? 'SIM' : 'NÃO' });
    return isFriend;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <BlurView intensity={20} style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          onPress={handleClose}
          activeOpacity={1}
        />
        <Animated.View 
          style={[
            styles.modalContent,
            { backgroundColor: ds.colors.background },
            {
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [Dimensions.get('window').height, 0],
                }),
              }],
            },
          ]}
        >
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: ds.colors.text.primary }]}>
              {currentMode === 'search' ? t('friends.addFriend') : t('friends.friendRequests')}
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={ds.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Mode Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                currentMode === 'search' && { backgroundColor: ds.colors.primary }
              ]}
              onPress={switchToSearch}
            >
              <Ionicons 
                name="search" 
                size={16} 
                color={currentMode === 'search' ? 'white' : ds.colors.text.secondary} 
              />
              <Text style={[
                styles.tabText,
                { color: currentMode === 'search' ? 'white' : ds.colors.text.secondary }
              ]}>
                {t('friends.search')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                currentMode === 'requests' && { backgroundColor: ds.colors.primary }
              ]}
              onPress={switchToRequests}
            >
              <Ionicons 
                name="people" 
                size={16} 
                color={currentMode === 'requests' ? 'white' : ds.colors.text.secondary} 
              />
              <View style={styles.tabContent}>
                <Text style={[
                  styles.tabText,
                  { color: currentMode === 'requests' ? 'white' : ds.colors.text.secondary }
                ]}>
                  {t('friends.requests')}
                </Text>
                {hasPendingRequests && (
                  <View style={[styles.tabBadge, { backgroundColor: currentMode === 'requests' ? 'white' : ds.colors.primary }]}>
                    <Text style={[styles.tabBadgeText, { color: currentMode === 'requests' ? ds.colors.primary : 'white' }]}>
                      {pendingRequests.length}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Search Input - Only show in search mode */}
          {currentMode === 'search' && (
          <View style={styles.searchContainer}>
            <View style={[styles.inputContainer, { 
              backgroundColor: ds.colors.surface,
              borderColor: ds.colors.border.primary 
            }]}>
              <Ionicons name="search" size={20} color={ds.colors.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: ds.colors.text.primary }]}
                  placeholder={t('friends.searchPlaceholder')}
                placeholderTextColor={ds.colors.text.secondary}
                value={searchQuery}
                onChangeText={handleSearch}
                  autoFocus={true}
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color={ds.colors.text.secondary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Content */}
          <View style={styles.searchResultsContainer}>
            {currentMode === 'search' ? (
              <>
                <Text style={[styles.resultsTitle, { color: ds.colors.text.secondary }]}>
                  {searching ? t('friends.searching') : 
                   searchQuery.length >= 3 ? 
                     formatSearchResults(searchResults.length) : 
                     t('friends.searchMinChars')}
                </Text>
          <ScrollView style={styles.searchResults} showsVerticalScrollIndicator={false}>
            {searching ? (
              <View style={styles.loadingResults}>
                <ActivityIndicator size="small" color={ds.colors.primary} />
                <Text style={[styles.loadingText, { color: ds.colors.text.secondary }]}>
                      {t('friends.searchingUsers')}
                    </Text>
                  </View>
                ) : searchQuery.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="people-outline" size={64} color={ds.colors.text.secondary} />
                    <Text style={[styles.emptyStateTitle, { color: ds.colors.text.primary }]}>
                      {t('friends.searchTitle')}
                    </Text>
                    <Text style={[styles.emptyStateText, { color: ds.colors.text.secondary }]}>
                      {t('friends.searchSubtitle')}
                </Text>
              </View>
            ) : searchQuery.length >= 3 && searchResults.length === 0 ? (
              <View style={styles.noResults}>
                <Ionicons name="search-outline" size={48} color={ds.colors.text.secondary} />
                <Text style={[styles.noResultsText, { color: ds.colors.text.secondary }]}>
                      {t('friends.noUsersFound')}
                    </Text>
                    <Text style={[styles.noResultsSubtext, { color: ds.colors.text.secondary }]}>
                      {t('friends.noUsersSubtitle')}
                </Text>
              </View>
            ) : (
              searchResults.map((user) => (
                    <FriendSearchFriendItem
                  key={user.id}
                      user={user}
                      isAlreadyFriend={isUserAlreadyFriend(user.id)}
                      onPress={handleUserPress}
                    />
                  ))
                )}
                </ScrollView>
              </>
            ) : (
              <>
                <Text style={[styles.resultsTitle, { color: ds.colors.text.secondary }]}>
                  {loadingRequests ? t('friends.loadingRequests') : 
                   formatRequestsCount(pendingRequests.length)}
                </Text>
                <ScrollView style={styles.searchResults} showsVerticalScrollIndicator={false}>
                {loadingRequests ? (
                  <View style={styles.loadingResults}>
                    <ActivityIndicator size="small" color={ds.colors.primary} />
                    <Text style={[styles.loadingText, { color: ds.colors.text.secondary }]}>
                      {t('friends.loadingRequestsText')}
                    </Text>
                  </View>
                ) : pendingRequests.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="checkmark-circle-outline" size={64} color={ds.colors.text.secondary} />
                    <Text style={[styles.emptyStateTitle, { color: ds.colors.text.primary }]}>
                      {t('friends.noRequests')}
                    </Text>
                    <Text style={[styles.emptyStateText, { color: ds.colors.text.secondary }]}>
                      {t('friends.noRequestsSubtitle')}
                      </Text>
                    </View>
                  ) : (
                  pendingRequests.map((request) => (
                    <FriendSearchAcceptItem
                      key={request.id}
                      request={request}
                      onAccept={handleAcceptRequest}
                      onReject={handleRejectRequest}
                    />
              ))
            )}
          </ScrollView>
              </>
            )}
          </View>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: Dimensions.get('window').height * 0.95,
    minHeight: Dimensions.get('window').height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  searchContainer: {
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  searchResultsContainer: {
    flex: 1,
    marginTop: 10,
  },
  resultsTitle: {
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
  },
  searchResults: {
    flex: 1,
  },
  loadingResults: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
  },
  emptyState: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    flex: 1,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  noResults: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 20,
  },
  noResultsText: {
    marginTop: 10,
    fontSize: 16,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
