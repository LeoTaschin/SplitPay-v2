import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useDesignSystem } from '../hooks/useDesignSystem';

interface DebtItemProps {
  personName: string;
  description: string;
  amount: number;
  isCreditor: boolean;
  date: string;
  isGroup?: boolean;
  style?: ViewStyle;
  personNameStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  amountStyle?: TextStyle;
  dateStyle?: TextStyle;
  groupBadgeStyle?: ViewStyle;
  groupTextStyle?: TextStyle;
}

export const DebtItem: React.FC<DebtItemProps> = ({
  personName,
  description,
  amount,
  isCreditor,
  date,
  isGroup = false,
  style,
  personNameStyle,
  descriptionStyle,
  amountStyle,
  dateStyle,
  groupBadgeStyle,
  groupTextStyle,
}) => {
  const ds = useDesignSystem();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <View style={[styles.container, { backgroundColor: ds.colors.surface }, style]}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={[styles.personName, { color: ds.colors.text.primary }, personNameStyle]}>
            {personName}
          </Text>
          <Text style={[styles.description, { color: ds.colors.text.secondary }, descriptionStyle]}>
            {description}
          </Text>
        </View>
        
        <View style={styles.amount}>
          <Text style={[
            styles.value, 
            { color: isCreditor ? '#10B981' : '#EF4444' },
            amountStyle
          ]}>
            {isCreditor ? '+' : '-'} {formatCurrency(amount)}
          </Text>
          <Text style={[styles.type, { color: ds.colors.text.secondary }]}>
            {isCreditor ? 'A Receber' : 'A Pagar'}
          </Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={[styles.date, { color: ds.colors.text.secondary }, dateStyle]}>
          {date}
        </Text>
        {isGroup && (
          <View style={[styles.groupBadge, { backgroundColor: ds.colors.primary + '20' }, groupBadgeStyle]}>
            <Text style={[styles.groupText, { color: ds.colors.primary }, groupTextStyle]}>
              Grupo
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  info: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    marginTop: 4,
  },
  amount: {
    alignItems: 'flex-end',
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  type: {
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
  },
  groupBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  groupText: {
    fontSize: 12,
    fontWeight: '600',
  },
}); 