import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'medium',
  icon,
  iconSize = 16,
  style,
  textStyle,
}) => {
  const ds = useDesignSystem();

  const getBadgeStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: ds.getBorderRadius('badge') as number,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    };

    // Variant styles
    const variantStyles = {
      primary: {
        backgroundColor: ds.colors.primary,
      },
      secondary: {
        backgroundColor: ds.colors.secondary,
      },
      success: {
        backgroundColor: ds.colors.feedback.success,
      },
      warning: {
        backgroundColor: ds.colors.feedback.warning,
      },
      error: {
        backgroundColor: ds.colors.feedback.error,
      },
      info: {
        backgroundColor: ds.colors.feedback.info,
      },
    };

    // Size styles
    const sizeStyles = {
      small: {
        paddingHorizontal: ds.spacing.xs,
        paddingVertical: 2,
        minHeight: 20,
      },
      medium: {
        paddingHorizontal: ds.spacing.sm,
        paddingVertical: ds.spacing.xs,
        minHeight: 24,
      },
      large: {
        paddingHorizontal: ds.spacing.md,
        paddingVertical: ds.spacing.sm,
        minHeight: 32,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...sizeStyles[size],
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      color: ds.colors.text.inverse,
      fontWeight: '600',
    };

    const sizeStyles = {
      small: {
        fontSize: 10,
      },
      medium: {
        fontSize: 12,
      },
      large: {
        fontSize: 14,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
    };
  };

  return (
    <View style={[getBadgeStyle(), style]}>
      {icon && (
        <Ionicons
          name={icon}
          size={iconSize}
          color={ds.colors.text.inverse}
          style={{ marginRight: ds.spacing.xs }}
        />
      )}
      <Text style={[getTextStyle(), textStyle]}>{label}</Text>
    </View>
  );
}; 