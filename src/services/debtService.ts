import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc,
  doc, 
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';
import { auth } from '../config/firebase';
import { Debt, ApiResponse } from '../types';

interface DebtData {
  creditorId: string;
  debtorId: string;
  amount: number;
  description?: string;
  createdAt: Date;
  paid: boolean;
  paidAt?: Date;
  paidBy?: string;
  creditor: any;
  debtor: any;
}

interface CreateDebtParams {
  creditorId: string;
  debtorId: string;
  amount: number;
  description?: string;
}

// Criar uma nova dívida
export async function createDebt(
  creditorId: string, 
  debtorId: string, 
  amount: number, 
  description?: string
): Promise<ApiResponse<{ debtId: string }>> {
      console.log('debtService: Criando nova dívida...');

  try {
    // Verificar se os documentos dos usuários existem
    const creditorRef = doc(db, 'users', creditorId);
    const debtorRef = doc(db, 'users', debtorId);

    const [creditorDoc, debtorDoc] = await Promise.all([
      getDoc(creditorRef),
      getDoc(debtorRef)
    ]);

    if (!creditorDoc.exists()) {
      console.error('debtService: Documento do credor não encontrado');
      throw new Error('Documento do credor não encontrado');
    }

    if (!debtorDoc.exists()) {
      console.error('debtService: Documento do devedor não encontrado');
      throw new Error('Documento do devedor não encontrado');
    }

    // Criar a dívida em uma transação
    const result = await runTransaction(db, async (transaction) => {
      // Criar o documento da dívida
      const debtRef = doc(collection(db, 'debts'));
      
      const debtData: DebtData = {
        creditorId,
        debtorId,
        amount: Number(amount),
        description,
        createdAt: new Date(),
        paid: false,
        creditor: {
          id: creditorId,
          ...creditorDoc.data()
        },
        debtor: {
          id: debtorId,
          ...debtorDoc.data()
        }
      };

      transaction.set(debtRef, debtData);

      // Atualizar os totais dos usuários
      const creditorData = creditorDoc.data();
      const debtorData = debtorDoc.data();

      transaction.update(creditorRef, {
        totalToReceive: (creditorData.totalToReceive || 0) + Number(amount)
      });

      transaction.update(debtorRef, {
        totalToPay: (debtorData.totalToPay || 0) + Number(amount)
      });

      return { success: true, debtId: debtRef.id };
    });

    console.log('debtService: Dívida criada com sucesso');
    return result;
  } catch (error) {
    console.error('debtService: Erro ao criar dívida:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Função auxiliar para ordenar dívidas por data
const sortDebtsByDate = (debts: Debt[]): Debt[] => {
  const getDebtTimestamp = (debt: Debt) => {
    const createdAt = debt.createdAt;
    
    if (createdAt instanceof Date) {
      return createdAt.getTime();
    }
    
    if (typeof createdAt === 'string') {
      const date = new Date(createdAt);
      return isNaN(date.getTime()) ? 0 : date.getTime();
    }
    
    // Se for Firestore Timestamp
    if (createdAt && typeof createdAt === 'object' && 'toDate' in createdAt) {
      return createdAt.toDate().getTime();
    }
    
    // Se for timestamp numérico
    if (typeof createdAt === 'number') {
      return createdAt;
    }
    
    return 0;
  };
  
  return debts.sort((a, b) => {
    const timestampA = getDebtTimestamp(a);
    const timestampB = getDebtTimestamp(b);
    return timestampB - timestampA; // Mais recente primeiro
  });
};

// Buscar dívidas onde o usuário é credor
export const getDebtsAsCreditor = async (userId: string): Promise<Debt[]> => {
  try {
    console.log('debtService: Buscando dívidas como credor...');
    
    // Tentar com ordenação no Firebase primeiro
    try {
      const q = query(
        collection(db, 'debts'),
        where('creditorId', '==', userId),
        where('paid', '==', false),
        orderBy('createdAt', 'desc')
      );

      const groupQ = query(
        collection(db, 'debts'),
        where('receiverId', '==', userId),
        where('type', '==', 'group'),
        where('paid', '==', false),
        orderBy('createdAt', 'desc')
      );

      const [querySnapshot, groupQuerySnapshot] = await Promise.all([
        getDocs(q),
        getDocs(groupQ)
      ]);

      const regularDebts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const groupDebts = groupQuerySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        debtorId: doc.data().payerId,
        creditorId: doc.data().receiverId
      }));

      const allDebts = [...regularDebts, ...groupDebts];
      console.log(`debtService: ${allDebts.length} dívidas como credor encontradas`);
      return allDebts as Debt[];
    } catch (error) {
      console.log('debtService: Fallback para ordenação local');
      
      // Fallback: buscar sem ordenação e ordenar localmente
      const q = query(
        collection(db, 'debts'),
        where('creditorId', '==', userId),
        where('paid', '==', false)
      );

      const groupQ = query(
        collection(db, 'debts'),
        where('receiverId', '==', userId),
        where('type', '==', 'group'),
        where('paid', '==', false)
      );

      const [querySnapshot, groupQuerySnapshot] = await Promise.all([
        getDocs(q),
        getDocs(groupQ)
      ]);

      const regularDebts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const groupDebts = groupQuerySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        debtorId: doc.data().payerId,
        creditorId: doc.data().receiverId
      }));

      const allDebts = [...regularDebts, ...groupDebts];
      const sortedDebts = sortDebtsByDate(allDebts);
      console.log(`debtService: ${sortedDebts.length} dívidas como credor (ordenadas localmente)`);
      return sortedDebts as Debt[];
    }
  } catch (error) {
    console.error('debtService: Erro ao buscar dívidas como credor:', error);
    throw error;
  }
};

