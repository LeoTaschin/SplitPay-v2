const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');

// Configuração do Firebase (substitua pelos seus dados)
const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "seu-sender-id",
  appId: "seu-app-id"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Função para migrar dívidas
async function migrateDebts() {
  try {
    console.log('🔄 Iniciando migração de dívidas...');
    
    const debtsRef = collection(db, 'debts');
    const snapshot = await getDocs(debtsRef);
    
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const debtDoc of snapshot.docs) {
      try {
        const debtData = debtDoc.data();
        const updates = {};
        
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
          console.log(`✅ Dívida ${debtDoc.id} migrada com sucesso`);
        }
      } catch (error) {
        console.error(`❌ Erro ao migrar dívida ${debtDoc.id}:`, error);
        errorCount++;
      }
    }
    
    console.log(`📊 Migração de dívidas concluída: ${migratedCount} migradas, ${errorCount} erros`);
    return { success: true, migratedCount, errorCount };
  } catch (error) {
    console.error('❌ Erro na migração de dívidas:', error);
    return { success: false, error: error.message };
  }
}

// Função para migrar usuários
async function migrateUsers() {
  try {
    console.log('🔄 Iniciando migração de usuários...');
    
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const userDoc of snapshot.docs) {
      try {
        const userData = userDoc.data();
        const updates = {};
        
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
          console.log(`✅ Usuário ${userDoc.id} migrado com sucesso`);
        }
      } catch (error) {
        console.error(`❌ Erro ao migrar usuário ${userDoc.id}:`, error);
        errorCount++;
      }
    }
    
    console.log(`📊 Migração de usuários concluída: ${migratedCount} migrados, ${errorCount} erros`);
    return { success: true, migratedCount, errorCount };
  } catch (error) {
    console.error('❌ Erro na migração de usuários:', error);
    return { success: false, error: error.message };
  }
}

// Função principal
async function runMigrations() {
  console.log('🚀 Iniciando migrações do Firebase...\n');
  
  const debtsResult = await migrateDebts();
  console.log('');
  const usersResult = await migrateUsers();
  
  console.log('\n📋 Resumo das migrações:');
  console.log(`Dívidas: ${debtsResult.success ? '✅' : '❌'} ${debtsResult.migratedCount || 0} migradas`);
  console.log(`Usuários: ${usersResult.success ? '✅' : '❌'} ${usersResult.migratedCount || 0} migrados`);
  
  const success = debtsResult.success && usersResult.success;
  console.log(`\n${success ? '🎉' : '⚠️'} Migrações ${success ? 'concluídas com sucesso!' : 'completadas com erros.'}`);
}

// Executar migrações
runMigrations().catch(console.error);
