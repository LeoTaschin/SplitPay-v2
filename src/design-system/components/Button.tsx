import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
  iconSize = 20,
  fullWidth = false,
}) => {
  const ds = useDesignSystem();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: ds.getBorderRadius('button') as number,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      paddingHorizontal: ds.spacing.button.padding,
      ...ds.getShadow('button'),
    };

    // Size styles
    const sizeStyles = {
      small: {
        paddingVertical: ds.spacing.button.paddingSmall,
        minHeight: 36,
      },
      medium: {
        paddingVertical: ds.spacing.button.padding,
        minHeight: 48,
      },
      large: {
        paddingVertical: ds.spacing.button.paddingLarge,
        minHeight: 56,
      },
    };

    // Variant styles
    const variantStyles = {
      primary: {
        backgroundColor: ds.colors.primary,
        borderWidth: 0,
      },
      secondary: {
        backgroundColor: ds.colors.secondary,
        borderWidth: 0,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: ds.colors.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 0,
      },
      danger: {
        backgroundColor: ds.colors.feedback.error,
        borderWidth: 0,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: disabled ? 0.6 : 1,
      width: fullWidth ? '100%' : undefined,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontWeight: '600',
    };

    const variantTextStyles = {
      primary: {
        color: ds.colors.text.inverse,
      },
      secondary: {
        color: ds.colors.text.inverse,
      },
      outline: {
        color: ds.colors.primary,
      },
      ghost: {
        color: ds.colors.primary,
      },
      danger: {
        color: ds.colors.text.inverse,
      },
    };

    const sizeTextStyles = {
      small: ds.text.button.small,
      medium: ds.text.button.medium,
      large: ds.text.button.large,
    };

    return {
      ...baseTextStyle,
      ...variantTextStyles[variant],
      ...sizeTextStyles[size],
    };
  };

  const getIconColor = () => {
    if (variant === 'outline' || variant === 'ghost') {
      return ds.colors.primary;
    }
    return ds.colors.text.inverse;
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getIconColor()}
        />
      ) : (
        <>
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={iconSize}
              color={getIconColor()}
              style={{ marginRight: ds.spacing.xs }}
            />
          )}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          {rightIcon && (
            <Ionicons
              name={rightIcon}
              size={iconSize}
              color={getIconColor()}
              style={{ marginLeft: ds.spacing.xs }}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}; 