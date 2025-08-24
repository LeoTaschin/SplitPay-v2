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
import { ProfileStats, ProfileSettings, ProfileAccountInfo, ProfileActivity, ProfileLogout } from '../design-system';
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

  const handleQRCodePress = () => {
    Alert.alert(t('friends.addFriend'), t('common.comingSoon'));
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
          navigation={navigation}
          onQRCodePress={handleQRCodePress}
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