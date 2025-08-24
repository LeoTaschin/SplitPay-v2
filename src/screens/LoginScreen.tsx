import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  SafeAreaView, 
  TextInput, 
  Text, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity,
  Dimensions,
  Alert,
  ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { LanguageSelector, Logo } from '../design-system';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const SPACING = 20;
const { height } = Dimensions.get('window');

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { loginWithPersistence } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  const handleLogin = async () => {
    // Set hasAttemptedLogin to true on first attempt
    setHasAttemptedLogin(true);
    
    // Reset errors
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError(t('errors.requiredField'));
      return;
    }

    if (!password) {
      setPasswordError(t('errors.requiredField'));
      return;
    }

    try {
      setLoading(true);
      console.log('Tentando fazer login com:', email, 'keepLoggedIn:', keepLoggedIn);
      
      // Usar o novo método de login com persistência
      await loginWithPersistence(email, password, keepLoggedIn);
      console.log('Login com persistência realizado com sucesso');
      
    } catch (error: any) {
      console.log('Erro completo:', error);
      console.log('Código do erro:', error.code);
      console.log('Mensagem do erro:', error.message);
      
      switch (error.code) {
        case 'auth/invalid-email':
          setEmailError(t('errors.invalidEmail'));
          break;
        case 'auth/user-disabled':
          setEmailError(t('errors.userDisabled'));
          break;
        case 'auth/wrong-password':
          setPasswordError(t('errors.wrongPassword'));
          break;
        case 'auth/user-not-found':
          setEmailError(t('errors.userNotFound'));
          break;
        case 'auth/invalid-credential':
          setEmailError(t('errors.invalidCredentials'));
          setPasswordError(t('errors.invalidCredentials'));
          break;
        default:
          Alert.alert(t('common.error'), `${t('errors.loginError')}: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getInputBorderColor = (hasError: string, isEmpty: boolean) => {
    if (hasAttemptedLogin) {
      if (isEmpty) return theme.colors.warning;
      if (hasError) return theme.colors.error;
    }
    return theme.colors.border;
  };

  const getEmailErrorColor = (error: string) => {
    if (!error) return undefined;
    // Check if it's the empty field warning
    if (error === t('errors.requiredField')) {
      return theme.colors.warning;
    }
    // For all other errors (validation errors), use red
    return theme.colors.error;
  };

  const getPasswordErrorColor = (error: string) => {
    if (!error) return undefined;
    // Check if it's the empty field warning
    if (error === t('errors.requiredField')) {
      return theme.colors.warning;
    }
    // For all other errors (validation errors), use red
    return theme.colors.error;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Header com Logo e Language Selector */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Logo size={80} />
              </View>
              
              {/* Language Selector */}
              <View style={styles.languageContainer}>
                <LanguageSelector
                  size="small"
                  variant="ghost"
                  showNativeName={false}
                  showText={false}
                  style={styles.languageSelector}
                />
              </View>
            </View>

            <View style={styles.mainContent}>
              <Text style={[theme.typography.h3 as any, { color: theme.colors.text, marginBottom: SPACING }]}>
                {t('auth.welcome')}
              </Text>

              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Text style={[theme.typography.body as any, { color: theme.colors.text }]}>{t('auth.email')}</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.text,
                        borderColor: getInputBorderColor(emailError, !email),
                      }
                    ]}
                    placeholder={t('auth.emailPlaceholder')}
                    placeholderTextColor={theme.colors.textSecondary}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setEmailError('');
                    }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                  {emailError ? (
                    <Text style={[styles.errorText, { color: getEmailErrorColor(emailError) }]}>{emailError}</Text>
                  ) : null}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[theme.typography.body as any, { color: theme.colors.text }]}>{t('auth.password')}</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.text,
                        borderColor: getInputBorderColor(passwordError, !password),
                      }
                    ]}
                    placeholder={t('auth.passwordPlaceholder')}
                    placeholderTextColor={theme.colors.textSecondary}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setPasswordError('');
                    }}
                    secureTextEntry
                  />
                  {passwordError ? (
                    <Text style={[styles.errorText, { color: getPasswordErrorColor(passwordError) }]}>{passwordError}</Text>
                  ) : null}
                </View>

                {/* Opção "Manter Logado" */}
                <TouchableOpacity
                  style={styles.keepLoggedInContainer}
                  onPress={() => setKeepLoggedIn(!keepLoggedIn)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.checkbox,
                    { 
                      backgroundColor: keepLoggedIn ? theme.colors.primary : 'transparent',
                      borderColor: keepLoggedIn ? theme.colors.primary : theme.colors.border,
                    }
                  ]} />
                  <Text style={[styles.keepLoggedInText, { color: theme.colors.text }]}>
                    {t('auth.keepLoggedIn')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    { backgroundColor: theme.colors.primary },
                    loading && { opacity: 0.7 }
                  ]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  <Text style={[styles.loginButtonText, { color: '#FFFFFF' }]}>
                    {loading ? t('common.loading') : t('auth.login')}
                  </Text>
                </TouchableOpacity>

                <View style={styles.registerContainer}>
                  <Text style={[theme.typography.body as any, { color: theme.colors.text }]}>
                    {t('auth.dontHaveAccount')}
                  </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={[theme.typography.body as any, { color: theme.colors.primary, marginLeft: SPACING / 4 }]}>
                      {t('auth.register')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: height,
  },
  content: {
    flex: 1,
    padding: SPACING,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: height * 0.01,
    minHeight: height * 0.1,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  languageContainer: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingTop: 8,
  },
  languageSelector: {
    minWidth: 44, // Largura fixa para o botão da bandeira
  },
  mainContent: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: SPACING,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: SPACING,
    marginTop: SPACING / 2,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  keepLoggedInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING,
    paddingVertical: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 2,
    marginRight: 10,
  },
  keepLoggedInText: {
    fontSize: 15,
    fontWeight: '400',
  },
  loginButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING,
  },
}); 