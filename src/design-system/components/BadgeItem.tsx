import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { Badge } from './BadgeSystem';

interface BadgeItemProps {
  badge: Badge;
  isSelected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  showProgress?: boolean;
}

export const BadgeItem: React.FC<BadgeItemProps> = ({
  badge,
  isSelected = false,
  onPress,
  style,
  showProgress = true,
}) => {
  const ds = useDesignSystem();

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

  const BadgeContent = (
    <View style={[styles.container, style]}>
      {/* Ícone do Badge */}
      <View style={[styles.badgeIcon, { backgroundColor: badge.isUnlocked ? getRankColor(badge.rank) + '20' : ds.colors.surfaceVariant }]}>
        <Ionicons
          name={badge.icon as any}
          size={20}
          color={badge.isUnlocked ? getRankColor(badge.rank) : '#666'}
        />
        
        {/* Indicador de rank pequeno */}
        <View style={[styles.rankIndicator, { backgroundColor: badge.isUnlocked ? getRankColor(badge.rank) : 'transparent' }]}>
          <Ionicons
            name={getRankIcon(badge.rank) as any}
            size={8}
            color={badge.isUnlocked ? 'white' : '#666'}
          />
        </View>
      </View>

      {/* Informações do Badge */}
      <View style={styles.badgeInfo}>
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.badgeName,
              {
                color: badge.isUnlocked ? ds.colors.text.primary : ds.colors.text.secondary,
                fontWeight: badge.isUnlocked ? '600' : 'normal',
              },
            ]}
          >
            {badge.name}
          </Text>
          
          {/* Status do Badge - apenas para badges bloqueados */}
          {!badge.isUnlocked && (
            <View style={styles.lockedStatus}>
              <Ionicons name="lock-closed" size={16} color={ds.colors.text.secondary} />
            </View>
          )}
        </View>

        <Text
          style={[
            styles.badgeDescription,
            {
              color: ds.colors.text.secondary,
            },
          ]}
        >
          {badge.description}
        </Text>

        {/* Rank e Raridade */}
        <View style={styles.detailsRow}>
          <View style={styles.rankContainer}>
            <Ionicons name="medal" size={12} color={getRankColor(badge.rank)} />
            <Text style={[styles.rankText, { color: getRankColor(badge.rank) }]}>
              {badge.rank.charAt(0).toUpperCase() + badge.rank.slice(1)}
            </Text>
          </View>
          
          {badge.rarity && (
            <View style={styles.rarityContainer}>
              <Ionicons name="star" size={12} color={ds.colors.text.secondary} />
              <Text style={[styles.rarityText, { color: ds.colors.text.secondary }]}>
                {badge.rarity.split('(')[0].trim()}
              </Text>
            </View>
          )}
        </View>

        {/* Barra de Progresso (apenas para badges bloqueados) */}
        {!badge.isUnlocked && badge.progress !== undefined && showProgress && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: ds.colors.text.secondary }]}>
                Progresso
              </Text>
              <Text style={[styles.progressText, { color: ds.colors.text.secondary }]}>
                {badge.progress}/{badge.maxProgress}
              </Text>
            </View>
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
          </View>
        )}
      </View>


    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={badge.isUnlocked ? 0.7 : 1}
        style={[
          styles.touchableContainer,
          {
            backgroundColor: isSelected ? ds.colors.primary + '20' : ds.colors.surface,
            borderColor: isSelected ? ds.colors.primary : ds.colors.border.primary,
            borderWidth: 1,
            opacity: badge.isUnlocked ? 1 : 0.6,
          },
        ]}
      >
        {BadgeContent}
      </TouchableOpacity>
    );
  }

  return BadgeContent;
};

const styles = StyleSheet.create({
  touchableContainer: {
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  badgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  rankIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  lockedStatus: {
    alignItems: 'flex-end',
  },
  badgeDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '500',
  },
  rarityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rarityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 2,
  },
});
