import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ViewStyle,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useLanguage } from '../../context/LanguageContext';
import { useSlideAnimation } from '../hooks/useSlideAnimation';
import { Badge } from './BadgeSystem';
import { BadgeItem } from './BadgeItem';

interface BadgeSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (selectedBadges: Badge[]) => void;
  availableBadges: Badge[];
  selectedBadges: Badge[];
}

export const BadgeSelectorModal: React.FC<BadgeSelectorModalProps> = ({
  visible,
  onClose,
  onSelect,
  availableBadges,
  selectedBadges,
}) => {
  const ds = useDesignSystem();
  const { t } = useLanguage();
  const { slideAnim, fadeAnim } = useSlideAnimation({
    visible,
    slideDistance: 600,
    slideDuration: 300,
    fadeDuration: 300,
  });

  const [tempSelectedBadges, setTempSelectedBadges] = useState<Badge[]>(selectedBadges);

  const categories = [
    { id: 'loyalty', name: t('badges.categories.loyalty'), icon: 'time', description: t('badges.categories.loyalty') },
    { id: 'social', name: t('badges.categories.social'), icon: 'people', description: t('badges.categories.social') },
    { id: 'events', name: t('badges.categories.events'), icon: 'calendar', description: t('badges.categories.events') },
    { id: 'values', name: t('badges.categories.values'), icon: 'wallet', description: t('badges.categories.values') },
  ];

  const handleBadgeSelect = (badge: Badge) => {
    // Verificar se o badge está bloqueado
    if (!badge.isUnlocked) {
      Alert.alert(
        t('badges.alerts.lockedBadge.title'),
        t('badges.alerts.lockedBadge.message').replace('{badgeName}', badge.name),
        [
          {
            text: t('badges.alerts.lockedBadge.button'),
            style: 'default',
          },
        ]
      );
      return;
    }

    const isSelected = tempSelectedBadges.some(selected => selected.id === badge.id);
    
    if (isSelected) {
      // Remove o badge se já estiver selecionado
      setTempSelectedBadges(prev => prev.filter(b => b.id !== badge.id));
    } else {
      // Remove qualquer badge da mesma categoria e adiciona o novo
      const filteredBadges = tempSelectedBadges.filter(b => b.category !== badge.category);
      setTempSelectedBadges([...filteredBadges, badge]);
    }
  };

  const handleSave = () => {
    onSelect(tempSelectedBadges);
  };

  const handleCancel = () => {
    setTempSelectedBadges(selectedBadges);
    onClose();
  };

  const isBadgeSelected = (badge: Badge) => {
    return tempSelectedBadges.some(selected => selected.id === badge.id);
  };

  const getSelectedBadgeForCategory = (categoryId: string) => {
    return tempSelectedBadges.find(badge => badge.category === categoryId);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleCancel}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View 
          style={[
            styles.container, 
            { 
              backgroundColor: ds.colors.surface,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: ds.colors.text.primary }]}>
              Selecionar Badges
            </Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <Ionicons
                name="close"
                size={24}
                color={ds.colors.text.secondary}
              />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {categories.map((category) => {
              const categoryBadges = availableBadges.filter(badge => badge.category === category.id);
              const selectedBadge = getSelectedBadgeForCategory(category.id);

              return (
                <View key={category.id} style={styles.categorySection}>
                  <View style={styles.categoryHeader}>
                    <View style={styles.categoryInfo}>
                      <Ionicons
                        name={category.icon as any}
                        size={20}
                        color={ds.colors.primary}
                      />
                      <View style={styles.categoryText}>
                        <Text style={[styles.categoryTitle, { color: ds.colors.text.primary }]}>
                          {category.name}
                        </Text>
                        <Text style={[styles.categoryDescription, { color: ds.colors.text.secondary }]}>
                          {category.description}
                        </Text>
                      </View>
                    </View>
                    
                    {selectedBadge && (
                      <View style={styles.selectedIndicator}>
                        <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                        <Text style={[styles.selectedText, { color: '#10B981' }]}>
                          Selecionado
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.badgesList}>
                    {categoryBadges.map((badge) => (
                      <BadgeItem
                        key={badge.id}
                        badge={badge}
                        isSelected={isBadgeSelected(badge)}
                        onPress={() => handleBadgeSelect(badge)}
                        showProgress={true}
                      />
                    ))}
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: ds.colors.surfaceVariant }]}
              onPress={handleCancel}
            >
              <Text style={[styles.buttonText, { color: '#616161' }]}>
                Cancelar
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, { backgroundColor: ds.colors.primary }]}
              onPress={handleSave}
            >
              <Text style={[styles.buttonText, { color: 'white' }]}>
                Salvar ({tempSelectedBadges.length})
              </Text>
            </TouchableOpacity>
          </View>
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
    maxHeight: '90%',
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
    marginBottom: 32,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryText: {
    marginLeft: 12,
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedText: {
    fontSize: 12,
    fontWeight: '500',
  },
  badgesList: {
    gap: 8,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },


  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
