import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ViewStyle,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useLanguage } from '../../context/LanguageContext';

// Tipos
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rank: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  category: 'loyalty' | 'social' | 'events' | 'values';
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
  isUnlocked: boolean;
  criteria?: string; // Critérios para desbloquear
  rarity?: string; // Raridade do badge
}

interface BadgeSystemProps {
  badges: Badge[];
  style?: ViewStyle;
  onBadgePress?: (badge: Badge) => void;
  showOnlyIcons?: boolean; // Nova prop para mostrar apenas ícones
}

// Componente Círculo (apenas ícone)
const BadgeIcon: React.FC<{
  size: number;
  color: string;
  icon: string;
  rankIcon: string;
  isUnlocked: boolean;
  onPress?: () => void;
}> = ({ size, color, icon, rankIcon, isUnlocked, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.badgeIconContainer}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.badgeIcon,
          {
            width: size,
            height: size,
            backgroundColor: color,
            opacity: isUnlocked ? 1 : 0.3,
          },
        ]}
      >
        {/* Ícone principal */}
        <Ionicons
          name={icon as any}
          size={size * 0.5}
          color={isUnlocked ? 'white' : '#666'}
        />
        
        {/* Indicador de rank no canto */}
        <View
          style={[
            styles.rankIndicator,
            {
              backgroundColor: isUnlocked ? 'rgba(255,255,255,0.2)' : 'transparent',
              width: size * 0.25,
              height: size * 0.25,
              borderRadius: size * 0.125,
            },
          ]}
        >
          <Ionicons
            name={rankIcon as any}
            size={size * 0.15}
            color={isUnlocked ? 'white' : '#666'}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Modal de Detalhes do Badge
const BadgeDetailsModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  badge: Badge | null;
}> = ({ visible, onClose, badge }) => {
  const ds = useDesignSystem();
  
  if (!badge) return null;

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'platinum': return '#E5E4E2';
      case 'diamond': return '#B9F2FF';
      default: return '#CD7F32';
    }
  };

  const getRankName = (rank: string) => {
    switch (rank) {
      case 'bronze': return 'Bronze';
      case 'silver': return 'Prata';
      case 'gold': return 'Ouro';
      case 'platinum': return 'Platina';
      case 'diamond': return 'Diamante';
      default: return 'Bronze';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: ds.colors.background }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: ds.colors.text.primary }]}>
              Detalhes do Badge
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={ds.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Badge Principal */}
          <View style={styles.badgeMainSection}>
            <View
              style={[
                styles.badgeMainIcon,
                {
                  backgroundColor: getRankColor(badge.rank),
                  opacity: badge.isUnlocked ? 1 : 0.3,
                },
              ]}
            >
              <Ionicons
                name={badge.icon as any}
                size={48}
                color={badge.isUnlocked ? 'white' : '#666'}
              />
            </View>
            
            <Text style={[styles.badgeMainName, { color: ds.colors.text.primary }]}>
              {badge.name}
            </Text>
            
            <Text style={[styles.badgeMainDescription, { color: ds.colors.text.secondary }]}>
              {badge.description}
            </Text>
          </View>

          {/* Informações Detalhadas */}
          <View style={styles.badgeDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="medal" size={20} color={getRankColor(badge.rank)} />
              <Text style={[styles.detailLabel, { color: ds.colors.text.secondary }]}>
                Rank:
              </Text>
              <Text style={[styles.detailValue, { color: getRankColor(badge.rank) }]}>
                {getRankName(badge.rank)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="folder" size={20} color={ds.colors.text.secondary} />
              <Text style={[styles.detailLabel, { color: ds.colors.text.secondary }]}>
                Categoria:
              </Text>
              <Text style={[styles.detailValue, { color: ds.colors.text.primary }]}>
                {badge.category === 'loyalty' ? 'Fidelidade' :
                 badge.category === 'social' ? 'Social' :
                 badge.category === 'events' ? 'Eventos' : 'Valores'}
              </Text>
            </View>

            {badge.criteria && (
              <View style={styles.detailRow}>
                <Ionicons name="checkmark-circle" size={20} color={ds.colors.text.secondary} />
                <Text style={[styles.detailLabel, { color: ds.colors.text.secondary }]}>
                  Critérios:
                </Text>
                <Text style={[styles.detailValue, { color: ds.colors.text.primary }]}>
                  {badge.criteria}
                </Text>
              </View>
            )}

            {badge.rarity && (
              <View style={styles.detailRow}>
                <Ionicons name="star" size={20} color={ds.colors.text.secondary} />
                <Text style={[styles.detailLabel, { color: ds.colors.text.secondary }]}>
                  Raridade:
                </Text>
                <Text style={[styles.detailValue, { color: ds.colors.text.primary }]}>
                  {badge.rarity}
                </Text>
              </View>
            )}

            {/* Status */}
            <View style={styles.statusSection}>
              {badge.isUnlocked ? (
                <View style={styles.unlockedStatus}>
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  <Text style={[styles.statusText, { color: '#10B981' }]}>
                    Desbloqueado
                  </Text>
                  {badge.unlockedAt && (
                    <Text style={[styles.unlockDate, { color: ds.colors.text.secondary }]}>
                      em {badge.unlockedAt.toLocaleDateString('pt-BR')}
                    </Text>
                  )}
                </View>
              ) : (
                <View style={styles.lockedStatus}>
                  <Ionicons name="lock-closed" size={24} color="#EF4444" />
                  <Text style={[styles.statusText, { color: '#EF4444' }]}>
                    Bloqueado
                  </Text>
                  {badge.progress !== undefined && (
                    <View style={styles.progressSection}>
                      <View style={[styles.progressBar, { backgroundColor: ds.colors.surfaceVariant }]}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              backgroundColor: getRankColor(badge.rank),
                              width: `${(badge.progress / badge.maxProgress!) * 100}%`,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.progressText, { color: ds.colors.text.secondary }]}>
                        {badge.progress}/{badge.maxProgress}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Componente Principal
export const BadgeSystem: React.FC<BadgeSystemProps> = ({
  badges,
  style,
  onBadgePress,
  showOnlyIcons = true, // Padrão: mostrar apenas ícones
}) => {
  const ds = useDesignSystem();
  const { t } = useLanguage();
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [showModal, setShowModal] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'loyalty': return 'time';
      case 'social': return 'people';
      case 'events': return 'calendar';
      case 'values': return 'wallet';
      default: return 'star';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'loyalty': return 'Fidelidade';
      case 'social': return 'Social';
      case 'events': return 'Eventos';
      case 'values': return 'Valores';
      default: return 'Geral';
    }
  };

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case 'bronze': return 'medal';
      case 'silver': return 'medal';
      case 'gold': return 'trophy';
      case 'platinum': return 'diamond';
      case 'diamond': return 'diamond';
      default: return 'medal';
    }
  };

  const categories = ['loyalty', 'social', 'events', 'values'];

  const handleBadgePress = (badge: Badge) => {
    setSelectedBadge(badge);
    setShowModal(true);
    onBadgePress?.(badge);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBadge(null);
  };

  if (showOnlyIcons) {
    return (
      <View style={[styles.container, style]}>
        <Text style={[styles.title, { color: ds.colors.text.primary }]}>
          🏆 Badges
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {categories.map((category) => {
            const categoryBadges = badges.filter((badge) => badge.category === category);
            const unlockedCount = categoryBadges.filter((badge) => badge.isUnlocked).length;

            return (
              <View key={category} style={styles.categorySection}>
                <View style={styles.categoryHeader}>
                  <Ionicons
                    name={getCategoryIcon(category) as any}
                    size={20}
                    color={ds.colors.primary}
                  />
                  <Text style={[styles.categoryTitle, { color: ds.colors.text.primary }]}>
                    {getCategoryName(category)}
                  </Text>
                  <Text style={[styles.categoryCount, { color: ds.colors.text.secondary }]}>
                    {unlockedCount}/{categoryBadges.length}
                  </Text>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.badgesScroll}
                >
                  {categoryBadges.map((badge) => (
                    <BadgeIcon
                      key={badge.id}
                      size={40}
                      color={badge.isUnlocked ? getRankColor(badge.rank) : ds.colors.surfaceVariant}
                      icon={badge.icon}
                      rankIcon={getRankIcon(badge.rank)}
                      isUnlocked={badge.isUnlocked}
                      onPress={() => handleBadgePress(badge)}
                    />
                  ))}
                </ScrollView>
              </View>
            );
          })}
        </ScrollView>

        {/* Modal de Detalhes */}
        <BadgeDetailsModal
          visible={showModal}
          onClose={closeModal}
          badge={selectedBadge}
        />
      </View>
    );
  }

  // Fallback para o modo antigo (com texto)
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, { color: ds.colors.text.primary }]}>
        🏆 Badges
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
        {categories.map((category) => {
          const categoryBadges = badges.filter((badge) => badge.category === category);
          const unlockedCount = categoryBadges.filter((badge) => badge.isUnlocked).length;

          return (
            <View key={category} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Ionicons
                  name={getCategoryIcon(category) as any}
                  size={20}
                  color={ds.colors.primary}
                />
                <Text style={[styles.categoryTitle, { color: ds.colors.text.primary }]}>
                  {getCategoryName(category)}
                </Text>
                <Text style={[styles.categoryCount, { color: ds.colors.text.secondary }]}>
                  {unlockedCount}/{categoryBadges.length}
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.badgesScroll}
              >
                {categoryBadges.map((badge) => (
                  <TouchableOpacity
                    key={badge.id}
                    style={styles.badgeContainer}
                    onPress={() => handleBadgePress(badge)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.circle,
                        {
                          width: 50,
                          height: 50,
                          backgroundColor: badge.isUnlocked ? getRankColor(badge.rank) : ds.colors.surfaceVariant,
                          opacity: badge.isUnlocked ? 1 : 0.3,
                        },
                      ]}
                    >
                      <View style={styles.circleIcon}>
                        <Ionicons
                          name={badge.icon as any}
                          size={20}
                          color={badge.isUnlocked ? 'white' : '#666'}
                        />
                      </View>
                    </View>

                    <Text
                      style={[
                        styles.badgeName,
                        {
                          color: badge.isUnlocked ? ds.colors.text.primary : ds.colors.text.secondary,
                          fontWeight: badge.isUnlocked ? 'bold' : 'normal',
                        },
                      ]}
                    >
                      {badge.name}
                    </Text>

                    {!badge.isUnlocked && badge.progress !== undefined && (
                      <View style={styles.progressContainer}>
                        <View style={[styles.progressBar, { backgroundColor: ds.colors.surfaceVariant }]}>
                          <View
                            style={[
                              styles.progressFill,
                              {
                                backgroundColor: getRankColor(badge.rank),
                                width: `${(badge.progress / badge.maxProgress!) * 100}%`,
                              },
                            ]}
                          />
                        </View>
                        <Text style={[styles.progressText, { color: ds.colors.text.secondary }]}>
                          {badge.progress}/{badge.maxProgress}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>

      {/* Modal de Detalhes */}
      <BadgeDetailsModal
        visible={showModal}
        onClose={closeModal}
        badge={selectedBadge}
      />
    </View>
  );
};

// Função auxiliar para obter cor do rank
const getRankColor = (rank: string) => {
  switch (rank) {
    case 'bronze': return '#CD7F32';
    case 'silver': return '#C0C0C0';
    case 'gold': return '#FFD700';
    case 'platinum': return '#E5E4E2';
    case 'diamond': return '#B9F2FF';
    default: return '#CD7F32';
  }
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  categoriesScroll: {
    marginBottom: 16,
  },
  categorySection: {
    marginRight: 24,
    minWidth: 200,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  categoryCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  badgesScroll: {
    marginBottom: 8,
  },
  badgeContainer: {
    alignItems: 'center',
    marginRight: 8,
  },
  badgeIconContainer: {
    marginRight: 8,
  },
  badgeIcon: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 9999,
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
    borderRadius: 9999,
  },
  circleIcon: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeName: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
  progressContainer: {
    width: '100%',
    marginTop: 4,
  },
  progressBar: {
    height: 3,
    borderRadius: 2,
    marginBottom: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 8,
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: Dimensions.get('window').width * 0.9,
    maxHeight: Dimensions.get('window').height * 0.8,
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  badgeMainSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  badgeMainIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeMainName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeMainDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  badgeDetails: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    flex: 1,
  },
  statusSection: {
    marginTop: 8,
  },
  unlockedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lockedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  unlockDate: {
    fontSize: 12,
    marginLeft: 8,
  },
  progressSection: {
    marginTop: 8,
    width: '100%',
  },
});
