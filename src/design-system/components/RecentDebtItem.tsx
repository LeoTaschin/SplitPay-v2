import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useLanguage } from '../../context/LanguageContext';
import { Avatar } from './Avatar';
import { Timestamp } from 'firebase/firestore';

interface RecentDebtItemProps {
  personName: string;
  personPhoto?: string;
  description: string;
  amount: number;
  isCreditor: boolean;
  date: string | Date | Timestamp;
  isGroup?: boolean;
  style?: ViewStyle;
  personNameStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  amountStyle?: TextStyle;
  dateStyle?: TextStyle;
  groupBadgeStyle?: ViewStyle;
  groupTextStyle?: TextStyle;
}

export const RecentDebtItem: React.FC<RecentDebtItemProps> = ({
  personName,
  personPhoto,
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
  const { t } = useLanguage();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateInput: string | Date | Timestamp) => {
    console.log('RecentDebtItem - dateInput:', dateInput, 'type:', typeof dateInput);
    
    let date: Date;
    
    // Se for Firestore Timestamp
    if (dateInput instanceof Timestamp) {
      date = dateInput.toDate();
      console.log('RecentDebtItem - É um Firestore Timestamp:', date);
    }
    // Se já for um objeto Date
    else if (dateInput instanceof Date) {
      date = dateInput;
      console.log('RecentDebtItem - É um Date:', date);
    } else {
      // Se for string, tentar converter
      date = new Date(dateInput);
      console.log('RecentDebtItem - Convertido de string:', date);
      
      // Se for timestamp do Firebase (seconds)
      if (typeof dateInput === 'string' && !isNaN(Number(dateInput))) {
        const timestamp = Number(dateInput);
        console.log('RecentDebtItem - Timestamp detectado:', timestamp);
        // Se for em segundos (Firebase), converter para milissegundos
        if (timestamp < 1000000000000) {
          date = new Date(timestamp * 1000);
          console.log('RecentDebtItem - Convertido de segundos:', date);
        } else {
          date = new Date(timestamp);
          console.log('RecentDebtItem - Convertido de milissegundos:', date);
        }
      }
    }
    
    // Verificar se a data é válida
    if (isNaN(date.getTime())) {
      console.log('RecentDebtItem - Data inválida');
      return 'Data inválida';
    }
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Se for hoje
    if (diffDays === 0) {
      return t('date.today');
    }
    
    // Se for ontem
    if (diffDays === 1) {
      return t('date.yesterday');
    }
    
    // Se for esta semana
    if (diffDays <= 7) {
      return date.toLocaleDateString(t('common.language') === 'en' ? 'en-US' : 'pt-BR', { weekday: 'long' });
    }
    
    // Se for este mês
    if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString(t('common.language') === 'en' ? 'en-US' : 'pt-BR', { day: 'numeric', month: 'long' });
    }
    
    // Caso contrário, mostrar data completa
    return date.toLocaleDateString(t('common.language') === 'en' ? 'en-US' : 'pt-BR', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getStatusIcon = () => {
    return isCreditor ? 'arrow-up-circle' : 'arrow-down-circle';
  };

  const getStatusColor = () => {
    return isCreditor ? '#10B981' : '#EF4444';
  };

  const getStatusText = () => {
    return isCreditor ? 'A Receber' : 'A Pagar';
  };

  return (
    <View style={[styles.container, { backgroundColor: ds.colors.surface }, style]}>
      {/* Header com Avatar e Status */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Avatar
            source={personPhoto}
            name={personName}
            size="medium"
            variant="circle"
          />
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() + '20' }]}>
            <Ionicons 
              name={getStatusIcon() as any} 
              size={24} 
              color={getStatusColor()} 
            />
          </View>
        </View>
        
        <View style={styles.info}>
          <Text style={[styles.personName, { color: ds.colors.text.primary }, personNameStyle]}>
            {personName}
          </Text>
          <Text style={[styles.description, { color: ds.colors.text.secondary }, descriptionStyle]}>
            {description}
          </Text>
        </View>
        
        <View style={styles.amountContainer}>
          <Text style={[
            styles.amount, 
            { color: getStatusColor() },
            amountStyle
          ]}>
            {isCreditor ? '+' : '-'} {formatCurrency(amount)}
          </Text>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
      </View>
      
      {/* Footer com Data e Badge */}
      <View style={styles.footer}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={14} color={ds.colors.text.secondary} />
          <Text style={[styles.date, { color: ds.colors.text.secondary }, dateStyle]}>
            {formatDate(date)}
          </Text>
        </View>
        
        {isGroup && (
          <View style={[styles.groupBadge, { backgroundColor: ds.colors.primary + '20' }, groupBadgeStyle]}>
            <Ionicons name="people" size={12} color={ds.colors.primary} />
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
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  personName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 18,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    marginLeft: 4,
  },
  groupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  groupText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
}); 