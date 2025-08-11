// User types
export interface User {
    id: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    createdAt: Date;
    updatedAt: Date;
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
    creditor?: any;
    debtor?: any;
    // Campos para dívidas em grupo
    receiverId?: string;
    payerId?: string;
    receiver?: any;
    payer?: any;
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
    FriendProfile: { userId: string };
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