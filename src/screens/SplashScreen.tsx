import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { useDesignSystem } from '../design-system/hooks/useDesignSystem';
import { Logo } from '../design-system/components/Logo';

interface SplashScreenProps {
  isReady?: boolean;
  onFadeOutComplete?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ isReady = false, onFadeOutComplete }) => {
  const ds = useDesignSystem();
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const fadeOut = Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 1000,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    });

    fadeOut.start(({ finished }) => {
      if (finished && onFadeOutComplete) {
        onFadeOutComplete();
      }
    });
  }, [isReady]);

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: ds.colors.background, opacity: opacityAnim },
      ]}
    >
      <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
        <Logo size={120} />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 