import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Badge } from '../types';

const defaultBadges: Omit<Badge, 'id' | 'createdAt'>[] = [
  // Badges de Lealdade
  {
    name: 'Primeiro Login',
    description: 'Bem-vindo ao SplitPay!',
    icon: 'person-add',
    rank: 'bronze',
    category: 'social',
    isUnlocked: true,
    unlockCondition: 'Fazer primeiro login',
    points: 10,
  },
  {
    name: 'Usuário Ativo',
    description: 'Usando o app por 7 dias',
    icon: 'calendar',
    rank: 'bronze',
    category: 'loyalty',
    isUnlocked: false,
    unlockCondition: 'Usar o app por 7 dias consecutivos',
    points: 25,
  },
  {
    name: 'Veterano',
    description: 'Usando o app por 30 dias',
    icon: 'time',
    rank: 'silver',
    category: 'loyalty',
    isUnlocked: false,
    unlockCondition: 'Usar o app por 30 dias',
    points: 100,
  },

  // Badges Sociais
  {
    name: 'Primeiro Amigo',
    description: 'Adicionou seu primeiro amigo',
    icon: 'people',
    rank: 'bronze',
    category: 'social',
    isUnlocked: false,
    unlockCondition: 'Adicionar primeiro amigo',
    points: 20,
  },
  {
    name: 'Social',
    description: 'Tem 10 amigos',
    icon: 'people-circle',
    rank: 'silver',
    category: 'social',
    isUnlocked: false,
    unlockCondition: 'Ter 10 amigos',
    points: 75,
  },
  {
    name: 'Influenciador',
    description: 'Tem 50 amigos',
    icon: 'star',
    rank: 'gold',
    category: 'social',
    isUnlocked: false,
    unlockCondition: 'Ter 50 amigos',
    points: 300,
  },

  // Badges Financeiros
  {
    name: 'Primeira Dívida',
    description: 'Criou sua primeira dívida',
    icon: 'wallet',
    rank: 'bronze',
    category: 'values',
    isUnlocked: false,
    unlockCondition: 'Criar primeira dívida',
    points: 15,
  },
  {
    name: 'Pagador Confiável',
    description: 'Pagou 10 dívidas',
    icon: 'checkmark-circle',
    rank: 'silver',
    category: 'values',
    isUnlocked: false,
    unlockCondition: 'Pagar 10 dívidas',
    points: 150,
  },
  {
    name: 'Organizador',
    description: 'Criou 5 grupos',
    icon: 'people-circle',
    rank: 'gold',
    category: 'values',
    isUnlocked: false,
    unlockCondition: 'Criar 5 grupos',
    points: 200,
  },
  {
    name: 'Socorrista',
    description: 'Ajudou 3 amigos com dívidas',
    icon: 'heart',
    rank: 'gold',
    category: 'values',
    isUnlocked: false,
    unlockCondition: 'Ajudar 3 amigos com dívidas',
    points: 250,
  },

  // Badges de Eventos
  {
    name: 'Primeiro Grupo',
    description: 'Criou seu primeiro grupo',
    icon: 'people-circle',
    rank: 'bronze',
    category: 'events',
    isUnlocked: false,
    unlockCondition: 'Criar primeiro grupo',
    points: 30,
  },
  {
    name: 'Festa',
    description: 'Participou de 5 eventos',
    icon: 'wine',
    rank: 'silver',
    category: 'events',
    isUnlocked: false,
    unlockCondition: 'Participar de 5 eventos',
    points: 120,
  },

  // Badges Especiais
  {
    name: 'Poupador',
    description: 'Economizou R$ 1000',
    icon: 'trending-up',
    rank: 'platinum',
    category: 'special',
    isUnlocked: false,
    unlockCondition: 'Economizar R$ 1000',
    points: 500,
  },
  {
    name: 'VIP',
    description: 'Usuário premium por 1 ano',
    icon: 'diamond',
    rank: 'diamond',
    category: 'special',
    isUnlocked: false,
    unlockCondition: 'Ser usuário premium por 1 ano',
    points: 1000,
  },
];

export const initializeBadges = async () => {
  try {
    console.log('🚀 Inicializando badges padrão...');
    
    const badgesRef = collection(db, 'badges');
    
    for (const badge of defaultBadges) {
      await addDoc(badgesRef, {
        ...badge,
        createdAt: serverTimestamp(),
      });
      console.log(`✅ Badge "${badge.name}" criado`);
    }
    
    console.log('🎉 Todos os badges foram inicializados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar badges:', error);
    throw error;
  }
};

// Função para verificar se os badges já existem
export const checkBadgesExist = async (): Promise<boolean> => {
  try {
    const badgesRef = collection(db, 'badges');
    const snapshot = await getDocs(badgesRef);
    return !snapshot.empty;
  } catch (error) {
    console.error('Erro ao verificar badges:', error);
    return false;
  }
};
