import { db } from '../config/firebase';
import { 
  collection,
  query,
  where,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { Debt, User } from '../types';
import { generatePixPayload } from '../utils/pixUtils';

// Calcular saldo entre dois usuários
export const calculateBalance = async (
  currentUserId: string,
  friendId: string
): Promise<{
  balance: number;
  totalToReceive: number;
  totalToPay: number;
  debts: Debt[];
}> => {
  try {
    // Buscar dívidas onde o usuário atual é credor
    const debtsAsCreditorQuery = query(
      collection(db, 'debts'),
      where('creditorId', '==', currentUserId),
      where('debtorId', '==', friendId),
      where('paid', '==', false)
    );

    // Buscar dívidas onde o usuário atual é devedor
    const debtsAsDebtorQuery = query(
      collection(db, 'debts'),
      where('creditorId', '==', friendId),
      where('debtorId', '==', currentUserId),
      where('paid', '==', false)
    );

    console.log('🔄 Executando queries...');
    const [creditorSnapshot, debtorSnapshot] = await Promise.all([
      getDocs(debtsAsCreditorQuery),
      getDocs(debtsAsDebtorQuery)
    ]);
    
    console.log('✅ Queries executadas');
    console.log('📊 Dívidas como credor:', creditorSnapshot.docs.length);
    console.log('📊 Dívidas como devedor:', debtorSnapshot.docs.length);

    // Calcular total a receber
    const totalToReceive = creditorSnapshot.docs.reduce(
      (total, doc) => total + doc.data().amount,
      0
    );

    // Calcular total a pagar
    const totalToPay = debtorSnapshot.docs.reduce(
      (total, doc) => total + doc.data().amount,
      0
    );

    // Calcular saldo (positivo = você deve, negativo = você deve receber)
    const balance = totalToPay - totalToReceive;
    
    console.log('💰 Valores calculados:');
    console.log('💰 totalToReceive:', totalToReceive);
    console.log('💰 totalToPay:', totalToPay);
    console.log('💰 balance:', balance);

    // Combinar todas as dívidas
    const debts: Debt[] = [
      ...creditorSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Debt)),
      ...debtorSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Debt))
    ];

    console.log('✅ calculateBalance finalizado');
    return {
      balance,
      totalToReceive,
      totalToPay,
      debts
    };
  } catch (error) {
    console.error('Erro ao calcular saldo:', error);
    throw error;
  }
};

// Gerar payload Pix para pagamento de dívida
export const generatePixPayloadForDebt = async (
  currentUserId: string,
  friendId: string,
  amount: number
): Promise<{
  pixPayload: string;
  referenceId: string;
}> => {
  try {
    // Buscar dados do amigo (destinatário do pagamento)
    const friendRef = doc(db, 'users', friendId);
    const friendDoc = await getDoc(friendRef);

    if (!friendDoc.exists()) {
      throw new Error('Amigo não encontrado');
    }

    const friendData = friendDoc.data() as User;

    // Verificar se o amigo tem dados Pix configurados
    if (!friendData.pixKey || !friendData.name || !friendData.city) {
      console.warn('Amigo não possui dados Pix configurados, usando dados padrão');
      // Usar dados padrão para testes
      friendData.pixKey = friendData.pixKey || '123e4567-e89b-12d3-a456-426614174000';
      friendData.name = friendData.name || 'Teste Pagamento';
      friendData.city = friendData.city || 'Sao Paulo';
    }

    // Garantir que os dados estão no formato correto para EMV
    friendData.name = friendData.name.replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 25);
    friendData.city = friendData.city.replace(/[^a-zA-Z0-9\s]/g, '');

    // Gerar ID de referência único
    const referenceId = `DEBT_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`.toUpperCase();

    // Gerar payload Pix
    const pixPayload = generatePixPayload({
      toUser: friendData,
      amount,
      referenceId
    });

    return {
      pixPayload,
      referenceId
    };
  } catch (error) {
    console.error('Erro ao gerar payload Pix:', error);
    throw error;
  }
};

// Marcar dívidas como pagas
export const markDebtsAsPaid = async (
  currentUserId: string,
  friendId: string,
  amount: number
): Promise<void> => {
  try {
    // Buscar dívidas onde o usuário atual é devedor
    const debtsQuery = query(
      collection(db, 'debts'),
      where('creditorId', '==', friendId),
      where('debtorId', '==', currentUserId),
      where('paid', '==', false)
    );

    const debtsSnapshot = await getDocs(debtsQuery);
    const debts = debtsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Debt));

    // Ordenar dívidas por data de criação (mais antigas primeiro)
    debts.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    let remainingAmount = amount;
    const updates: Promise<void>[] = [];

    // Marcar dívidas como pagas até o valor total
    for (const debt of debts) {
      if (remainingAmount <= 0) break;

      const debtAmount = debt.amount;
      const amountToPay = Math.min(remainingAmount, debtAmount);

      if (amountToPay >= debtAmount) {
        // Pagar dívida completa
        updates.push(
          updateDoc(doc(db, 'debts', debt.id), {
            paid: true,
            paidAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          })
        );
        remainingAmount -= debtAmount;
      } else {
        // Pagar parte da dívida (não implementado - dívidas são sempre pagas por completo)
        break;
      }
    }

    // Executar todas as atualizações
    await Promise.all(updates);

    // Atualizar saldos dos usuários
    await updateUserBalances(currentUserId, friendId);
  } catch (error) {
    console.error('Erro ao marcar dívidas como pagas:', error);
    throw error;
  }
};

