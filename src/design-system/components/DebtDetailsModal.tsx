import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useLanguage } from '../../context/LanguageContext';
import { Avatar } from './Avatar';
import { Timestamp } from 'firebase/firestore';

interface DebtDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  debt: {
    id: string;
    description?: string;
    amount: number;
    createdAt: string | Date | Timestamp;
    type?: 'personal' | 'group';
    creditor?: {
      id: string;
      name?: string;
      username?: string;
      photoURL?: string;
    };
    debtor?: {
      id: string;
      name?: string;
      username?: string;
      photoURL?: string;
    };
    creditorId?: string;
    debtorId?: string;
    amountPerPerson?: number;
    paid?: boolean;
    paidAt?: string | Date | Timestamp;
    // Campos para dívidas em grupo
    receiverId?: string;
    payerId?: string;
    receiver?: {
      id: string;
      name?: string;
      username?: string;
      photoURL?: string;
    };
    payer?: {
      id: string;
      name?: string;
      username?: string;
      photoURL?: string;
    };
  };
  currentUserId?: string;
}

export const DebtDetailsModal: React.FC<DebtDetailsModalProps> = ({
  visible,
  onClose,
  debt,
  currentUserId,
}) => {
  const ds = useDesignSystem();
  const { t } = useLanguage();
  const slideAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.in(Easing.cubic),
    }).start(() => {
      onClose();
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateInput: string | Date | Timestamp) => {
    let date: Date;
    
    if (dateInput instanceof Timestamp) {
      date = dateInput.toDate();
    } else if (dateInput instanceof Date) {
      date = dateInput;
    } else {
      date = new Date(dateInput);
      
      if (typeof dateInput === 'string' && !isNaN(Number(dateInput))) {
        const timestamp = Number(dateInput);
        if (timestamp < 1000000000000) {
          date = new Date(timestamp * 1000);
        } else {
          date = new Date(timestamp);
        }
      }
    }
    
    if (isNaN(date.getTime())) {
      return 'Data inválida';
    }
    
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Para dívidas em grupo, usar receiverId/payerId
  const isCreditor = debt.type === 'group' 
    ? debt.receiverId === currentUserId 
    : debt.creditorId === currentUserId;
  
  // Determinar a pessoa correta baseada no tipo de dívida
  let otherPerson;
  if (debt.type === 'group') {
    // Para dívidas em grupo, usar payerId/receiverId
    otherPerson = isCreditor ? debt.payer : debt.receiver;
  } else {
    // Para dívidas pessoais, usar debtor/creditor
    otherPerson = isCreditor ? debt.debtor : debt.creditor;
  }
  
  const amount = debt.type === 'group' ? (debt.amountPerPerson || 0) : (debt.amount || 0);

  const getStatusColor = () => {
    return isCreditor ? '#10B981' : '#EF4444';
  };

  const getStatusText = () => {
    return isCreditor ? t('dashboard.toReceive') : t('dashboard.toPay');
  };

  const getStatusIcon = () => {
    return isCreditor ? 'arrow-up-circle' : 'arrow-down-circle';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <BlurView intensity={20} style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          onPress={handleClose}
          activeOpacity={1}
        />
        <Animated.View 
          style={[
            styles.modalContent,
            { backgroundColor: ds.colors.background },
            {
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [Dimensions.get('window').height, 0],
                }),
              }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={[styles.title, { color: ds.colors.text.primary }]}>
                {t('debts.details.title')}
              </Text>
              <Text style={[styles.subtitle, { color: ds.colors.text.secondary }]}>
                {debt.type === 'group' ? t('debts.details.fields.typeGroup') : t('debts.details.fields.typeIndividual')}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons
                name="close"
                size={24}
                color={ds.colors.text.secondary}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Status Card */}
            <View style={[styles.statusCard, { backgroundColor: getStatusColor() + '10' }]}>
              <View style={styles.statusHeader}>
                <Ionicons 
                  name={getStatusIcon() as any} 
                  size={32} 
                  color={getStatusColor()} 
                />
                <View style={styles.statusInfo}>
                  <Text style={[styles.statusText, { color: getStatusColor() }]}>
                    {getStatusText()}
                  </Text>
                  <Text style={[styles.amount, { color: getStatusColor() }]}>
                    {formatCurrency(amount)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Description */}
            {debt.description && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: ds.colors.text.primary }]}>
                  {t('debts.details.sections.description')}
                </Text>
                <Text style={[styles.description, { color: ds.colors.text.secondary }]}>
                  {debt.description}
                </Text>
              </View>
            )}

            {/* People Involved */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: ds.colors.text.primary }]}>
                {t('debts.details.sections.involved')}
              </Text>
              <View style={styles.peopleContainer}>
                <View style={styles.personCard}>
                  <Avatar
                    source={debt.type === 'group' ? debt.receiver?.photoURL : debt.creditor?.photoURL}
                    name={debt.type === 'group' 
                      ? (debt.receiver?.username || debt.receiver?.name || 'Usuário')
                      : (debt.creditor?.username || debt.creditor?.name || 'Usuário')
                    }
                    size="large"
                    variant="circle"
                  />
                  <Text style={[styles.personName, { color: ds.colors.text.primary }]}>
                    {debt.type === 'group' 
                      ? (debt.receiver?.username || debt.receiver?.name || 'Usuário')
                      : (debt.creditor?.username || debt.creditor?.name || 'Usuário')
                    }
                  </Text>
                  <Text style={[styles.personRole, { color: '#10B981' }]}>
                    {debt.type === 'group' ? 'Recebeu' : t('debts.details.fields.creditor')}
                  </Text>
                </View>

                <View style={styles.arrowContainer}>
                  <Ionicons name="arrow-forward" size={24} color={ds.colors.text.secondary} />
                </View>

                <View style={styles.personCard}>
                  <Avatar
                    source={debt.type === 'group' ? debt.payer?.photoURL : debt.debtor?.photoURL}
                    name={debt.type === 'group' 
                      ? (debt.payer?.username || debt.payer?.name || 'Usuário')
                      : (debt.debtor?.username || debt.debtor?.name || 'Usuário')
                    }
                    size="large"
                    variant="circle"
                  />
                  <Text style={[styles.personName, { color: ds.colors.text.primary }]}>
                    {debt.type === 'group' 
                      ? (debt.payer?.username || debt.payer?.name || 'Usuário')
                      : (debt.debtor?.username || debt.debtor?.name || 'Usuário')
                    }
                  </Text>
                  <Text style={[styles.personRole, { color: '#EF4444' }]}>
                    {debt.type === 'group' ? 'Pagou' : t('debts.details.fields.debtor')}
                  </Text>
                </View>
              </View>
            </View>

            {/* Transaction Details */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: ds.colors.text.primary }]}>
                {t('debts.details.sections.transactionDetails')}
              </Text>
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Ionicons name="calendar-outline" size={20} color={ds.colors.text.secondary} />
                  <View style={styles.detailInfo}>
                    <Text style={[styles.detailLabel, { color: ds.colors.text.secondary }]}>
                      {t('debts.details.fields.creationDate')}
                    </Text>
                    <Text style={[styles.detailValue, { color: ds.colors.text.primary }]}>
                      {formatDate(debt.createdAt)}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons name="cash-outline" size={20} color={ds.colors.text.secondary} />
                  <View style={styles.detailInfo}>
                    <Text style={[styles.detailLabel, { color: ds.colors.text.secondary }]}>
                      {t('debts.details.fields.totalAmount')}
                    </Text>
                    <Text style={[styles.detailValue, { color: ds.colors.text.primary }]}>
                      {formatCurrency(debt.amount)}
                    </Text>
                  </View>
                </View>

                {debt.type === 'group' && (
                  <View style={styles.detailItem}>
                    <Ionicons name="people-outline" size={20} color={ds.colors.text.secondary} />
                                      <View style={styles.detailInfo}>
                    <Text style={[styles.detailLabel, { color: ds.colors.text.secondary }]}>
                      {t('debts.details.fields.amountPerPerson')}
                    </Text>
                      <Text style={[styles.detailValue, { color: ds.colors.text.primary }]}>
                        {formatCurrency(debt.amountPerPerson || 0)}
                      </Text>
                    </View>
                  </View>
                )}

                <View style={styles.detailItem}>
                  <Ionicons 
                    name={debt.paid ? 'checkmark-circle' : 'time-outline'} 
                    size={20} 
                    color={debt.paid ? '#10B981' : ds.colors.text.secondary} 
                  />
                  <View style={styles.detailInfo}>
                    <Text style={[styles.detailLabel, { color: ds.colors.text.secondary }]}>
                      {t('debts.details.fields.status')}
                    </Text>
                    <Text style={[
                      styles.detailValue, 
                      { color: debt.paid ? '#10B981' : '#F59E0B' }
                                         ]}>
                       {debt.paid ? t('debts.details.status.paid') : t('debts.details.status.pending')}
                     </Text>
                  </View>
                </View>

                {debt.paid && debt.paidAt && (
                  <View style={styles.detailItem}>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
                                      <View style={styles.detailInfo}>
                    <Text style={[styles.detailLabel, { color: ds.colors.text.secondary }]}>
                      {t('debts.details.fields.paymentDate')}
                    </Text>
                      <Text style={[styles.detailValue, { color: ds.colors.text.primary }]}>
                        {formatDate(debt.paidAt)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: Dimensions.get('window').height * 0.95,
    minHeight: Dimensions.get('window').height * 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    paddingVertical: 10,
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  amount: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  peopleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  personCard: {
    alignItems: 'center',
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  personRole: {
    fontSize: 14,
    fontWeight: '500',
  },
  arrowContainer: {
    paddingHorizontal: 16,
  },
  detailsGrid: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});
