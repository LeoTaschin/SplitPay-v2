import { doc, getDoc, updateDoc, onSnapshot, serverTimestamp, deleteField } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { favoriteCacheService } from './favoriteCacheService';

class FavoriteSyncService {
  private syncInProgress = false;
  private lastSyncTime = 0;
  private readonly SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutos

  /**
   * Sincronizar favoritos com Firebase
   */
  async syncWithFirebase(): Promise<string[]> {
    if (this.syncInProgress) {
      console.log('⏳ FavoriteSync: Sincronização já em andamento');
      return [];
    }

    this.syncInProgress = true;
    
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      console.log('🔄 FavoriteSync: Iniciando sincronização com Firebase');
      
      // Buscar favoritos do Firebase
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        console.log('📭 FavoriteSync: Usuário não encontrado no Firebase');
        return [];
      }

      const firebaseData = userDoc.data();
      const firebaseFavorites = firebaseData?.favorites || {};
      
      // Converter para array de IDs
      const favoriteIds = Object.keys(firebaseFavorites);
      
      // Salvar no cache local
      await favoriteCacheService.saveToCache(favoriteIds);
      
      this.lastSyncTime = Date.now();
      console.log(`✅ FavoriteSync: Sincronização concluída - ${favoriteIds.length} favoritos`);
      
      return favoriteIds;
    } catch (error) {
      console.error('❌ FavoriteSync: Erro na sincronização:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Escutar mudanças em tempo real
   */
  listenToChanges(callback: (favorites: string[]) => void): () => void {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.log('⚠️ FavoriteSync: Usuário não autenticado, listener não iniciado');
      return () => {};
    }

    console.log('👂 FavoriteSync: Iniciando listener de mudanças');
    
    const unsubscribe = onSnapshot(
      doc(db, 'users', userId),
      (doc) => {
        if (!doc.exists()) {
          console.log('📭 FavoriteSync: Documento do usuário não encontrado');
          return;
        }

        const data = doc.data();
        const favorites = Object.keys(data?.favorites || {});
        
        // Atualizar cache local
        favoriteCacheService.saveToCache(favorites);
        
        // Notificar componente
        callback(favorites);
        
        console.log(`📡 FavoriteSync: Mudança detectada - ${favorites.length} favoritos`);
      },
      (error) => {
        console.error('❌ FavoriteSync: Erro no listener:', error);
      }
    );

    return unsubscribe;
  }

  /**
   * Verificar se precisa sincronizar
   */
  shouldSync(): boolean {
    const timeSinceLastSync = Date.now() - this.lastSyncTime;
    return timeSinceLastSync > this.SYNC_INTERVAL;
  }

  /**
   * Forçar sincronização
   */
  async forceSync(): Promise<void> {
    console.log('🔄 FavoriteSync: Forçando sincronização');
    await this.syncWithFirebase();
  }

  /**
   * Adicionar favorito no Firebase
   */
  async addToFirebase(friendId: string): Promise<void> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      console.log(`⭐ FavoriteSync: Adicionando favorito no Firebase - ${friendId}`);

      // Obter próximo número de ordem
      const currentFavorites = await this.getCurrentFavorites();
      const nextOrder = currentFavorites.length + 1;

      await updateDoc(doc(db, 'users', userId), {
        [`favorites.${friendId}`]: {
          addedAt: serverTimestamp(),
          order: nextOrder,
          lastSynced: serverTimestamp()
        }
      });

      console.log('✅ FavoriteSync: Favorito adicionado no Firebase');
    } catch (error) {
      console.error('❌ FavoriteSync: Erro ao adicionar favorito no Firebase:', error);
      throw error;
    }
  }

  /**
   * Remover favorito do Firebase
   */
  async removeFromFirebase(friendId: string): Promise<void> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      console.log(`⭐ FavoriteSync: Removendo favorito do Firebase - ${friendId}`);

      await updateDoc(doc(db, 'users', userId), {
        [`favorites.${friendId}`]: deleteField()
      });

      console.log('✅ FavoriteSync: Favorito removido do Firebase');
    } catch (error) {
      console.error('❌ FavoriteSync: Erro ao remover favorito do Firebase:', error);
      throw error;
    }
  }

  /**
   * Obter favoritos atuais do Firebase
   */
  private async getCurrentFavorites(): Promise<string[]> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return [];

      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return [];

      const firebaseData = userDoc.data();
      return Object.keys(firebaseData?.favorites || {});
    } catch (error) {
      console.error('❌ FavoriteSync: Erro ao obter favoritos atuais:', error);
      return [];
    }
  }

  /**
   * Verificar se usuário está autenticado
   */
  private isAuthenticated(): boolean {
    return auth.currentUser !== null;
  }
}

export const favoriteSyncService = new FavoriteSyncService();
