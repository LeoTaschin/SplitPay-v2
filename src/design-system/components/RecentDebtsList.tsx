import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useLanguage } from '../../context/LanguageContext';

interface RecentDebtsListProps {
  title: string;
  onViewAll?: () => void;
  children: React.ReactNode;
  emptyState?: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
  };
  style?: ViewStyle;
  titleStyle?: TextStyle;
  viewAllStyle?: TextStyle;
  showAll?: boolean;
  onToggleShowAll?: () => void;
}

export const RecentDebtsList: React.FC<RecentDebtsListProps> = ({
  title,
  onViewAll,
  children,
  emptyState,
  style,
  titleStyle,
  viewAllStyle,
  showAll = false,
  onToggleShowAll,
}) => {
  const ds = useDesignSystem();
  const { t } = useLanguage();

  // Filtrar children baseado no estado showAll
  const childrenArray = React.Children.toArray(children);
  const visibleChildren = showAll ? childrenArray : childrenArray.slice(0, 10);

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: ds.colors.text.primary }, titleStyle]}>
            {title}
          </Text>
          <View style={[styles.recentBadge, { backgroundColor: ds.colors.primary + '20' }]}>
            <Ionicons name="time-outline" size={12} color={ds.colors.primary} />
            <Text style={[styles.recentText, { color: ds.colors.primary }]}>
              {t('common.recent')}
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={[styles.content, { flex: 1 }]}>
        {React.Children.count(children) > 0 ? (
          <ScrollView 
            style={[
              styles.scrollContainer, 
              { flex: 1 }
            ]}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            <View style={styles.list}>
              {visibleChildren.map((child, index) => (
                <View key={index} style={styles.listItem}>
                  {index === 0 && (
                    <View style={styles.latestIndicator}>
                      <Ionicons name="star" size={12} color={ds.colors.primary} />
                      <Text style={[styles.latestText, { color: ds.colors.primary }]}>
                        {t('common.latest')}
                      </Text>
                    </View>
                  )}
                  {child}
                </View>
              ))}
              
              {/* View All Button */}
              <TouchableOpacity 
                style={[styles.viewAllButton, { backgroundColor: ds.colors.surface }]}
                onPress={onToggleShowAll || (() => {})}
              >
                <Ionicons 
                  name={showAll ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color={ds.colors.primary} 
                />
                <Text style={[styles.viewAllButtonText, { color: ds.colors.primary }, viewAllStyle]}>
                  {showAll ? t('common.showLess') : t('common.viewAll')}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : emptyState ? (
          <View style={[styles.emptyState, { backgroundColor: ds.colors.surface }]}>
            <Ionicons 
              name={emptyState.icon} 
              size={48} 
              color={ds.colors.text.secondary} 
            />
            <Text style={[styles.emptyTitle, { color: ds.colors.text.secondary }]}>
              {emptyState.title}
            </Text>
            <Text style={[styles.emptySubtitle, { color: ds.colors.text.secondary }]}>
              {emptyState.subtitle}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 24,
    paddingBottom: 0, // Padding extra para evitar sobreposição com toolbar
    flex: 1, // Ocupa todo o espaço disponível quando não há altura máxima
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '400',
  },
  recentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  recentText: {
    fontSize: 10,
    fontWeight: '500',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1, // Ocupa todo o espaço disponível
  },
  scrollContainer: {
    borderRadius: 12,
  },
  scrollContent: {
    flexGrow: 1, // Permite que o conteúdo cresça para ocupar toda a altura
    paddingBottom: 20, // Espaço extra para o botão
  },
  list: {
    gap: 12,
  },
  listItem: {
    position: 'relative',
  },
  latestIndicator: {
    position: 'absolute',
    top: 0,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 1,
  },
  latestText: {
    fontSize: 10,
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 20, // Espaço extra para evitar sobreposição com toolbar
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  viewAllButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 18,
    marginTop: 15,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
}); 