// Hook do Design System - SplitPay
import { useTheme } from '../../context/ThemeContext';
import { 
  lightColorTokens, 
  darkColorTokens,
  type LightColorTokens,
  type DarkColorTokens 
} from '../tokens/colors';
import { spacingTokens, type SpacingToken } from '../tokens/spacing';
import { typographyTokens, type TypographyToken } from '../tokens/typography';
import { borderRadiusTokens, type BorderRadiusToken } from '../tokens/border-radius';
import { getShadow, type ShadowToken } from '../tokens/shadows';

export const useDesignSystem = () => {
  const { theme } = useTheme();
  
  // Determinar se é tema escuro ou claro
  const isDark = theme.colors.background === darkColorTokens.background;
  const colorTokens = isDark ? darkColorTokens : lightColorTokens;
  
  return {
    // Tokens de cores
    colors: colorTokens,
    
    // Tokens de espaçamento
    spacing: spacingTokens,
    getSpacing: (key: SpacingToken) => spacingTokens[key],
    
    // Tokens de tipografia
    typography: typographyTokens,
    getTypography: (key: TypographyToken) => typographyTokens[key],
    
    // Tokens de border radius
    borderRadius: borderRadiusTokens,
    getBorderRadius: (key: BorderRadiusToken) => borderRadiusTokens[key],
    
    // Tokens de sombra
    getShadow: (key: ShadowToken) => getShadow(key),
    
    // Utilitários
    isDark,
    isLight: !isDark,
    
    // Helpers para cores
    getColor: (path: string) => {
      const keys = path.split('.');
      let value: any = colorTokens;
      
      for (const key of keys) {
        value = value[key];
        if (value === undefined) {
          console.warn(`Color token not found: ${path}`);
          return colorTokens.text.primary;
        }
      }
      
      return value;
    },
    
    // Helpers para espaçamento
    space: (multiplier: number = 1) => spacingTokens.md * multiplier,
    
    // Helpers para tipografia
    text: {
      h1: typographyTokens.h1,
      h2: typographyTokens.h2,
      h3: typographyTokens.h3,
      h4: typographyTokens.h4,
      body: typographyTokens.body,
      caption: typographyTokens.caption,
      button: typographyTokens.button,
      label: typographyTokens.label,
    },
  };
};

// Tipos para exportação
export type DesignSystem = ReturnType<typeof useDesignSystem>; 