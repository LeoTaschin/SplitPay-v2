import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';

interface EditButtonProps {
  isEditing: boolean;
  onToggle: () => void;
  style?: ViewStyle;
}

export const EditButton: React.FC<EditButtonProps> = ({
  isEditing,
  onToggle,
  style,
}) => {
  const ds = useDesignSystem();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          backgroundColor: isEditing 
            ? `${ds.colors.surface}`
            : ds.colors.surface 
        },
        style,
      ]}
      onPress={onToggle}
    >
      <Ionicons
        name={isEditing ? 'checkmark' : 'create-outline'}
        size={20}
        color={isEditing ? ds.colors.primary : ds.colors.text.secondary}
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