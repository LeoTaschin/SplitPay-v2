import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { Card } from './Card';
import { formatCurrency } from '../../utils/formatters';

interface BalanceCardProps {
  balance: number;
  title?: string;
  style?: ViewStyle;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  title = 'Balanço Geral',
  style
}) => {
  const ds = useDesignSystem();
  
  const isPositive = balance >= 0;
  const isZero = balance === 0;
  const formattedBalance = formatCurrency(Math.abs(balance));
  const displayValue = isZero ? formattedBalance : `${isPositive ? '+' : '-'}${formattedBalance}`;

  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: isZero 
          ? ds.colors.surface
          : isPositive 
            ? ds.colors.feedback.success + '1A' // 10% opacity
            : ds.colors.feedback.error + '1A'   // 10% opacity
      }
    ]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: ds.colors.text.secondary }]}>
          {title}
        </Text>
        <Text style={[
          styles.value, 
          { 
            color: isZero 
              ? ds.colors.text.primary
              : isPositive 
                ? ds.colors.feedback.success 
                : ds.colors.feedback.error 
          }
        ]}>
          {displayValue}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 0,
  },
  content: {
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
