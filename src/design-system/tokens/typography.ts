// Tokens de Tipografia - SplitPay Design System

// Escala de tamanhos de fonte
export const fontSizeTokens = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 48,
} as const;

// Pesos de fonte
export const fontWeightTokens = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

// Altura de linha
export const lineHeightTokens = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
  loose: 1.8,
} as const;

// Estilos de tipografia predefinidos
export const typographyTokens = {
  // Títulos
  h1: {
    fontSize: fontSizeTokens.xxxl,
    fontWeight: fontWeightTokens.bold,
    lineHeight: fontSizeTokens.xxxl * lineHeightTokens.tight,
  },
  
  h2: {
    fontSize: fontSizeTokens.xxl,
    fontWeight: fontWeightTokens.semibold,
    lineHeight: fontSizeTokens.xxl * lineHeightTokens.tight,
  },
  
  h3: {
    fontSize: fontSizeTokens.xl,
    fontWeight: fontWeightTokens.semibold,
    lineHeight: fontSizeTokens.xl * lineHeightTokens.normal,
  },
  
  h4: {
    fontSize: fontSizeTokens.lg,
    fontWeight: fontWeightTokens.medium,
    lineHeight: fontSizeTokens.lg * lineHeightTokens.normal,
  },
  
  // Texto do corpo
  body: {
    large: {
      fontSize: fontSizeTokens.lg,
      fontWeight: fontWeightTokens.regular,
      lineHeight: fontSizeTokens.lg * lineHeightTokens.normal,
    },
    
    medium: {
      fontSize: fontSizeTokens.md,
      fontWeight: fontWeightTokens.regular,
      lineHeight: fontSizeTokens.md * lineHeightTokens.normal,
    },
    
    small: {
      fontSize: fontSizeTokens.sm,
      fontWeight: fontWeightTokens.regular,
      lineHeight: fontSizeTokens.sm * lineHeightTokens.normal,
    },
  },
  
  // Texto de destaque
  caption: {
    fontSize: fontSizeTokens.xs,
    fontWeight: fontWeightTokens.regular,
    lineHeight: fontSizeTokens.xs * lineHeightTokens.normal,
  },
  
  // Botões
  button: {
    large: {
      fontSize: fontSizeTokens.lg,
      fontWeight: fontWeightTokens.semibold,
      lineHeight: fontSizeTokens.lg * lineHeightTokens.tight,
    },
    
    medium: {
      fontSize: fontSizeTokens.md,
      fontWeight: fontWeightTokens.semibold,
      lineHeight: fontSizeTokens.md * lineHeightTokens.tight,
    },
    
    small: {
      fontSize: fontSizeTokens.sm,
      fontWeight: fontWeightTokens.semibold,
      lineHeight: fontSizeTokens.sm * lineHeightTokens.tight,
    },
  },
  
  // Labels
  label: {
    fontSize: fontSizeTokens.sm,
    fontWeight: fontWeightTokens.medium,
    lineHeight: fontSizeTokens.sm * lineHeightTokens.tight,
  },
} as const;

// Função para obter estilo de tipografia
export const getTypography = (key: keyof typeof typographyTokens) => {
  return typographyTokens[key];
};

// Tipos para TypeScript
export type FontSizeToken = keyof typeof fontSizeTokens;
export type FontWeightToken = keyof typeof fontWeightTokens;
export type LineHeightToken = keyof typeof lineHeightTokens;
export type TypographyToken = keyof typeof typographyTokens; 