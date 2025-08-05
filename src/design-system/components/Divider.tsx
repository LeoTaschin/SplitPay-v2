import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useDesignSystem } from '../hooks/useDesignSystem';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
  size?: 'thin' | 'medium' | 'thick';
  color?: string;
  style?: ViewStyle;
  margin?: number;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  variant = 'solid',
  size = 'thin',
  color,
  style,
  margin = 0,
}) => {
  const ds = useDesignSystem();

  const getDividerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: color || ds.colors.border.primary,
    };

    // Orientation styles
    const orientationStyles = {
      horizontal: {
        width: '100%' as const,
        height: size === 'thin' ? 1 : size === 'medium' ? 2 : 4,
      },
      vertical: {
        width: size === 'thin' ? 1 : size === 'medium' ? 2 : 4,
        height: '100%' as const,
      },
    };

    // Variant styles
    const variantStyles = {
      solid: {},
      dashed: {
        borderStyle: 'dashed' as const,
        borderWidth: orientation === 'horizontal' ? 0 : 1,
        borderTopWidth: orientation === 'horizontal' ? 1 : 0,
        backgroundColor: 'transparent',
      },
      dotted: {
        borderStyle: 'dotted' as const,
        borderWidth: orientation === 'horizontal' ? 0 : 1,
        borderTopWidth: orientation === 'horizontal' ? 1 : 0,
        backgroundColor: 'transparent',
      },
    };

    // Margin styles
    const marginStyles = {
      horizontal: {
        marginVertical: margin,
      },
      vertical: {
        marginHorizontal: margin,
      },
    };

    return {
      ...baseStyle,
      ...orientationStyles[orientation],
      ...variantStyles[variant],
      ...marginStyles[orientation],
    };
  };

  return <View style={[getDividerStyle(), style]} />;
}; 