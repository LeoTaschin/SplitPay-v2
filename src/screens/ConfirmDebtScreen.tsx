import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useDesignSystem } from '../design-system';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import { getUserFriends } from '../services/userService';
import { createDebt } from '../services/debtService';

const { width } = Dimensions.get('window');

interface RouteParams {
  type: 'individual' | 'group';
  friendId?: string;
  friendName?: string;
  friendPhoto?: string;
  friendEmail?: string;
  groupId?: string;
  groupName?: string;
  value: number;
  currency: string;
}

interface Friend {
  id: string;
  username: string;
  email: string;
  photoURL?: string | null;
  isVerified?: boolean;
}

const ConfirmDebtScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme, isDark } = useTheme();
  const ds = useDesignSystem();
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const params = route.params as RouteParams;
  
  const [title, setTitle] = useState('');
  const [friend, setFriend] = useState<Friend | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const loadFriendData = async () => {
      if (params.friendId && user?.uid) {
        try {
          setLoading(true);
          const allFriends = await getUserFriends(user.uid);
          const friendData = allFriends.find(f => f.id === params.friendId);
          if (friendData) {
            setFriend(friendData);
          }
        } catch (error) {
          console.error('Error loading friend data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadFriendData();
  }, [params.friendId, user?.uid]);

  const handleConfirm = async () => {
    if (!user?.uid || !params.friendId) {
      console.error('Dados insuficientes para criar dívida');
      return;
    }

    if (!title.trim()) {
      console.error('Título é obrigatório');
      return;
    }

    try {
      setCreating(true);
      console.log('🔄 Criando dívida...');

      // Criar a dívida no banco de dados
      const newDebt = await createDebt(
        user.uid, // Credor (usuário atual)
        params.friendId, // Devedor (amigo)
        params.value, // Valor
        title.trim(), // Título
        'personal' // Tipo individual
      );

      console.log('✅ Dívida criada com sucesso:', newDebt.id);

      // Navegar de volta ou para uma tela de sucesso
      navigation.goBack();
      
      // TODO: Mostrar notificação de sucesso
      // TODO: Atualizar lista de dívidas se necessário
      
    } catch (error) {
      console.error('❌ Erro ao criar dívida:', error);
      // TODO: Mostrar erro para o usuário
    } finally {
      setCreating(false);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: ds.colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={ds.colors.primary} />
            <Text style={[styles.loadingText, { color: ds.colors.text.secondary }]}>
              Carregando dados do amigo...
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: ds.colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={styles.safeArea}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: ds.colors.surface }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={ds.colors.text.primary} />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={[styles.headerTitle, { color: ds.colors.text.primary }]}>
              {t('debts.confirmDebt.header.title')}
            </Text>
            <Text style={[styles.headerSubtitle, { color: ds.colors.text.secondary }]}>
              {t('debts.confirmDebt.header.subtitle')}
            </Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Value Display */}
          <View style={[styles.valueContainer, { backgroundColor: ds.colors.surface }]}>
            <Text style={[styles.valueLabel, { color: ds.colors.text.secondary }]}>
              {t('debts.confirmDebt.value.label')}
            </Text>
            <Text style={[styles.valueAmount, { color: ds.colors.text.primary }]}>
              {formatCurrency(params.value)}
            </Text>
          </View>

          {/* Friend Info */}
          <View style={[styles.friendContainer, { backgroundColor: ds.colors.surface }]}>
            <View style={styles.friendInfo}>
              <View style={[styles.friendAvatar, { backgroundColor: ds.colors.primary }]}>
                {friend?.photoURL ? (
                  <Image source={{ uri: friend.photoURL }} style={styles.friendPhoto} />
                ) : (
                  <Ionicons name="person" size={32} color={ds.colors.surface} />
                )}
              </View>
              <View style={styles.friendDetails}>
                <Text style={[styles.friendName, { color: ds.colors.text.primary }]}>
                  {friend?.username || params.friendName}
                </Text>
                <Text style={[styles.friendEmail, { color: ds.colors.text.secondary }]}>
                  {friend?.email || params.friendEmail}
                </Text>
              </View>
            </View>
          </View>

          {/* Title Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: ds.colors.text.primary }]}>
              {t('debts.confirmDebt.title.label')}
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: ds.colors.surface,
                  color: ds.colors.text.primary,
                  borderColor: ds.colors.border?.primary || ds.colors.surface,
                }
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder={t('debts.confirmDebt.title.placeholder')}
              placeholderTextColor={ds.colors.text.secondary}
              maxLength={50}
            />
          </View>



        </ScrollView>

        {/* Confirm Button */}
        <View style={styles.confirmContainer}>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              { 
                backgroundColor: creating ? ds.colors.text.disabled : ds.colors.primary,
                opacity: creating ? 0.7 : 1
              }
            ]}
            onPress={handleConfirm}
            activeOpacity={0.8}
            disabled={creating}
          >
            {creating ? (
              <View style={styles.loadingButtonContent}>
                <ActivityIndicator size="small" color={ds.colors.surface} />
                <Text style={[styles.confirmButtonText, { color: ds.colors.surface, marginLeft: 8 }]}>
                  Criando...
                </Text>
              </View>
            ) : (
              <Text style={[styles.confirmButtonText, { color: ds.colors.surface }]}>
                {t('debts.confirmDebt.confirm')}
              </Text>
            )}
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  valueContainer: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  valueLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  valueAmount: {
    fontSize: 32,
    fontWeight: '600',
  },
  friendContainer: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  friendPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  friendEmail: {
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  confirmContainer: {
    padding: 20,
    paddingBottom: 34, // Safe area bottom
  },
  confirmButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ConfirmDebtScreen;
