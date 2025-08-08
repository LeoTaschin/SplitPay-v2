import { db } from '../config/firebase';
import { 
  collection, 
  getDocs,
  updateDoc,
  doc,
  query,
  where
} from 'firebase/firestore';

// Serviço para migrar dados existentes e adicionar campos necessários
export const migrationService = {
  // Migrar dívidas existentes para adicionar campos necessários
  async migrateDebts() {
    try {
      console.log('Iniciando migração de dívidas...');
      
      const debtsRef = collection(db, 'debts');
      const snapshot = await getDocs(debtsRef);
      
      let migratedCount = 0;
      let errorCount = 0;
      
      for (const debtDoc of snapshot.docs) {
        try {
          const debtData = debtDoc.data();
          const updates: any = {};
          
          // Adicionar campo paidAt se não existir e a dívida foi paga
          if (debtData.paid && !debtData.paidAt) {
            updates.paidAt = debtData.updatedAt || debtData.createdAt;
            updates.paidBy = debtData.paidBy || debtData.creditorId;
          }
          
          // Adicionar campo type se não existir
          if (!debtData.type) {
            updates.type = 'personal'; // Padrão para dívidas existentes
          }
          
          // Adicionar campo amountPerPerson para dívidas de grupo
          if (debtData.type === 'group' && !debtData.amountPerPerson) {
            updates.amountPerPerson = debtData.amount || 0;
          }
          
          // Aplicar atualizações se houver mudanças
          if (Object.keys(updates).length > 0) {
            await updateDoc(doc(db, 'debts', debtDoc.id), updates);
            migratedCount++;
            console.log(`Dívida ${debtDoc.id} migrada com sucesso`);
          }
        } catch (error) {
          console.error(`Erro ao migrar dívida ${debtDoc.id}:`, error);
          errorCount++;
        }
      }
      
      console.log(`Migração concluída: ${migratedCount} dívidas migradas, ${errorCount} erros`);
      return { success: true, migratedCount, errorCount };
    } catch (error) {
      console.error('Erro na migração:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Adicionar campos necessários aos usuários
  async migrateUsers() {
    try {
      console.log('Iniciando migração de usuários...');
      
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      let migratedCount = 0;
      let errorCount = 0;
      
      for (const userDoc of snapshot.docs) {
        try {
          const userData = userDoc.data();
          const updates: any = {};
          
          // Adicionar campos se não existirem
          if (!userData.totalToReceive) {
            updates.totalToReceive = 0;
          }
          
          if (!userData.totalToPay) {
            updates.totalToPay = 0;
          }
          
          if (!userData.friends) {
            updates.friends = [];
          }
          
          // Aplicar atualizações se houver mudanças
          if (Object.keys(updates).length > 0) {
            await updateDoc(doc(db, 'users', userDoc.id), updates);
            migratedCount++;
            console.log(`Usuário ${userDoc.id} migrado com sucesso`);
          }
        } catch (error) {
          console.error(`Erro ao migrar usuário ${userDoc.id}:`, error);
          errorCount++;
        }
      }
      
      console.log(`Migração de usuários concluída: ${migratedCount} usuários migrados, ${errorCount} erros`);
      return { success: true, migratedCount, errorCount };
    } catch (error) {
      console.error('Erro na migração de usuários:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Executar todas as migrações
  async runAllMigrations() {
    console.log('Iniciando todas as migrações...');
    
    const debtsResult = await this.migrateDebts();
    const usersResult = await this.migrateUsers();
    
    return {
      debts: debtsResult,
      users: usersResult,
      success: debtsResult.success && usersResult.success
    };
  }
};
