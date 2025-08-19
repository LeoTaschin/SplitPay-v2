import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Importar Design System, Auth e Language
import { ProfileHeader, ProfileStats, ProfileSettings, ProfileAccountInfo, ProfileActivity, ProfileLogout } from '../design-system';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import { signOut } from '../services/auth';

export const ProfileScreen: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
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
              await signOut();
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

  const handleChangePassword = () => {
    Alert.alert(t('profile.changePassword'), t('common.comingSoon'));
  };

  const handleNotifications = () => {
    Alert.alert(t('profile.notifications'), t('common.comingSoon'));
  };

  const handlePrivacy = () => {
    Alert.alert(t('profile.privacy'), t('common.comingSoon'));
  };

  const handleSecurity = () => {
    Alert.alert(t('profile.security'), t('common.comingSoon'));
  };

  const handleHelp = () => {
    Alert.alert(t('profile.help'), t('common.comingSoon'));
  };

  const handleAbout = () => {
    Alert.alert(t('profile.about'), t('common.comingSoon'));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Header do Perfil */}
        <ProfileHeader 
          user={user}
          navigation={navigation}
        />

        {/* Estatísticas do Usuário */}
        <ProfileStats user={user} />

        {/* Atividade Recente */}
        <ProfileActivity />

        {/* Configurações */}
        <ProfileSettings
          onChangePassword={handleChangePassword}
          onNotifications={handleNotifications}
          onPrivacy={handlePrivacy}
          onHelp={handleHelp}
          onAbout={handleAbout}
        />

        {/* Informações da Conta */}
        <ProfileAccountInfo user={user} />

        {/* Botão de Logout */}
        <ProfileLogout onLogout={handleLogout} loading={loading} />

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
    paddingBottom: 20,
  },
}); 