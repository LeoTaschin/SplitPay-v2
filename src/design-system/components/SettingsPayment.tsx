import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../hooks/useAuth';
import { Card } from './Card';

import { Input } from './Input';
import { User } from '../../types';
import { updateUserPixData, updateUserPixKeys, getUserData } from '../../services/userService';
import { validatePixKey, formatPixKey, maskPixKey } from '../../utils/pixUtils';

interface PixKey {
  id: string;
  pixKey: string;
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone';
  bankName?: string;
  isDefault: boolean;
}

interface PixData {
  name: string;
  city: string;
  pixKeys: PixKey[];
  document: string;
}

export const SettingsPayment: React.FC = () => {
  const ds = useDesignSystem();
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [showPixKey, setShowPixKey] = useState(false);
  const [showSavedKeys, setShowSavedKeys] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [newKeyData, setNewKeyData] = useState({
    pixKey: '',
    bankName: '',
    pixKeyType: '' as string,
  });
  
  const [pixData, setPixData] = useState<PixData>({
    name: '',
    city: '',
    pixKeys: [{
      id: '1',
      pixKey: '',
      pixKeyType: 'cpf',
      isDefault: true,
    }],
    document: '',
  });

  // Debounce para salvar automaticamente
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (currentUser?.uid) {
      loadUserData();
    }
  }, [currentUser?.uid]);

  // Cleanup do timeout quando componente for desmontado
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  // Função para salvar automaticamente os dados pessoais
  const autoSavePersonalData = async (name: string, city: string) => {
    if (!currentUser?.uid) return;

    try {
      // Cancelar timeout anterior se existir
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }

      // Criar novo timeout para debounce
      const timeout = setTimeout(async () => {
        try {
          setAutoSaving(true);
          
          await updateUserPixKeys(currentUser.uid, pixData.pixKeys, {
            name: name,
            city: city,
            merchantName: name,
            merchantCity: city,
          });
          
          // Recarregar dados para confirmar sincronização
          setTimeout(() => {
            loadUserData();
          }, 500);
          
        } catch (error) {
          console.error('Erro ao salvar dados pessoais automaticamente:', error);
        } finally {
          setAutoSaving(false);
        }
      }, 1000); // Salvar após 1 segundo de inatividade

      setAutoSaveTimeout(timeout);
    } catch (error) {
      console.error('Erro ao configurar auto-save:', error);
    }
  };

  const loadUserData = async () => {
    if (!currentUser?.uid) return;
    
    try {
      setLoading(true);
      
      const userData = await getUserData(currentUser.uid);
      
      // Converter dados do Firebase para o formato do componente
      const convertedData = {
        name: userData.name || '',
        city: userData.city || '',
        pixKeys: userData.pixKeys && userData.pixKeys.length > 0 
          ? userData.pixKeys 
          : [{
              id: '1',
              pixKey: userData.pixKey || '',
              pixKeyType: (userData.pixKeyType === 'random' ? 'cpf' : userData.pixKeyType) || 'cpf',
              bankName: 'Banco Principal',
              isDefault: true,
            }],
        document: userData.document || '',
      };
      
      setPixData(convertedData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validar nome
    if (!pixData.name.trim()) {
      newErrors.name = t('settings.sections.payment.validationErrors.nameRequired');
    } else if (pixData.name.length < 3) {
      newErrors.name = t('settings.sections.payment.validationErrors.nameMinLength');
    }

    // Validar cidade
    if (!pixData.city.trim()) {
      newErrors.city = t('settings.sections.payment.validationErrors.cityRequired');
    }

    // Validar chave Pix
    const defaultPixKey = pixData.pixKeys.find(key => key.isDefault);
    if (!defaultPixKey || !defaultPixKey.pixKey.trim()) {
      newErrors.pixKey = t('settings.sections.payment.validationErrors.pixKeyRequired');
    } else if (!validatePixKey(defaultPixKey.pixKey, defaultPixKey.pixKeyType)) {
      newErrors.pixKey = t('settings.sections.payment.validationErrors.pixKeyInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!currentUser?.uid) {
      Alert.alert(t('common.error'), t('errors.userNotAuthenticated'));
      return;
    }

    if (!validateForm()) {
      Alert.alert(t('common.error'), t('common.pleaseCorrectErrors'));
      return;
    }

    try {
      setSaving(true);
      
      // Salvar múltiplas chaves Pix
      await updateUserPixKeys(currentUser.uid, pixData.pixKeys, {
        name: pixData.name,
        city: pixData.city,
        merchantName: pixData.name, // Usar nome pessoal como fallback
        merchantCity: pixData.city, // Usar cidade pessoal como fallback
      });

      // Recarregar dados após salvar
      await loadUserData();

      Alert.alert(
        t('common.success'),
        t('settings.sections.payment.successMessage'),
        [{ text: t('common.ok') }]
      );
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      Alert.alert(t('common.error'), t('settings.sections.payment.errorMessage'));
    } finally {
      setSaving(false);
    }
  };

  const handleSavePixKey = async () => {
    if (!currentUser?.uid) {
      Alert.alert(t('common.error'), t('errors.userNotAuthenticated'));
      return;
    }

    // Validar dados da nova chave
    if (!newKeyData.pixKey.trim()) {
      Alert.alert(t('common.error'), t('settings.sections.payment.pleaseEnterPixKey'));
      return;
    }

    if (!newKeyData.bankName.trim()) {
      Alert.alert(t('common.error'), t('settings.sections.payment.pleaseEnterBankName'));
      return;
    }

    if (!newKeyData.pixKeyType || !['cpf', 'cnpj', 'email', 'phone'].includes(newKeyData.pixKeyType)) {
      Alert.alert(t('common.error'), t('settings.sections.payment.pleaseSelectKeyType'));
      return;
    }

    if (!validatePixKey(newKeyData.pixKey, newKeyData.pixKeyType as 'cpf' | 'cnpj' | 'email' | 'phone')) {
      Alert.alert(t('common.error'), t('settings.sections.payment.invalidPixKey'));
      return;
    }

    try {
      setSaving(true);
      
      // Criar nova chave
      const newId = (pixData.pixKeys.length + 1).toString();
      const newPixKey = {
        id: newId,
        pixKey: newKeyData.pixKey,
        pixKeyType: newKeyData.pixKeyType as 'cpf' | 'cnpj' | 'email' | 'phone',
        bankName: newKeyData.bankName,
        isDefault: pixData.pixKeys.length === 0, // Primeira chave será padrão
      };

      // Adicionar à lista de chaves
      const updatedPixKeys = [...pixData.pixKeys, newPixKey];
      
      // Salvar no Firebase
      await updateUserPixKeys(currentUser.uid, updatedPixKeys, {
        name: pixData.name,
        city: pixData.city,
        merchantName: pixData.name,
        merchantCity: pixData.city,
      });

      // Atualizar estado local
      setPixData(prev => ({
        ...prev,
        pixKeys: updatedPixKeys,
      }));

      // Limpar formulário
      setNewKeyData({
        pixKey: '',
        bankName: '',
        pixKeyType: '',
      });
      setEditingKey(null);

      Alert.alert(
        t('common.success'),
        t('settings.sections.payment.keySaved'),
        [{ text: t('common.ok') }]
      );
    } catch (error) {
      console.error('Erro ao salvar chave Pix:', error);
      Alert.alert(t('common.error'), t('settings.sections.payment.couldNotSaveKey'));
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefaultKey = async (keyId: string) => {
    if (!currentUser?.uid) {
      Alert.alert(t('common.error'), t('errors.userNotAuthenticated'));
      return;
    }

    try {
      setSaving(true);
      
      // Atualizar chave padrão
      const updatedPixKeys = pixData.pixKeys.map(key => ({
        ...key,
        isDefault: key.id === keyId
      }));
      
      // Salvar no Firebase
      await updateUserPixKeys(currentUser.uid, updatedPixKeys, {
        name: pixData.name,
        city: pixData.city,
        merchantName: pixData.name,
        merchantCity: pixData.city,
      });

      // Atualizar estado local
      setPixData(prev => ({
        ...prev,
        pixKeys: updatedPixKeys,
      }));

      Alert.alert(
        t('common.success'),
        t('settings.sections.payment.defaultKeyUpdated'),
        [{ text: t('common.ok') }]
      );
    } catch (error) {
      console.error('Erro ao atualizar chave padrão:', error);
      Alert.alert(t('common.error'), t('settings.sections.payment.couldNotUpdateDefault'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePixKey = async (keyId: string) => {
    if (!currentUser?.uid) {
      Alert.alert(t('common.error'), t('errors.userNotAuthenticated'));
      return;
    }

    // Verificar se é a última chave
    if (pixData.pixKeys.length <= 1) {
      Alert.alert(t('common.error'), t('settings.sections.payment.needAtLeastOneKey'));
      return;
    }

    // Confirmar exclusão
    Alert.alert(
      t('settings.sections.payment.confirmDelete'),
      t('settings.sections.payment.confirmDeleteMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.sections.payment.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);
              
              // Remover a chave
              const updatedPixKeys = pixData.pixKeys.filter(key => key.id !== keyId);
              
              // Se a chave excluída era a padrão, definir a primeira como padrão
              const deletedKey = pixData.pixKeys.find(key => key.id === keyId);
              if (deletedKey?.isDefault && updatedPixKeys.length > 0) {
                updatedPixKeys[0].isDefault = true;
              }
              
              // Salvar no Firebase
              await updateUserPixKeys(currentUser.uid, updatedPixKeys, {
                name: pixData.name,
                city: pixData.city,
                merchantName: pixData.name,
                merchantCity: pixData.city,
              });

              // Atualizar estado local
              setPixData(prev => ({
                ...prev,
                pixKeys: updatedPixKeys,
              }));

              Alert.alert(
                t('common.success'),
                t('settings.sections.payment.keyDeleted'),
                [{ text: t('common.ok') }]
              );
            } catch (error) {
              console.error('Erro ao excluir chave Pix:', error);
              Alert.alert(t('common.error'), t('settings.sections.payment.couldNotDeleteKey'));
            } finally {
              setSaving(false);
            }
          }
        }
      ]
    );
  };

  const handlePixKeyTypeChange = (type: 'cpf' | 'cnpj' | 'email' | 'phone') => {
    setPixData(prev => ({
      ...prev,
      pixKeys: prev.pixKeys.map(key => 
        key.isDefault ? { ...key, pixKeyType: type, pixKey: '' } : key
      ),
    }));
    setErrors(prev => ({ ...prev, pixKey: '' }));
  };

  const getPixKeyTypeLabel = (type: string) => {
    switch (type) {
      case 'cpf': return t('settings.sections.payment.keyTypes.cpf');
      case 'cnpj': return t('settings.sections.payment.keyTypes.cnpj');
      case 'email': return t('settings.sections.payment.keyTypes.email');
      case 'phone': return t('settings.sections.payment.keyTypes.phone');
      default: return type;
    }
  };

  const getPixKeyPlaceholder = (type: string) => {
    switch (type) {
      case 'cpf': return t('settings.sections.payment.placeholders.cpf');
      case 'cnpj': return t('settings.sections.payment.placeholders.cnpj');
      case 'email': return t('settings.sections.payment.placeholders.email');
      case 'phone': return t('settings.sections.payment.placeholders.phone');
      default: return '';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { color: ds.colors.text.secondary }]}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header da Seção */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: ds.colors.text.primary }]}>
          {t('settings.sections.payment.title')}
        </Text>
        <Text style={[styles.sectionDescription, { color: ds.colors.text.secondary }]}>
          {t('settings.sections.payment.description')}
        </Text>
      </View>

      {/* Dados Pessoais */}
      <Card variant="elevated" style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="person" size={20} color={ds.colors.text.secondary} />
            <Text style={[styles.cardTitle, { color: ds.colors.text.primary }]}>
              {t('settings.sections.payment.personalData')}
            </Text>
          </View>
          {autoSaving && (
            <View style={styles.autoSaveIndicator}>
              <ActivityIndicator size="small" color={ds.colors.primary} />
              <Text style={[styles.autoSaveText, { color: ds.colors.text.secondary }]}>
                {t('settings.sections.payment.saving')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.formGroup}>
          <Input
            label={t('settings.sections.payment.fullName')}
            value={pixData.name}
            onChangeText={(text) => {
              setPixData(prev => ({ ...prev, name: text }));
              if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
              // Auto-save após mudança
              autoSavePersonalData(text, pixData.city);
            }}
            placeholder={t('settings.sections.payment.fullNamePlaceholder')}
            error={errors.name}
            maxLength={25}
          />
        </View>

        <View style={styles.formGroup}>
          <Input
            label={t('settings.sections.payment.city')}
            value={pixData.city}
            onChangeText={(text) => {
              setPixData(prev => ({ ...prev, city: text }));
              if (errors.city) setErrors(prev => ({ ...prev, city: '' }));
              // Auto-save após mudança
              autoSavePersonalData(pixData.name, text);
            }}
            placeholder={t('settings.sections.payment.cityPlaceholder')}
            error={errors.city}
            maxLength={15}
          />
        </View>
      </Card>

      {/* Configuração da Chave Pix */}
      <Card variant="elevated" style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="key" size={20} color={ds.colors.text.secondary} />
            <Text style={[styles.cardTitle, { color: ds.colors.text.primary }]}>
              {t('settings.sections.payment.pixKey')}
            </Text>
          </View>
          {saving && (
            <View style={styles.autoSaveIndicator}>
              <ActivityIndicator size="small" color={ds.colors.primary} />
              <Text style={[styles.autoSaveText, { color: ds.colors.text.secondary }]}>
                {t('settings.sections.payment.saving')}
              </Text>
            </View>
          )}
        </View>

        {/* Seleção do Tipo de Chave */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: ds.colors.text.secondary }]}>
            {t('settings.sections.payment.keyType')}
          </Text>
          <View style={styles.pixKeyTypeContainer}>
            {(['cpf', 'cnpj', 'email', 'phone'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.pixKeyTypeButton,
                  {
                    backgroundColor: newKeyData.pixKeyType === type 
                      ? ds.colors.primary 
                      : ds.colors.surface,
                    borderColor: newKeyData.pixKeyType === type 
                      ? ds.colors.primary 
                      : ds.colors.border.primary,
                  }
                ]}
                onPress={() => {
                  setNewKeyData(prev => ({ ...prev, pixKeyType: type }));
                  setEditingKey(type);
                }}
              >
                                  <Text style={[
                    styles.pixKeyTypeText,
                    {
                      color: newKeyData.pixKeyType === type 
                        ? 'white' 
                        : ds.colors.text.secondary,
                      fontWeight: newKeyData.pixKeyType === type ? '600' : '400'
                    }
                  ]}>
                    {getPixKeyTypeLabel(type)}
                  </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Formulário para Nova Chave Pix */}
        {editingKey && newKeyData.pixKeyType && (
          <View style={[styles.newKeyForm, { 
            backgroundColor: ds.colors.surface,
            borderColor: ds.colors.border.primary 
          }]}>
            <Text style={[styles.formTitle, { color: ds.colors.text.primary }]}>
              {t('settings.sections.payment.addKey')} {getPixKeyTypeLabel(newKeyData.pixKeyType)}
            </Text>
            
            <Input
              label={t('settings.sections.payment.bankName')}
              value={newKeyData.bankName}
              onChangeText={(text) => setNewKeyData(prev => ({ ...prev, bankName: text }))}
              placeholder={t('settings.sections.payment.bankNamePlaceholder')}
              style={{ marginBottom: 12 }}
            />
            
            <Input
              label={`${t('settings.sections.payment.pixKeyPlaceholder')} ${getPixKeyTypeLabel(newKeyData.pixKeyType)}`}
              value={newKeyData.pixKey}
              onChangeText={(text) => setNewKeyData(prev => ({ ...prev, pixKey: text }))}
              placeholder={getPixKeyPlaceholder(newKeyData.pixKeyType)}
              secureTextEntry={!showPixKey}
              rightIcon={showPixKey ? "eye-off" : "eye"}
              onRightIconPress={() => setShowPixKey(!showPixKey)}
              style={{ marginBottom: 16 }}
            />
            
            <View style={styles.formActions}>
              <TouchableOpacity
                style={[styles.cancelButton, { 
                  backgroundColor: ds.colors.surface,
                  borderColor: ds.colors.border.primary 
                }]}
                onPress={() => {
                  setEditingKey(null);
                  setNewKeyData({
                    pixKey: '',
                    bankName: '',
                    pixKeyType: '',
                  });
                }}
              >
                <Text style={[styles.cancelButtonText, { color: ds.colors.text.secondary }]}>
                  {t('settings.sections.payment.cancel')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.saveKeyButton, { backgroundColor: ds.colors.primary }]}
                onPress={handleSavePixKey}
                disabled={saving}
              >
                {saving ? (
                  <Text style={[styles.saveKeyButtonText, { color: 'white' }]}>
                    {t('settings.sections.payment.savingKey')}
                  </Text>
                ) : (
                  <Text style={[styles.saveKeyButtonText, { color: 'white' }]}>
                    {t('settings.sections.payment.saveKey')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Botão Ver Chaves */}
        <View style={styles.formGroup}>
          <TouchableOpacity
            style={[styles.viewKeysButton, { 
              backgroundColor: ds.colors.surface,
              borderColor: ds.colors.border.primary 
            }]}
            onPress={() => setShowSavedKeys(!showSavedKeys)}
          >
            <Ionicons name="list" size={16} color={ds.colors.primary} />
            <Text style={[styles.viewKeysText, { color: ds.colors.primary }]}>
              {t('settings.sections.payment.viewSavedKeys')}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Lista de Chaves Salvas */}
        {showSavedKeys && (
          <View style={[styles.savedKeysContainer, { backgroundColor: ds.colors.surface }]}>
            <Text style={[styles.savedKeysTitle, { color: ds.colors.text.primary }]}>
              {t('settings.sections.payment.savedKeys')}
            </Text>
            
            {pixData.pixKeys.length === 0 ? (
              <Text style={[styles.noKeysText, { color: ds.colors.text.secondary }]}>
                {t('settings.sections.payment.noKeysConfigured')}
              </Text>
            ) : (
              pixData.pixKeys.map((pixKey, index) => (
                <View key={pixKey.id} style={styles.savedKeyItem}>
                  <View style={styles.savedKeyInfo}>
                    <Text style={[styles.savedKeyLabel, { color: ds.colors.text.secondary }]}>
                      {pixKey.bankName || `Banco ${index + 1}`}
                    </Text>
                    <Text style={[styles.savedKeyValue, { color: ds.colors.text.primary }]}>
                      {pixKey.pixKey ? maskPixKey(pixKey.pixKey, pixKey.pixKeyType) : 'Não configurada'}
                    </Text>
                    <Text style={[styles.savedKeyType, { color: ds.colors.text.tertiary }]}>
                      Tipo: {getPixKeyTypeLabel(pixKey.pixKeyType)}
                      {pixKey.isDefault && ` (${t('settings.sections.payment.default')})`}
                    </Text>
                  </View>
                  
                                     <View style={styles.savedKeyActions}>
                     <TouchableOpacity
                       style={[styles.setDefaultButton, { 
                         backgroundColor: pixKey.isDefault ? ds.colors.primary : ds.colors.surface 
                       }]}
                       onPress={() => handleSetDefaultKey(pixKey.id)}
                       disabled={pixKey.isDefault}
                     >
                       <Text style={[styles.setDefaultButtonText, { 
                         color: pixKey.isDefault ? 'white' : ds.colors.text.secondary 
                       }]}>
                         {pixKey.isDefault ? t('settings.sections.payment.default') : t('settings.sections.payment.setDefault')}
                       </Text>
                     </TouchableOpacity>
                     
                     <TouchableOpacity
                       style={[styles.deleteKeyButton, { backgroundColor: ds.colors.surface }]}
                       onPress={() => handleDeletePixKey(pixKey.id)}
                     >
                       <Ionicons name="trash-outline" size={16} color={ds.colors.feedback.error} />
                     </TouchableOpacity>
                   </View>
                </View>
              ))
            )}
          </View>
        )}


      </Card>



      {/* Informações */}
      <Card variant="outlined" style={[styles.infoCard, { 
        backgroundColor: ds.colors.surface,
        borderColor: ds.colors.border.primary 
      }] as any}>
        <View style={styles.infoHeader}>
          <View style={[styles.infoIconContainer, { backgroundColor: ds.colors.primary + '15' }]}>
            <Ionicons name="help-circle-outline" size={18} color={ds.colors.primary} />
          </View>
          <Text style={[styles.infoTitle, { color: ds.colors.text.primary }]}>
            {t('settings.sections.payment.howItWorks')}
          </Text>
        </View>
        <Text style={[styles.infoText, { color: ds.colors.text.secondary }]}>
          {t('settings.sections.payment.howItWorksDescription')}
        </Text>
      </Card>



      {/* Botão Salvar */}
      <View style={styles.saveButtonContainer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            {
              backgroundColor: ds.colors.primary,
              opacity: saving ? 0.6 : 1,
            }
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText}>
                {t('settings.sections.payment.saving')}
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText}>
                {t('settings.sections.payment.saveData')}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  pixKeyTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pixKeyTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  pixKeyTypeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoCard: {
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
  },
  saveButtonContainer: {
    marginBottom: 20,
    marginTop: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    minHeight: 48,
    width: '100%',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  pixKeyItem: {
    marginBottom: 16,
  },
  pixKeyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pixKeyLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  defaultButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  defaultButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  addPixKeyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addPixKeyText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  viewKeysButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  viewKeysText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
        savedKeysContainer: {
        marginTop: 12,
        padding: 12,
        borderRadius: 8,
      },
  savedKeysTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  savedKeyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  savedKeyInfo: {
    flex: 1,
    marginRight: 12,
  },
  savedKeyLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  savedKeyValue: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  savedKeyType: {
    fontSize: 11,
  },
  selectKeyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  selectKeyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  savedKeysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addNewKeyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  addNewKeyText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  savedKeyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteKeyButton: {
    padding: 8,
    borderRadius: 6,
  },
  newKeyForm: {
    marginTop: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveKeyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveKeyButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  noKeysText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 16,
  },
  setDefaultButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
  },
  setDefaultButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  autoSaveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  autoSaveText: {
    fontSize: 12,
    marginLeft: 4,
  },
});
