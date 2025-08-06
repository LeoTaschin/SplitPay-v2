import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ViewStyle,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useLanguage } from '../../context/LanguageContext';
import { useSlideAnimation } from '../hooks/useSlideAnimation';

interface StatCardOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  category: string;
}

interface StatCardSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (cardId: string) => void;
  availableCards: StatCardOption[];
  style?: ViewStyle;
}

export const StatCardSelector: React.FC<StatCardSelectorProps> = ({
  visible,
  onClose,
  onSelect,
  availableCards,
  style,
}) => {
  const ds = useDesignSystem();
  const { t } = useLanguage();
  const { slideAnim, fadeAnim } = useSlideAnimation({
    visible,
    slideDistance: 600,
    slideDuration: 300,
    fadeDuration: 300,
  });

  const categories = [
    { id: 'financial', name: t('dashboard.cardSelector.categories.financial'), icon: 'cash-outline' },
    { id: 'social', name: t('dashboard.cardSelector.categories.social'), icon: 'people-outline' },
    { id: 'analytics', name: t('dashboard.cardSelector.categories.analytics'), icon: 'analytics-outline' },
  ];

  const groupedCards = categories.map(category => ({
    ...category,
    cards: availableCards.filter(card => card.category === category.id)
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View 
          style={[
            styles.container, 
            { 
              backgroundColor: ds.colors.surface,
              transform: [{ translateY: slideAnim }]
            }, 
            style
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: ds.colors.text.primary }]}>
              {t('dashboard.cardSelector.title')}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons
                name="close"
                size={24}
                color={ds.colors.text.secondary}
              />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {groupedCards.map((category) => (
              <View key={category.id} style={styles.categorySection}>
                <View style={styles.categoryHeader}>
                  <Ionicons
                    name={category.icon as any}
                    size={20}
                    color={ds.colors.text.secondary}
                  />
                  <Text style={[styles.categoryTitle, { color: ds.colors.text.secondary }]}>
                    {category.name}
                  </Text>
                </View>
                
                {category.cards.map((card) => (
                  <TouchableOpacity
                    key={card.id}
                    style={[styles.cardOption, { backgroundColor: ds.colors.background }]}
                    onPress={() => onSelect(card.id)}
                  >
                    <View style={[styles.cardIcon, { backgroundColor: card.color + '20' }]}>
                      <Ionicons
                        name={card.icon as any}
                        size={20}
                        color={card.color}
                      />
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={[styles.cardTitle, { color: ds.colors.text.primary }]}>
                        {card.title}
                      </Text>
                      <Text style={[styles.cardDescription, { color: ds.colors.text.secondary }]}>
                        {card.description}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={ds.colors.text.secondary}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cardOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 