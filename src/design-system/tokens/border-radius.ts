// Tokens de Border Radius - SplitPay Design System

// Sistema de border radius baseado em múltiplos de 4
export const borderRadiusTokens = {
  // Border radius pequenos
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
  
  // Border radius específicos para componentes
  button: {
    small: 6,
    medium: 8,
    large: 12,
  },
  
  card: {
    small: 8,
    medium: 12,
    large: 16,
  },
  
  input: {
    small: 6,
    medium: 8,
    large: 12,
  },
  
  avatar: {
    small: 16,
    medium: 24,
    large: 32,
  },
  
  badge: {
    small: 12,
    medium: 16,
    large: 20,
  },
} as const;

// Função para obter border radius
export const getBorderRadius = (key: keyof typeof borderRadiusTokens): number => {
  const value = borderRadiusTokens[key];
  if (typeof value === 'object') {
    // Se for um objeto, pegar o valor medium ou o primeiro valor numérico
    if ('medium' in value) {
      return value.medium;
    }
    const numericValues = Object.values(value).filter(v => typeof v === 'number');
    return numericValues[0] || 8;
  }
  return value;
};

// Tipos para TypeScript
export type BorderRadiusToken = keyof typeof borderRadiusTokens; 