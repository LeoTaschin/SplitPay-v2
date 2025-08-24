import { Badge } from '../design-system/components/BadgeSystem';

interface BadgeConfig {
  id: string;
  category: 'loyalty' | 'social' | 'events' | 'values';
  rank: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

interface BadgeData {
  nameKey: string;
  descriptionKey: string;
  criteriaKey: string;
  rarityKey: string;
  rarityPercentage: number;
  params: Record<string, string | number>;
}

// Configurações dos badges
const badgeConfigs: Record<string, BadgeData> = {
  // FIDELIDADE
  'loyalty_1': {
    nameKey: 'badges.names.loyalty.1_month',
    descriptionKey: 'badges.descriptions.loyalty.1_month',
    criteriaKey: 'badges.criteria.loyalty',
    rarityKey: 'badges.rarity.common',
    rarityPercentage: 70,
    params: { months: 1, time: '1 mês' }
  },
  'loyalty_2': {
    nameKey: 'badges.names.loyalty.3_months',
    descriptionKey: 'badges.descriptions.loyalty.3_months',
    criteriaKey: 'badges.criteria.loyalty',
    rarityKey: 'badges.rarity.common',
    rarityPercentage: 45,
    params: { months: 3, time: '3 meses' }
  },
  'loyalty_3': {
    nameKey: 'badges.names.loyalty.6_months',
    descriptionKey: 'badges.descriptions.loyalty.6_months',
    criteriaKey: 'badges.criteria.loyalty',
    rarityKey: 'badges.rarity.rare',
    rarityPercentage: 20,
    params: { months: 6, time: '6 meses' }
  },
  'loyalty_4': {
    nameKey: 'badges.names.loyalty.1_year',
    descriptionKey: 'badges.descriptions.loyalty.1_year',
    criteriaKey: 'badges.criteria.loyalty',
    rarityKey: 'badges.rarity.rare',
    rarityPercentage: 8,
    params: { years: 1, time: '1 ano' }
  },
  'loyalty_5': {
    nameKey: 'badges.names.loyalty.2_years',
    descriptionKey: 'badges.descriptions.loyalty.2_years',
    criteriaKey: 'badges.criteria.loyalty',
    rarityKey: 'badges.rarity.very_rare',
    rarityPercentage: 2,
    params: { years: 2, time: '2 anos' }
  },
  'loyalty_6': {
    nameKey: 'badges.names.loyalty.5_years',
    descriptionKey: 'badges.descriptions.loyalty.5_years',
    criteriaKey: 'badges.criteria.loyalty',
    rarityKey: 'badges.rarity.legendary',
    rarityPercentage: 0.1,
    params: { years: 5, time: '5 anos' }
  },

  // SOCIAL
  'social_1': {
    nameKey: 'badges.names.social.5_friends',
    descriptionKey: 'badges.descriptions.social.5_friends',
    criteriaKey: 'badges.criteria.social',
    rarityKey: 'badges.rarity.common',
    rarityPercentage: 60,
    params: { count: 5 }
  },
  'social_2': {
    nameKey: 'badges.names.social.20_friends',
    descriptionKey: 'badges.descriptions.social.20_friends',
    criteriaKey: 'badges.criteria.social',
    rarityKey: 'badges.rarity.common',
    rarityPercentage: 35,
    params: { count: 20 }
  },
  'social_3': {
    nameKey: 'badges.names.social.50_friends',
    descriptionKey: 'badges.descriptions.social.50_friends',
    criteriaKey: 'badges.criteria.social',
    rarityKey: 'badges.rarity.rare',
    rarityPercentage: 15,
    params: { count: 50 }
  },
  'social_4': {
    nameKey: 'badges.names.social.100_friends',
    descriptionKey: 'badges.descriptions.social.100_friends',
    criteriaKey: 'badges.criteria.social',
    rarityKey: 'badges.rarity.very_rare',
    rarityPercentage: 5,
    params: { count: 100 }
  },
  'social_5': {
    nameKey: 'badges.names.social.200_friends',
    descriptionKey: 'badges.descriptions.social.200_friends',
    criteriaKey: 'badges.criteria.social',
    rarityKey: 'badges.rarity.legendary',
    rarityPercentage: 0.5,
    params: { count: 200 }
  },

  // VALORES
  'values_1': {
    nameKey: 'badges.names.values.50_debts',
    descriptionKey: 'badges.descriptions.values.50_debts',
    criteriaKey: 'badges.criteria.values',
    rarityKey: 'badges.rarity.common',
    rarityPercentage: 55,
    params: { count: 50 }
  },
  'values_2': {
    nameKey: 'badges.names.values.100_debts',
    descriptionKey: 'badges.descriptions.values.100_debts',
    criteriaKey: 'badges.criteria.values',
    rarityKey: 'badges.rarity.common',
    rarityPercentage: 30,
    params: { count: 100 }
  },
  'values_3': {
    nameKey: 'badges.names.values.200_debts',
    descriptionKey: 'badges.descriptions.values.200_debts',
    criteriaKey: 'badges.criteria.values',
    rarityKey: 'badges.rarity.rare',
    rarityPercentage: 12,
    params: { count: 200 }
  },
  'values_4': {
    nameKey: 'badges.names.values.500_debts',
    descriptionKey: 'badges.descriptions.values.500_debts',
    criteriaKey: 'badges.criteria.values',
    rarityKey: 'badges.rarity.very_rare',
    rarityPercentage: 3,
    params: { count: 500 }
  },
  'values_5': {
    nameKey: 'badges.names.values.1000_debts',
    descriptionKey: 'badges.descriptions.values.1000_debts',
    criteriaKey: 'badges.criteria.values',
    rarityKey: 'badges.rarity.legendary',
    rarityPercentage: 0.5,
    params: { count: 1000 }
  },
  'values_6': {
    nameKey: 'badges.names.values.3000_debts',
    descriptionKey: 'badges.descriptions.values.3000_debts',
    criteriaKey: 'badges.criteria.values',
    rarityKey: 'badges.rarity.legendary',
    rarityPercentage: 0.1,
    params: { count: 3000 }
  },
};

// Função para substituir placeholders em strings
function replacePlaceholders(text: string, params: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key]?.toString() || match;
  });
}

