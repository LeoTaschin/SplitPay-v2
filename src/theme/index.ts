import { Theme } from '../types';
import { SPACING, FONT_SIZES } from '../utils/dimensions';

// Cores base do SplitPay Design System
const colors = {
  // Cores primárias (Verde)
  primary: {
    50: '#E8F5E8',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50', // Verde principal do SplitPay
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },
  
  // Cores secundárias (Azul)
  secondary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#357ABD', // Azul secundário do SplitPay
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },
  
  // Cores neutras (Cinza)
  neutral: {
    100: '#F7F7F7',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  
  // Cores de feedback
  success: {
    50: '#E8F5E8',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#34C759', // Verde sucesso do SplitPay
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },
  
  warning: {
    50: '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#FFB300', // Amarelo aviso do SplitPay
    600: '#FFB300',
    700: '#FFA000',
    800: '#FF8F00',
    900: '#FF6F00',
  },
  
  error: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#E53935', // Vermelho erro do SplitPay
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
  },
  
  // Verde accent do SplitPay
  accent: {
    50: '#E8F5E8',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#50C878', // Verde accent do SplitPay
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },
};

// Tema claro
export const lightTheme: Theme = {
  colors: {
    primary: colors.primary[500], // Verde principal do SplitPay
    secondary: colors.secondary[500], // Azul secundário do SplitPay
    background: '#FFFFFF', // Branco do SplitPay
    surface: '#F5F5F5', // Surface do SplitPay
    text: '#000000', // Texto principal do SplitPay
    textSecondary: '#616161', // Texto secundário do SplitPay
    border: '#E5E5E5', // Borda do SplitPay
    error: colors.error[500], // Vermelho erro do SplitPay
    success: colors.success[500], // Verde sucesso do SplitPay
    warning: colors.warning[500], // Amarelo aviso do SplitPay
    info: colors.secondary[500], // Azul info
  },
  spacing: SPACING,
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  typography: {
    h1: {
      fontSize: FONT_SIZES.xxxl,
      fontWeight: '700',
    },
    h2: {
      fontSize: FONT_SIZES.xxl,
      fontWeight: '600',
    },
    h3: {
      fontSize: FONT_SIZES.xl,
      fontWeight: '600',
    },
    body: {
      fontSize: FONT_SIZES.md,
      fontWeight: '400',
    },
    caption: {
      fontSize: FONT_SIZES.sm,
      fontWeight: '400',
    },
  },
};

// Tema escuro
export const darkTheme: Theme = {
  colors: {
    primary: colors.primary[500], // Verde principal do SplitPay (mesmo)
    secondary: colors.secondary[500], // Azul secundário do SplitPay
    background: '#121212', // Fundo escuro do SplitPay
    surface: '#1E1E1E', // Surface escuro do SplitPay
    text: '#FFFFFF', // Texto principal escuro do SplitPay
    textSecondary: '#E0E0E0', // Texto secundário escuro do SplitPay
    border: '#2D2D2D', // Borda escura do SplitPay
    error: colors.error[500], // Vermelho erro do SplitPay
    success: colors.success[500], // Verde sucesso do SplitPay
    warning: colors.warning[500], // Amarelo aviso do SplitPay
    info: colors.secondary[500], // Azul info
  },
  spacing: SPACING,
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  typography: {
    h1: {
      fontSize: FONT_SIZES.xxxl,
      fontWeight: '700',
    },
    h2: {
      fontSize: FONT_SIZES.xxl,
      fontWeight: '600',
    },
    h3: {
      fontSize: FONT_SIZES.xl,
      fontWeight: '600',
    },
    body: {
      fontSize: FONT_SIZES.md,
      fontWeight: '400',
    },
    caption: {
      fontSize: FONT_SIZES.sm,
      fontWeight: '400',
    },
  },
};

// Exportar cores para uso em componentes
export { colors }; 