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
  orderBy,
  limit
} from 'firebase/firestore';
import { Transaction, CreateTransactionForm, PixPayload, User } from '../types';
import { generateReferenceId } from '../utils/pixUtils';

// Criar nova transação
export const createTransaction = async (
  fromUserId: string, 
  formData: CreateTransactionForm
): Promise<Transaction> => {
  try {
    // Gerar ID único para a transação
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Gerar ID de referência único
    const referenceId = generateReferenceId();
    
    // Buscar dados do usuário destinatário para gerar payload Pix
    const toUserRef = doc(db, 'users', formData.toUser);
    const toUserDoc = await getDoc(toUserRef);
    
    if (!toUserDoc.exists()) {
      throw new Error('Usuário destinatário não encontrado');
    }
    
    const toUserData = toUserDoc.data() as User;
    
    // Verificar se o usuário tem dados Pix configurados
    if (!toUserData.pixKey || !toUserData.name || !toUserData.city) {
      throw new Error('Usuário destinatário não possui dados Pix configurados');
    }
    
    // Gerar payload Pix
    const pixPayload = generatePixPayload({
      toUser: toUserData,
      amount: formData.amount,
      referenceId
    });
    
    // Criar documento da transação
    const transaction: Omit<Transaction, 'id'> = {
      fromUser: fromUserId,
      toUser: formData.toUser,
      amount: formData.amount,
      referenceId,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      pixPayload,
      description: formData.description
    };
    
    await setDoc(doc(db, 'transactions', transactionId), {
      ...transaction,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return {
      id: transactionId,
      ...transaction
    };
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    throw error;
  }
};

// Buscar transações do usuário
export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    const transactionsRef = collection(db, 'transactions');
    const q = query(
      transactionsRef,
      where('fromUser', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    const querySnapshot = await getDocs(q);
    const transactions: Transaction[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      transactions.push({
        id: doc.id,
        fromUser: data.fromUser,
        toUser: data.toUser,
        amount: data.amount,
        referenceId: data.referenceId,
        status: data.status,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        pixPayload: data.pixPayload,
        description: data.description
      });
    });
    
    return transactions;
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    throw error;
  }
};

// Atualizar status da transação
export const updateTransactionStatus = async (
  transactionId: string, 
  status: Transaction['status']
): Promise<void> => {
  try {
    const transactionRef = doc(db, 'transactions', transactionId);
    await updateDoc(transactionRef, {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Erro ao atualizar status da transação:', error);
    throw error;
  }
};

// Buscar transação por ID
export const getTransactionById = async (transactionId: string): Promise<Transaction | null> => {
  try {
    const transactionRef = doc(db, 'transactions', transactionId);
    const transactionDoc = await getDoc(transactionRef);
    
    if (!transactionDoc.exists()) {
      return null;
    }
    
    const data = transactionDoc.data();
    return {
      id: transactionDoc.id,
      fromUser: data.fromUser,
      toUser: data.toUser,
      amount: data.amount,
      referenceId: data.referenceId,
      status: data.status,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      pixPayload: data.pixPayload,
      description: data.description
    };
  } catch (error) {
    console.error('Erro ao buscar transação:', error);
    throw error;
  }
};

// Gerar payload Pix BR Code
const generatePixPayload = (params: {
  toUser: User;
  amount: number;
  referenceId: string;
}): string => {
  const { toUser, amount, referenceId } = params;
  
  // Construir payload Pix seguindo o padrão BR Code
  const payload: PixPayload = {
    payloadFormatIndicator: "01",
    pointOfInitiationMethod: "12", // QR Code único
    merchantAccountInformation: {
      gui: "br.gov.bcb.pix",
      key: toUser.pixKey!,
      keyType: toUser.pixKeyType || "random"
    },
    merchantCategoryCode: "0000",
    transactionCurrency: "986", // BRL
    transactionAmount: amount.toFixed(2),
    countryCode: "BR",
    merchantName: toUser.name!,
    merchantCity: toUser.city!,
    additionalDataFieldTemplate: {
      referenceLabel: referenceId
    }
  };
  
  // Converter payload para string (implementação simplificada)
  // Em produção, usar biblioteca específica para BR Code
  return JSON.stringify(payload);
};
