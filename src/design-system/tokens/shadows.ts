// Tokens de Sombras - SplitPay Design System

import { Platform } from 'react-native';

// Sistema de sombras para iOS e Android
export const shadowTokens = {
  // Sombras pequenas
  xs: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  sm: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  md: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  
  lg: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  
  xl: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  
  // Sombras específicas para componentes
  button: {
    primary: {
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 3,
    },
    
    floating: {
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 6,
    },
  },
  
  card: {
    small: {
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    
    medium: {
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    
    large: {
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  modal: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

// Função para obter sombra baseada na plataforma
export const getShadow = (key: keyof typeof shadowTokens) => {
  const shadow = shadowTokens[key];
  
  // Se for um objeto aninhado, pegar o primeiro valor
  const shadowValue = typeof shadow === 'object' && 'shadowColor' in shadow 
    ? shadow 
    : Object.values(shadow)[0];
  
  if (Platform.OS === 'ios') {
    return {
      shadowColor: shadowValue.shadowColor,
      shadowOffset: shadowValue.shadowOffset,
      shadowOpacity: shadowValue.shadowOpacity,
      shadowRadius: shadowValue.shadowRadius,
    };
  } else {
    return {
      elevation: shadowValue.elevation,
    };
  }
};

// Tipos para TypeScript
export type ShadowToken = keyof typeof shadowTokens; 