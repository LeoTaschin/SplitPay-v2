import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Dimensions,
} from 'react-native';
import { useDesignSystem } from '../hooks/useDesignSystem';

interface StatsGridProps {
  children: React.ReactNode;
  style?: ViewStyle;
  itemCount?: number;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  children,
  style,
  itemCount = 4,
}) => {
  const ds = useDesignSystem();

  // Layout 3x3 sempre, mas com cards menores e responsivos
  const getGridConfig = (count: number) => {
    const screenWidth = Dimensions.get('window').width;
    const paddingHorizontal = 24;
    const availableWidth = screenWidth - (paddingHorizontal * 2);
    const gap = 4; // Gap ainda menor
    
    // Sempre 3 colunas, mas com largura calculada
    const cardWidth = (availableWidth - (gap * 2)) / 3;
    
    return { 
      width: cardWidth,
      gap: gap,
      justifyContent: 'flex-start' as const,
      minWidth: Math.min(cardWidth, 80), // Mínimo menor
      minHeight: Math.min(cardWidth, 80), // Mínimo menor
      columns: 3 // Sempre 3 colunas
    };
  };

  const gridConfig = getGridConfig(itemCount);

  return (
    <View style={[
      styles.container, 
      { 
        gap: gridConfig.gap,
        justifyContent: gridConfig.justifyContent,
        minWidth: gridConfig.minWidth,
        minHeight: gridConfig.minHeight
      }, 
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
}); 