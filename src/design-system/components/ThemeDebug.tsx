import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useTheme } from '../../context/ThemeContext';

export const ThemeDebug: React.FC = () => {
  const ds = useDesignSystem();
  const { isDark, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: ds.colors.background }]}>
      <Text style={[styles.title, { color: ds.colors.text.primary }]}>
        Debug do Tema
      </Text>
      
      <View style={[styles.infoCard, { backgroundColor: ds.colors.surface }]}>
        <Text style={[styles.infoText, { color: ds.colors.text.primary }]}>
          Tema atual: {isDark ? 'ESCURO' : 'CLARO'}
        </Text>
        <Text style={[styles.infoText, { color: ds.colors.text.secondary }]}>
          Background: {ds.colors.background}
        </Text>
        <Text style={[styles.infoText, { color: ds.colors.text.secondary }]}>
          Surface: {ds.colors.surface}
        </Text>
        <Text style={[styles.infoText, { color: ds.colors.text.secondary }]}>
          Text Primary: {ds.colors.text.primary}
        </Text>
        <Text style={[styles.infoText, { color: ds.colors.text.secondary }]}>
          Text Secondary: {ds.colors.text.secondary}
        </Text>
        <Text style={[styles.infoText, { color: ds.colors.text.secondary }]}>
          Primary: {ds.colors.primary}
        </Text>
        <Text style={[styles.infoText, { color: ds.colors.text.secondary }]}>
          Border: {ds.colors.border}
        </Text>
      </View>
      
      <View style={[styles.testCard, { backgroundColor: ds.colors.surface }]}>
        <Text style={[styles.testText, { color: ds.colors.text.primary }]}>
          Este é um texto de teste
        </Text>
        <Text style={[styles.testText, { color: ds.colors.text.secondary }]}>
          Este é um texto secundário
        </Text>
        <View style={[styles.testButton, { backgroundColor: ds.colors.primary }]}>
          <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
            Botão de Teste
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
  },
  testCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  testText: {
    fontSize: 16,
    marginBottom: 12,
  },
  testButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
