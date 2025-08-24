import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged as firebaseAuthStateChanged,
    User as FirebaseUser,
    signInWithCustomToken
  } from 'firebase/auth';
  import { auth } from '../config/firebase';
  import { User } from '../types';
  import { useState, useEffect } from 'react';
  import { AuthStorageService } from '../services/authStorageService';
  
  export const signIn = async (email: string, password: string): Promise<FirebaseUser> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };
  
  export const signUp = async (email: string, password: string): Promise<FirebaseUser> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };
  
  export const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      // Limpar sessão local também
      await AuthStorageService.clearUserSession();
    } catch (error) {
      throw error;
    }
  };
  
  export const getCurrentUser = (): FirebaseUser | null => {
    return auth.currentUser;
  };
  
  export const onAuthStateChanged = (callback: (user: FirebaseUser | null) => void) => {
    return firebaseAuthStateChanged(auth, callback);
  };
  
  // Helper function to convert Firebase User to our User type
  export const convertFirebaseUser = (firebaseUser: FirebaseUser): User => {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || undefined,
      photoURL: firebaseUser.photoURL || undefined,
      createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
    };
  };

  // useAuth hook for managing authentication state with persistence
  export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
      // Duração mínima pequena para permitir o fade-in sem atrasar muito
      const splashMinDurationMs = 700;
      const startedAt = Date.now();
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      const initializeAuth = async () => {
        try {
          // Primeiro, tentar carregar sessão salva
          const session = await AuthStorageService.loadUserSession();
          
          if (session) {
            console.log('🔄 Tentando auto-login com sessão salva...');
            const savedUser = AuthStorageService.convertToUser(session);
            setUser(savedUser);
            
            // Verificar se o Firebase ainda tem o usuário autenticado
            if (!auth.currentUser) {
              console.log('⚠️ Firebase não tem usuário, mas temos sessão salva');
              console.log('🔄 Aguardando Firebase Auth se sincronizar...');
              // Aguardar um pouco para o Firebase Auth se sincronizar
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              // Se ainda não tem usuário, limpar sessão local
              if (!auth.currentUser) {
                console.log('❌ Firebase Auth não sincronizou, limpando sessão local');
                await AuthStorageService.clearUserSession();
                setUser(null);
              }
            }
          }
        } catch (error) {
          console.error('❌ Erro ao carregar sessão:', error);
        } finally {
          setIsInitializing(false);
        }
      };

      // Inicializar autenticação
      initializeAuth();

      const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
        console.log('🔍 Firebase Auth state changed:', firebaseUser?.uid);
        
        if (firebaseUser) {
          const convertedUser = convertFirebaseUser(firebaseUser);
          setUser(convertedUser);
          
          // Salvar sessão automaticamente quando Firebase Auth sincroniza
          try {
            await AuthStorageService.saveUserSession(convertedUser, true);
            console.log('✅ Sessão salva automaticamente após sincronização do Firebase');
          } catch (error) {
            console.error('❌ Erro ao salvar sessão:', error);
          }
        } else {
          console.log('🔍 Firebase Auth: usuário deslogado');
          setUser(null);
          
          // Limpar sessão local quando Firebase Auth desloga
          try {
            await AuthStorageService.clearUserSession();
            console.log('✅ Sessão local limpa após logout do Firebase');
          } catch (error) {
            console.error('❌ Erro ao limpar sessão:', error);
          }
        }

        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, splashMinDurationMs - elapsed);
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => setLoading(false), remaining);
      });

      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        unsubscribe();
      };
    }, []);

    const saveCredentials = async (email: string, password: string) => {
      // This function can be used to save credentials securely
      // For now, we'll just return a promise that resolves
      return Promise.resolve();
    };

    const loginWithPersistence = async (
      email: string, 
      password: string, 
      keepLoggedIn: boolean = false
    ): Promise<void> => {
      try {
        const firebaseUser = await signIn(email, password);
        const user = convertFirebaseUser(firebaseUser);
        
        // Salvar sessão com persistência
        await AuthStorageService.saveUserSession(user, keepLoggedIn);
        
        setUser(user);
        console.log('✅ Login com persistência realizado com sucesso');
      } catch (error) {
        console.error('❌ Erro no login com persistência:', error);
        throw error;
      }
    };

    const logout = async (): Promise<void> => {
      try {
        await signOut();
        setUser(null);
        console.log('✅ Logout realizado com sucesso');
      } catch (error) {
        console.error('❌ Erro no logout:', error);
        throw error;
      }
    };

    const refreshSession = async (): Promise<void> => {
      try {
        await AuthStorageService.refreshSession();
        console.log('🔄 Sessão renovada com sucesso');
      } catch (error) {
        console.error('❌ Erro ao renovar sessão:', error);
        throw error;
      }
    };

    const getSessionInfo = async () => {
      return await AuthStorageService.getSessionInfo();
    };

    // Função para verificar se o Firebase Auth está sincronizado
    const checkAndReauthenticate = async (): Promise<boolean> => {
      try {
        // Se já temos usuário autenticado no Firebase, está tudo ok
        if (auth.currentUser) {
          console.log('✅ Firebase Auth já autenticado:', auth.currentUser.uid);
          return true;
        }

        // Se não temos usuário no Firebase, verificar sessão local
        const session = await AuthStorageService.loadUserSession();
        if (!session) {
          console.log('📭 Nenhuma sessão local encontrada');
          return false;
        }

        console.log('🔄 Firebase não autenticado, mas temos sessão local');
        console.log('🔄 Aguardando Firebase Auth se sincronizar...');
        
        // Aguardar até 5 segundos para o Firebase Auth se sincronizar
        for (let i = 0; i < 10; i++) {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          if (auth.currentUser) {
            console.log('✅ Firebase Auth sincronizou automaticamente');
            return true;
          }
        }

        console.log('❌ Firebase Auth não sincronizou após 5 segundos');
        console.log('🔄 Limpando sessão local e pedindo novo login');
        
        // Limpar sessão local e pedir novo login
        await AuthStorageService.clearUserSession();
        setUser(null);
        return false;
      } catch (error) {
        console.error('❌ Erro ao verificar autenticação:', error);
        return false;
      }
    };

    return { 
      user, 
      loading, 
      isInitializing,
      saveCredentials, 
      loginWithPersistence,
      logout,
      refreshSession,
      getSessionInfo,
      checkAndReauthenticate,
    };
  }; 