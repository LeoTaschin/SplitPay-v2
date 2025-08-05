import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';

interface AvatarProps {
  source?: string;
  name?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  variant?: 'circle' | 'rounded';
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'medium',
  variant = 'circle',
  style,
  textStyle,
  icon,
  iconSize = 24,
}) => {
  const ds = useDesignSystem();

  const getAvatarStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: ds.colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    };

    // Size styles
    const sizeStyles = {
      small: {
        width: 32,
        height: 32,
        borderRadius: variant === 'circle' ? 16 : ds.getBorderRadius('avatar') as number,
      },
      medium: {
        width: 48,
        height: 48,
        borderRadius: variant === 'circle' ? 24 : ds.getBorderRadius('avatar') as number,
      },
      large: {
        width: 64,
        height: 64,
        borderRadius: variant === 'circle' ? 32 : ds.getBorderRadius('avatar') as number,
      },
      xlarge: {
        width: 96,
        height: 96,
        borderRadius: variant === 'circle' ? 48 : ds.getBorderRadius('avatar') as number,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      color: ds.colors.text.primary,
      fontWeight: '600',
    };

    const sizeStyles = {
      small: {
        fontSize: 12,
      },
      medium: {
        fontSize: 16,
      },
      large: {
        fontSize: 20,
      },
      xlarge: {
        fontSize: 28,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
    };
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'medium':
        return 24;
      case 'large':
        return 32;
      case 'xlarge':
        return 48;
      default:
        return iconSize;
    }
  };

  return (
    <View style={[getAvatarStyle(), style]}>
      {source ? (
        <Image
          source={{ uri: source }}
          style={{
            width: '100%',
            height: '100%',
          }}
          resizeMode="cover"
        />
      ) : icon ? (
        <Ionicons
          name={icon}
          size={getIconSize()}
          color={ds.colors.text.secondary}
        />
      ) : name ? (
        <Text style={[getTextStyle(), textStyle]}>
          {getInitials(name)}
        </Text>
      ) : (
        <Ionicons
          name="person"
          size={getIconSize()}
          color={ds.colors.text.secondary}
        />
      )}
    </View>
  );
}; 