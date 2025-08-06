import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { Avatar } from './Avatar';

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
  customIcon?: React.ReactNode;
  isEditing?: boolean;
  onRemove?: () => void;
  width?: number;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  valueStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = '#10B981',
  customIcon,
  isEditing = false,
  onRemove,
  width = 120,
  style,
  titleStyle,
  valueStyle,
  subtitleStyle,
}) => {
  const ds = useDesignSystem();

  // Layout melhorado com design moderno
  const getSizeStyles = () => {
    return {
      container: { 
        width: width, 
        aspectRatio: 0.8, // Altura maior (1.25x a largura)
        padding: 20, // Padding maior para respiração
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        minWidth: Math.min(width, 160), // Mínimo maior
        minHeight: Math.min(width * 1.25, 200) // Altura mínima maior
      },
      icon: { 
        width: 64, // Ícone ainda maior
        height: 64, // Ícone ainda maior
        borderRadius: 32,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        marginBottom: 20 // Espaçamento maior
      },
      iconSize: 32, // Tamanho do ícone maior
      content: {
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        flex: 1,
        gap: 8 // Espaçamento entre elementos
      },
      valueFontSize: 14, // Fonte maior para destaque
      titleFontSize: 10, // Fonte adequada
      subtitleFontSize: 14, // Fonte legível
      removeButton: { 
        width: 32, // Botão maior
        height: 32, // Botão maior
        top: -8, // Posição ajustada
        right: -8 // Posição ajustada
      }
    };
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={[styles.container, sizeStyles.container, { backgroundColor: ds.colors.surface}, style]}>
      {isEditing && onRemove && (
        <TouchableOpacity
          style={[styles.removeButton, sizeStyles.removeButton]}
          onPress={onRemove}
        >
          <Ionicons
            name="close-circle"
            size={20}
            color="#EF4444"
          />
        </TouchableOpacity>
      )}
      
      {/* Icon */}
      <View style={[styles.icon, sizeStyles.icon, { backgroundColor: color + '20' }]}>
        {customIcon ? (
          customIcon
        ) : (
          <Ionicons name={icon as any} size={sizeStyles.iconSize} color={color} />
        )}
      </View>
      
      {/* Content */}
      <View style={[styles.content, sizeStyles.content]}>
        <Text style={[styles.value, { fontSize: sizeStyles.valueFontSize, color: ds.colors.text.primary }, valueStyle]}>
          {value}
        </Text>
        <Text style={[styles.title, { fontSize: sizeStyles.titleFontSize, color: ds.colors.text.secondary }, titleStyle]}>
          {title}
        </Text>
        <Text style={[styles.subtitle, { fontSize: sizeStyles.subtitleFontSize, color: ds.colors.text.secondary }, subtitleStyle]}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },

  icon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  title: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 8,
    opacity: 0.7,
    textAlign: 'center',
  },
}); 