// Buscar dívidas onde o usuário é devedor
export const getDebtsAsDebtor = async (userId: string): Promise<Debt[]> => {
  try {
    console.log('debtService: Buscando dívidas como devedor...');
    
    // Tentar com ordenação no Firebase primeiro
    try {
      const q = query(
        collection(db, 'debts'),
        where('debtorId', '==', userId),
        where('paid', '==', false),
        orderBy('createdAt', 'desc')
      );

      const groupQ = query(
        collection(db, 'debts'),
        where('payerId', '==', userId),
        where('type', '==', 'group'),
        where('paid', '==', false),
        orderBy('createdAt', 'desc')
      );

      const [querySnapshot, groupQuerySnapshot] = await Promise.all([
        getDocs(q),
        getDocs(groupQ)
      ]);

      const regularDebts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const groupDebts = groupQuerySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        debtorId: doc.data().payerId,
        creditorId: doc.data().receiverId
      }));

      const allDebts = [...regularDebts, ...groupDebts];
      console.log(`debtService: ${allDebts.length} dívidas como devedor encontradas`);
      return allDebts as Debt[];
    } catch (error) {
      console.log('debtService: Fallback para ordenação local');
      
      // Fallback: buscar sem ordenação e ordenar localmente
      const q = query(
        collection(db, 'debts'),
        where('debtorId', '==', userId),
        where('paid', '==', false)
      );

      const groupQ = query(
        collection(db, 'debts'),
        where('payerId', '==', userId),
        where('type', '==', 'group'),
        where('paid', '==', false)
      );

      const [querySnapshot, groupQuerySnapshot] = await Promise.all([
        getDocs(q),
        getDocs(groupQ)
      ]);

      const regularDebts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const groupDebts = groupQuerySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        debtorId: doc.data().payerId,
        creditorId: doc.data().receiverId
      }));

      const allDebts = [...regularDebts, ...groupDebts];
      const sortedDebts = sortDebtsByDate(allDebts);
      console.log(`debtService: ${sortedDebts.length} dívidas como devedor (ordenadas localmente)`);
      return sortedDebts as Debt[];
    }
  } catch (error) {
    console.error('debtService: Erro ao buscar dívidas como devedor:', error);
    throw error;
  }
};

// Marcar uma dívida como paga
export const markDebtAsPaid = async (debtId: string): Promise<ApiResponse<void>> => {
  try {
    await runTransaction(db, async (transaction) => {
      const debtRef = doc(db, 'debts', debtId);
      const debtDoc = await transaction.get(debtRef);
      
      if (!debtDoc.exists()) {
        throw new Error('Dívida não encontrada');
      }

      const debtData = debtDoc.data();
      const { creditorId, debtorId, amount } = debtData;

      // Atualizar a dívida
      transaction.update(debtRef, {
        paid: true,
        paidAt: new Date(),
        paidBy: currentUserId
      });

      // Atualizar os totais dos usuários
      const creditorRef = doc(db, 'users', creditorId);
      const debtorRef = doc(db, 'users', debtorId);

      const [creditorDoc, debtorDoc] = await Promise.all([
        transaction.get(creditorRef),
        transaction.get(debtorRef)
      ]);

      if (creditorDoc.exists()) {
        const creditorData = creditorDoc.data();
        transaction.update(creditorRef, {
          totalToReceive: Math.max(0, (creditorData.totalToReceive || 0) - Number(amount))
        });
      }

      if (debtorDoc.exists()) {
        const debtorData = debtorDoc.data();
        transaction.update(debtorRef, {
          totalToPay: Math.max(0, (debtorData.totalToPay || 0) - Number(amount))
        });
      }
    });

    console.log('debtService: Dívida marcada como paga');
    return { success: true };
  } catch (error) {
    console.error('debtService: Erro ao marcar dívida como paga:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
};

// Atualizar totais do usuário
export const updateUserTotals = async (userId: string): Promise<{ totalToReceive: number; totalToPay: number }> => {
  try {
    console.log('debtService: Atualizando totais...');
    
    const [creditorDebts, debtorDebts] = await Promise.all([
      getDebtsAsCreditor(userId),
      getDebtsAsDebtor(userId)
    ]);

    const totalToReceive = creditorDebts.reduce((sum, debt) => {
      const amount = debt.type === 'group' ? (debt.amountPerPerson || 0) : (debt.amount || 0);
      return sum + amount;
    }, 0);

    const totalToPay = debtorDebts.reduce((sum, debt) => {
      const amount = debt.type === 'group' ? (debt.amountPerPerson || 0) : (debt.amount || 0);
      return sum + amount;
    }, 0);

    // Atualizar no Firestore
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      totalToReceive,
      totalToPay,
      updatedAt: new Date()
    });

    console.log(`debtService: Totais atualizados - Receber: R$ ${totalToReceive.toFixed(2)}, Pagar: R$ ${totalToPay.toFixed(2)}`);
    return { totalToReceive, totalToPay };
  } catch (error) {
    console.error('debtService: Erro ao atualizar totais:', error);
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
    console.log('debtService: Calculando balanço...');
    
    const [creditorDebts, debtorDebts] = await Promise.all([
      getDebtsAsCreditor(userId),
      getDebtsAsDebtor(userId)
    ]);

    const totalToReceive = creditorDebts.reduce((sum, debt) => {
      const amount = debt.type === 'group' ? (debt.amountPerPerson || 0) : (debt.amount || 0);
      return sum + amount;
    }, 0);

    const totalOwed = debtorDebts.reduce((sum, debt) => {
      const amount = debt.type === 'group' ? (debt.amountPerPerson || 0) : (debt.amount || 0);
      return sum + amount;
    }, 0);

    const netBalance = totalToReceive - totalOwed;

    console.log(`debtService: Balanço calculado - Devo: R$ ${totalOwed.toFixed(2)}, Devo receber: R$ ${totalToReceive.toFixed(2)}`);
    return { totalOwed, totalToReceive, netBalance };
  } catch (error) {
    console.error('debtService: Erro ao buscar balanço:', error);
    throw error;
  }
};

