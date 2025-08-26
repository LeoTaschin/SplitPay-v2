import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Importar Design System, Auth e Language
import { ProfileStats, ProfileAccountInfo, ProfileLogoutButton, ProfileSettingsButton } from '../design-system';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';

export const ProfileScreen: React.FC = () => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

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
              await logout();
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

  const handleSettings = () => {
    navigation.navigate && navigation.navigate('Settings' as never);
  };

  const handleQRCodePress = () => {
    // Implementar lógica para mostrar QR code
    console.log('Show QR Code for adding friends');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Card Principal do Perfil */}
        <ProfileAccountInfo 
          user={user} 
          onQRCodePress={handleQRCodePress}
        />

        {/* Estatísticas do Usuário */}
        <ProfileStats user={user} />

        {/* Botão de Configurações */}
        <ProfileSettingsButton onPress={handleSettings} />

        {/* Botão de Logout */}
        <ProfileLogoutButton onPress={handleLogout} loading={loading} />

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
    paddingBottom: 100,
  },
}); 