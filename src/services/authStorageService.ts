import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

interface StoredUserSession {
  user: {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    createdAt: string;
  };
  loginTimestamp: number;
  keepLoggedIn: boolean;
  expiresAt: number;
}

const STORAGE_KEYS = {
  USER_SESSION: '@splitpay_user_session',
  KEEP_LOGGED_IN: '@splitpay_keep_logged_in',
} as const;

const SESSION_DURATION = {
  KEEP_LOGGED_IN: 30 * 24 * 60 * 60 * 1000, // 30 dias
  DEFAULT: 7 * 24 * 60 * 60 * 1000, // 7 dias
} as const;

export class AuthStorageService {
  /**
   * Salva a sessão do usuário no AsyncStorage
   */
  static async saveUserSession(
    user: User, 
    keepLoggedIn: boolean = false
  ): Promise<void> {
    try {
      const session: StoredUserSession = {
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || undefined,
          photoURL: user.photoURL || undefined,
          createdAt: user.createdAt,
        },
        loginTimestamp: Date.now(),
        keepLoggedIn,
        expiresAt: Date.now() + (keepLoggedIn ? SESSION_DURATION.KEEP_LOGGED_IN : SESSION_DURATION.DEFAULT),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(session));
      await AsyncStorage.setItem(STORAGE_KEYS.KEEP_LOGGED_IN, JSON.stringify(keepLoggedIn));
      
      console.log('✅ Sessão salva com sucesso:', {
        uid: user.uid,
        keepLoggedIn,
        expiresAt: new Date(session.expiresAt).toISOString(),
      });
    } catch (error) {
      console.error('❌ Erro ao salvar sessão:', error);
      throw new Error('Falha ao salvar sessão do usuário');
    }
  }

  /**
   * Carrega a sessão do usuário do AsyncStorage
   */
  static async loadUserSession(): Promise<StoredUserSession | null> {
    try {
      const sessionData = await AsyncStorage.getItem(STORAGE_KEYS.USER_SESSION);
      
      if (!sessionData) {
        console.log('📭 Nenhuma sessão encontrada');
        return null;
      }

      const session: StoredUserSession = JSON.parse(sessionData);
      
      // Verificar se a sessão expirou
      if (Date.now() > session.expiresAt) {
        console.log('⏰ Sessão expirada, removendo...');
        await this.clearUserSession();
        return null;
      }

      console.log('✅ Sessão carregada:', {
        uid: session.user.uid,
        keepLoggedIn: session.keepLoggedIn,
        expiresAt: new Date(session.expiresAt).toISOString(),
      });

      return session;
    } catch (error) {
      console.error('❌ Erro ao carregar sessão:', error);
      // Em caso de erro, limpar dados corrompidos
      await this.clearUserSession();
      return null;
    }
  }

  /**
   * Verifica se existe uma sessão válida
   */
  static async hasValidSession(): Promise<boolean> {
    try {
      const session = await this.loadUserSession();
      return session !== null;
    } catch (error) {
      console.error('❌ Erro ao verificar sessão:', error);
      return false;
    }
  }

  /**
   * Verifica se a sessão está expirada
   */
  static async isSessionExpired(): Promise<boolean> {
    try {
      const session = await this.loadUserSession();
      if (!session) return true;
      
      return Date.now() > session.expiresAt;
    } catch (error) {
      console.error('❌ Erro ao verificar expiração:', error);
      return true;
    }
  }

  /**
   * Renova a sessão (estende o tempo de expiração)
   */
  static async refreshSession(): Promise<void> {
    try {
      const session = await this.loadUserSession();
      if (!session) {
        throw new Error('Nenhuma sessão para renovar');
      }

      // Criar nova sessão com tempo estendido
      const newSession: StoredUserSession = {
        ...session,
        loginTimestamp: Date.now(),
        expiresAt: Date.now() + (session.keepLoggedIn ? SESSION_DURATION.KEEP_LOGGED_IN : SESSION_DURATION.DEFAULT),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(newSession));
      
      console.log('🔄 Sessão renovada:', {
        uid: session.user.uid,
        newExpiresAt: new Date(newSession.expiresAt).toISOString(),
      });
    } catch (error) {
      console.error('❌ Erro ao renovar sessão:', error);
      throw error;
    }
  }

  /**
   * Limpa a sessão do usuário
   */
  static async clearUserSession(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_SESSION,
        STORAGE_KEYS.KEEP_LOGGED_IN,
      ]);
      
      console.log('🗑️ Sessão limpa com sucesso');
    } catch (error) {
      console.error('❌ Erro ao limpar sessão:', error);
      throw new Error('Falha ao limpar sessão do usuário');
    }
  }

  /**
   * Obtém a preferência "manter logado"
   */
  static async getKeepLoggedInPreference(): Promise<boolean> {
    try {
      const preference = await AsyncStorage.getItem(STORAGE_KEYS.KEEP_LOGGED_IN);
      return preference ? JSON.parse(preference) : false;
    } catch (error) {
      console.error('❌ Erro ao obter preferência:', error);
      return false;
    }
  }

  /**
   * Salva a preferência "manter logado"
   */
  static async saveKeepLoggedInPreference(keepLoggedIn: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.KEEP_LOGGED_IN, JSON.stringify(keepLoggedIn));
      console.log('💾 Preferência salva:', keepLoggedIn);
    } catch (error) {
      console.error('❌ Erro ao salvar preferência:', error);
      throw new Error('Falha ao salvar preferência');
    }
  }

  /**
   * Converte StoredUserSession para User
   */
  static convertToUser(session: StoredUserSession): User {
    return {
      uid: session.user.uid,
      email: session.user.email,
      displayName: session.user.displayName,
      photoURL: session.user.photoURL,
      createdAt: session.user.createdAt,
    };
  }

  /**
   * Obtém informações sobre a sessão atual
   */
  static async getSessionInfo(): Promise<{
    hasSession: boolean;
    isExpired: boolean;
    keepLoggedIn: boolean;
    expiresAt?: Date;
    timeRemaining?: number;
  }> {
    try {
      const session = await this.loadUserSession();
      const keepLoggedIn = await this.getKeepLoggedInPreference();
      
      if (!session) {
        return {
          hasSession: false,
          isExpired: true,
          keepLoggedIn,
        };
      }

      const isExpired = Date.now() > session.expiresAt;
      const timeRemaining = isExpired ? 0 : session.expiresAt - Date.now();

      return {
        hasSession: true,
        isExpired,
        keepLoggedIn: session.keepLoggedIn,
        expiresAt: new Date(session.expiresAt),
        timeRemaining,
      };
    } catch (error) {
      console.error('❌ Erro ao obter informações da sessão:', error);
      return {
        hasSession: false,
        isExpired: true,
        keepLoggedIn: false,
      };
    }
  }
}
