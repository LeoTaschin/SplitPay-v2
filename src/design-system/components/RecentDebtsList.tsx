import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';

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
}

export const RecentDebtsList: React.FC<RecentDebtsListProps> = ({
  title,
  onViewAll,
  children,
  emptyState,
  style,
  titleStyle,
  viewAllStyle,
}) => {
  const ds = useDesignSystem();

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: ds.colors.text.primary }, titleStyle]}>
          {title}
        </Text>
        {onViewAll && (
          <Text style={[styles.viewAll, { color: ds.colors.primary }, viewAllStyle]}>
            Ver Todas
          </Text>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {React.Children.count(children) > 0 ? (
          <View style={styles.list}>
            {children}
          </View>
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
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    minHeight: 100,
  },
  list: {
    gap: 12,
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