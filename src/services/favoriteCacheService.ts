import AsyncStorage from '@react-native-async-storage/async-storage';
import { FavoriteCache } from '../types';

class FavoriteCacheService {
  private readonly CACHE_KEY = 'user_favorites_cache';
  private readonly CACHE_VERSION = '1.0';
  private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 horas
  private readonly CACHE_ACCESS_THRESHOLD = 5; // Número de acessos para renovar cache
  private cacheAccessCount = 0;

  /**
   * Salvar favoritos no cache local
   */
  async saveToCache(favorites: string[]): Promise<void> {
    try {
      const cacheData: FavoriteCache = {
        favorites,
        lastSync: new Date(),
        version: this.CACHE_VERSION
      };
      
      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
      console.log('💾 FavoriteCache: Favoritos salvos localmente');
    } catch (error) {
      console.error('❌ FavoriteCache: Erro ao salvar cache:', error);
      throw error;
    }
  }

  /**
   * Carregar favoritos do cache local
   */
  async loadFromCache(): Promise<string[] | null> {
    try {
      const cached = await AsyncStorage.getItem(this.CACHE_KEY);
      if (!cached) {
        console.log('📭 FavoriteCache: Cache não encontrado');
        return null;
      }

      const cacheData: FavoriteCache = JSON.parse(cached);
      
      // Verificar se cache é válido (versão e expiração)
      if (cacheData.version !== this.CACHE_VERSION) {
        console.log('🔄 FavoriteCache: Versão do cache desatualizada');
        await this.clearCache();
        return null;
      }

      const cacheAge = Date.now() - new Date(cacheData.lastSync).getTime();
      const isValid = cacheAge < this.CACHE_EXPIRY;

      if (!isValid) {
        console.log('⏰ FavoriteCache: Cache expirado, removendo...');
        await this.clearCache();
        return null;
      }

      // Incrementar contador de acesso
      this.cacheAccessCount++;
      
      // Se cache foi acessado muitas vezes, renovar automaticamente
      if (this.cacheAccessCount >= this.CACHE_ACCESS_THRESHOLD) {
        console.log('🔄 FavoriteCache: Cache muito acessado, renovando...');
        this.cacheAccessCount = 0;
        await this.renewCache(cacheData.favorites);
      }

      console.log('⚡ FavoriteCache: Favoritos carregados do cache');
      return cacheData.favorites;
    } catch (error) {
      console.error('❌ FavoriteCache: Erro ao carregar cache:', error);
      await this.clearCache();
      return null;
    }
  }

  /**
   * Limpar cache local
   */
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.CACHE_KEY);
      console.log('🗑️ FavoriteCache: Cache limpo');
    } catch (error) {
      console.error('❌ FavoriteCache: Erro ao limpar cache:', error);
    }
  }

  /**
   * Verificar se cache existe e é válido
   */
  async hasValidCache(): Promise<boolean> {
    try {
      const cached = await AsyncStorage.getItem(this.CACHE_KEY);
      if (!cached) return false;

      const cacheData: FavoriteCache = JSON.parse(cached);
      
      // Verificar versão
      if (cacheData.version !== this.CACHE_VERSION) return false;

      // Verificar expiração
      const cacheAge = Date.now() - new Date(cacheData.lastSync).getTime();
      return cacheAge < this.CACHE_EXPIRY;
    } catch (error) {
      console.error('❌ FavoriteCache: Erro ao verificar cache:', error);
      return false;
    }
  }

  /**
   * Obter idade do cache em milissegundos
   */
  async getCacheAge(): Promise<number> {
    try {
      const cached = await AsyncStorage.getItem(this.CACHE_KEY);
      if (!cached) return Infinity;

      const cacheData: FavoriteCache = JSON.parse(cached);
      return Date.now() - new Date(cacheData.lastSync).getTime();
    } catch (error) {
      console.error('❌ FavoriteCache: Erro ao obter idade do cache:', error);
      return Infinity;
    }
  }

  /**
   * Verificar se cache existe
   */
  async hasCache(): Promise<boolean> {
    try {
      const cached = await AsyncStorage.getItem(this.CACHE_KEY);
      return cached !== null;
    } catch (error) {
      console.error('❌ FavoriteCache: Erro ao verificar existência do cache:', error);
      return false;
    }
  }

  /**
   * Renovar cache (atualizar timestamp sem mudar dados)
   */
  private async renewCache(favorites: string[]): Promise<void> {
    try {
      await this.saveToCache(favorites);
      console.log('🔄 FavoriteCache: Cache renovado com sucesso');
    } catch (error) {
      console.error('❌ FavoriteCache: Erro ao renovar cache:', error);
    }
  }

  /**
   * Obter estatísticas do cache
   */
  async getCacheStats(): Promise<{
    exists: boolean;
    age: number;
    accessCount: number;
    isValid: boolean;
  }> {
    try {
      const exists = await this.hasCache();
      if (!exists) {
        return {
          exists: false,
          age: 0,
          accessCount: this.cacheAccessCount,
          isValid: false
        };
      }

      const age = await this.getCacheAge();
      const isValid = age < this.CACHE_EXPIRY;

      return {
        exists: true,
        age,
        accessCount: this.cacheAccessCount,
        isValid
      };
    } catch (error) {
      console.error('❌ FavoriteCache: Erro ao obter estatísticas:', error);
      return {
        exists: false,
        age: 0,
        accessCount: 0,
        isValid: false
      };
    }
  }
}

export const favoriteCacheService = new FavoriteCacheService();