// Buscar número de amigos com dívidas em aberto
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
    console.log('debtService: Buscando amigos com dívidas...');
    
    // Buscar todos os amigos do usuário
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.error('debtService: Usuário não encontrado');
      return { count: 0, friends: [] };
    }
    
    const userData = userDoc.data();
    const friendsList = userData.friends || [];
    
    if (friendsList.length === 0) {
      console.log('debtService: Nenhum amigo encontrado');
      return { count: 0, friends: [] };
    }
    
    // Buscar dados dos amigos
    const usersRef = collection(db, 'users');
    const friendsQuery = query(usersRef, where('uid', 'in', friendsList));
    const friendsSnapshot = await getDocs(friendsQuery);
    
    const friendsData = friendsSnapshot.docs.map(doc => ({
      id: doc.data().uid,
      name: doc.data().username || 'Usuário',
      photoURL: doc.data().photoURL,
      email: doc.data().email
    }));
    
    // Para cada amigo, calcular o saldo de dívidas
    const friendsWithBalances = await Promise.all(
      friendsData.map(async (friend) => {
        try {
          // Buscar dívidas onde o usuário atual é credor e o amigo é devedor
          const creditorQuery = query(
            collection(db, 'debts'),
            where('creditorId', '==', userId),
            where('debtorId', '==', friend.id),
            where('paid', '==', false)
          );
          
          // Buscar dívidas onde o usuário atual é devedor e o amigo é credor
          const debtorQuery = query(
            collection(db, 'debts'),
            where('creditorId', '==', friend.id),
            where('debtorId', '==', userId),
            where('paid', '==', false)
          );
          
          const [creditorSnapshot, debtorSnapshot] = await Promise.all([
            getDocs(creditorQuery),
            getDocs(debtorQuery)
          ]);
          
          // Calcular saldo (o que você deve receber - o que você deve pagar)
          const totalToReceive = creditorSnapshot.docs.reduce((sum, doc) => {
            const debt = doc.data();
            const amount = debt.type === 'group' ? (debt.amountPerPerson || 0) : (debt.amount || 0);
            return sum + amount;
          }, 0);
          
          const totalToPay = debtorSnapshot.docs.reduce((sum, doc) => {
            const debt = doc.data();
            const amount = debt.type === 'group' ? (debt.amountPerPerson || 0) : (debt.amount || 0);
            return sum + amount;
          }, 0);
          
          const balance = totalToReceive - totalToPay;
          
          return {
            ...friend,
            balance
          };
        } catch (error) {
          console.error(`debtService: Erro ao calcular saldo para amigo ${friend.id}:`, error);
          return {
            ...friend,
            balance: 0
          };
        }
      })
    );
    
    // Filtrar apenas amigos com saldo diferente de zero
    const friendsWithOpenDebts = friendsWithBalances.filter(friend => friend.balance !== 0);
    
    console.log(`debtService: ${friendsWithOpenDebts.length} amigos com dívidas`);
    return {
      count: friendsWithOpenDebts.length,
      friends: friendsWithOpenDebts
    };
  } catch (error) {
    console.error('debtService: Erro ao buscar amigos com dívidas em aberto:', error);
    return { count: 0, friends: [] };
  }
}; 