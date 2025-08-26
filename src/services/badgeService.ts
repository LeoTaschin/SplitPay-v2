import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Badge, BadgeHistory, UserBadgeProgress, User } from '../types';

class BadgeService {
  private readonly BADGES_COLLECTION = 'badges';
  private readonly USERS_COLLECTION = 'users';
  private readonly BADGE_HISTORY_COLLECTION = 'badgeHistory';

  /**
   * Carregar todos os badges disponíveis
   */
  async getAllBadges(): Promise<Badge[]> {
    try {
      const badgesRef = collection(db, this.BADGES_COLLECTION);
      const badgesSnapshot = await getDocs(badgesRef);
      
      const badges: Badge[] = [];
      badgesSnapshot.forEach((doc) => {
        const data = doc.data();
        badges.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Badge);
      });

      return badges.sort((a, b) => a.points - b.points);
    } catch (error) {
      console.error('Erro ao carregar badges:', error);
      throw error;
    }
  }

  /**
   * Carregar badges de um usuário específico
   */
  async getUserBadges(userId: string): Promise<UserBadgeProgress | null> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data() as User;
      
      // Carregar badges desbloqueados
      const unlockedBadges = userData.selectedBadges || [];
      
      // Carregar histórico de conquistas
      const historyQuery = query(
        collection(db, this.BADGE_HISTORY_COLLECTION),
        where('userId', '==', userId),
        orderBy('unlockedAt', 'desc')
      );
      
      const historySnapshot = await getDocs(historyQuery);
      const achievements: BadgeHistory[] = [];
      
      historySnapshot.forEach((doc) => {
        const data = doc.data();
        achievements.push({
          id: doc.id,
          ...data,
          unlockedAt: data.unlockedAt?.toDate() || new Date(),
        } as BadgeHistory);
      });

      return {
        userId,
        totalPoints: userData.totalPoints || 0,
        rank: userData.rank || 'bronze',
        unlockedBadges,
        selectedBadges: userData.selectedBadges || [],
        achievements,
      };
    } catch (error) {
      console.error('Erro ao carregar badges do usuário:', error);
      throw error;
    }
  }

  /**
   * Salvar badges selecionados pelo usuário
   */
  async saveSelectedBadges(userId: string, selectedBadges: Badge[]): Promise<void> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      
      // Filtrar campos undefined e criar objeto limpo
      const cleanBadges = selectedBadges.map(badge => {
        const cleanBadge: any = {};
        
        if (badge.id !== undefined) cleanBadge.id = badge.id;
        if (badge.name !== undefined) cleanBadge.name = badge.name;
        if (badge.description !== undefined) cleanBadge.description = badge.description;
        if (badge.icon !== undefined) cleanBadge.icon = badge.icon;
        if (badge.rank !== undefined) cleanBadge.rank = badge.rank;
        if (badge.category !== undefined) cleanBadge.category = badge.category;
        if (badge.isUnlocked !== undefined) cleanBadge.isUnlocked = badge.isUnlocked;
        if (badge.points !== undefined) cleanBadge.points = badge.points;
        
        return cleanBadge;
      });

      await updateDoc(userRef, {
        selectedBadges: cleanBadges,
        updatedAt: serverTimestamp(),
      });

      console.log('Badges selecionados salvos com sucesso');
    } catch (error) {
      console.error('Erro ao salvar badges selecionados:', error);
      throw error;
    }
  }

  /**
   * Desbloquear um badge para o usuário
   */
  async unlockBadge(userId: string, badge: Badge, unlockedBy: 'achievement' | 'purchase' | 'gift' = 'achievement'): Promise<void> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error('Usuário não encontrado');
      }

      const userData = userDoc.data() as User;
      const currentPoints = userData.totalPoints || 0;
      const newPoints = currentPoints + badge.points;
      const newRank = this.calculateRank(newPoints);

      // Atualizar usuário com novos pontos e rank
      await updateDoc(userRef, {
        totalPoints: newPoints,
        rank: newRank,
        updatedAt: serverTimestamp(),
      });

      // Adicionar ao histórico de conquistas
      await addDoc(collection(db, this.BADGE_HISTORY_COLLECTION), {
        userId,
        badgeId: badge.id,
        unlockedAt: serverTimestamp(),
        unlockedBy,
        pointsEarned: badge.points,
      });

      console.log(`Badge "${badge.name}" desbloqueado para o usuário ${userId}`);
    } catch (error) {
      console.error('Erro ao desbloquear badge:', error);
      throw error;
    }
  }

  /**
   * Calcular rank baseado nos pontos
   */
  private calculateRank(points: number): 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' {
    if (points >= 10000) return 'diamond';
    if (points >= 5000) return 'platinum';
    if (points >= 2000) return 'gold';
    if (points >= 500) return 'silver';
    return 'bronze';
  }

  /**
   * Verificar se um badge já foi desbloqueado
   */
  async isBadgeUnlocked(userId: string, badgeId: string): Promise<boolean> {
    try {
      const historyQuery = query(
        collection(db, this.BADGE_HISTORY_COLLECTION),
        where('userId', '==', userId),
        where('badgeId', '==', badgeId)
      );
      
      const historySnapshot = await getDocs(historyQuery);
      return !historySnapshot.empty;
    } catch (error) {
      console.error('Erro ao verificar se badge foi desbloqueado:', error);
      return false;
    }
  }

  /**
   * Obter progresso de badges de um usuário
   */
  async getBadgeProgress(userId: string): Promise<{
    totalBadges: number;
    unlockedBadges: number;
    totalPoints: number;
    rank: string;
    nextRank: string;
    pointsToNextRank: number;
  }> {
    try {
      const userProgress = await this.getUserBadges(userId);
      if (!userProgress) {
        return {
          totalBadges: 0,
          unlockedBadges: 0,
          totalPoints: 0,
          rank: 'bronze',
          nextRank: 'silver',
          pointsToNextRank: 500,
        };
      }

      const allBadges = await this.getAllBadges();
      const totalBadges = allBadges.length;
      const unlockedBadges = userProgress.achievements.length;
      const totalPoints = userProgress.totalPoints;
      const currentRank = userProgress.rank;

      // Calcular próximo rank
      const rankThresholds = {
        bronze: 500,
        silver: 2000,
        gold: 5000,
        platinum: 10000,
        diamond: Infinity,
      };

      const currentThreshold = rankThresholds[currentRank as keyof typeof rankThresholds];
      const nextRank = this.getNextRank(currentRank);
      const nextThreshold = rankThresholds[nextRank as keyof typeof rankThresholds];
      const pointsToNextRank = nextThreshold - totalPoints;

      return {
        totalBadges,
        unlockedBadges,
        totalPoints,
        rank: currentRank,
        nextRank,
        pointsToNextRank: Math.max(0, pointsToNextRank),
      };
    } catch (error) {
      console.error('Erro ao obter progresso de badges:', error);
      throw error;
    }
  }

  /**
   * Obter próximo rank
   */
  private getNextRank(currentRank: string): string {
    const ranks = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
    const currentIndex = ranks.indexOf(currentRank);
    return ranks[Math.min(currentIndex + 1, ranks.length - 1)];
  }

  /**
   * Inicializar badges padrão para um novo usuário
   */
  async initializeUserBadges(userId: string): Promise<void> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      
      await updateDoc(userRef, {
        selectedBadges: [],
        totalPoints: 0,
        rank: 'bronze',
        updatedAt: serverTimestamp(),
      });

      console.log('Badges inicializados para o usuário:', userId);
    } catch (error) {
      console.error('Erro ao inicializar badges do usuário:', error);
      throw error;
    }
  }
}

export const badgeService = new BadgeService();
