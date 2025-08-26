import { useState, useEffect, useCallback } from 'react';
import { favoriteService } from '../services/favoriteService';
import { favoriteSyncService } from '../services/favoriteSyncService';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prefetching, setPrefetching] = useState(false);

  /**
   * Carregar favoritos
   */
  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 useFavorites: Carregando favoritos...');
      const favoriteIds = await favoriteService.getFavorites();
      setFavorites(favoriteIds);
      
      console.log(`✅ useFavorites: ${favoriteIds.length} favoritos carregados`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar favoritos';
      setError(errorMessage);
      console.error('❌ useFavorites: Erro ao carregar favoritos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Adicionar aos favoritos
   */
  const addToFavorites = useCallback(async (friendId: string) => {
    try {
      setError(null);
      
      console.log(`⭐ useFavorites: Adicionando favorito - ${friendId}`);
      const result = await favoriteService.addToFavorites(friendId);
      
      if (result.success) {
        setFavorites(result.data || []);
        console.log('✅ useFavorites: Favorito adicionado com sucesso');
        return true;
      } else {
        setError(result.error || 'Erro ao adicionar favorito');
        console.error('❌ useFavorites: Erro ao adicionar favorito:', result.error);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar favorito';
      setError(errorMessage);
      console.error('❌ useFavorites: Erro ao adicionar favorito:', err);
      return false;
    }
  }, []);

  /**
   * Remover dos favoritos
   */
  const removeFromFavorites = useCallback(async (friendId: string) => {
    try {
      setError(null);
      
      console.log(`⭐ useFavorites: Removendo favorito - ${friendId}`);
      const result = await favoriteService.removeFromFavorites(friendId);
      
      if (result.success) {
        setFavorites(result.data || []);
        console.log('✅ useFavorites: Favorito removido com sucesso');
        return true;
      } else {
        setError(result.error || 'Erro ao remover favorito');
        console.error('❌ useFavorites: Erro ao remover favorito:', result.error);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover favorito';
      setError(errorMessage);
      console.error('❌ useFavorites: Erro ao remover favorito:', err);
      return false;
    }
  }, []);

  /**
   * Verificar se é favorito
   */
  const isFavorite = useCallback((friendId: string) => {
    return favorites.includes(friendId);
  }, [favorites]);

  /**
   * Toggle favorito (adicionar se não existe, remover se existe)
   */
  const toggleFavorite = useCallback(async (friendId: string) => {
    try {
      setError(null);
      
      console.log(`🔄 useFavorites: Toggle favorito - ${friendId}`);
      const result = await favoriteService.toggleFavorite(friendId);
      
      if (result.success) {
        setFavorites(result.data || []);
        console.log('✅ useFavorites: Toggle realizado com sucesso');
        return true;
      } else {
        setError(result.error || 'Erro ao alterar favorito');
        console.error('❌ useFavorites: Erro no toggle:', result.error);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao alterar favorito';
      setError(errorMessage);
      console.error('❌ useFavorites: Erro no toggle:', err);
      return false;
    }
  }, []);

  /**
   * Refresh favoritos
   */
  const refresh = useCallback(async () => {
    await loadFavorites();
  }, [loadFavorites]);

  /**
   * Prefetch favoritos (carregar em background)
   */
  const prefetch = useCallback(async () => {
    if (prefetching || loading) return;
    
    try {
      setPrefetching(true);
      console.log('🔄 useFavorites: Iniciando prefetch...');
      
      const favoriteIds = await favoriteService.getFavorites();
      setFavorites(favoriteIds);
      
      console.log('✅ useFavorites: Prefetch concluído');
    } catch (err) {
      console.error('❌ useFavorites: Erro no prefetch:', err);
    } finally {
      setPrefetching(false);
    }
  }, [prefetching, loading]);

  /**
   * Forçar sincronização
   */
  const forceSync = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('🔄 useFavorites: Forçando sincronização...');
      const result = await favoriteService.forceSync();
      
      if (result.success) {
        setFavorites(result.data || []);
        console.log('✅ useFavorites: Sincronização forçada concluída');
      } else {
        setError(result.error || 'Erro na sincronização');
        console.error('❌ useFavorites: Erro na sincronização:', result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro na sincronização';
      setError(errorMessage);
      console.error('❌ useFavorites: Erro na sincronização:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Limpar erro
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Sincronização em tempo real
   */
  useEffect(() => {
    // Carregar favoritos iniciais
    loadFavorites();

    // Cache warming em background
    const warmCacheInBackground = async () => {
      try {
        await favoriteService.warmCache();
      } catch (error) {
        console.error('❌ useFavorites: Erro no cache warming:', error);
      }
    };

    // Executar cache warming após carregamento inicial
    setTimeout(warmCacheInBackground, 1000);

    // Listener para mudanças em tempo real
    const unsubscribe = favoriteSyncService.listenToChanges((newFavorites) => {
      console.log(`📡 useFavorites: Mudança detectada - ${newFavorites.length} favoritos`);
      setFavorites(newFavorites);
    });

    // Cleanup do listener
    return () => {
      console.log('🧹 useFavorites: Limpando listener');
      unsubscribe();
    };
  }, [loadFavorites]);

  return {
    // Estado
    favorites,
    loading,
    error,
    prefetching,
    
    // Métodos
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    refresh,
    prefetch,
    forceSync,
    clearError,
    
    // Utilitários
    totalFavorites: favorites.length,
    hasFavorites: favorites.length > 0
  };
};
