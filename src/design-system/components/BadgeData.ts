import { Badge as BadgeType } from '../../types';

// Função para gerar badges com traduções
export function getMockBadges(t: (key: string) => string): BadgeType[] {
  // Badges padrão
  const standardBadges: BadgeType[] = [
    {
      id: 'loyalty_1',
      name: t('badges.items.loyalty_1.name'),
      description: t('badges.items.loyalty_1.description'),
      icon: 'person-add',
      rank: 'bronze',
      category: 'social',
      isUnlocked: true,
      unlockCondition: 'Fazer primeiro login',
      points: 10,
      createdAt: new Date(),
    },
    {
      id: 'loyalty_2',
      name: t('badges.items.loyalty_2.name'),
      description: t('badges.items.loyalty_2.description'),
      icon: 'calendar',
      rank: 'bronze',
      category: 'achievement',
      isUnlocked: false,
      unlockCondition: 'Usar o app por 7 dias consecutivos',
      points: 25,
      createdAt: new Date(),
    },
    {
      id: 'social_1',
      name: t('badges.items.social_1.name'),
      description: t('badges.items.social_1.description'),
      icon: 'people',
      rank: 'bronze',
      category: 'social',
      isUnlocked: false,
      unlockCondition: 'Adicionar primeiro amigo',
      points: 20,
      createdAt: new Date(),
    },
    {
      id: 'financial_1',
      name: t('badges.items.financial_1.name'),
      description: t('badges.items.financial_1.description'),
      icon: 'wallet',
      rank: 'bronze',
      category: 'financial',
      isUnlocked: false,
      unlockCondition: 'Criar primeira dívida',
      points: 15,
      createdAt: new Date(),
    },
  ];
  
  // Adicionar badges de eventos (não padronizados)
  const eventBadges: BadgeType[] = [
    {
      id: 'events_1',
      name: t('badges.items.events_1.name'),
      description: t('badges.items.events_1.description'),
      icon: 'gift',
      rank: 'bronze',
      category: 'events',
      isUnlocked: true,
      unlockCondition: 'Usar o app no dia 25/12/2023',
      points: 50,
      createdAt: new Date('2023-12-25'),
    },
    {
      id: 'events_2',
      name: t('badges.items.events_2.name'),
      description: t('badges.items.events_2.description'),
      icon: 'sparkles',
      rank: 'silver',
      category: 'events',
      isUnlocked: true,
      unlockCondition: 'Usar o app no dia 01/01/2024',
      points: 75,
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 'events_3',
      name: t('badges.items.events_3.name'),
      description: t('badges.items.events_3.description'),
      icon: 'skull',
      rank: 'gold',
      category: 'events',
      isUnlocked: false,
      unlockCondition: 'Usar o app no dia 31/10/2024',
      points: 150,
      createdAt: new Date('2024-10-31'),
    },
    {
      id: 'events_4',
      name: t('badges.items.events_4.name'),
      description: t('badges.items.events_4.description'),
      icon: 'gift',
      rank: 'platinum',
      category: 'events',
      isUnlocked: false,
      unlockCondition: 'Usar o app no dia 25/12/2024',
      points: 300,
      createdAt: new Date('2024-12-25'),
    },
    {
      id: 'events_5',
      name: t('badges.items.events_5.name'),
      description: t('badges.items.events_5.description'),
      icon: 'flag',
      rank: 'diamond',
      category: 'events',
      isUnlocked: true,
      unlockCondition: 'Ser o primeiro usuário da cidade',
      points: 1000,
      createdAt: new Date('2024-01-01'),
    },
  ];

  return [...standardBadges, ...eventBadges];
}

// Dados mock para compatibilidade (usar apenas se necessário)
export const mockBadges: BadgeType[] = getMockBadges((key: string) => {
  // Fallback para traduções - retorna a chave se não encontrar tradução
  return key;
});
