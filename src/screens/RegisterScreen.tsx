import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { useDesignSystem } from '../design-system/hooks/useDesignSystem';
import { Button } from '../design-system/components/Button';
import { Input } from '../design-system/components/Input';
import { Card } from '../design-system/components/Card';
import { signUp } from '../services/auth';
import { initializeUser, updateUserPixData } from '../services/userService';
import { validatePixKey, formatPixKey } from '../utils/pixUtils';
import { RootStackParamList } from '../types';

type RegisterScreenNavigationProp = any;

interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  // Campos obrigatórios para BR Code Pix
  name: string;
  city: string;
  pixKey: string;
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  document: string;
  merchantName: string;
  merchantCity: string;
}

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { theme } = useTheme();
  const ds = useDesignSystem();

  const [form, setForm] = useState<RegisterForm>({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    name: '',
    city: '',
    pixKey: '',
    pixKeyType: 'cpf',
    document: '',
    merchantName: '',
    merchantCity: '',
  });

  const [errors, setErrors] = useState<Partial<RegisterForm>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateForm = (field: keyof RegisterForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterForm> = {};

    // Validações básicas
    if (!form.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!form.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (form.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Confirme sua senha';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    if (!form.displayName) {
      newErrors.displayName = 'Nome de usuário é obrigatório';
    }

    // Validações para BR Code Pix
    if (!form.name) {
      newErrors.name = 'Nome completo é obrigatório';
    }

    if (!form.city) {
      newErrors.city = 'Cidade é obrigatória';
    }

    if (!form.pixKey) {
      newErrors.pixKey = 'Chave Pix é obrigatória';
    } else if (!validatePixKey(form.pixKey, form.pixKeyType)) {
      newErrors.pixKey = `Chave Pix inválida para o tipo ${form.pixKeyType}`;
    }

    if (!form.document) {
      newErrors.document = 'CPF/CNPJ é obrigatório';
    }

    if (!form.merchantName) {
      newErrors.merchantName = 'Nome do estabelecimento é obrigatório';
    }

    if (!form.merchantCity) {
      newErrors.merchantCity = 'Cidade do estabelecimento é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Criar conta no Firebase Auth
      const userCredential = await signUp(form.email, form.password);
      
      // Inicializar dados do usuário no Firestore
      await initializeUser(userCredential);

      // Atualizar dados do usuário com informações Pix
      await updateUserPixData(userCredential.uid, {
        name: form.name,
        city: form.city,
        pixKey: form.pixKey,
        pixKeyType: form.pixKeyType,
        document: form.document,
        merchantName: form.merchantName,
        merchantCity: form.merchantCity,
      });

      Alert.alert(
        'Sucesso!',
        'Conta criada com sucesso. Você pode agora configurar seus dados Pix.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    } catch (error: any) {
      console.error('Erro ao criar conta:', error);
      
      let errorMessage = 'Erro ao criar conta. Tente novamente.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está em uso.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'A senha é muito fraca.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido.';
      }

      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPixKeyPlaceholder = () => {
    switch (form.pixKeyType) {
      case 'cpf':
        return '000.000.000-00';
      case 'cnpj':
        return '00.000.000/0000-00';
      case 'email':
        return 'seu@email.com';
      case 'phone':
        return '(11) 99999-9999';
      case 'random':
        return 'Chave aleatória (32-77 caracteres)';
      default:
        return 'Digite sua chave Pix';
    }
  };

  const getDocumentPlaceholder = () => {
    return form.pixKeyType === 'cnpj' ? '00.000.000/0000-00' : '000.000.000-00';
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons 
            name="person-add" 
            size={48} 
            color={ds.colors.primary} 
          />
          <Text style={[styles.title, { color: ds.colors.text.primary }]}>
            Criar Conta
          </Text>
          <Text style={[styles.subtitle, { color: ds.colors.text.secondary }]}>
            Configure sua conta e dados Pix
          </Text>
        </View>

        {/* Form */}
        <Card title="Dados Básicos" leftIcon="person">
          <Input
            label="Email"
            placeholder="seu@email.com"
            value={form.email}
            onChangeText={(text) => updateForm('email', text)}
            type="email"
            leftIcon="mail"
            error={errors.email}
            style={styles.input}
          />

          <Input
            label="Nome de Usuário"
            placeholder="Seu nome de usuário"
            value={form.displayName}
            onChangeText={(text) => updateForm('displayName', text)}
            leftIcon="person"
            error={errors.displayName}
            style={styles.input}
          />

          <Input
            label="Senha"
            placeholder="Mínimo 6 caracteres"
            value={form.password}
            onChangeText={(text) => updateForm('password', text)}
            type="password"
            leftIcon="lock-closed"
            rightIcon={showPassword ? "eye-off" : "eye"}
            onRightIconPress={() => setShowPassword(!showPassword)}
            secureTextEntry={!showPassword}
            error={errors.password}
            style={styles.input}
          />

          <Input
            label="Confirmar Senha"
            placeholder="Digite a senha novamente"
            value={form.confirmPassword}
            onChangeText={(text) => updateForm('confirmPassword', text)}
            type="password"
            leftIcon="lock-closed"
            rightIcon={showConfirmPassword ? "eye-off" : "eye"}
            onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
            secureTextEntry={!showConfirmPassword}
            error={errors.confirmPassword}
            style={styles.input}
          />
        </Card>

        {/* Pix Configuration */}
        <Card title="Configuração Pix" leftIcon="qr-code">
          <Input
            label="Nome Completo"
            placeholder="Seu nome completo"
            value={form.name}
            onChangeText={(text) => updateForm('name', text)}
            leftIcon="person"
            error={errors.name}
            style={styles.input}
          />

          <Input
            label="Cidade"
            placeholder="Sua cidade"
            value={form.city}
            onChangeText={(text) => updateForm('city', text)}
            leftIcon="location"
            error={errors.city}
            style={styles.input}
          />

          <Input
            label="CPF/CNPJ"
            placeholder={getDocumentPlaceholder()}
            value={form.document}
            onChangeText={(text) => updateForm('document', text)}
            leftIcon="card"
            type="number"
            error={errors.document}
            style={styles.input}
          />

          <Input
            label="Nome do Estabelecimento"
            placeholder="Nome do seu estabelecimento"
            value={form.merchantName}
            onChangeText={(text) => updateForm('merchantName', text)}
            leftIcon="business"
            error={errors.merchantName}
            style={styles.input}
          />

          <Input
            label="Cidade do Estabelecimento"
            placeholder="Cidade do estabelecimento"
            value={form.merchantCity}
            onChangeText={(text) => updateForm('merchantCity', text)}
            leftIcon="location"
            error={errors.merchantCity}
            style={styles.input}
          />
        </Card>

        {/* Pix Key Configuration */}
        <Card title="Chave Pix" leftIcon="key">
          <View style={styles.pixKeyTypeContainer}>
            <Text style={[styles.pixKeyTypeLabel, { color: ds.colors.text.secondary }]}>
              Tipo de Chave Pix
            </Text>
            <View style={styles.pixKeyTypeButtons}>
              {(['cpf', 'cnpj', 'email', 'phone', 'random'] as const).map((type) => (
                <Button
                  key={type}
                  title={type.toUpperCase()}
                  onPress={() => updateForm('pixKeyType', type)}
                  variant={form.pixKeyType === type ? 'primary' : 'outline'}
                  size="small"
                  style={styles.pixKeyTypeButton}
                />
              ))}
            </View>
          </View>

          <Input
            label="Chave Pix"
            placeholder={getPixKeyPlaceholder()}
            value={form.pixKey}
            onChangeText={(text) => updateForm('pixKey', text)}
            leftIcon="qr-code"
            error={errors.pixKey}
            helperText={`Digite sua chave Pix do tipo ${form.pixKeyType.toUpperCase()}`}
            style={styles.input}
          />
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="Criar Conta"
            onPress={handleRegister}
            loading={loading}
            fullWidth
            style={styles.registerButton}
          />

          <Button
            title="Já tenho uma conta"
            onPress={() => navigation.navigate('Login')}
            variant="ghost"
            fullWidth
            style={styles.loginButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  input: {
    marginBottom: 16,
  },
  pixKeyTypeContainer: {
    marginBottom: 16,
  },
  pixKeyTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  pixKeyTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pixKeyTypeButton: {
    flex: 1,
    minWidth: 60,
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  registerButton: {
    marginBottom: 8,
  },
  loginButton: {
    marginTop: 8,
  },
}); 