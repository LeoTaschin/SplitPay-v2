import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';

interface EditIconButtonProps {
  onPress: () => void;
  style?: ViewStyle;
  icon?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
}

export const EditIconButton: React.FC<EditIconButtonProps> = ({
  onPress,
  style,
  icon = 'create-outline',
  iconSize = 20,
}) => {
  const ds = useDesignSystem();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          backgroundColor: ds.colors.surface 
        },
        style,
      ]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={iconSize}
        color={ds.colors.text.secondary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
