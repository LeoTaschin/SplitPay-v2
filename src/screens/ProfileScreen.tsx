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

// Importar Design System, Auth e Language
import { useDesignSystem, Button, Card, Avatar } from '../design-system';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import { signOut } from '../services/auth';

export const ProfileScreen: React.FC = () => {
  const ds = useDesignSystem();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      t('profile.logoutConfirm'),
      t('profile.logoutConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('auth.logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await signOut();
              // O useAuth hook irá detectar automaticamente a mudança de estado
            } catch (error) {
              Alert.alert(t('common.error'), t('profile.logoutError'));
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: ds.colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Header do Perfil */}
        <View style={styles.header}>
          <Avatar 
            name={user?.displayName || user?.email || t('common.user')}
            size="xlarge"
            style={styles.avatar}
          />
          <Text style={[styles.userName, { color: ds.colors.text.primary }]}>
            {user?.displayName || user?.email?.split('@')[0] || t('common.user')}
          </Text>
          <Text style={[styles.userEmail, { color: ds.colors.text.secondary }]}>
            {user?.email || 'email@exemplo.com'}
          </Text>
        </View>

        {/* Informações do Perfil */}
        <Card title={t('profile.accountInfo')} variant="elevated" style={styles.section}>
          <View style={styles.infoRow}>
            <Ionicons name="person" size={20} color={ds.colors.text.secondary} />
            <Text style={[styles.infoLabel, { color: ds.colors.text.secondary }]}>
              {t('common.name')}:
            </Text>
            <Text style={[styles.infoValue, { color: ds.colors.text.primary }]}>
              {user?.displayName || t('common.notDefined')}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="mail" size={20} color={ds.colors.text.secondary} />
            <Text style={[styles.infoLabel, { color: ds.colors.text.secondary }]}>
              {t('auth.email')}:
            </Text>
            <Text style={[styles.infoValue, { color: ds.colors.text.primary }]}>
              {user?.email || t('common.notDefined')}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color={ds.colors.text.secondary} />
            <Text style={[styles.infoLabel, { color: ds.colors.text.secondary }]}>
              {t('profile.memberSince')}:
            </Text>
            <Text style={[styles.infoValue, { color: ds.colors.text.primary }]}>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : t('common.notAvailable')}
            </Text>
          </View>
        </Card>

        {/* Configurações */}
        <Card title={t('settings.title')} variant="elevated" style={styles.section}>
          <Button
            title={t('profile.editProfile')}
            variant="outline"
            size="medium"
            leftIcon="create"
            onPress={() => Alert.alert(t('profile.editProfile'), t('common.comingSoon'))}
            style={styles.settingButton}
          />
          
          <Button
            title={t('profile.changePassword')}
            variant="outline"
            size="medium"
            leftIcon="lock-closed"
            onPress={() => Alert.alert(t('profile.changePassword'), t('common.comingSoon'))}
            style={styles.settingButton}
          />
          
          <Button
            title={t('profile.notifications')}
            variant="outline"
            size="medium"
            leftIcon="notifications"
            onPress={() => Alert.alert(t('profile.notifications'), t('common.comingSoon'))}
            style={styles.settingButton}
          />
        </Card>

        {/* Botão de Logout */}
        <Card title={t('profile.accountInfo')} variant="elevated" style={styles.section}>
          <Button
            title={t('auth.logout')}
            variant="danger"
            size="large"
            leftIcon="log-out"
            onPress={handleLogout}
            loading={loading}
            fullWidth
          />
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    opacity: 0.8,
  },
  section: {
    marginBottom: 24,
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
  settingButton: {
    marginBottom: 12,
  },
}); 