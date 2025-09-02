// User types
export interface User {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    createdAt: string;
    // Novos campos para badges
    selectedBadges?: Badge[];
    totalPoints?: number;
    rank?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    // Campos obrigatórios para BR Code Pix
    name?: string; // Nome completo do beneficiário
    city?: string; // Cidade do beneficiário
    pixKey?: string; // Chave Pix (CPF, CNPJ, email, telefone, chave aleatória)
    pixKeyType?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random'; // Tipo da chave Pix
    document?: string; // CPF/CNPJ do beneficiário
    merchantName?: string; // Nome do estabelecimento (opcional)
    merchantCity?: string; // Cidade do estabelecimento (opcional)
    // Novos campos para múltiplas chaves Pix
    pixKeys?: Array<{
      id: string;
      pixKey: string;
      pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone';
      bankName?: string;
      isDefault: boolean;
    }>;
  }

// Badge types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rank: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  category: 'social' | 'financial' | 'achievement' | 'special' | 'events';
  isUnlocked: boolean;
  unlockCondition: string;
  points: number;
  createdAt: Date;
}

export interface BadgeHistory {
  id: string;
  userId: string;
  badgeId: string;
  unlockedAt: Date;
  unlockedBy: 'achievement' | 'purchase' | 'gift';
  pointsEarned: number;
}

export interface UserBadgeProgress {
  userId: string;
  totalPoints: number;
  rank: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  unlockedBadges: Badge[];
  selectedBadges: Badge[];
  achievements: BadgeHistory[];
}
  
  // Debt types
  export interface Debt {
    id: string;
    title?: string;
    amount: number;
    description?: string;
    createdAt: Date;
    updatedAt?: Date;
    paidAt?: Date;
    paidBy?: string;
    isPaid?: boolean;
    paid?: boolean;
    createdBy?: string;
    owedBy?: string;
    owedTo?: string;
    creditorId?: string;
    debtorId?: string;
    category?: string;
    type?: 'personal' | 'group';
    amountPerPerson?: number;
    groupId?: string;
    groupName?: string; // Nome do grupo
    group?: any; // Dados completos do grupo
    creditor?: any;
    debtor?: any;
    // Campos para dívidas em grupo
    receiverId?: string;
    payerId?: string;
    receiver?: any;
    payer?: any;
    // Informações do criador da dívida
    createdByUser?: {
      id: string;
      username: string;
      name?: string;
      photoURL?: string;
    };
  }
  
  // Group types
  export interface Group {
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    members: string[];
    totalDebt: number;
  }
  
  // Group Debt types
  export interface GroupDebt {
    id: string;
    title: string;
    amount: number;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    groupId: string;
    createdBy: string;
    paidBy: string;
    splitBetween: string[];
    category?: string;
  }
  
  // Navigation types
  export type RootStackParamList = {
    Splash: undefined;
    Auth: undefined;
    Main: undefined;
    Home: undefined;
    MainTabs: undefined;
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
    Dashboard: undefined;
    Friends: undefined;
    Groups: undefined;
    NewDebt: undefined;
    NewGroupDebt: { groupId: string };
    DebtDetails: { debtId: string };
    GroupDetail: { groupId: string };
    Profile: undefined;
    Settings: undefined;
    EditProfile: undefined;
    FriendProfile: { 
      friendId: string;
      friendData?: {
        id: string;
        username: string;
        email: string;
        photoURL?: string;
        balance: number;
      };
    };
    FriendTransactions: {
      friendId: string;
      friendData?: {
        id: string;
        username: string;
        email: string;
        photoURL?: string;
        balance: number;
      };
    };
    PixPayment: {
      friendId: string;
      friendData?: {
        id: string;
        username: string;
        email: string;
        photoURL?: string;
        balance: number;
      };
      amount: number;
    };
    SelectDebtTarget: undefined;
    SelectGroup: undefined;
    Activity: undefined;
    About: undefined;
    Help: undefined;
    Privacy: undefined;
  };
  
  export type MainTabParamList = {
    Dashboard: undefined;
    Friends: undefined;
    Groups: undefined;
    Profile: undefined;
  };
  
  // Theme types
  export interface Theme {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      surface: string;
      text: string;
      textSecondary: string;
      border: string;
      error: string;
      success: string;
      warning: string;
      info: string;
    };
    spacing: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
    borderRadius: {
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
    typography: {
      h1: {
        fontSize: number;
        fontWeight: string;
      };
      h2: {
        fontSize: number;
        fontWeight: string;
      };
      h3: {
        fontSize: number;
        fontWeight: string;
      };
      body: {
        fontSize: number;
        fontWeight: string;
      };
      caption: {
        fontSize: number;
        fontWeight: string;
      };
    };
  }
  
  // Store types
  export interface AppState {
    user: User | null;
    debts: Debt[];
    groups: Group[];
    isLoading: boolean;
    error: string | null;
  }
  
  // API Response types
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
  }
  
  // Form types
  export interface LoginForm {
    email: string;
    password: string;
  }
  
  export interface RegisterForm {
    email: string;
    password: string;
    confirmPassword: string;
    displayName: string;
  }
  
  export interface NewDebtForm {
    title: string;
    amount: number;
    description?: string;
    owedTo: string;
    category?: string;
  }
  
  export interface NewGroupDebtForm {
    title: string;
    amount: number;
    description?: string;
    paidBy: string;
    splitBetween: string[];
    category?: string;
  }

  // Transaction types para BR Code Pix
  export interface Transaction {
    id: string;
    fromUser: string;
    toUser: string;
    amount: number;
    referenceId: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
    pixPayload?: string; // Payload do QR Code Pix
    description?: string; // Descrição da transação
  }

  export interface CreateTransactionForm {
    toUser: string;
    amount: number;
    description?: string;
  }

  // BR Code Pix types
  export interface PixPayload {
    payloadFormatIndicator: string; // "01"
    pointOfInitiationMethod: string; // "12" para QR Code único, "11" para QR Code reutilizável
    merchantAccountInformation: {
      gui: string; // "br.gov.bcb.pix"
      key: string; // Chave Pix
      keyType: string; // Tipo da chave
    };
    merchantCategoryCode: string; // "0000" para MCC genérico
    transactionCurrency: string; // "986" para BRL
    transactionAmount?: string; // Valor da transação (opcional)
    countryCode: string; // "BR"
    merchantName: string; // Nome do beneficiário
    merchantCity: string; // Cidade do beneficiário
    additionalDataFieldTemplate?: {
      referenceLabel?: string; // ID de referência
    };
  }

  // Favorite types
  export interface FavoriteFriend {
    friendId: string;
    addedAt: Date;
    order: number;
    lastSynced: Date;
  }

  export interface UserFavorites {
    [friendId: string]: FavoriteFriend;
  }

  export interface FavoriteCache {
    favorites: string[];
    lastSync: Date;
    version: string;
  }

  export interface FavoriteServiceResponse {
    success: boolean;
    data?: any;
    error?: string;
  } 