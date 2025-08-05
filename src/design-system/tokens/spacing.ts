// Tokens de Espaçamento - SplitPay Design System

// Sistema de espaçamento baseado em múltiplos de 4
export const spacingTokens = {
  // Espaçamentos pequenos
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
  
  // Espaçamentos específicos para componentes
  button: {
    padding: 16,
    paddingSmall: 12,
    paddingLarge: 20,
  },
  
  card: {
    padding: 16,
    paddingLarge: 24,
    margin: 8,
  },
  
  input: {
    padding: 12,
    paddingLarge: 16,
  },
  
  // Espaçamentos para layout
  layout: {
    screen: 20,
    section: 24,
    item: 12,
  },
  
  // Espaçamentos para ícones
  icon: {
    small: 16,
    medium: 24,
    large: 32,
  },
} as const;

// Função para obter espaçamento
export const getSpacing = (key: keyof typeof spacingTokens): number => {
  const value = spacingTokens[key];
  if (typeof value === 'object') {
    // Verificar se tem padding, senão usar o primeiro valor numérico
    if ('padding' in value) {
      return value.padding;
    }
    // Se não tem padding, pegar o primeiro valor numérico
    const numericValues = Object.values(value).filter(v => typeof v === 'number');
    return numericValues[0] || 16;
  }
  return value;
};

// Tipos para TypeScript
export type SpacingToken = keyof typeof spacingTokens; 