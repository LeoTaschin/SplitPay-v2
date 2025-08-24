import { db } from '../config/firebase';
import { 
  collection, 
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { Debt } from '../types';

interface MonthlyAverageData {
  average: number;
  period: string;
}

interface BiggestDebtData {
  amount: number;
  description?: string;
  createdAt: Date;
}

interface MostActiveFriendData {
  name: string;
  transactionCount: number;
  photoURL?: string;
  totalAmount: number;
}

interface GroupActivityData {
  groupCount: number;
  activeTransactions: number;
  totalGroupAmount: number;
}

interface HighestAmountToReceiveData {
  amount: number;
  description?: string;
  creditorName?: string;
}

interface DebtDistributionData {
  personalPercentage: number;
  groupPercentage: number;
  personalAmount: number;
  groupAmount: number;
}

// Calcular média mensal dos últimos 3 meses
export const getMonthlyAverage = async (userId: string): Promise<MonthlyAverageData> => {
  try {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // Buscar todas as dívidas dos últimos 3 meses
    const q = query(
      collection(db, 'debts'),
      where('createdAt', '>=', threeMonthsAgo),
      where('creditorId', '==', userId)
    );

    const debtorQ = query(
      collection(db, 'debts'),
      where('createdAt', '>=', threeMonthsAgo),
      where('debtorId', '==', userId)
    );

    const [creditorSnapshot, debtorSnapshot] = await Promise.all([
      getDocs(q),
      getDocs(debtorQ)
    ]);

    const allDebts = [
      ...creditorSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      ...debtorSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    ] as Debt[];

    const totalAmount = allDebts.reduce((sum, debt) => {
      const amount = debt.type === 'group' ? (debt.amountPerPerson || 0) : (debt.amount || 0);
      return sum + amount;
    }, 0);

    const average = allDebts.length > 0 ? totalAmount / 3 : 0;

    return {
      average,
      period: '3 meses'
    };
  } catch (error) {
    console.error('Erro ao calcular média mensal:', error);
    return { average: 0, period: '3 meses' };
  }
};

// Encontrar a maior dívida não paga
export const getBiggestDebt = async (userId: string): Promise<BiggestDebtData> => {
  try {
    // Buscar dívidas não pagas onde o usuário é credor
    const creditorQ = query(
      collection(db, 'debts'),
      where('creditorId', '==', userId),
      where('paid', '==', false)
    );

    // Buscar dívidas não pagas onde o usuário é devedor
    const debtorQ = query(
      collection(db, 'debts'),
      where('debtorId', '==', userId),
      where('paid', '==', false)
    );

    const [creditorSnapshot, debtorSnapshot] = await Promise.all([
      getDocs(creditorQ),
      getDocs(debtorQ)
    ]);

    const allUnpaidDebts = [
      ...creditorSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      ...debtorSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    ] as Debt[];

    if (allUnpaidDebts.length === 0) {
      return { amount: 0, description: '', createdAt: new Date() };
    }

    // Encontrar a dívida com maior valor
    const biggestDebt = allUnpaidDebts.reduce((max, debt) => {
      const amount = debt.type === 'group' ? (debt.amountPerPerson || 0) : (debt.amount || 0);
      const maxAmount = max.type === 'group' ? (max.amountPerPerson || 0) : (max.amount || 0);
      return amount > maxAmount ? debt : max;
    });

    return {
      amount: biggestDebt.type === 'group' ? (biggestDebt.amountPerPerson || 0) : (biggestDebt.amount || 0),
      description: biggestDebt.description || '',
      createdAt: biggestDebt.createdAt instanceof Date ? biggestDebt.createdAt : (biggestDebt.createdAt as any).toDate()
    };
  } catch (error) {
    console.error('Erro ao buscar maior dívida:', error);
    return { amount: 0, description: '', createdAt: new Date() };
  }
};

// Encontrar o amigo mais ativo (mais transações)
export const getMostActiveFriend = async (userId: string): Promise<MostActiveFriendData> => {
  try {
    // Buscar todas as dívidas do usuário
    const creditorQ = query(
      collection(db, 'debts'),
      where('creditorId', '==', userId)
    );

    const debtorQ = query(
      collection(db, 'debts'),
      where('debtorId', '==', userId)
    );

    const [creditorSnapshot, debtorSnapshot] = await Promise.all([
      getDocs(creditorQ),
      getDocs(debtorQ)
    ]);

    const allDebts = [
      ...creditorSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      ...debtorSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    ] as Debt[];

    // Contar transações por amigo (incluindo peso por atividade recente)
    const friendActivity: Record<string, { 
      count: number; 
      totalAmount: number; 
      name: string; 
      photoURL?: string;
      recentActivity: number; // Atividade recente (últimos 30 dias)
    }> = {};

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    allDebts.forEach(debt => {
      const friendId = debt.creditorId === userId ? debt.debtorId : debt.creditorId;
      const friendName = debt.creditorId === userId ? debt.debtor?.username : debt.creditor?.username;
      const friendPhoto = debt.creditorId === userId ? debt.debtor?.photoURL : debt.creditor?.photoURL;
      const amount = debt.type === 'group' ? (debt.amountPerPerson || 0) : (debt.amount || 0);

      if (friendId && typeof friendId === 'string') {
        if (!friendActivity[friendId]) {
          friendActivity[friendId] = {
            count: 0,
            totalAmount: 0,
            name: friendName || 'Usuário',
            photoURL: friendPhoto,
            recentActivity: 0
          };
        }
        
        // Contar transação
        friendActivity[friendId].count += 1;
        friendActivity[friendId].totalAmount += amount;
        
        // Verificar se é atividade recente
        const debtDate = debt.createdAt instanceof Date ? debt.createdAt : (debt.createdAt as any).toDate();
        if (debtDate > thirtyDaysAgo) {
          friendActivity[friendId].recentActivity += 1;
        }
      }
    });

    if (Object.keys(friendActivity).length === 0) {
      return { name: 'Nenhum amigo', transactionCount: 0, photoURL: '', totalAmount: 0 };
    }

    // Encontrar o amigo mais ativo (priorizando atividade recente)
    const mostActiveFriend = Object.entries(friendActivity)
      .sort(([, a], [, b]) => {
        // Primeiro por atividade recente, depois por total de transações
        if (a.recentActivity !== b.recentActivity) {
          return b.recentActivity - a.recentActivity;
        }
        return b.count - a.count;
      })[0];

    return {
      name: mostActiveFriend[1].name,
      transactionCount: mostActiveFriend[1].count,
      photoURL: mostActiveFriend[1].photoURL,
      totalAmount: mostActiveFriend[1].totalAmount
    };
  } catch (error) {
    console.error('Erro ao buscar amigo mais ativo:', error);
    return { name: 'Nenhum amigo', transactionCount: 0, photoURL: '', totalAmount: 0 };
  }
};

// Calcular atividade em grupos
export const getGroupActivity = async (userId: string): Promise<GroupActivityData> => {
  try {
    // Buscar dívidas de grupo onde o usuário participa
    const groupQ = query(
      collection(db, 'debts'),
      where('type', '==', 'group'),
      where('paid', '==', false)
    );

    const snapshot = await getDocs(groupQ);
    const groupDebts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Debt[];

    // Filtrar apenas dívidas onde o usuário é credor ou devedor
    const userGroupDebts = groupDebts.filter(debt => 
      debt.creditorId === userId || debt.debtorId === userId
    );

    // Contar grupos únicos (usando description como identificador de grupo)
    const uniqueGroups = new Set();
    userGroupDebts.forEach(debt => {
      if (debt.description && debt.description.includes('Grupo:')) {
        const groupName = debt.description.split('Grupo:')[1]?.trim();
        if (groupName) {
          uniqueGroups.add(groupName);
        }
      }
    });
    const groupCount = uniqueGroups.size;

    // Contar transações ativas
    const activeTransactions = userGroupDebts.length;

    // Calcular valor total
    const totalGroupAmount = userGroupDebts.reduce((sum, debt) => {
      const amount = debt.amountPerPerson || 0;
      return sum + amount;
    }, 0);

    return {
      groupCount,
      activeTransactions,
      totalGroupAmount
    };
  } catch (error) {
    console.error('Erro ao calcular atividade em grupos:', error);
    return { groupCount: 0, activeTransactions: 0, totalGroupAmount: 0 };
  }
};

// Calcular maior valor a receber
export const getHighestAmountToReceive = async (userId: string): Promise<HighestAmountToReceiveData> => {
  try {
    // Buscar dívidas não pagas onde o usuário é credor
    const unpaidQ = query(
      collection(db, 'debts'),
      where('paid', '==', false),
      where('creditorId', '==', userId)
    );

    const snapshot = await getDocs(unpaidQ);
    const unpaidDebts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Debt[];

    if (unpaidDebts.length === 0) {
      return { amount: 0, description: '', creditorName: '' };
    }

    // Encontrar a dívida com maior valor
    const highestDebt = unpaidDebts.reduce((highest, debt) => {
      const amount = debt.type === 'group' ? (debt.amountPerPerson || 0) : (debt.amount || 0);
      const highestAmount = highest.type === 'group' ? (highest.amountPerPerson || 0) : (highest.amount || 0);
      
      return amount > highestAmount ? debt : highest;
    });

    const amount = highestDebt.type === 'group' ? (highestDebt.amountPerPerson || 0) : (highestDebt.amount || 0);

    return {
      amount,
      description: highestDebt.description || '',
      creditorName: highestDebt.debtor?.username || highestDebt.debtor?.name || 'Usuário'
    };
  } catch (error) {
    console.error('Erro ao calcular maior valor a receber:', error);
    return { amount: 0, description: '', creditorName: '' };
  }
};

// Calcular distribuição de dívidas (pessoal vs grupo)
export const getDebtDistribution = async (userId: string): Promise<DebtDistributionData> => {
  try {
    // Buscar todas as dívidas não pagas
    const creditorQ = query(
      collection(db, 'debts'),
      where('creditorId', '==', userId),
      where('paid', '==', false)
    );

    const debtorQ = query(
      collection(db, 'debts'),
      where('debtorId', '==', userId),
      where('paid', '==', false)
    );

    const [creditorSnapshot, debtorSnapshot] = await Promise.all([
      getDocs(creditorQ),
      getDocs(debtorQ)
    ]);

    const allDebts = [
      ...creditorSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      ...debtorSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    ] as Debt[];

    // Separar dívidas pessoais e de grupo
    const personalDebts = allDebts.filter(debt => debt.type !== 'group');
    const groupDebts = allDebts.filter(debt => debt.type === 'group');

    // Calcular valores
    const personalAmount = personalDebts.reduce((sum, debt) => {
      const amount = debt.amount || 0;
      return sum + amount;
    }, 0);

    const groupAmount = groupDebts.reduce((sum, debt) => {
      const amount = debt.amountPerPerson || 0;
      return sum + amount;
    }, 0);

    const totalAmount = personalAmount + groupAmount;

    // Calcular porcentagens
    const personalPercentage = totalAmount > 0 ? Math.round((personalAmount / totalAmount) * 100) : 0;
    const groupPercentage = totalAmount > 0 ? Math.round((groupAmount / totalAmount) * 100) : 0;

    return {
      personalPercentage,
      groupPercentage,
      personalAmount,
      groupAmount
    };
  } catch (error) {
    console.error('Erro ao calcular distribuição de dívidas:', error);
    return { personalPercentage: 0, groupPercentage: 0, personalAmount: 0, groupAmount: 0 };
  }
}; 