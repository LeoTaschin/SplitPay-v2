import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useDesignSystem } from '../hooks/useDesignSystem';

interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  variant?: 'spinner' | 'dots' | 'pulse';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  color,
  text,
  variant = 'spinner',
  style,
  textStyle,
}) => {
  const ds = useDesignSystem();

  const getContainerStyle = (): ViewStyle => ({
    alignItems: 'center',
    justifyContent: 'center',
    padding: ds.spacing.lg,
  });

  const getTextStyle = (): TextStyle => ({
    ...ds.text.body.medium,
    color: ds.colors.text.secondary,
    marginTop: ds.spacing.md,
    textAlign: 'center',
  });

  const getSpinnerColor = () => {
    return color || ds.colors.primary;
  };

  const renderSpinner = () => (
    <ActivityIndicator
      size={size}
      color={getSpinnerColor()}
    />
  );

  const renderDots = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {[0, 1, 2].map((index) => (
        <View
          key={index}
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: getSpinnerColor(),
            marginHorizontal: 4,
            opacity: 0.3 + (index * 0.3),
          }}
        />
      ))}
    </View>
  );

  const renderPulse = () => (
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: getSpinnerColor(),
        opacity: 0.6,
      }}
    />
  );

  const renderLoadingIndicator = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      default:
        return renderSpinner();
    }
  };

  return (
    <View style={[getContainerStyle(), style]}>
      {renderLoadingIndicator()}
      {text && (
        <Text style={[getTextStyle(), textStyle]}>
          {text}
        </Text>
      )}
    </View>
  );
}; 