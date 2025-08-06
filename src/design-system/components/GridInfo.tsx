import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useLanguage } from '../../context/LanguageContext';

interface GridInfoProps {
  currentCount: number;
  maxCount: number;
  isEditing: boolean;
  availableSlots?: number;
}

export const GridInfo: React.FC<GridInfoProps> = ({
  currentCount,
  maxCount,
  isEditing,
  availableSlots = 0,
}) => {
  const ds = useDesignSystem();
  const { t } = useLanguage();

  const getGridLayout = (count: number) => {
    return '3x3'; // Sempre 3x3 agora
  };

  const getGridSize = (count: number) => {
    return t('dashboard.sizeResponsive'); // Responsivo
  };

  if (!isEditing) return null;

  return (
    <View style={styles.container}>
      <View style={styles.infoRow}>
        <Ionicons
          name="add-circle-outline"
          size={16}
          color={ds.colors.text.secondary}
        />
        <Text style={[styles.infoText, { color: ds.colors.text.secondary }]}>
          {availableSlots} {availableSlots === 1 ? t('dashboard.slot') : t('dashboard.slots')} {t('dashboard.available')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: 0,
    paddingRight: 0,
    paddingVertical: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    fontWeight: '500',
  },
}); 