import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useDesignSystem, ThemeDebug } from '../design-system';

export const SettingsScreen: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const ds = useDesignSystem();

  return (
    <ScrollView style={[styles.container, { backgroundColor: ds.colors.background }]}>
      <Text style={[styles.title, { color: ds.colors.text.primary }]}>
        Configurações
      </Text>
      
      {/* Toggle de Tema */}
      <View style={[styles.settingItem, { backgroundColor: ds.colors.surface }]}>
        <View style={styles.settingContent}>
          <Text style={[styles.settingLabel, { color: ds.colors.text.primary }]}>
            Modo Escuro
          </Text>
          <Text style={[styles.settingDescription, { color: ds.colors.text.secondary }]}>
            {isDark ? 'Ativado' : 'Desativado'}
          </Text>
        </View>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: ds.colors.border.primary, true: ds.colors.primary }}
          thumbColor={isDark ? ds.colors.surface : ds.colors.surface}
        />
      </View>
      
      {/* Informações do Tema */}
      <View style={[styles.infoCard, { backgroundColor: ds.colors.surface }]}>
        <Text style={[styles.infoTitle, { color: ds.colors.text.primary }]}>
          Informações do Tema
        </Text>
        <Text style={[styles.infoText, { color: ds.colors.text.secondary }]}>
          Tema atual: {isDark ? 'Escuro' : 'Claro'}
        </Text>
        <Text style={[styles.infoText, { color: ds.colors.text.secondary }]}>
          Cor de fundo: {ds.colors.background}
        </Text>
        <Text style={[styles.infoText, { color: ds.colors.text.secondary }]}>
          Cor do texto: {ds.colors.text.primary}
        </Text>
      </View>
      
      {/* Debug do Tema */}
      <ThemeDebug />
    </ScrollView>
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
    marginBottom: 30,
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
  },
}); 