// Atualizar saldos dos usuários
const updateUserBalances = async (
  currentUserId: string,
  friendId: string
): Promise<void> => {
  try {
    // Recalcular saldos
    const currentUserBalance = await calculateBalance(currentUserId, friendId);
    const friendBalance = await calculateBalance(friendId, currentUserId);

    // Atualizar saldos no documento do usuário atual
    const currentUserRef = doc(db, 'users', currentUserId);
    await updateDoc(currentUserRef, {
      totalToReceive: currentUserBalance.totalToReceive,
      totalToPay: currentUserBalance.totalToPay,
      updatedAt: serverTimestamp()
    });

    // Atualizar saldos no documento do amigo
    const friendRef = doc(db, 'users', friendId);
    await updateDoc(friendRef, {
      totalToReceive: friendBalance.totalToReceive,
      totalToPay: friendBalance.totalToPay,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Erro ao atualizar saldos:', error);
    throw error;
  }
};

// Buscar balanço do usuário
export const getUserBalance = async (userId: string): Promise<{
  totalOwed: number;
  totalToReceive: number;
  netBalance: number;
}> => {
  try {
    // Buscar dívidas onde o usuário é credor
    const creditorQuery = query(
      collection(db, 'debts'),
      where('creditorId', '==', userId),
      where('paid', '==', false)
    );

    // Buscar dívidas onde o usuário é devedor
    const debtorQuery = query(
      collection(db, 'debts'),
      where('debtorId', '==', userId),
      where('paid', '==', false)
    );

    const [creditorSnapshot, debtorSnapshot] = await Promise.all([
      getDocs(creditorQuery),
      getDocs(debtorQuery)
    ]);

    const totalToReceive = creditorSnapshot.docs.reduce(
      (total, doc) => total + doc.data().amount,
      0
    );

    const totalOwed = debtorSnapshot.docs.reduce(
      (total, doc) => total + doc.data().amount,
      0
    );

    const netBalance = totalToReceive - totalOwed;

    return { totalOwed, totalToReceive, netBalance };
  } catch (error) {
    console.error('Erro ao buscar balanço:', error);
    throw error;
  }
};

// Buscar dívidas onde o usuário é credor
export const getDebtsAsCreditor = async (userId: string): Promise<Debt[]> => {
  try {
    const q = query(
      collection(db, 'debts'),
      where('creditorId', '==', userId),
      where('paid', '==', false)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Debt));
  } catch (error) {
    console.error('Erro ao buscar dívidas como credor:', error);
    throw error;
  }
};

// Buscar dívidas onde o usuário é devedor
export const getDebtsAsDebtor = async (userId: string): Promise<Debt[]> => {
  try {
    const q = query(
      collection(db, 'debts'),
      where('debtorId', '==', userId),
      where('paid', '==', false)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Debt));
  } catch (error) {
    console.error('Erro ao buscar dívidas como devedor:', error);
    throw error;
  }
};

// Buscar amigos com dívidas em aberto
export const getFriendsWithOpenDebts = async (userId: string): Promise<{
  count: number;
  friends: Array<{
    id: string;
    name: string;
    photoURL?: string;
    balance: number;
  }>;
}> => {
  try {
    // Buscar dados do usuário para obter lista de amigos
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return { count: 0, friends: [] };
    }

    const userData = userDoc.data();
    const friendsList = userData.friends || [];

    if (friendsList.length === 0) {
      return { count: 0, friends: [] };
    }

    // Para cada amigo, calcular o saldo
    const friendsWithBalances = await Promise.all(
      friendsList.map(async (friendId: string) => {
        try {
          const balanceData = await calculateBalance(userId, friendId);
          
          // Buscar dados do amigo
          const friendRef = doc(db, 'users', friendId);
          const friendDoc = await getDoc(friendRef);
          
          if (!friendDoc.exists()) {
            return null;
          }

          const friendData = friendDoc.data();
          
          return {
            id: friendId,
            name: friendData.username || 'Usuário',
            photoURL: friendData.photoURL,
            balance: balanceData.balance
          };
        } catch (error) {
          console.error(`Erro ao calcular saldo para amigo ${friendId}:`, error);
          return null;
        }
      })
    );

    // Filtrar amigos válidos e com saldo diferente de zero
    const validFriends = friendsWithBalances
      .filter(friend => friend !== null)
      .filter(friend => friend!.balance !== 0);

    return {
      count: validFriends.length,
      friends: validFriends as Array<{
        id: string;
        name: string;
        photoURL?: string;
        balance: number;
      }>
    };
  } catch (error) {
    console.error('Erro ao buscar amigos com dívidas:', error);
    return { count: 0, friends: [] };
  }
}; 