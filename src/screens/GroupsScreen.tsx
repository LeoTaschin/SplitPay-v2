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
import { GroupService } from '../services/groupService';
import { useDesignSystem, Loading, GroupItem, CreateGroupModal } from '../design-system';

interface Group {
  id: string;
  name: string;
  photoURL?: string;
  participantsCount: number;
  description?: string;
  members: string[];
  createdBy: string;
  createdAt: any;
}

export const GroupsScreen: React.FC = () => {
  const ds = useDesignSystem();
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  
  // Modal state (será implementado depois)
  const [isCreateGroupModalVisible, setIsCreateGroupModalVisible] = useState(false);

  // Dados mockados para demonstração
  const mockGroups: Group[] = [
    {
      id: '1',
      name: 'Viagem para a Praia',
      participantsCount: 5,
      members: ['user1', 'user2', 'user3', 'user4', 'user5'],
      createdBy: 'user1',
      createdAt: new Date()
    },
    {
      id: '2',
      name: 'Jantar de Família',
      participantsCount: 8,
      members: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8'],
      createdBy: 'user1',
      createdAt: new Date()
    },
    {
      id: '3',
      name: 'Acampamento',
      participantsCount: 12,
      members: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8', 'user9', 'user10', 'user11', 'user12'],
      createdBy: 'user1',
      createdAt: new Date()
    }
  ];

  const fetchGroups = async (showLoading: boolean = true) => {
    if (!user?.uid) return;

    try {
      if (showLoading) {
        setLoading(true);
      }
      console.log('🔄 Groups: Iniciando carregamento de grupos...');
      
      // Buscar grupos reais do Firebase
      const firebaseGroups = await GroupService.getUserGroups(user.uid);
      console.log(`📊 Groups: ${firebaseGroups.length} grupos carregados do Firebase`);
      
      // Converter para o formato esperado pela interface
      const formattedGroups: Group[] = firebaseGroups.map(group => ({
        id: group.id,
        name: group.name,
        photoURL: group.photoURL,
        participantsCount: group.members.length,
        description: group.description,
        members: group.members,
        createdBy: group.createdBy,
        createdAt: group.createdAt
      }));
      
      // Log resumido dos dados processados
      const totalParticipants = formattedGroups.reduce((sum, group) => sum + group.participantsCount, 0);
      const avgParticipants = formattedGroups.length > 0 ? (totalParticipants / formattedGroups.length).toFixed(1) : '0';
      console.log(`✅ Groups: Processamento concluído - ${formattedGroups.length} grupos, ${totalParticipants} participantes total, média: ${avgParticipants} por grupo`);
      
      setGroups(formattedGroups);
      setLastFetchTime(Date.now());
    } catch (error) {
      console.error('❌ Groups: Erro ao carregar grupos:', error);
      Alert.alert(t('common.error'), 'Erro ao carregar grupos');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    console.log('🔄 Groups: Iniciando refresh manual...');
    try {
      await fetchGroups(false); // Não mostrar loading no refresh
      console.log('✅ Groups: Refresh concluído com sucesso');
    } catch (error) {
      console.error('❌ Groups: Erro durante refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleGroupPress = (group: Group) => {
    // TODO: Implementar navegação para detalhes do grupo
    console.log(`👥 Groups: Grupo selecionado - ${group.name} (ID: ${group.id}, ${group.participantsCount} participantes)`);
    Alert.alert(
      'Detalhes do Grupo',
      `Abrindo detalhes de: ${group.name}`,
      [{ text: 'OK' }]
    );
  };

  const handleGroupLongPress = (group: Group) => {
    // TODO: Implementar menu de opções (editar, excluir, etc.)
    console.log(`🔧 Groups: Long press em ${group.name} - Abrindo menu de opções`);
    Alert.alert(
      'Opções do Grupo',
      `Opções para: ${group.name}`,
      [
        { text: 'Editar', onPress: () => console.log('✏️ Groups: Editar grupo -', group.name) },
        { text: 'Excluir', onPress: () => console.log('🗑️ Groups: Excluir grupo -', group.name), style: 'destructive' },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const handleCreateGroupPress = () => {
    console.log('➕ Groups: Abrindo modal de criar grupo');
    setIsCreateGroupModalVisible(true);
  };

  const handleCloseModal = () => {
    console.log('❌ Groups: Fechando modal de criar grupo');
    setIsCreateGroupModalVisible(false);
  };

  const handleGroupCreated = async (groupData: any) => {
    console.log('✅ Groups: Grupo criado com sucesso:', {
      id: groupData.id,
      name: groupData.name,
      participantsCount: groupData.members?.length || 0
    });
    // Atualizar a lista sem mostrar loading
    await fetchGroups(false);
  };

  useEffect(() => {
    if (user?.uid && !isCreateGroupModalVisible) {
      const now = Date.now();
      const cacheExpiry = 30000; // 30 segundos de cache
      
      console.log('🔄 Groups: useEffect executado -', {
        hasGroups: groups.length > 0,
        cacheAge: now - lastFetchTime,
        cacheExpired: (now - lastFetchTime) > cacheExpiry,
        modalOpen: isCreateGroupModalVisible
      });
      
      // Só recarregar se não há dados ou se o cache expirou
      if (groups.length === 0 || (now - lastFetchTime) > cacheExpiry) {
        console.log('📡 Groups: Cache expirado ou sem dados - carregando...');
        fetchGroups(true); // Mostrar loading apenas no carregamento inicial
      } else {
        console.log('⚡ Groups: Usando cache - dados ainda válidos');
        // Se há dados em cache, apenas mostrar sem loading
        setLoading(false);
      }
    }
  }, [user?.uid, isCreateGroupModalVisible]);



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
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: ds.colors.text.primary }]}>
            {t('groups.title')}
          </Text>
          <Text style={[styles.subtitle, { color: ds.colors.text.secondary }]}>
            {groups.length > 0 
              ? `${groups.length} ${groups.length === 1 ? 'grupo' : 'grupos'}`
              : t('groups.noGroups')
            }
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleCreateGroupPress}
        >
          <View style={styles.addButtonContainer}>
            <Ionicons name="add" size={24} color={ds.colors.primary} />
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
        {groups.length > 0 ? (
          <View style={styles.groupsList}>
            {groups.map((group) => (
              <GroupItem
                key={group.id}
                group={group}
                onPress={() => handleGroupPress(group)}
                onLongPress={() => handleGroupLongPress(group)}
                style={styles.groupItem}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: ds.colors.surface }]}>
              <Ionicons 
                name="people-circle-outline" 
                size={48} 
                color={ds.colors.text.secondary} 
              />
            </View>
            <Text style={[styles.emptyTitle, { color: ds.colors.text.primary }]}>
              {t('groups.noGroups')}
            </Text>
            <Text style={[styles.emptySubtitle, { color: ds.colors.text.secondary }]}>
              {t('groups.createFirstGroup')}
            </Text>
            <TouchableOpacity 
              style={[styles.createGroupButton, { backgroundColor: ds.colors.primary }]}
              onPress={handleCreateGroupPress}
            >
              <Ionicons name="add-circle" size={20} color="white" />
              <Text style={styles.createGroupButtonText}>
                {t('groups.createGroup')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Create Group Modal */}
      <CreateGroupModal
        visible={isCreateGroupModalVisible}
        onClose={handleCloseModal}
        onGroupCreated={handleGroupCreated}
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

  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  groupsList: {
    gap: 0,
    paddingHorizontal: 0,
    paddingBottom: 30,
  },
  groupItem: {
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
  createGroupButton: {
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
  createGroupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 