// Função para traduzir uma chave
function translateKey(t: (key: string) => string, key: string, params?: Record<string, string | number>): string {
  const translation = t(key);
  return params ? replacePlaceholders(translation, params) : translation;
}

// Função para gerar badges com traduções
export function generateBadges(t: (key: string) => string, configs: BadgeConfig[]): Badge[] {
  return configs.map(config => {
    const badgeData = badgeConfigs[config.id];
    
    if (!badgeData) {
      throw new Error(`Badge configuration not found for ID: ${config.id}`);
    }

    return {
      id: config.id,
      name: translateKey(t, badgeData.nameKey),
      description: translateKey(t, badgeData.descriptionKey, badgeData.params),
      icon: config.icon,
      rank: config.rank,
      category: config.category,
      isUnlocked: config.isUnlocked,
      unlockedAt: config.unlockedAt,
      progress: config.progress,
      maxProgress: config.maxProgress,
      criteria: translateKey(t, badgeData.criteriaKey, badgeData.params),
      rarity: translateKey(t, badgeData.rarityKey, { percentage: badgeData.rarityPercentage }),
    };
  });
}

// Configurações padrão para badges de eventos (não padronizados)
export const eventBadgeConfigs: BadgeConfig[] = [
  {
    id: 'events_1',
    category: 'events',
    rank: 'bronze',
    icon: 'gift',
    isUnlocked: true,
    unlockedAt: new Date('2023-12-25'),
  },
  {
    id: 'events_2',
    category: 'events',
    rank: 'silver',
    icon: 'sparkles',
    isUnlocked: true,
    unlockedAt: new Date('2024-01-01'),
  },
  {
    id: 'events_3',
    category: 'events',
    rank: 'gold',
    icon: 'skull',
    isUnlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'events_4',
    category: 'events',
    rank: 'platinum',
    icon: 'gift',
    isUnlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'events_5',
    category: 'events',
    rank: 'diamond',
    icon: 'flag',
    isUnlocked: true,
    unlockedAt: new Date('2024-01-01'),
  },
];

