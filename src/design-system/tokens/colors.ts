// Tokens de Cores - SplitPay Design System

// Paleta de cores base do SplitPay
export const colorPalette = {
  // Verde (Primary) - SplitPay
  green: {
    50: '#E8F5E8',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50', // Cor principal do SplitPay
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },
  
  // Azul (Secondary) - SplitPay
  blue: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#357ABD', // Cor secundária do SplitPay
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },
  
  // Verde Accent - SplitPay
  accent: {
    50: '#E8F5E8',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#50C878', // Accent do SplitPay
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },
  
  // Cinza (Neutral) - SplitPay
  gray: {
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
  
  // Vermelho (Error) - SplitPay
  red: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#E53935', // Erro do SplitPay
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
  },
  
  // Amarelo (Warning) - SplitPay
  yellow: {
    50: '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#FFB300', // Aviso do SplitPay
    600: '#FFB300',
    700: '#FFA000',
    800: '#FF8F00',
    900: '#FF6F00',
  },
  
  // Verde (Success) - SplitPay
  success: {
    50: '#E8F5E8',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#34C759', // Sucesso do SplitPay
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },
} as const;

// Tokens semânticos para tema claro
export const lightColorTokens = {
  // Cores principais
  primary: colorPalette.green[500], // Verde principal do SplitPay
  secondary: colorPalette.blue[500], // Azul secundário do SplitPay
  accent: colorPalette.accent[500], // Verde accent do SplitPay
  
  // Cores de fundo
  background: '#F5F5F5', // Branco do SplitPay
  surface: '#FFFFFF', // Surface do SplitPay
  surfaceVariant: colorPalette.gray[100],
  
  // Cores de texto
  text: {
    primary: '#000000', // Texto principal do SplitPay
    secondary: '#616161', // Texto secundário do SplitPay
    tertiary: colorPalette.gray[500],
    disabled: colorPalette.gray[400],
    inverse: '#000000', // Texto invertido do SplitPay
  },
  
  // Cores de borda
  border: {
    primary: '#E5E5E5', // Borda do SplitPay
    secondary: colorPalette.gray[300],
    focus: colorPalette.green[500],
  },
  
  // Cores de feedback
  feedback: {
    success: colorPalette.success[500], // Verde sucesso do SplitPay
    warning: colorPalette.yellow[500], // Amarelo aviso do SplitPay
    error: colorPalette.red[500], // Vermelho erro do SplitPay
    info: colorPalette.blue[500], // Azul info
  },
  
  // Cores de estado
  state: {
    hover: colorPalette.green[50],
    pressed: colorPalette.green[100],
    disabled: colorPalette.gray[100],
  },
} as const;

// Tokens semânticos para tema escuro
export const darkColorTokens = {
  // Cores principais
  primary: colorPalette.green[500], // Verde principal do SplitPay (mesmo)
  secondary: colorPalette.blue[500], // Azul secundário do SplitPay
  accent: colorPalette.accent[500], // Verde accent do SplitPay
  
  // Cores de fundo
  background: '#121212', // Fundo escuro do SplitPay
  surface: '#1E1E1E', // Surface escuro do SplitPay
  surfaceVariant: colorPalette.gray[200],
  
  // Cores de texto
  text: {
    primary: '#FFFFFF', // Texto principal escuro do SplitPay
    secondary: '#E0E0E0', // Texto secundário escuro do SplitPay
    tertiary: colorPalette.gray[400],
    disabled: colorPalette.gray[600],
    inverse: '#FFFFFF', // Texto invertido escuro do SplitPay
  },
  
  // Cores de borda
  border: {
    primary: '#2D2D2D', // Borda escura do SplitPay
    secondary: colorPalette.gray[600],
    focus: colorPalette.green[500],
  },
  
  // Cores de feedback
  feedback: {
    success: colorPalette.success[500], // Verde sucesso do SplitPay
    warning: colorPalette.yellow[500], // Amarelo aviso do SplitPay
    error: colorPalette.red[500], // Vermelho erro do SplitPay
    info: colorPalette.blue[500], // Azul info
  },
  
  // Cores de estado
  state: {
    hover: colorPalette.green[900],
    pressed: colorPalette.green[800],
    disabled: colorPalette.gray[800],
  },
} as const;

// Tipos para TypeScript
export type ColorPalette = typeof colorPalette;
export type LightColorTokens = typeof lightColorTokens;
export type DarkColorTokens = typeof darkColorTokens; 