import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'react-native';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useTheme } from '../../context/ThemeContext';

export const ThemeDebug: React.FC = () => {
  const ds = useDesignSystem();
  const { isDark, themeMode, systemColorScheme, setThemeMode, isLoaded } = useTheme();
  const reactNativeColorScheme = useColorScheme();
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    setLastUpdate(new Date());
  }, [systemColorScheme, isDark, reactNativeColorScheme]);

  return (
    <View style={[styles.container, { backgroundColor: ds.colors.background }]}>
      <Text style={[styles.title, { color: ds.colors.text.primary }]}>
        Debug do Tema
      </Text>
      
      <View style={[styles.infoCard, { backgroundColor: ds.colors.surface }]}>
        <Text style={[styles.infoText, { color: ds.colors.text.primary }]}>
          🎨 Tema Atual: {isDark ? 'ESCURO' : 'CLARO'}
        </Text>
        <Text style={[styles.infoText, { color: ds.colors.text.secondary }]}>
          🔧 Modo: {themeMode.toUpperCase()}
        </Text>
        <Text style={[styles.infoText, { color: ds.colors.text.secondary }]}>
          📱 Sistema (Robusto): {systemColorScheme.toUpperCase()}
        </Text>
        <Text style={[styles.infoText, { color: ds.colors.text.secondary }]}>
          📱 Sistema (RN Hook): {reactNativeColorScheme?.toUpperCase() || 'NULL'}
        </Text>
        <Text style={[styles.infoText, { color: ds.colors.text.secondary }]}>
          ⏰ Última atualização: {lastUpdate.toLocaleTimeString()}
        </Text>
        <Text style={[styles.infoText, { color: ds.colors.text.secondary }]}>
          🔄 Carregado: {isLoaded ? '✅' : '❌'}
        </Text>
        <Text style={[styles.infoText, { color: ds.colors.text.secondary }]}>
          🔗 Sincronizado: {themeMode === 'system' ? (systemColorScheme === (isDark ? 'dark' : 'light') ? '✅' : '❌') : 'N/A'}
        </Text>
      </View>

      <View style={[styles.controlsCard, { backgroundColor: ds.colors.surface }]}>
        <Text style={[styles.subtitle, { color: ds.colors.text.primary }]}>
          Controles Rápidos
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.quickButton, { 
              backgroundColor: themeMode === 'light' ? ds.colors.primary : ds.colors.border.primary 
            }]}
            onPress={() => setThemeMode('light')}
          >
            <Text style={[styles.buttonText, { 
              color: themeMode === 'light' ? 'white' : ds.colors.text.secondary 
            }]}>☀️ Claro</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickButton, { 
              backgroundColor: themeMode === 'dark' ? ds.colors.primary : ds.colors.border.primary 
            }]}
            onPress={() => setThemeMode('dark')}
          >
            <Text style={[styles.buttonText, { 
              color: themeMode === 'dark' ? 'white' : ds.colors.text.secondary 
            }]}>🌙 Escuro</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickButton, { 
              backgroundColor: themeMode === 'system' ? ds.colors.primary : ds.colors.border.primary 
            }]}
            onPress={() => setThemeMode('system')}
          >
            <Text style={[styles.buttonText, { 
              color: themeMode === 'system' ? 'white' : ds.colors.text.secondary 
            }]}>⚙️ Sistema</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.infoCard, { backgroundColor: ds.colors.surface }]}>
        <Text style={[styles.subtitle, { color: ds.colors.text.primary }]}>
          Informações de Cores
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
          Primary: {ds.colors.primary}
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
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  controlsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
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
    fontSize: 14,
    fontWeight: '600',
  },
});
