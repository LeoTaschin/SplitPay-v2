import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Tamanho base de design (pode ser ajustado conforme necessário)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

// Função para escalar horizontalmente
export const scaleWidth = (size: number): number => (width / guidelineBaseWidth) * size;

// Função para escalar verticalmente
export const scaleHeight = (size: number): number => (height / guidelineBaseHeight) * size;

// Fixed spacing values
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

// Fixed font sizes
export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// Safe scaling function that ensures integer values
export const moderateScale = (size: number): number => {
  return Math.floor(size);
};

// Dimensões da tela
export const screenWidth = width;
export const screenHeight = height;

// Breakpoints para diferentes tamanhos de tela
export const BREAKPOINTS = {
  phone: width < 375,
  tablet: width >= 768,
  desktop: width >= 1024,
} as const;

// Tipos para as constantes
export type SpacingKey = keyof typeof SPACING;
export type FontSizeKey = keyof typeof FONT_SIZES;
export type BreakpointKey = keyof typeof BREAKPOINTS; 