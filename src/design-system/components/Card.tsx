import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'elevated' | 'outlined';
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  style?: ViewStyle;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  variant = 'default',
  size = 'medium',
  onPress,
  style,
  leftIcon,
  rightIcon,
  iconSize = 24,
  padding = 'medium',
}) => {
  const ds = useDesignSystem();

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: ds.getBorderRadius('card') as number,
      backgroundColor: ds.colors.surface,
      overflow: 'hidden',
    };

    // Variant styles
    const variantStyles = {
      default: {
        borderWidth: 1,
        borderColor: ds.colors.border.primary,
      },
      elevated: {
        ...ds.getShadow('card'),
        borderWidth: 0,
      },
      outlined: {
        borderWidth: 2,
        borderColor: ds.colors.border.secondary,
      },
    };

    // Size styles
    const sizeStyles = {
      small: {
        margin: ds.spacing.card.margin,
      },
      medium: {
        margin: ds.spacing.card.margin,
      },
      large: {
        margin: ds.spacing.card.margin,
      },
    };

    // Padding styles
    const paddingStyles = {
      none: {
        padding: 0,
      },
      small: {
        padding: ds.spacing.sm,
      },
      medium: {
        padding: ds.spacing.card.padding,
      },
      large: {
        padding: ds.spacing.card.paddingLarge,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...sizeStyles[size],
      ...paddingStyles[padding],
    };
  };

  const getHeaderStyle = () => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: title || subtitle ? ds.spacing.sm : 0,
  });

  const getTitleStyle = () => ({
    ...ds.text.h4,
    color: ds.colors.text.primary,
    flex: 1,
  });

  const getSubtitleStyle = () => ({
    ...ds.text.body.small,
    color: ds.colors.text.secondary,
    marginTop: ds.spacing.xs,
  });

  const CardContainer = onPress ? TouchableOpacity : View;

  return (
    <CardContainer
      style={[getCardStyle(), style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      {(title || subtitle || leftIcon || rightIcon) && (
        <View style={getHeaderStyle()}>
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={iconSize}
              color={ds.colors.text.secondary}
              style={{ marginRight: ds.spacing.sm }}
            />
          )}
          
          <View style={{ flex: 1 }}>
            {title && <Text style={getTitleStyle()}>{title}</Text>}
            {subtitle && <Text style={getSubtitleStyle()}>{subtitle}</Text>}
          </View>
          
          {rightIcon && (
            <Ionicons
              name={rightIcon}
              size={iconSize}
              color={ds.colors.text.secondary}
              style={{ marginLeft: ds.spacing.sm }}
            />
          )}
        </View>
      )}
      
      {children}
    </CardContainer>
  );
}; 