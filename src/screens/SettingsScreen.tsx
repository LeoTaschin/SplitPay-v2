import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useDesignSystem } from '../design-system';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import { 
  SettingsNotifications,
  SettingsPrivacy,
  SettingsLanguage,
  SettingsTheme,
  SettingsSecurity,
} from '../design-system';

type TabType = 'notifications' | 'privacy' | 'language' | 'theme' | 'security';

export const SettingsScreen: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const ds = useDesignSystem();
  const { t } = useLanguage();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<TabType>('notifications');
  const scrollViewRef = useRef<ScrollView>(null);

  const tabs = [
    { id: 'notifications' as TabType, icon: 'notifications-outline', label: 'Notificações' },
    { id: 'privacy' as TabType, icon: 'shield-outline', label: 'Privacidade' },
    { id: 'language' as TabType, icon: 'language-outline', label: 'Idioma' },
    { id: 'theme' as TabType, icon: 'color-palette-outline', label: 'Tema' },
    { id: 'security' as TabType, icon: 'lock-closed-outline', label: 'Segurança' },
  ];

  const scrollToTab = (tabIndex: number) => {
    const tabWidth = 98; // largura aproximada de cada aba (90 + 8 margin)
    const scrollPosition = tabIndex * tabWidth;
    
    scrollViewRef.current?.scrollTo({
      x: scrollPosition,
      animated: true,
    });
  };

  const handlePreviousTab = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
    const newTab = tabs[previousIndex].id;
    
    setActiveTab(newTab);
    scrollToTab(previousIndex);
  };

  const handleNextTab = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
    const newTab = tabs[nextIndex].id;
    
    setActiveTab(newTab);
    scrollToTab(nextIndex);
  };

  const handleTabPress = (tabId: TabType) => {
    const tabIndex = tabs.findIndex(tab => tab.id === tabId);
    setActiveTab(tabId);
    scrollToTab(tabIndex);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notifications':
        return <SettingsNotifications />;
      case 'privacy':
        return <SettingsPrivacy />;
      case 'language':
        return <SettingsLanguage />;
      case 'theme':
        return <SettingsTheme />;
      case 'security':
        return <SettingsSecurity />;
      default:
        return <SettingsNotifications />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: ds.colors.background }]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={ds.colors.background}
      />
      
      {/* Header Moderno */}
      <View style={[styles.header, { backgroundColor: ds.colors.background }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="chevron-back" 
            size={24} 
            color={ds.colors.text.primary} 
          />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: ds.colors.text.primary }]}>
          Configurações
        </Text>
        
        <View style={styles.headerSpacer} />
      </View>

      {/* Tab Navigation com Indicadores */}
      <View style={[styles.tabContainer, { backgroundColor: ds.colors.surface }]}>
        {/* Indicador de Scroll à Esquerda */}
        <TouchableOpacity 
          style={[styles.scrollIndicator, styles.leftIndicator, { backgroundColor: ds.colors.surface }]}
          onPress={handlePreviousTab}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={16} color={ds.colors.text.secondary} />
        </TouchableOpacity>
        
        <ScrollView 
          ref={scrollViewRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
          style={styles.tabScrollView}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && { 
                  backgroundColor: ds.colors.primary,
                  shadowColor: ds.colors.primary,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 4,
                }
              ]}
              onPress={() => handleTabPress(tab.id)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={tab.icon as any}
                size={18}
                color={activeTab === tab.id ? 'white' : ds.colors.text.secondary}
              />
              <Text style={[
                styles.tabLabel,
                { 
                  color: activeTab === tab.id ? 'white' : ds.colors.text.secondary,
                  fontWeight: activeTab === tab.id ? '600' : '500'
                }
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Indicador de Scroll à Direita */}
        <TouchableOpacity 
          style={[styles.scrollIndicator, styles.rightIndicator, { backgroundColor: ds.colors.surface }]}
          onPress={handleNextTab}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-forward" size={16} color={ds.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView 
        style={styles.contentScrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
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
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scrollIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    opacity: 0.6,
  },
  leftIndicator: {
    marginLeft: 4,
  },
  rightIndicator: {
    marginRight: 4,
  },
  tabScrollView: {
    flex: 1,
  },
  tabScrollContent: {
    paddingHorizontal: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 25,
    minWidth: 90,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  tabLabel: {
    fontSize: 13,
    marginLeft: 6,
  },
  contentScrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
}); 