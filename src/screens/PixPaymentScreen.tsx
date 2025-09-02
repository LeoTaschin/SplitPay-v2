import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  TouchableOpacity,
  Clipboard,
  Platform,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useDesignSystem } from '../design-system/hooks/useDesignSystem';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../design-system/components/Button';
import { User } from '../types';
import { generatePixPayloadForDebt, markDebtsAsPaid } from '../services/debtService';

interface PixPaymentScreenParams {
  friendId: string;
  friendData?: {
    id: string;
    username: string;
    email: string;
    photoURL?: string;
    balance: number;
  };
  amount: number;
}

export const PixPaymentScreen: React.FC = () => {
  const ds = useDesignSystem();
  const { t } = useLanguage();
  const navigation = useNavigation();
  const route = useRoute();
  const { user: currentUser } = useAuth();
  
  const { friendId, friendData, amount } = route.params as PixPaymentScreenParams;
  
  const [friend, setFriend] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pixPayload, setPixPayload] = useState('');
  const [copied, setCopied] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [isUsingTestData, setIsUsingTestData] = useState(false);

  useEffect(() => {
    loadFriendData();
  }, [friendId]);

  const loadFriendData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados completos do amigo
      const { getUserData } = await import('../services/userService');
      const friendUserData = await getUserData(friendId);
      setFriend(friendUserData);
      
      console.log('📊 Dados do amigo carregados:', {
        name: friendUserData.name,
        city: friendUserData.city,
        pixKey: friendUserData.pixKey,
        pixKeyType: friendUserData.pixKeyType
      });
      
      // Verificar se o amigo tem dados Pix configurados
      if (!friendUserData.pixKey || !friendUserData.name || !friendUserData.city) {
        console.log('⚠️ Amigo não tem dados Pix completos configurados');
        Alert.alert(
          t('pixPayment.incompletePixData.title'),
          `${friendUserData.displayName || t('pixPayment.incompletePixData.thisFriend')} ${t('pixPayment.incompletePixData.message')}`,
          [{ text: t('common.ok') }]
        );
      }
      
      // Gerar payload Pix usando dados reais do Firebase
      if (currentUser?.uid) {
        try {
          // Primeiro tentar usar dados reais do amigo
          if (friendUserData.pixKey && friendUserData.name && friendUserData.city) {
            console.log('✅ Usando dados reais do Firebase para gerar Pix');
            const { generatePixPayload } = await import('../utils/pixUtils');
            const realPayload = generatePixPayload({
              toUser: friendUserData,
              amount,
              referenceId: `DEBT_${Date.now()}`
            });
            setPixPayload(realPayload);
            setIsUsingTestData(false);
          } else {
            // Se não tiver dados Pix, usar o serviço de dívida
            console.log('⚠️ Amigo não tem dados Pix, tentando gerar via serviço');
            const { pixPayload: payload } = await generatePixPayloadForDebt(
              currentUser.uid,
              friendId,
              amount
            );
            setPixPayload(payload);
            setIsUsingTestData(true);
          }
        } catch (error) {
          console.log('⚠️ Erro ao gerar payload Pix:', error);
          // Fallback com dados do amigo se disponíveis
          try {
            const { generatePixPayload } = await import('../utils/pixUtils');
            const fallbackUser: User = {
              uid: friendUserData.uid,
              email: friendUserData.email,
              createdAt: friendUserData.createdAt,
              pixKey: friendUserData.pixKey || '123e4567-e89b-12d3-a456-426614174000',
              name: friendUserData.name || friendUserData.displayName || 'Teste Pagamento',
              city: friendUserData.city || 'Sao Paulo'
            };
            const fallbackPayload = generatePixPayload({
              toUser: fallbackUser,
              amount,
              referenceId: 'TEST'
            });
            setPixPayload(fallbackPayload);
            setIsUsingTestData(true);
            console.log('✅ Usando fallback com dados do amigo');
          } catch (fallbackError) {
            console.error('Erro ao gerar payload fallback:', fallbackError);
            // Fallback manual se tudo falhar
            const valor = amount.toFixed(2);
            const payload = `00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-42661417400052040000530398654${valor.length.toString().padStart(2, '0')}${valor}5802BR5913Teste Pagamento6008Sao Paulo62070503***6304ABCD`;
            setPixPayload(payload);
          }
        }
      } else {
        // Fallback se não houver usuário autenticado
        try {
          const { generatePixPayload } = await import('../utils/pixUtils');
          const fallbackUser: User = {
            uid: friendUserData.uid,
            email: friendUserData.email,
            createdAt: friendUserData.createdAt,
            pixKey: friendUserData.pixKey || '123e4567-e89b-12d3-a456-426614174000',
            name: friendUserData.name || friendUserData.displayName || 'Teste Pagamento',
            city: friendUserData.city || 'Sao Paulo'
          };
          const fallbackPayload = generatePixPayload({
            toUser: fallbackUser,
            amount,
            referenceId: 'TEST'
          });
          setPixPayload(fallbackPayload);
        } catch (error) {
          console.error('Erro ao gerar payload fallback:', error);
          // Fallback manual se a função falhar
          const valor = amount.toFixed(2);
          const payload = `00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-42661417400052040000530398654${valor.length.toString().padStart(2, '0')}${valor}5802BR5913Teste Pagamento6008Sao Paulo62070503***6304ABCD`;
          setPixPayload(payload);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert(t('common.error'), t('pixPayment.loadDataError'));
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleCopyCode = async () => {
    try {
      await Clipboard.setString(pixPayload);
      setCopied(true);
      
      // Reset copied state after 3 seconds
      setTimeout(() => setCopied(false), 3000);
      
      Alert.alert(
        t('pixPayment.codeCopied.title'), 
        t('pixPayment.codeCopied.message'),
        [
          { text: t('pixPayment.codeCopied.openBankApp'), onPress: () => {
            // Tentar abrir app bancário (iOS/Android)
            try {
              // Para iOS, tentar abrir apps bancários comuns
              const bankApps = [
                'itau://',
                'bancodobrasil://',
                'nubank://',
                'inter://',
                'santander://',
                'bradesco://'
              ];
              
              // Para Android, usar intent
              if (Platform.OS === 'android') {
                // Tentar abrir qualquer app bancário
                Linking.openURL('market://search?q=banco');
              } else {
                // iOS - tentar abrir app bancário
                Linking.openURL('itms-apps://itunes.apple.com/search?term=banco');
              }
            } catch (error) {
              console.log('Não foi possível abrir app bancário automaticamente');
            }
          }},
          { text: t('common.ok'), style: 'default' }
        ]
      );
    } catch (error) {
      console.error('Erro ao copiar código:', error);
      Alert.alert(t('common.error'), t('pixPayment.copyCodeError'));
    }
  };



  const handleConfirmPayment = () => {
    Alert.alert(
      t('pixPayment.confirmPaymentTitle'),
      `${t('pixPayment.confirmPaymentMessage.amount')} R$ ${amount.toFixed(2)} ${t('pixPayment.confirmPaymentMessage.for')} ${friend?.displayName || friendData?.username}?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.confirm'), onPress: confirmPayment }
      ]
    );
  };

  const confirmPayment = async () => {
    if (!currentUser?.uid) {
      Alert.alert(t('common.error'), t('errors.userNotAuthenticated'));
      return;
    }

    try {
      setConfirmLoading(true);
      
      // Marcar dívidas como pagas
      await markDebtsAsPaid(currentUser.uid, friendId, amount);
      
      Alert.alert(
        t('pixPayment.paymentConfirmed.title'),
        `${t('pixPayment.paymentConfirmed.message')} R$ ${amount.toFixed(2)} ${t('pixPayment.paymentConfirmed.wasMarkedAsPaid')}.`,
        [{ text: t('common.ok'), onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      Alert.alert(t('common.error'), t('pixPayment.confirmPaymentError'));
    } finally {
      setConfirmLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: ds.colors.background }]}>
        <View style={styles.loadingContainer}>
                  <Text style={[styles.loadingText, { color: ds.colors.text.primary }]}>
          {t('pixPayment.generatingCode')}
        </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: ds.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBackPress}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={ds.colors.text.primary} 
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: ds.colors.text.primary }]}>
          {t('pixPayment.title')}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Informações do Pagamento */}
        <View style={[styles.card, { backgroundColor: ds.colors.surface, borderColor: ds.colors.border.primary }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="card" size={20} color={ds.colors.text.secondary} />
                    <Text style={[styles.cardTitle, { color: ds.colors.text.primary }]}>
          {t('pixPayment.paymentDetails')}
        </Text>
          </View>
          
          {isUsingTestData && (
            <View style={[styles.testDataWarning, { backgroundColor: ds.colors.feedback.warning + '20' }]}>
              <Ionicons name="warning" size={16} color={ds.colors.feedback.warning} />
              <Text style={[styles.testDataText, { color: ds.colors.feedback.warning }]}>
                {t('pixPayment.testDataWarning')}
              </Text>
            </View>
          )}
          <View style={styles.paymentInfo}>
            <View style={styles.amountContainer}>
              <Text style={[styles.amountLabel, { color: ds.colors.text.secondary }]}>
                {t('pixPayment.amountToPay')}
              </Text>
              <Text style={[styles.amount, { color: ds.colors.primary }]}>
                R$ {amount.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.friendInfo}>
              <Ionicons name="person" size={16} color={ds.colors.text.secondary} />
              <Text style={[styles.friendName, { color: ds.colors.text.primary }]}>
                {friend?.displayName || friendData?.username}
              </Text>
            </View>
          </View>
        </View>

        {/* QR Code */}
        <View style={[styles.card, { backgroundColor: ds.colors.surface, borderColor: ds.colors.border.primary }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="qr-code" size={20} color={ds.colors.text.secondary} />
                    <Text style={[styles.cardTitle, { color: ds.colors.text.primary }]}>
          {t('pixPayment.qrCode')}
        </Text>
          </View>
          <View style={styles.qrContainer}>
            <View style={[styles.qrWrapper, { backgroundColor: ds.colors.surface }]}>
            {pixPayload ? (
              <QRCode
                value={pixPayload}
                size={250}
                color={ds.colors.text.primary}
                backgroundColor={ds.colors.surface}
                ecl="M"
              />
            ) : (
              <View style={[
                styles.qrPlaceholder, 
                { 
                  backgroundColor: ds.isDark ? ds.colors.surface : ds.colors.surfaceVariant 
                }
              ]}>
                <Text style={[
                  styles.qrPlaceholderText, 
                  { 
                    color: ds.isDark ? '#E0E0E0' : ds.colors.text.secondary 
                  }
                ]}>
                  {t('pixPayment.generatingQRCode')}
                </Text>
              </View>
            )}
          </View>
            <Text style={[styles.qrInstruction, { color: ds.colors.text.secondary }]}>
              {t('pixPayment.qrInstruction')}
            </Text>
          </View>
        </View>

        {/* Código Pix - Copia e Cola */}
        <View style={[styles.card, { backgroundColor: ds.colors.surface, borderColor: ds.colors.border.primary }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="copy" size={20} color={ds.colors.text.secondary} />
                    <Text style={[styles.cardTitle, { color: ds.colors.text.primary }]}>
          {t('pixPayment.copyPasteCode')}
        </Text>
          </View>
          
          <Text style={[styles.codeInstruction, { color: ds.colors.text.secondary }]}>
            {t('pixPayment.codeInstruction')}
          </Text>
          
          <View style={styles.codeContainer}>
            <TouchableOpacity 
              style={[
                styles.codeWrapper, 
                { 
                  backgroundColor: ds.isDark ? ds.colors.surface : ds.colors.surfaceVariant,
                  borderColor: ds.colors.border.primary
                }
              ]}
              onPress={handleCopyCode}
              activeOpacity={0.7}
            >
              <View style={styles.codeContent}>
                <Text style={[
                  styles.codeText, 
                  { 
                    color: ds.isDark ? '#FFFFFF' : ds.colors.text.primary,
                    fontFamily: 'monospace',
                    fontWeight: '500'
                  }
                ]}>
                  {pixPayload}
                </Text>
                <View style={styles.copyIndicator}>
                  <Ionicons 
                    name={copied ? "checkmark-circle" : "copy"} 
                    size={20} 
                    color={copied 
                      ? ds.colors.feedback.success 
                      : (ds.isDark ? '#E0E0E0' : ds.colors.text.secondary)
                    } 
                  />
                  <Text style={[
                    styles.copyText, 
                    { 
                      color: copied 
                        ? ds.colors.feedback.success 
                        : (ds.isDark ? '#E0E0E0' : ds.colors.text.secondary),
                      fontWeight: '500'
                    }
                  ]}>
                    {copied ? t('pixPayment.copied') : t('pixPayment.tapToCopy')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
            

          </View>
        </View>

        {/* Instruções Detalhadas */}
        <View style={[styles.card, { backgroundColor: ds.colors.surface, borderColor: ds.colors.border.primary }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={20} color={ds.colors.text.secondary} />
                    <Text style={[styles.cardTitle, { color: ds.colors.text.primary }]}>
          {t('pixPayment.howToPay')}
        </Text>
          </View>
          <View style={styles.instructions}>
            <View style={styles.instructionItem}>
              <Ionicons name="copy" size={16} color={ds.colors.primary} />
              <Text style={[styles.instructionText, { color: ds.colors.text.primary }]}>
                1. {t('pixPayment.instructions.step1')}
              </Text>
            </View>
            
            <View style={styles.instructionItem}>
              <Ionicons name="phone-portrait" size={16} color={ds.colors.primary} />
              <Text style={[styles.instructionText, { color: ds.colors.text.primary }]}>
                2. {t('pixPayment.instructions.step2')}
              </Text>
            </View>
            
            <View style={styles.instructionItem}>
              <Ionicons name="search" size={16} color={ds.colors.primary} />
              <Text style={[styles.instructionText, { color: ds.colors.text.primary }]}>
                3. {t('pixPayment.instructions.step3')}
              </Text>
            </View>
            
            <View style={styles.instructionItem}>
              <Ionicons name="clipboard" size={16} color={ds.colors.primary} />
              <Text style={[styles.instructionText, { color: ds.colors.text.primary }]}>
                4. {t('pixPayment.instructions.step4')}
              </Text>
            </View>
            
            <View style={styles.instructionItem}>
              <Ionicons name="checkmark-circle" size={16} color={ds.colors.primary} />
              <Text style={[styles.instructionText, { color: ds.colors.text.primary }]}>
                5. {t('pixPayment.instructions.step5')}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Botões de Ação */}
      <View style={styles.actions}>
        <Button
          title={t('pixPayment.confirmPayment')}
          onPress={handleConfirmPayment}
          loading={confirmLoading}
          fullWidth
          style={styles.confirmButton}
        />
        
        <Button
          title={t('common.cancel')}
          onPress={handleBackPress}
          variant="ghost"
          fullWidth
          style={styles.cancelButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  paymentInfo: {
    gap: 16,
  },
  amountContainer: {
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '500',
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  qrWrapper: {
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrInstruction: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
  qrPlaceholder: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  qrPlaceholderText: {
    fontSize: 14,
    textAlign: 'center',
  },
  codeContainer: {
    gap: 16,
  },
  codeInstruction: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  codeWrapper: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  codeContent: {
    alignItems: 'center',
  },
  codeText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 8,
  },
  copyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  copyText: {
    fontSize: 12,
    fontWeight: '500',
  },

  instructions: {
    gap: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  instructionText: {
    fontSize: 14,
    flex: 1,
  },
  actions: {
    padding: 20,
    gap: 12,
  },
  confirmButton: {
    marginBottom: 8,
  },
  cancelButton: {
    marginTop: 8,
  },
  testDataWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  testDataText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});
