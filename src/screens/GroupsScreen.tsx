import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { BalanceCard } from '../design-system';

export const GroupsScreen: React.FC = () => {
  const { theme } = useTheme();
  const [groupBalance] = useState(-1250.75); // Exemplo de saldo

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Balanço Geral dos Grupos */}
      <View style={styles.balanceContainer}>
        <BalanceCard 
          balance={groupBalance}
          title="Balanço dos Grupos"
          style={styles.balanceCard}
        />
      </View>

      {/* Conteúdo da tela */}
      <View style={styles.content}>
        <Text style={[styles.text, { color: theme.colors.text }]}>
          Tela de Grupos
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Componente BalanceCard reutilizado
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  balanceContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  balanceCard: {
    marginBottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
  },
}); 