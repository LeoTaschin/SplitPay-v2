import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';

interface BadgeProps {
  title: string;
  description: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  style?: ViewStyle;
  textStyle?: TextStyle;
  onPress?: () => void;
  isUnlocked?: boolean;
}

// Componente Círculo
const Circle: React.FC<{
  size: number;
  color: string;
  icon: string;
  iconSize: number;
  isUnlocked: boolean;
}> = ({ size, color, icon, iconSize, isUnlocked }) => {
  return (
    <View style={styles.circleContainer}>
      {/* Círculo */}
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            backgroundColor: color,
            opacity: isUnlocked ? 1 : 0.3,
          },
        ]}
      >
        {/* Ícone centralizado */}
        <View style={styles.circleIcon}>
          <Ionicons
            name={icon as any}
            size={iconSize}
            color={isUnlocked ? 'white' : '#666'}
          />
        </View>
      </View>
    </View>
  );
};

export const Badge: React.FC<BadgeProps> = ({
  title,
  description,
  variant = 'primary',
  size = 'medium',
  icon,
  iconSize = 24,
  style,
  textStyle,
  onPress,
  isUnlocked = true,
}) => {
  const ds = useDesignSystem();

  const getBadgeColor = (): string => {
    const variantColors = {
      primary: ds.colors.primary,
      secondary: ds.colors.secondary,
      success: ds.colors.feedback.success,
      warning: ds.colors.feedback.warning,
      error: ds.colors.feedback.error,
      info: ds.colors.feedback.info,
    };
    return variantColors[variant];
  };

  const getCircleSize = (): number => {
    const sizeMap = {
      small: 40,
      medium: 50,
      large: 60,
    };
    return sizeMap[size];
  };

  const getIconSize = (): number => {
    const sizeMap = {
      small: 14,
      medium: 16,
      large: 20,
    };
    return sizeMap[size];
  };

  const getTextSize = (): { titleSize: number; descriptionSize: number } => {
    const sizeMap = {
      small: { titleSize: 8, descriptionSize: 6 },
      medium: { titleSize: 10, descriptionSize: 8 },
      large: { titleSize: 12, descriptionSize: 10 },
    };
    return sizeMap[size];
  };

  const circleSize = getCircleSize();
  const iconSizeValue = getIconSize();
  const textSizes = getTextSize();

  const BadgeContent = (
    <View style={[styles.container, style]}>
      {/* Círculo */}
      <Circle
        size={circleSize}
        color={isUnlocked ? getBadgeColor() : ds.colors.surfaceVariant}
        icon={icon || 'star'}
        iconSize={iconSizeValue}
        isUnlocked={isUnlocked}
      />

      {/* Título */}
      <Text
        style={[
          styles.title,
          {
            fontSize: textSizes.titleSize,
            color: isUnlocked ? ds.colors.text.primary : ds.colors.text.secondary,
            fontWeight: isUnlocked ? 'bold' : 'normal',
          },
          textStyle,
        ]}
      >
        {title}
      </Text>

      {/* Descrição */}
      <Text
        style={[
          styles.description,
          {
            fontSize: textSizes.descriptionSize,
            color: ds.colors.text.secondary,
          },
        ]}
      >
        {description}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {BadgeContent}
      </TouchableOpacity>
    );
  }

  return BadgeContent;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: 8,
  },
  circleContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 9999, // Círculo perfeito
  },
  circleIcon: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 1,
  },
  description: {
    textAlign: 'center',
    lineHeight: 10,
  },
}); 