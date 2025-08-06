import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Logo } from '../components/Logo';
import { useDesignSystem } from '../hooks/useDesignSystem';

export const LogoExample: React.FC = () => {
  const ds = useDesignSystem();

  return (
    <View style={[styles.container, { backgroundColor: ds.colors.background }]}>
      {/* Logo padrão */}
      <Logo />
      
      {/* Logo pequeno */}
      <Logo size={40} />
      
      {/* Logo grande */}
      <Logo size={120} />
      
      {/* Logo com estilo personalizado */}
      <Logo 
        size={100} 
        style={styles.customLogo} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 20,
  },
  customLogo: {
    opacity: 0.8,
    transform: [{ rotate: '5deg' }],
  },
}); 