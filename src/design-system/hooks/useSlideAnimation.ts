import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

interface UseSlideAnimationProps {
  visible: boolean;
  slideDistance?: number;
  slideDuration?: number;
  fadeDuration?: number;
}

export const useSlideAnimation = ({
  visible,
  slideDistance = 600,
  slideDuration = 300,
  fadeDuration = 300,
}: UseSlideAnimationProps) => {
  const slideAnim = useRef(new Animated.Value(slideDistance)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset para posição inicial
      slideAnim.setValue(slideDistance);
      fadeAnim.setValue(0);
      
      // Animar entrada
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: slideDuration,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: fadeDuration,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animar saída
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: slideDistance,
          duration: slideDuration * 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: fadeDuration * 0.8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim, slideDistance, slideDuration, fadeDuration]);

  return {
    slideAnim,
    fadeAnim,
  };
}; 