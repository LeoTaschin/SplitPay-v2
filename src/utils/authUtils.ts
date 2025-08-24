import { auth } from '../config/firebase';

/**
 * Aguarda a sincronização do Firebase Auth
 * @param timeoutMs Tempo máximo de espera em milissegundos (padrão: 5000ms)
 * @returns Promise<boolean> - true se autenticado, false se timeout
 */
export const waitForFirebaseAuth = async (timeoutMs: number = 5000): Promise<boolean> => {
  // Se já está autenticado, retorna imediatamente
  if (auth.currentUser) {
    console.log('✅ Firebase Auth já autenticado:', auth.currentUser.uid);
    return true;
  }

  console.log('🔄 Aguardando Firebase Auth sincronizar...');
  
  const startTime = Date.now();
  const checkInterval = 500; // Verificar a cada 500ms
  
  while (Date.now() - startTime < timeoutMs) {
    if (auth.currentUser) {
      console.log('✅ Firebase Auth sincronizou após', Date.now() - startTime, 'ms');
      return true;
    }
    
    // Aguardar antes da próxima verificação
    await new Promise(resolve => setTimeout(resolve, checkInterval));
  }
  
  console.log('⏰ Timeout aguardando Firebase Auth sincronizar');
  return false;
};

/**
 * Verifica se o usuário está autenticado no Firebase Auth
 * @param userId ID do usuário esperado (opcional)
 * @returns Promise<boolean> - true se autenticado e ID corresponde
 */
export const isFirebaseAuthReady = async (userId?: string): Promise<boolean> => {
  const isAuthenticated = await waitForFirebaseAuth();
  
  if (!isAuthenticated) {
    return false;
  }
  
  if (userId && auth.currentUser?.uid !== userId) {
    console.error('❌ ID do usuário não corresponde:', {
      expected: userId,
      actual: auth.currentUser?.uid
    });
    return false;
  }
  
  return true;
};

/**
 * Obtém o usuário autenticado no Firebase Auth
 * @returns Promise<firebase.User | null>
 */
export const getAuthenticatedUser = async (): Promise<any> => {
  const isReady = await waitForFirebaseAuth();
  return isReady ? auth.currentUser : null;
};
