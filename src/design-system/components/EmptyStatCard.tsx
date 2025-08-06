import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';

interface EmptyStatCardProps {
  onPress?: () => void;
  width?: number;
  style?: ViewStyle;
}

export const EmptyStatCard: React.FC<EmptyStatCardProps> = ({
  onPress,
  width = 120,
  style,
}) => {
  const ds = useDesignSystem();

  // Layout organizado com ícone
  const getSizeStyles = () => {
    return {
      container: { 
        width: width, 
        aspectRatio: 0.8, // Altura maior (1.25x a largura)
        padding: 16, // Padding maior
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        minWidth: Math.min(width, 160), // Mínimo maior
        minHeight: Math.min(width * 1.25, 200) // Altura mínima maior
      },
      content: {
        alignItems: 'center' as const,
        justifyContent: 'center' as const
      },
      iconSize: 32 // Tamanho do ícone de adicionar maior
    };
  };

  const sizeStyles = getSizeStyles();
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container 
      style={[styles.container, sizeStyles.container, { backgroundColor: ds.colors.surface}, style]}
      onPress={onPress}
    >
      <View style={[styles.content, sizeStyles.content]}>
        <Ionicons
          name="add"
          size={sizeStyles.iconSize}
          color={ds.colors.primary}
        />
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB' + '30',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },

  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 