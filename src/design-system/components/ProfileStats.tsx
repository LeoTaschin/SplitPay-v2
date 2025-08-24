import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useLanguage } from '../../context/LanguageContext';
import { BadgeSelectorModal } from './BadgeSelectorModal';
import { Badge } from './BadgeSystem';
import { getMockBadges } from './BadgeData';
import { EditIconButton } from './EditIconButton';
import { User } from '../../types';

interface ProfileStatsProps {
  user: User | null;
  style?: ViewStyle;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({
  user,
  style,
}) => {
  const ds = useDesignSystem();
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [selectedBadges, setSelectedBadges] = useState<Badge[]>([]);

  const handleBadgePress = (badge: Badge) => {
    console.log('Badge pressed:', badge.name);
  };

  const handleSelectBadges = (newSelectedBadges: Badge[]) => {
    setSelectedBadges(newSelectedBadges);
    setShowModal(false);
  };

  const handleEditPress = () => {
    setShowModal(true);
  };

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

  return (
    <View style={[styles.container, style]}>
      {/* Header com título e botão de editar */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: ds.colors.text.primary }]}>
          Badges
        </Text>
        <EditIconButton
          onPress={handleEditPress}
        />
      </View>

      {/* Badges selecionados */}
      {selectedBadges.length > 0 ? (
        <View style={styles.badgesContainer}>
          {selectedBadges.map((badge) => (
            <TouchableOpacity
              key={badge.id}
              style={styles.badgeItem}
              onPress={() => handleBadgePress(badge)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.badgeIcon,
                  {
                    backgroundColor: badge.isUnlocked ? getRankColor(badge.rank) : ds.colors.surfaceVariant,
                    opacity: badge.isUnlocked ? 1 : 0.3,
                  },
                ]}
              >
                <Ionicons
                  name={badge.icon as any}
                  size={24}
                  color={badge.isUnlocked ? 'white' : '#666'}
                />
                
                {/* Indicador de rank */}
                <View
                  style={[
                    styles.rankIndicator,
                    {
                      backgroundColor: badge.isUnlocked ? 'rgba(255,255,255,0.2)' : 'transparent',
                    },
                  ]}
                >
                  <Ionicons
                    name={getRankIcon(badge.rank) as any}
                    size={12}
                    color={badge.isUnlocked ? 'white' : '#666'}
                  />
                </View>
              </View>
              
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
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons 
            name="trophy-outline" 
            size={32} 
            color={ds.colors.text.secondary} 
          />
          <Text style={[styles.emptyText, { color: ds.colors.text.secondary }]}>
            Nenhum badge selecionado
          </Text>
          <Text style={[styles.emptySubtext, { color: ds.colors.text.secondary }]}>
            Toque no ícone de editar para escolher seus badges
          </Text>
        </View>
      )}

      {/* Modal de seleção de badges */}
      <BadgeSelectorModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSelect={handleSelectBadges}
        availableBadges={getMockBadges(t)}
        selectedBadges={selectedBadges}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  badgeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  rankIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeName: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
