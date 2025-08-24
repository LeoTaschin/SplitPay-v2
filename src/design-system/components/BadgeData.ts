import { Badge } from './BadgeSystem';
import { generateBadges, defaultBadgeConfigs, eventBadgeConfigs } from '../../utils/badgeUtils';

// Função para gerar badges com traduções
export function getMockBadges(t: (key: string) => string): Badge[] {
  // Gerar badges padronizados (fidelidade, social, valores)
  const standardBadges = generateBadges(t, defaultBadgeConfigs);
  
  // Adicionar badges de eventos (não padronizados)
  const eventBadges: Badge[] = [
    {
      id: 'events_1',
      name: 'Natalino 2023',
      description: 'Ativo no SplitPay durante o Natal 2023',
      icon: 'gift',
      rank: 'bronze',
      category: 'events',
      isUnlocked: true,
      unlockedAt: new Date('2023-12-25'),
      criteria: 'Usar o app no dia 25/12/2023',
      rarity: 'Evento (40% dos usuários)',
    },
    {
      id: 'events_2',
      name: 'Ano Novo 2024',
      description: 'Começou 2024 com SplitPay',
      icon: 'sparkles',
      rank: 'silver',
      category: 'events',
      isUnlocked: true,
      unlockedAt: new Date('2024-01-01'),
      criteria: 'Usar o app no dia 01/01/2024',
      rarity: 'Evento (35% dos usuários)',
    },
    {
      id: 'events_3',
      name: 'Halloween 2024',
      description: 'Terror financeiro no Halloween 2024',
      icon: 'skull',
      rank: 'gold',
      category: 'events',
      isUnlocked: false,
      progress: 0,
      maxProgress: 1,
      criteria: 'Usar o app no dia 31/10/2024',
      rarity: 'Evento (25% dos usuários)',
    },
    {
      id: 'events_4',
      name: 'Natalino 2024',
      description: 'Natal 2024 com SplitPay',
      icon: 'gift',
      rank: 'platinum',
      category: 'events',
      isUnlocked: false,
      progress: 0,
      maxProgress: 1,
      criteria: 'Usar o app no dia 25/12/2024',
      rarity: 'Evento (30% dos usuários)',
    },
    {
      id: 'events_5',
      name: 'Pioneiro',
      description: 'Primeiro usuário da cidade no SplitPay',
      icon: 'flag',
      rank: 'diamond',
      category: 'events',
      isUnlocked: true,
      unlockedAt: new Date('2024-01-01'),
      criteria: 'Ser o primeiro usuário da cidade',
      rarity: 'Lendário (0.01% dos usuários)',
    },
  ];

  return [...standardBadges, ...eventBadges];
}

// Dados mock para compatibilidade (usar apenas se necessário)
export const mockBadges: Badge[] = getMockBadges((key: string) => key);
