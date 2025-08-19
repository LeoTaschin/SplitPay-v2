import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Importar Design System, Auth e Language
import { useDesignSystem, Button, Card, Input, Avatar } from '../design-system';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';

export const EditProfileScreen: React.FC = () => {
  const ds = useDesignSystem();
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert(t('common.error'), t('profile.nameRequired'));
      return;
    }

    try {
      setLoading(true);
      // Aqui você implementaria a lógica para salvar as alterações
      // Por exemplo: await updateUserProfile({ displayName, email });
      
      Alert.alert(
        t('common.success'),
        t('profile.profileUpdated'),
        [
          {
            text: t('common.ok'),
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(t('common.error'), t('profile.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: ds.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: ds.colors.surface }]}>
        <View style={styles.headerContent}>
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={ds.colors.text.primary}
            onPress={handleCancel}
            style={styles.backButton}
          />
          <Text style={[styles.headerTitle, { color: ds.colors.text.primary }]}>
            {t('profile.editProfile')}
          </Text>
          <View style={styles.placeholder} />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Foto do Perfil */}
        <Card variant="elevated" style={styles.section}>
          <View style={styles.avatarSection}>
            <Avatar 
              name={user?.displayName || user?.email || t('common.user')}
              size="xlarge"
              style={styles.avatar}
            />
            <Button
              title={t('profile.changePhoto')}
              variant="outline"
              size="small"
              onPress={() => Alert.alert(t('profile.changePhoto'), t('common.comingSoon'))}
              style={styles.changePhotoButton}
            />
          </View>
        </Card>

        {/* Formulário */}
        <Card title={t('profile.personalInfo')} variant="elevated" style={styles.section}>
          <Input
            label={t('common.name')}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder={t('profile.namePlaceholder')}
            icon="person"
            style={styles.input}
          />
          
          <Input
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            placeholder={t('auth.emailPlaceholder')}
            icon="mail"
            keyboardType="email-address"
            editable={false} // Email não pode ser editado
            style={styles.input}
          />
        </Card>

        {/* Informações Adicionais */}
        <Card title={t('profile.additionalInfo')} variant="elevated" style={styles.section}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color={ds.colors.text.secondary} />
            <Text style={[styles.infoLabel, { color: ds.colors.text.secondary }]}>
              {t('profile.memberSince')}:
            </Text>
            <Text style={[styles.infoValue, { color: ds.colors.text.primary }]}>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : t('common.notAvailable')}
            </Text>
          </View>
        </Card>

        {/* Botões de Ação */}
        <View style={styles.actionButtons}>
          <Button
            title={t('common.cancel')}
            variant="outline"
            size="large"
            onPress={handleCancel}
            style={styles.cancelButton}
            fullWidth
          />
          
          <Button
            title={t('common.save')}
            variant="primary"
            size="large"
            onPress={handleSave}
            loading={loading}
            style={styles.saveButton}
            fullWidth
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    marginBottom: 16,
  },
  changePhotoButton: {
    marginTop: 8,
  },
  input: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
    marginRight: 8,
    minWidth: 80,
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
}); 