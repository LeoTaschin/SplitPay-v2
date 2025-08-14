import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { UserPresence } from '../../services/presenceService';

interface OnlineIndicatorProps {
  presence: UserPresence;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  showBorder?: boolean;
}

export const OnlineIndicator: React.FC<OnlineIndicatorProps> = ({
  presence,
  size = 'medium',
  style,
  showBorder = true,
}) => {
  const ds = useDesignSystem();

  const getSize = () => {
    switch (size) {
      case 'small': return 8;
      case 'large': return 16;
      default: return 12;
    }
  };

  const getBorderSize = () => {
    switch (size) {
      case 'small': return 2;
      case 'large': return 3;
      default: return 2;
    }
  };

  const getStatusColor = () => {
    switch (presence.status) {
      case 'online':
        return '#10B981'; // Green
      case 'away':
        return '#F59E0B'; // Yellow
      case 'busy':
        return '#EF4444'; // Red
      case 'offline':
      default:
        return '#9CA3AF'; // Gray
    }
  };

  const indicatorSize = getSize();
  const borderSize = getBorderSize();

  // Don't show indicator if user is offline
  if (!presence.isOnline || presence.status === 'offline') {
    return null;
  }

  return (
    <View style={[
      styles.container,
      {
        width: indicatorSize + (showBorder ? borderSize * 2 : 0),
        height: indicatorSize + (showBorder ? borderSize * 2 : 0),
        borderRadius: (indicatorSize + (showBorder ? borderSize * 2 : 0)) / 2,
        borderWidth: showBorder ? borderSize : 0,
        borderColor: ds.colors.surface,
        backgroundColor: getStatusColor(),
      },
      style
    ]} />
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
});