// Configurações padrão para todos os badges
export const defaultBadgeConfigs: BadgeConfig[] = [
  // FIDELIDADE
  {
    id: 'loyalty_1',
    category: 'loyalty',
    rank: 'bronze',
    icon: 'time',
    isUnlocked: true,
    unlockedAt: new Date('2024-01-15'),
  },
  {
    id: 'loyalty_2',
    category: 'loyalty',
    rank: 'silver',
    icon: 'calendar',
    isUnlocked: true,
    unlockedAt: new Date('2024-03-15'),
  },
  {
    id: 'loyalty_3',
    category: 'loyalty',
    rank: 'gold',
    icon: 'shield',
    isUnlocked: false,
    progress: 4,
    maxProgress: 6,
  },
  {
    id: 'loyalty_4',
    category: 'loyalty',
    rank: 'platinum',
    icon: 'gift',
    isUnlocked: false,
    progress: 8,
    maxProgress: 12,
  },
  {
    id: 'loyalty_5',
    category: 'loyalty',
    rank: 'diamond',
    icon: 'star',
    isUnlocked: false,
    progress: 15,
    maxProgress: 24,
  },
  {
    id: 'loyalty_6',
    category: 'loyalty',
    rank: 'diamond',
    icon: 'diamond',
    isUnlocked: false,
    progress: 24,
    maxProgress: 60,
  },

  // SOCIAL
  {
    id: 'social_1',
    category: 'social',
    rank: 'bronze',
    icon: 'people',
    isUnlocked: true,
    unlockedAt: new Date('2024-02-10'),
  },
  {
    id: 'social_2',
    category: 'social',
    rank: 'silver',
    icon: 'people-circle',
    isUnlocked: false,
    progress: 12,
    maxProgress: 20,
  },
  {
    id: 'social_3',
    category: 'social',
    rank: 'gold',
    icon: 'trending-up',
    isUnlocked: false,
    progress: 30,
    maxProgress: 50,
  },
  {
    id: 'social_4',
    category: 'social',
    rank: 'platinum',
    icon: 'star',
    isUnlocked: false,
    progress: 60,
    maxProgress: 100,
  },
  {
    id: 'social_5',
    category: 'social',
    rank: 'diamond',
    icon: 'trophy',
    isUnlocked: false,
    progress: 120,
    maxProgress: 200,
  },

  // VALORES
  {
    id: 'values_1',
    category: 'values',
    rank: 'bronze',
    icon: 'wallet',
    isUnlocked: true,
    unlockedAt: new Date('2024-01-20'),
  },
  {
    id: 'values_2',
    category: 'values',
    rank: 'silver',
    icon: 'card',
    isUnlocked: false,
    progress: 75,
    maxProgress: 100,
  },
  {
    id: 'values_3',
    category: 'values',
    rank: 'gold',
    icon: 'cash',
    isUnlocked: false,
    progress: 150,
    maxProgress: 200,
  },
  {
    id: 'values_4',
    category: 'values',
    rank: 'platinum',
    icon: 'diamond',
    isUnlocked: false,
    progress: 300,
    maxProgress: 500,
  },
  {
    id: 'values_5',
    category: 'values',
    rank: 'diamond',
    icon: 'trophy',
    isUnlocked: false,
    progress: 600,
    maxProgress: 1000,
  },
  {
    id: 'values_6',
    category: 'values',
    rank: 'diamond',
    icon: 'star',
    isUnlocked: false,
    progress: 1500,
    maxProgress: 3000,
  },
];
