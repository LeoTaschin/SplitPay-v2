import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useLanguage } from '../../context/LanguageContext';
import { StatCard } from './StatCard';
import { EmptyStatCard } from './EmptyStatCard';

interface StatsCarouselProps {
  data: Array<{
    id: string;
    title: string;
    value: string;
    subtitle: string;
    icon?: keyof typeof Ionicons.glyphMap;
    color?: string;
    customIcon?: React.ReactNode;
  }>;
  isEditing?: boolean;
  onRemove?: (id: string) => void;
  onAdd?: () => void;
  style?: ViewStyle;
}

export const StatsCarousel: React.FC<StatsCarouselProps> = ({
  data,
  isEditing = false,
  onRemove,
  onAdd,
  style,
}) => {
  const ds = useDesignSystem();
  const { t } = useLanguage();
  const scrollViewRef = useRef<ScrollView>(null);
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth - 48 - 16) / 2; // 2 cards por vez com gap
  const cardHeight = cardWidth * 1.25; // Altura proporcional

  const renderCards = () => {
    const cards = [...data];
    
    // Adicionar card de "adicionar" se estiver editando
    if (isEditing && onAdd) {
      cards.push({ id: 'add', title: '', value: '', subtitle: '' });
    }

    return cards.map((item, index) => {
      if (item.id === 'add') {
        return (
          <View key="add" style={[styles.cardContainer, { width: cardWidth, height: cardHeight }]}>
            <EmptyStatCard
              onPress={onAdd}
              width={cardWidth - 8}
            />
          </View>
        );
      }

      return (
        <View key={item.id} style={[styles.cardContainer, { width: cardWidth, height: cardHeight }]}>
          <StatCard
            title={item.title}
            value={item.value}
            subtitle={item.subtitle}
            icon={item.icon as any}
            color={item.color}
            customIcon={item.customIcon}
            isEditing={isEditing}
            onRemove={() => onRemove?.(item.id)}
            width={cardWidth - 8}
          />
        </View>
      );
    });
  };

  return (
    <View style={[styles.container, style]}>
      {/* Carousel */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={cardWidth + 16}
        decelerationRate="fast"
      >
        {renderCards()}
      </ScrollView>

      {/* Navigation Dots */}
      {data.length > 2 && (
        <View style={styles.pagination}>
          {Array.from({ length: Math.ceil(data.length / 2) }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: ds.colors.border.primary }
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingLeft: 0,
    paddingRight: 0,
    gap: 16,
  },
  cardContainer: {
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
}); 