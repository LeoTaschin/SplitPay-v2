import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  Share,
  Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from './Button';
import { Card } from './Card';

interface PixPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirmPayment: () => void;
  pixPayload: string;
  amount: number;
  friendName: string;
  loading?: boolean;
}

export const PixPaymentModal: React.FC<PixPaymentModalProps> = ({
  visible,
  onClose,
  onConfirmPayment,
  pixPayload,
  amount,
  friendName,
  loading = false,
}) => {
  const ds = useDesignSystem();
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await Clipboard.setString(pixPayload);
      setCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
      
      Alert.alert('Código Pix copiado!', 'Cole o código no seu app bancário');
    } catch (error) {
      console.error('Erro ao copiar código:', error);
      Alert.alert('Erro', 'Não foi possível copiar o código');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Pague R$ ${amount.toFixed(2)} para ${friendName}\n\nCódigo Pix:\n${pixPayload}`,
        title: 'Pagamento Pix',
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const handleConfirmPayment = () => {
    Alert.alert(
      'Confirmar Pagamento',
      `Você confirma que pagou R$ ${amount.toFixed(2)} para ${friendName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: onConfirmPayment }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: ds.colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={ds.colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: ds.colors.text.primary }]}>
            Pagamento Pix
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          {/* Informações do Pagamento */}
          <Card title="Detalhes do Pagamento" leftIcon="card">
            <View style={styles.paymentInfo}>
              <View style={styles.amountContainer}>
                <Text style={[styles.amountLabel, { color: ds.colors.text.secondary }]}>
                  Valor a Pagar
                </Text>
                <Text style={[styles.amount, { color: ds.colors.primary }]}>
                  R$ {amount.toFixed(2)}
                </Text>
              </View>
              
              <View style={styles.friendInfo}>
                <Ionicons name="person" size={16} color={ds.colors.text.secondary} />
                <Text style={[styles.friendName, { color: ds.colors.text.primary }]}>
                  {friendName}
                </Text>
              </View>
            </View>
          </Card>

          {/* QR Code */}
          <Card title="QR Code Pix" leftIcon="qr-code">
            <View style={styles.qrContainer}>
              <View style={styles.qrWrapper}>
                <QRCode
                  value={pixPayload}
                  size={200}
                  color={ds.colors.text.primary}
                  backgroundColor={ds.colors.surface}
                />
              </View>
              <Text style={[styles.qrInstruction, { color: ds.colors.text.secondary }]}>
                Escaneie o QR Code com seu app bancário
              </Text>
            </View>
          </Card>

          {/* Código Pix */}
          <Card title="Código Pix" leftIcon="copy">
            <View style={styles.codeContainer}>
              <View style={[styles.codeWrapper, { backgroundColor: ds.colors.surfaceVariant }]}>
                <Text style={[styles.codeText, { color: ds.colors.text.primary }]}>
                  {pixPayload}
                </Text>
              </View>
              
              <View style={styles.codeActions}>
                <Button
                  title={copied ? "Copiado!" : "Copiar Código"}
                  onPress={handleCopyCode}
                  variant={copied ? "secondary" : "outline"}
                  leftIcon={copied ? "checkmark" : "copy"}
                  size="small"
                  style={styles.copyButton}
                />
                
                <Button
                  title="Compartilhar"
                  onPress={handleShare}
                  variant="ghost"
                  leftIcon="share"
                  size="small"
                  style={styles.shareButton}
                />
              </View>
            </View>
          </Card>

          {/* Instruções */}
          <Card title="Como Pagar" leftIcon="information-circle">
            <View style={styles.instructions}>
              <View style={styles.instructionItem}>
                <Ionicons name="qr-code" size={16} color={ds.colors.primary} />
                <Text style={[styles.instructionText, { color: ds.colors.text.primary }]}>
                  Escaneie o QR Code ou copie o código Pix
                </Text>
              </View>
              
              <View style={styles.instructionItem}>
                <Ionicons name="phone-portrait" size={16} color={ds.colors.primary} />
                <Text style={[styles.instructionText, { color: ds.colors.text.primary }]}>
                  Abra seu app bancário e selecione "Pagar com Pix"
                </Text>
              </View>
              
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle" size={16} color={ds.colors.primary} />
                <Text style={[styles.instructionText, { color: ds.colors.text.primary }]}>
                  Confirme o pagamento e aguarde a confirmação
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Botões de Ação */}
        <View style={styles.actions}>
          <Button
            title="Confirmar Pagamento"
            onPress={handleConfirmPayment}
            loading={loading}
            fullWidth
            style={styles.confirmButton}
          />
          
          <Button
            title="Cancelar"
            onPress={onClose}
            variant="ghost"
            fullWidth
            style={styles.cancelButton}
          />
        </View>
      </View>
    </Modal>
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
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
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
    backgroundColor: 'white',
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
  codeContainer: {
    gap: 16,
  },
  codeWrapper: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  codeText: {
    fontSize: 12,
    fontFamily: 'monospace',
    textAlign: 'center',
    lineHeight: 18,
  },
  codeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  copyButton: {
    flex: 1,
  },
  shareButton: {
    flex: 1,
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
});
