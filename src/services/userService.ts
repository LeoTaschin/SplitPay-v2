import { db } from '../config/firebase';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { User, ApiResponse } from '../types';
import { User as FirebaseUser } from 'firebase/auth';
import { isFirebaseAuthReady } from '../utils/authUtils';
import { badgeService } from './badgeService';
import { DEBUG_CONFIG } from '../config/debug';

interface UserData {
  uid: string;
  email: string;
  username: string;
  photoURL?: string | null;
  friends: string[];
  debtsAsCreditor: string[];
  debtsAsDebtor: string[];
  totalToReceive: number;
  totalToPay: number;
  // Campos para BR Code Pix
  name?: string;
  city?: string;
  pixKey?: string;
  pixKeyType?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  document?: string;
  merchantName?: string;
  merchantCity?: string;
  createdAt: any;
  updatedAt: any;
}

interface Friend {
  id: string;
  username: string;
  email: string;
  photoURL?: string | null;
  isVerified: boolean;
}

interface RemoveFriendResult {
  success: boolean;
  error?: string;
  totalToReceive?: number;
  totalToPay?: number;
  finalBalance?: number;
}

// Inicializar ou atualizar dados do usuário
export const initializeUser = async (user: FirebaseUser): Promise<ApiResponse<void>> => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Criar novo usuário
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        username: user.email?.split('@')[0] || 'user',
        photoURL: user.photoURL || null,
        friends: [],
        debtsAsCreditor: [],
        debtsAsDebtor: [],
        totalToReceive: 0,
        totalToPay: 0,
        // Inicializar badges
        selectedBadges: [],
        totalPoints: 0,
        rank: 'bronze',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Inicializar badges do usuário
      try {
        await badgeService.initializeUserBadges(user.uid);
        console.log('✅ Badges inicializados para novo usuário:', user.uid);
      } catch (error) {
        console.error('❌ Erro ao inicializar badges:', error);
      }
    } else {
      // Garantir que todos os campos necessários existam
      const userData = userDoc.data();
      const updates: Partial<UserData> = {};

      if (!userData.debtsAsCreditor) updates.debtsAsCreditor = [];
      if (!userData.debtsAsDebtor) updates.debtsAsDebtor = [];
      if (!userData.totalToReceive) updates.totalToReceive = 0;
      if (!userData.totalToPay) updates.totalToPay = 0;

      if (Object.keys(updates).length > 0) {
        updates.updatedAt = serverTimestamp();
        await updateDoc(userRef, updates);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error initializing user:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
};

// Interface para chave Pix
interface PixKeyData {
  id: string;
  pixKey: string;
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone';
  bankName?: string;
  isDefault: boolean;
}

// Atualizar dados Pix do usuário (versão antiga - mantida para compatibilidade)
export const updateUserPixData = async (
  userId: string, 
  pixData: {
    name: string;
    city: string;
    pixKey: string;
    pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
    document: string;
    merchantName: string;
    merchantCity: string;
  }
): Promise<ApiResponse<void>> => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      ...pixData,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating user Pix data:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
};

// Nova função para atualizar múltiplas chaves Pix
export const updateUserPixKeys = async (
  userId: string,
  pixKeys: PixKeyData[],
  userData: {
    name: string;
    city: string;
    merchantName: string;
    merchantCity: string;
  }
): Promise<ApiResponse<void>> => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Encontrar a chave padrão
    const defaultKey = pixKeys.find(key => key.isDefault);
    
    const updateData = {
      name: userData.name,
      city: userData.city,
      merchantName: userData.merchantName,
      merchantCity: userData.merchantCity,
      // Manter compatibilidade com sistema antigo
      pixKey: defaultKey?.pixKey || '',
      pixKeyType: defaultKey?.pixKeyType || 'cpf',
      // Novos campos para múltiplas chaves
      pixKeys: pixKeys,
      updatedAt: serverTimestamp(),
    };
    
    await updateDoc(userRef, updateData);
    
    return { success: true };
  } catch (error) {
    console.error('Error updating user Pix keys:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
};

// Buscar dados do usuário
export const getUserData = async (userId: string): Promise<User> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const data = userDoc.data();
    
    // Carregar múltiplas chaves Pix se existirem
    let pixKeys: PixKeyData[] = [];
    if (data.pixKeys && Array.isArray(data.pixKeys)) {
      pixKeys = data.pixKeys;
    } else {
      // Fallback para sistema antigo - criar uma chave a partir dos dados antigos
      if (data.pixKey) {
        pixKeys = [{
          id: '1',
          pixKey: data.pixKey,
          pixKeyType: data.pixKeyType === 'random' ? 'cpf' : data.pixKeyType || 'cpf',
          bankName: 'Banco Principal',
          isDefault: true,
        }];
      }
    }
    
    const userData = {
      uid: userDoc.id,
      email: data.email || '',
      displayName: data.username || data.displayName,
      photoURL: data.photoURL,
      createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
      // Campos para BR Code Pix
      name: data.name || data.username || data.displayName,
      city: data.city || '',
      pixKey: data.pixKey || '',
      pixKeyType: data.pixKeyType || 'random',
      document: data.document || '',
      merchantName: data.merchantName || data.name || data.username,
      merchantCity: data.merchantCity || data.city || '',
      // Novos campos para múltiplas chaves
      pixKeys: pixKeys,
      // Campos de badges
      selectedBadges: data.selectedBadges || [],
      totalPoints: data.totalPoints || 0,
      rank: data.rank || 'bronze',
    };
    
    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

// Buscar amigos do usuário
export const getUserFriends = async (userId: string): Promise<Friend[]> => {
  try {
    if (!userId) {
      throw new Error('ID do usuário não fornecido');
    }

    // Verificar se o Firebase Auth está autenticado
    const isReady = await isFirebaseAuthReady(userId);
    if (!isReady) {
      throw new Error('Usuário não autenticado no Firebase');
    }

    // Primeiro, buscar o documento do usuário para obter a lista de IDs dos amigos
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('Usuário não encontrado');
    }

    const userData = userDoc.data();
    const friendsList = userData.friends || [];

    if (friendsList.length === 0) {
      return [];
    }

    // Buscar os dados de todos os amigos
    const usersRef = collection(db, 'users');
    
    // Firestore tem limite de 10 itens para 'in' queries, então vamos buscar em lotes
    const friends: any[] = [];
    const batchSize = 10;
    
    for (let i = 0; i < friendsList.length; i += batchSize) {
      const batch = friendsList.slice(i, i + batchSize);
      const friendsQuery = query(usersRef, where('uid', 'in', batch));
      const friendsSnapshot = await getDocs(friendsQuery);
      
      friendsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        friends.push({
          id: data.uid,
          username: data.username || 'Sem nome',
          email: data.email || 'Sem email',
          photoURL: data.photoURL || null,
          isVerified: data.isVerified || false
        });
      });
    }

    return friends;
  } catch (error) {
    console.error('Error fetching user friends:', error);
    throw error;
  }
};

