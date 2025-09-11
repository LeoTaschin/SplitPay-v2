import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useDesignSystem } from '../design-system';
import { useLanguage } from '../context/LanguageContext';

const { width, height } = Dimensions.get('window');

interface RouteParams {
  type: 'individual' | 'group';
  friendId?: string;
  friendName?: string;
  groupId?: string;
  groupName?: string;
}

const NewDebtValueScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme, isDark } = useTheme();
  const ds = useDesignSystem();
  const { t } = useLanguage();
  
  const params = route.params as RouteParams;
  
  const [value, setValue] = useState('0.00');
  const [isEditing, setIsEditing] = useState(false);
  
  const cursorAnimation = useRef(new Animated.Value(1)).current;
  const inputRef = useRef<View>(null);

  useEffect(() => {
    if (isEditing) {
      const blink = Animated.loop(
        Animated.sequence([
          Animated.timing(cursorAnimation, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(cursorAnimation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      blink.start();
      return () => blink.stop();
    }
  }, [isEditing, cursorAnimation]);

  const handleNumberPress = (number: string) => {
    setIsEditing(true);
    
    // Se o valor é "0.00", substitui pelo novo número
    if (value === '0.00') {
      setValue(`0.0${number}`);
      return;
    }
    
    // Remove o ponto decimal para trabalhar com números inteiros
    const numericValue = value.replace('.', '');
    
    // Adiciona o novo dígito
    const newNumericValue = numericValue + number;
    
    // Limita a 8 dígitos (máximo R$ 9.999.999,99)
    if (newNumericValue.length > 8) {
      return;
    }
    
    // Formata de volta com ponto decimal
    const formattedValue = newNumericValue.slice(0, -2) + '.' + newNumericValue.slice(-2);
    setValue(formattedValue);
  };

  const handleDecimalPress = () => {
    setIsEditing(true);
    // O ponto decimal já está sempre presente no formato "0.00"
    // Esta função pode ser usada para outros propósitos no futuro
    // Por enquanto, não faz nada pois o formato já inclui o ponto
  };

  const handleBackspace = () => {
    setIsEditing(true);
    
    // Se o valor é "0.00", não faz nada
    if (value === '0.00') {
      return;
    }
    
    // Remove o ponto decimal para trabalhar com números inteiros
    const numericValue = value.replace('.', '');
    
    // Remove o último dígito
    const newNumericValue = numericValue.slice(0, -1);
    
    // Se não sobrou nenhum dígito, volta para "0.00"
    if (newNumericValue.length === 0) {
      setValue('0.00');
      setIsEditing(false);
      return;
    }
    
    // Garante pelo menos 2 dígitos (para os centavos)
    const paddedValue = newNumericValue.padStart(2, '0');
    
    // Formata de volta com ponto decimal
    const formattedValue = paddedValue.slice(0, -2) + '.' + paddedValue.slice(-2);
    setValue(formattedValue);
  };

  const handleClear = () => {
    setValue('0.00');
    setIsEditing(false);
  };

  // Função para adicionar valores ao valor atual
  const handleAddValue = (amount: number) => {
    setIsEditing(true);
    
    // Converte o valor atual para número
    const currentValue = parseFloat(value);
    
    // Adiciona o novo valor
    const newValue = currentValue + amount;
    
    // Limita a 8 dígitos (máximo R$ 9.999.999,99)
    if (newValue >= 100000000) {
      return;
    }
    
    // Formata o novo valor
    const formattedValue = newValue.toFixed(2);
    setValue(formattedValue);
  };

  // Função para subtrair valores do valor atual
  const handleSubtractValue = (amount: number) => {
    setIsEditing(true);
    
    // Converte o valor atual para número
    const currentValue = parseFloat(value);
    
    // Subtrai o valor (não permite valores negativos)
    const newValue = Math.max(0, currentValue - amount);
    
    // Formata o novo valor
    const formattedValue = newValue.toFixed(2);
    setValue(formattedValue);
    
    // Se chegou a zero, para de editar
    if (newValue === 0) {
      setIsEditing(false);
    }
  };

  const handleContinue = () => {
    const numericValue = parseFloat(value);
    if (numericValue > 0) {
      // TODO: Navigate to next screen when implemented
      console.log('Navigate to NewDebtDetails with:', {
        ...params,
        value: numericValue,
        currency: 'BRL',
      });
    }
  };

  const formatDisplayValue = (val: string) => {
    const numericValue = parseFloat(val);
    
    // Para valores muito grandes, usa formatação mais compacta
    if (numericValue >= 1000000) {
      return numericValue.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        notation: 'standard',
      });
    }
    
    return numericValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getCurrencySymbol = () => {
    return 'R$';
  };

  const renderKeypadButton = (content: string | React.ReactNode, onPress: () => void, style?: any) => (
    <TouchableOpacity
      style={[styles.keypadButton, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {typeof content === 'string' ? (
        <Text style={[styles.keypadButtonText, { color: ds.colors.text.primary }]}>
          {content}
        </Text>
      ) : (
        content
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: ds.colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={styles.safeAreaTop}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: ds.colors.surface }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color={ds.colors.text.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: ds.colors.text.primary }]}>
            {t('debts.newDebtValue.header.title')}
          </Text>
          <Text style={[styles.headerSubtitle, { color: ds.colors.text.secondary }]}>
            {params.type === 'individual' 
              ? `${t('debts.newDebtValue.header.with')} ${params.friendName}`
              : `${t('debts.newDebtValue.header.in')} ${params.groupName}`
            }
          </Text>
        </View>
      </View>

      {/* Value Display */}
      <View style={styles.valueContainer}>
        <View style={styles.valueDisplay}>
          <Text style={[styles.currencySymbol, { color: ds.colors.text.secondary }]}>
            {getCurrencySymbol()}
          </Text>
          <View style={styles.valueInputContainer}>
            <Text style={[styles.valueText, { color: ds.colors.text.primary }]}>
              {formatDisplayValue(value)}
            </Text>
            {isEditing && (
              <Animated.View
                style={[
                  styles.cursor,
                  { 
                    backgroundColor: ds.colors.primary,
                    opacity: cursorAnimation 
                  }
                ]}
              />
            )}
          </View>
        </View>
        
        {value !== '0.00' && (
          <TouchableOpacity
            style={[styles.clearButton, { backgroundColor: ds.colors.surface }]}
            onPress={handleClear}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle" size={20} color={ds.colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Add Value Buttons */}
      <View style={styles.quickValuesContainer}>
        <TouchableOpacity
          style={[styles.quickValueButton, { backgroundColor: ds.colors.surface }]}
          onPress={() => handleAddValue(10)}
          activeOpacity={0.7}
        >
          <Text style={[styles.quickValueText, { color: ds.colors.text.primary }]}>+ R$ 10</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickValueButton, { backgroundColor: ds.colors.surface }]}
          onPress={() => handleAddValue(50)}
          activeOpacity={0.7}
        >
          <Text style={[styles.quickValueText, { color: ds.colors.text.primary }]}>+ R$ 50</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickValueButton, { backgroundColor: ds.colors.surface }]}
          onPress={() => handleAddValue(100)}
          activeOpacity={0.7}
        >
          <Text style={[styles.quickValueText, { color: ds.colors.text.primary }]}>+ R$ 100</Text>
        </TouchableOpacity>
      </View>

      {/* Continue Button */}
      <View style={styles.continueContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            { 
              backgroundColor: parseFloat(value) > 0 ? ds.colors.primary : ds.colors.text.disabled,
              opacity: parseFloat(value) > 0 ? 1 : 0.5
            }
          ]}
          onPress={handleContinue}
          disabled={parseFloat(value) <= 0}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>
            {t('debts.newDebtValue.continue')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Keypad */}
      <View style={[styles.keypad, { backgroundColor: ds.colors.surface }]}>
        <View style={styles.keypadRow}>
          {renderKeypadButton('1', () => handleNumberPress('1'))}
          {renderKeypadButton('2', () => handleNumberPress('2'))}
          {renderKeypadButton('3', () => handleNumberPress('3'))}
        </View>
        
        <View style={styles.keypadRow}>
          {renderKeypadButton('4', () => handleNumberPress('4'))}
          {renderKeypadButton('5', () => handleNumberPress('5'))}
          {renderKeypadButton('6', () => handleNumberPress('6'))}
        </View>
        
        <View style={styles.keypadRow}>
          {renderKeypadButton('7', () => handleNumberPress('7'))}
          {renderKeypadButton('8', () => handleNumberPress('8'))}
          {renderKeypadButton('9', () => handleNumberPress('9'))}
        </View>
        
        <View style={[styles.keypadRow, styles.lastKeypadRow]}>
          {renderKeypadButton('.', () => handleDecimalPress())}
          {renderKeypadButton('0', () => handleNumberPress('0'))}
          {renderKeypadButton(
            <Ionicons 
              name="backspace" 
              size={24} 
              color={value === '0.00' ? ds.colors.text.disabled : ds.colors.text.primary} 
            />,
            handleBackspace,
            value === '0.00' ? styles.disabledKeypadButton : undefined
          )}
        </View>
      </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeAreaTop: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  valueContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  valueDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '300',
    marginRight: 8,
  },
  valueInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 48,
    fontWeight: '300',
    letterSpacing: -1,
  },
  cursor: {
    width: 2,
    height: 48,
    marginLeft: 2,
  },
  clearButton: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypad: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  lastKeypadRow: {
    marginBottom: 34, // Safe area bottom
  },
  keypadButton: {
    width: (width - 80) / 3,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  keypadButtonText: {
    fontSize: 24,
    fontWeight: '400',
  },
  disabledKeypadButton: {
    opacity: 0.3,
  },
  quickValuesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  quickValueButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickValueText: {
    fontSize: 14,
    fontWeight: '600',
  },
  continueContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 20,
  },
  continueButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NewDebtValueScreen;
