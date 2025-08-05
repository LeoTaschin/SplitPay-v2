import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/ui/Card';
import { useTotalToReceive, useTotalToPay } from '../store';

export const DashboardScreen: React.FC = () => {
  const { theme } = useTheme();
  const totalToReceive = useTotalToReceive();
  const totalToPay = useTotalToPay();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Dashboard
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Resumo das suas dívidas
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            A Receber
          </Text>
          <Text style={[styles.cardAmount, { color: theme.colors.success }]}>
            R$ {totalToReceive.toFixed(2)}
          </Text>
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            A Pagar
          </Text>
          <Text style={[styles.cardAmount, { color: theme.colors.error }]}>
            R$ {totalToPay.toFixed(2)}
          </Text>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Dívidas Recentes
        </Text>
        <Card>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Nenhuma dívida encontrada
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  cardsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  cardAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
  },
}); 