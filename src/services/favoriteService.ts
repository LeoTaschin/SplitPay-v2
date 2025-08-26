import { favoriteCacheService } from './favoriteCacheService';
import { favoriteSyncService } from './favoriteSyncService';
import { FavoriteServiceResponse } from '../types';

// Debounce utility
class Debouncer {
  private timeoutId: NodeJS.Timeout | null = null;
  private readonly delay: number;

  constructor(delay: number = 300) {
    this.delay = delay;
  }

  debounce<T extends (...args: any[]) => any>(func: T): (...args: Parameters<T>) => void {
    return (...args: Parameters<T>) => {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }
      this.timeoutId = setTimeout(() => func(...args), this.delay);
    };
  }

  cancel(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

class FavoriteService {
  private debouncer = new Debouncer(300);
  private operationQueue: Set<string> = new Set();

  /**
   * Adicionar aos favoritos
   */
  async addToFavorites(friendId: string): Promise<FavoriteServiceResponse> {
    // Evitar operações duplicadas
    if (this.operationQueue.has(friendId)) {
      console.log(`⏳ FavoriteService: Operação já em andamento para ${friendId}`);
      return {
        success: false,
        error: 'Operação já em andamento'
      };
    }

    this.operationQueue.add(friendId);
    try {
      console.log(`⭐ FavoriteService: Adicionando favorito - ${friendId}`);

      // 1. Salvar no Firebase primeiro
      await favoriteSyncService.addToFirebase(friendId);

      // 2. Atualizar cache local
      const currentFavorites = await this.getFavorites();
      const newFavorites = [...currentFavorites, friendId];
      await favoriteCacheService.saveToCache(newFavorites);

      console.log('✅ FavoriteService: Favorito adicionado com sucesso');
      
      return {
        success: true,
        data: newFavorites
      };
    } catch (error) {
      console.error('❌ FavoriteService: Erro ao adicionar favorito:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    } finally {
      this.operationQueue.delete(friendId);
    }
  }

  /**
   * Remover dos favoritos
   */
  async removeFromFavorites(friendId: string): Promise<FavoriteServiceResponse> {
    // Evitar operações duplicadas
    if (this.operationQueue.has(friendId)) {
      console.log(`⏳ FavoriteService: Operação já em andamento para ${friendId}`);
      return {
        success: false,
        error: 'Operação já em andamento'
      };
    }

    this.operationQueue.add(friendId);
    
    try {
      console.log(`⭐ FavoriteService: Removendo favorito - ${friendId}`);

      // 1. Remover do Firebase
      await favoriteSyncService.removeFromFirebase(friendId);

      // 2. Atualizar cache local
      const currentFavorites = await this.getFavorites();
      const newFavorites = currentFavorites.filter(id => id !== friendId);
      await favoriteCacheService.saveToCache(newFavorites);

      console.log('✅ FavoriteService: Favorito removido com sucesso');
      
      return {
        success: true,
        data: newFavorites
      };
    } catch (error) {
      console.error('❌ FavoriteService: Erro ao remover favorito:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    } finally {
      this.operationQueue.delete(friendId);
    }
  }

  /**
   * Obter lista de favoritos (cache + sync)
   */
  async getFavorites(): Promise<string[]> {
    try {
      // 1. Tentar carregar do cache primeiro (rápido)
      const cachedFavorites = await favoriteCacheService.loadFromCache();
      
      if (cachedFavorites) {
        console.log('⚡ FavoriteService: Favoritos carregados do cache');
        return cachedFavorites;
      }

      // 2. Se não tem cache, sincronizar com Firebase
      console.log('🔄 FavoriteService: Cache vazio, sincronizando...');
      return await favoriteSyncService.syncWithFirebase();
    } catch (error) {
      console.error('❌ FavoriteService: Erro ao obter favoritos:', error);
      return [];
    }
  }

  /**
   * Verificar se é favorito
   */
  async isFavorite(friendId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      return favorites.includes(friendId);
    } catch (error) {
      console.error('❌ FavoriteService: Erro ao verificar favorito:', error);
      return false;
    }
  }

  /**
   * Toggle favorito (adicionar se não existe, remover se existe)
   */
  async toggleFavorite(friendId: string): Promise<FavoriteServiceResponse> {
    try {
      const isCurrentlyFavorite = await this.isFavorite(friendId);
      
      if (isCurrentlyFavorite) {
        return await this.removeFromFavorites(friendId);
      } else {
        return await this.addToFavorites(friendId);
      }
    } catch (error) {
      console.error('❌ FavoriteService: Erro ao fazer toggle do favorito:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Reordenar favoritos
   */
  async reorderFavorites(friendIds: string[]): Promise<FavoriteServiceResponse> {
    try {
      console.log('🔄 FavoriteService: Reordenando favoritos');

      // 1. Atualizar cache local
      await favoriteCacheService.saveToCache(friendIds);

      // 2. Atualizar Firebase (opcional - pode ser feito em background)
      // Por enquanto, vamos apenas atualizar o cache
      // TODO: Implementar reordenação no Firebase se necessário

      console.log('✅ FavoriteService: Favoritos reordenados com sucesso');
      
      return {
        success: true,
        data: friendIds
      };
    } catch (error) {
      console.error('❌ FavoriteService: Erro ao reordenar favoritos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Sincronização manual
   */
  async forceSync(): Promise<FavoriteServiceResponse> {
    try {
      console.log('🔄 FavoriteService: Forçando sincronização');
      
      const favorites = await favoriteSyncService.syncWithFirebase();
      
      return {
        success: true,
        data: favorites
      };
    } catch (error) {
      console.error('❌ FavoriteService: Erro na sincronização forçada:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Limpar cache local
   */
  async clearCache(): Promise<void> {
    try {
      await favoriteCacheService.clearCache();
      console.log('🗑️ FavoriteService: Cache limpo');
    } catch (error) {
      console.error('❌ FavoriteService: Erro ao limpar cache:', error);
    }
  }

  /**
   * Verificar se cache é válido
   */
  async hasValidCache(): Promise<boolean> {
    try {
      return await favoriteCacheService.hasValidCache();
    } catch (error) {
      console.error('❌ FavoriteService: Erro ao verificar cache:', error);
      return false;
    }
  }

  /**
   * Cache warming (pré-carregar dados)
   */
  async warmCache(): Promise<void> {
    try {
      console.log('🔥 FavoriteService: Iniciando cache warming...');
      
      // Verificar se já tem cache válido
      const hasValidCache = await favoriteCacheService.hasValidCache();
      if (hasValidCache) {
        console.log('✅ FavoriteService: Cache já está quente');
        return;
      }

      // Carregar dados do Firebase e salvar no cache
      const favorites = await favoriteSyncService.syncWithFirebase();
      await favoriteCacheService.saveToCache(favorites);
      
      console.log('✅ FavoriteService: Cache warming concluído');
    } catch (error) {
      console.error('❌ FavoriteService: Erro no cache warming:', error);
    }
  }

  /**
   * Obter estatísticas dos favoritos
   */
  async getStats(): Promise<{
    totalFavorites: number;
    hasCache: boolean;
    cacheAge: number;
    lastSync: Date | null;
    cacheStats: any;
  }> {
    try {
      const favorites = await this.getFavorites();
      const hasCache = await favoriteCacheService.hasCache();
      const cacheAge = await favoriteCacheService.getCacheAge();
      const cacheStats = await favoriteCacheService.getCacheStats();
      
      return {
        totalFavorites: favorites.length,
        hasCache,
        cacheAge,
        lastSync: hasCache ? new Date(Date.now() - cacheAge) : null,
        cacheStats
      };
    } catch (error) {
      console.error('❌ FavoriteService: Erro ao obter estatísticas:', error);
      return {
        totalFavorites: 0,
        hasCache: false,
        cacheAge: Infinity,
        lastSync: null,
        cacheStats: {
          exists: false,
          age: 0,
          accessCount: 0,
          isValid: false
        }
      };
    }
  }
}

export const favoriteService = new FavoriteService();
