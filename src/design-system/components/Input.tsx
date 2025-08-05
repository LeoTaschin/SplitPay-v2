import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  type?: 'text' | 'email' | 'password' | 'number' | 'phone';
  disabled?: boolean;
  error?: string;
  helperText?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  secureTextEntry?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  variant = 'default',
  size = 'medium',
  type = 'text',
  disabled = false,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  autoCapitalize = 'none',
  keyboardType = 'default',
  secureTextEntry = false,
}) => {
  const ds = useDesignSystem();
  const [isFocused, setIsFocused] = useState(false);

  const getInputContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: ds.getBorderRadius('input') as number,
      flexDirection: 'row',
      alignItems: multiline ? 'flex-start' : 'center',
      backgroundColor: ds.colors.surface,
      borderWidth: 1,
      minHeight: size === 'large' ? 56 : size === 'medium' ? 48 : 40,
    };

    // Variant styles
    const variantStyles = {
      default: {
        borderColor: error 
          ? ds.colors.feedback.error 
          : isFocused 
            ? ds.colors.border.focus 
            : ds.colors.border.primary,
        backgroundColor: ds.colors.surface,
      },
      outlined: {
        borderColor: error 
          ? ds.colors.feedback.error 
          : isFocused 
            ? ds.colors.border.focus 
            : ds.colors.border.secondary,
        backgroundColor: 'transparent',
        borderWidth: 2,
      },
      filled: {
        borderColor: 'transparent',
        backgroundColor: ds.colors.surfaceVariant,
      },
    };

    // Size styles
    const sizeStyles = {
      small: {
        paddingHorizontal: ds.spacing.input.padding,
        paddingVertical: ds.spacing.xs,
      },
      medium: {
        paddingHorizontal: ds.spacing.input.padding,
        paddingVertical: ds.spacing.sm,
      },
      large: {
        paddingHorizontal: ds.spacing.input.paddingLarge,
        paddingVertical: ds.spacing.md,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...sizeStyles[size],
      opacity: disabled ? 0.6 : 1,
    };
  };

  const getInputStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      flex: 1,
      color: ds.colors.text.primary,
      ...ds.text.body.medium,
    };

    const sizeStyles = {
      small: ds.text.body.small,
      medium: ds.text.body.medium,
      large: ds.text.body.large,
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
    };
  };

  const getLabelStyle = (): TextStyle => ({
    ...ds.text.label,
    color: error 
      ? ds.colors.feedback.error 
      : isFocused 
        ? ds.colors.border.focus 
        : ds.colors.text.secondary,
    marginBottom: ds.spacing.xs,
  });

  const getHelperTextStyle = (): TextStyle => ({
    ...ds.text.caption,
    color: error ? ds.colors.feedback.error : ds.colors.text.tertiary,
    marginTop: ds.spacing.xs,
  });

  const getIconColor = () => {
    if (error) return ds.colors.feedback.error;
    if (isFocused) return ds.colors.border.focus;
    return ds.colors.text.secondary;
  };

  const getKeyboardType = () => {
    switch (type) {
      case 'email':
        return 'email-address';
      case 'number':
        return 'numeric';
      case 'phone':
        return 'phone-pad';
      default:
        return keyboardType;
    }
  };

  const getSecureTextEntry = () => {
    return type === 'password' || secureTextEntry;
  };

  return (
    <View style={style}>
      {label && <Text style={getLabelStyle()}>{label}</Text>}
      
      <View style={getInputContainerStyle()}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={getIconColor()}
            style={{ marginRight: ds.spacing.sm }}
          />
        )}
        
        <TextInput
          style={[getInputStyle(), inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={ds.colors.text.tertiary}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          keyboardType={getKeyboardType()}
          secureTextEntry={getSecureTextEntry()}
        />
        
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={{ marginLeft: ds.spacing.sm }}
          >
            <Ionicons
              name={rightIcon}
              size={20}
              color={getIconColor()}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {(error || helperText) && (
        <Text style={getHelperTextStyle()}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
}; 