// Remover amigo
export const removeFriend = async (currentUserId: string, friendId: string): Promise<RemoveFriendResult> => {
  try {
    // Verificar se existem dívidas pendentes
    const debtsAsCreditorQuery = query(
      collection(db, 'debts'),
      where('creditorId', '==', currentUserId),
      where('debtorId', '==', friendId),
      where('paid', '==', false)
    );

    const debtsAsDebtorQuery = query(
      collection(db, 'debts'),
      where('creditorId', '==', friendId),
      where('debtorId', '==', currentUserId),
      where('paid', '==', false)
    );

    const [creditorDebts, debtorDebts] = await Promise.all([
      getDocs(debtsAsCreditorQuery),
      getDocs(debtsAsDebtorQuery)
    ]);

    const totalToReceive = creditorDebts.docs.reduce(
      (total, doc) => total + doc.data().amount,
      0
    );

    const totalToPay = debtorDebts.docs.reduce(
      (total, doc) => total + doc.data().amount,
      0
    );

    // Calcular o saldo final (o quanto você deve menos o quanto você está para receber)
    const finalBalance = totalToReceive - totalToPay;

    // Se o saldo final não for zero, retorna erro
    if (finalBalance !== 0) {
      return {
        success: false,
        error: 'PENDING_DEBTS',
        totalToReceive,
        totalToPay,
        finalBalance
      };
    }

    // Verificar se o usuário e o amigo existem
    const [userDoc, friendDoc] = await Promise.all([
      getDoc(doc(db, 'users', currentUserId)),
      getDoc(doc(db, 'users', friendId))
    ]);

    if (!userDoc.exists()) {
      return { success: false, error: 'USER_NOT_FOUND' };
    }

    if (!friendDoc.exists()) {
      return { success: false, error: 'FRIEND_NOT_FOUND' };
    }

    // Remove friend from current user's friends list
    const userFriends = userDoc.data().friends || [];
    const updatedFriends = userFriends.filter((id: string) => id !== friendId);
    
    // Remove current user from friend's friends list
    const friendFriends = friendDoc.data().friends || [];
    const updatedFriendFriends = friendFriends.filter((id: string) => id !== currentUserId);
    
    // Remove friendship documents from the friends collection
    const friendship1Id = `${currentUserId}_${friendId}`;
    const friendship2Id = `${friendId}_${currentUserId}`;
    
    DEBUG_CONFIG.log('REMOVAL', 'Iniciando remoção', { currentUserId: currentUserId.slice(-4), friendId: friendId.slice(-4) });

    // Verificar se os documentos existem antes de tentar removê-los
    const friendship1Doc = await getDoc(doc(db, 'friends', friendship1Id));
    const friendship2Doc = await getDoc(doc(db, 'friends', friendship2Id));
    
    DEBUG_CONFIG.log('INFO', 'Documentos encontrados', {
      doc1: friendship1Doc.exists() ? '✅' : '❌',
      doc2: friendship2Doc.exists() ? '✅' : '❌'
    });

    // Atualizar ambos os documentos e remover documentos da coleção friends
    await Promise.all([
      updateDoc(doc(db, 'users', currentUserId), { 
        friends: updatedFriends,
        updatedAt: serverTimestamp()
      }),
      updateDoc(doc(db, 'users', friendId), { 
        friends: updatedFriendFriends,
        updatedAt: serverTimestamp()
      }),
      deleteDoc(doc(db, 'friends', friendship1Id)),
      deleteDoc(doc(db, 'friends', friendship2Id))
    ]);

    DEBUG_CONFIG.log('SUCCESS', 'Amigo removido com sucesso');
    DEBUG_CONFIG.log('INFO', 'Arrays atualizados', {
      currentUser: updatedFriends.length,
      friend: updatedFriendFriends.length
    });
    return { success: true };
  } catch (error) {
    console.error('userService - removeFriend - Erro:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}; 