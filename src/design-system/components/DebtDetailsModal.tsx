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
import { Timestamp, getDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';

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
    // Campos adicionais para enriquecimento de dados
    groupId?: string;
    groupName?: string;
    group?: any;
    createdBy?: string;
    createdByUser?: {
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
  const [enrichedDebt, setEnrichedDebt] = useState(debt);

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start();
      
      // Buscar dados enriquecidos quando o modal é aberto
      loadEnrichedDebtData();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }).start();
    }
  }, [visible, debt]);

  // Função para carregar dados enriquecidos da dívida
  const loadEnrichedDebtData = async () => {
    if (!debt) return;
    
    try {
      let enrichedData = { ...debt };
      
      // Coletar IDs de usuários para buscar
      const userIds = new Set<string>();
      
      // Para dívidas pessoais
      if (debt.type !== 'group') {
        if (debt.creditorId) userIds.add(debt.creditorId);
        if (debt.debtorId) userIds.add(debt.debtorId);
      } else {
        // Para dívidas de grupo
        if (debt.receiverId) userIds.add(debt.receiverId);
        if (debt.payerId) userIds.add(debt.payerId);
      }
      
      // Buscar dados dos usuários
      const userData: { [key: string]: any } = {};
      
      for (const userId of userIds) {
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            userData[userId] = userDoc.data();
          }
        } catch (error) {
          console.error(`❌ DebtDetailsModal: Erro ao buscar usuário ${userId}`);
        }
      }
      
      // Enriquecer dados da dívida
      if (debt.type !== 'group') {
        // Dívidas pessoais
        if (debt.creditorId && userData[debt.creditorId]) {
          enrichedData.creditor = {
            id: debt.creditorId,
            username: userData[debt.creditorId].username,
            name: userData[debt.creditorId].displayName || userData[debt.creditorId].name,
            photoURL: userData[debt.creditorId].photoURL
          };
        }
        
        if (debt.debtorId && userData[debt.debtorId]) {
          enrichedData.debtor = {
            id: debt.debtorId,
            username: userData[debt.debtorId].username,
            name: userData[debt.debtorId].displayName || userData[debt.debtorId].name,
            photoURL: userData[debt.debtorId].photoURL
          };
        }
      } else {
        // Dívidas de grupo
        if (debt.receiverId && userData[debt.receiverId]) {
          enrichedData.receiver = {
            id: debt.receiverId,
            username: userData[debt.receiverId].username,
            name: userData[debt.receiverId].displayName || userData[debt.receiverId].name,
            photoURL: userData[debt.receiverId].photoURL
          };
        }
        
        if (debt.payerId && userData[debt.payerId]) {
          enrichedData.payer = {
            id: debt.payerId,
            username: userData[debt.payerId].username,
            name: userData[debt.payerId].displayName || userData[debt.payerId].name,
            photoURL: userData[debt.payerId].photoURL
          };
        }
      }
      
      console.log(`📋 DebtDetailsModal: "${enrichedDebt.description}" - R$ ${amount.toFixed(2)}`);
      setEnrichedDebt(enrichedData);
      
    } catch (error) {
      console.error('❌ DebtDetailsModal: Erro ao carregar dados');
    }
  };

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
  const isCreditor = enrichedDebt.type === 'group' 
    ? enrichedDebt.receiverId === currentUserId 
    : enrichedDebt.creditorId === currentUserId;
  
  // Determinar a pessoa correta baseada no tipo de dívida
  let otherPerson;
  if (enrichedDebt.type === 'group') {
    // Para dívidas em grupo, usar payerId/receiverId
    otherPerson = isCreditor ? enrichedDebt.payer : enrichedDebt.receiver;
  } else {
    // Para dívidas pessoais, usar debtor/creditor
    otherPerson = isCreditor ? enrichedDebt.debtor : enrichedDebt.creditor;
  }
  
  const amount = enrichedDebt.type === 'group' ? (enrichedDebt.amountPerPerson || 0) : (enrichedDebt.amount || 0);

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
                {enrichedDebt.type === 'group' ? t('debts.details.fields.typeGroup') : t('debts.details.fields.typeIndividual')}
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
            {enrichedDebt.description && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: ds.colors.text.primary }]}>
                  {t('debts.details.sections.description')}
                </Text>
                <Text style={[styles.description, { color: ds.colors.text.secondary }]}>
                  {enrichedDebt.description}
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
                    source={enrichedDebt.type === 'group' ? enrichedDebt.receiver?.photoURL : enrichedDebt.creditor?.photoURL}
                    name={enrichedDebt.type === 'group' 
                      ? (enrichedDebt.receiver?.username || enrichedDebt.receiver?.name || 'Usuário')
                      : (enrichedDebt.creditor?.username || enrichedDebt.creditor?.name || 'Usuário')
                    }
                    size="large"
                    variant="circle"
                  />
                  <Text style={[styles.personName, { color: ds.colors.text.primary }]}>
                    {enrichedDebt.type === 'group' 
                      ? (enrichedDebt.receiver?.username || enrichedDebt.receiver?.name || 'Usuário')
                      : (enrichedDebt.creditor?.username || enrichedDebt.creditor?.name || 'Usuário')
                    }
                  </Text>
                  <Text style={[styles.personRole, { color: '#10B981' }]}>
                    {t('debts.details.fields.creditor')}
                  </Text>
                </View>

                <View style={styles.arrowContainer}>
                  <Ionicons name="arrow-forward" size={24} color={ds.colors.text.secondary} />
                </View>

                <View style={styles.personCard}>
                  <Avatar
                    source={enrichedDebt.type === 'group' ? enrichedDebt.payer?.photoURL : enrichedDebt.debtor?.photoURL}
                    name={enrichedDebt.type === 'group' 
                      ? (enrichedDebt.payer?.username || enrichedDebt.payer?.name || 'Usuário')
                      : (enrichedDebt.debtor?.username || enrichedDebt.debtor?.name || 'Usuário')
                    }
                    size="large"
                    variant="circle"
                  />
                  <Text style={[styles.personName, { color: ds.colors.text.primary }]}>
                    {enrichedDebt.type === 'group' 
                      ? (enrichedDebt.payer?.username || enrichedDebt.payer?.name || 'Usuário')
                      : (enrichedDebt.debtor?.username || enrichedDebt.debtor?.name || 'Usuário')
                    }
                  </Text>
                  <Text style={[styles.personRole, { color: '#EF4444' }]}>
                    {t('debts.details.fields.debtor')}
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
                      {formatDate(enrichedDebt.createdAt)}
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
                      {formatCurrency(enrichedDebt.amount)}
                    </Text>
                  </View>
                </View>

                {enrichedDebt.type === 'group' && (
                  <View style={styles.detailItem}>
                    <Ionicons name="people-outline" size={20} color={ds.colors.text.secondary} />
                                      <View style={styles.detailInfo}>
                    <Text style={[styles.detailLabel, { color: ds.colors.text.secondary }]}>
                      {t('debts.details.fields.amountPerPerson')}
                    </Text>
                      <Text style={[styles.detailValue, { color: ds.colors.text.primary }]}>
                        {formatCurrency(enrichedDebt.amountPerPerson || 0)}
                      </Text>
                    </View>
                  </View>
                )}

                <View style={styles.detailItem}>
                  <Ionicons 
                    name={enrichedDebt.paid ? 'checkmark-circle' : 'time-outline'} 
                    size={20} 
                    color={enrichedDebt.paid ? '#10B981' : ds.colors.text.secondary} 
                  />
                  <View style={styles.detailInfo}>
                    <Text style={[styles.detailLabel, { color: ds.colors.text.secondary }]}>
                      {t('debts.details.fields.status')}
                    </Text>
                    <Text style={[
                      styles.detailValue, 
                      { color: enrichedDebt.paid ? '#10B981' : '#F59E0B' }
                                         ]}>
                       {enrichedDebt.paid ? t('debts.details.status.paid') : t('debts.details.status.pending')}
                     </Text>
                  </View>
                </View>

                {enrichedDebt.paid && enrichedDebt.paidAt && (
                  <View style={styles.detailItem}>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
                                      <View style={styles.detailInfo}>
                    <Text style={[styles.detailLabel, { color: ds.colors.text.secondary }]}>
                      {t('debts.details.fields.paymentDate')}
                    </Text>
                      <Text style={[styles.detailValue, { color: ds.colors.text.primary }]}>
                        {formatDate(enrichedDebt.paidAt)}
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
