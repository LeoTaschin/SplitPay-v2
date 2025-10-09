import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useDesignSystem } from '../design-system';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

interface RouteParams {
  type: 'group';
  groupId: string;
  groupName: string;
  value: number;
  currency: string;
  groupMembers?: Array<{
    id: string;
    name: string;
    photo?: string;
  }>;
}

const ConfirmDebtGroupScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme, isDark } = useTheme();
  const ds = useDesignSystem();
  const { t } = useLanguage();
  
  const params = route.params as RouteParams;
  
  const [title, setTitle] = useState('');
  const [splitType, setSplitType] = useState<'equal' | 'selective'>('equal');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Mock data for group members (in real app, this would come from props or API)
  const groupMembers = params.groupMembers || [
    { id: '1', name: 'João Silva', photo: undefined },
    { id: '2', name: 'Maria Santos', photo: undefined },
    { id: '3', name: 'Pedro Costa', photo: undefined },
    { id: '4', name: 'Ana Oliveira', photo: undefined },
  ];

  const handleConfirm = () => {
    // TODO: Implement group debt creation logic
    console.log('Creating group debt:', {
      ...params,
      title,
      splitType,
      selectedMembers: splitType === 'selective' ? selectedMembers : groupMembers.map(m => m.id),
    });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const calculateSplitAmount = () => {
    const memberCount = splitType === 'equal' ? groupMembers.length : selectedMembers.length;
    return params.value / memberCount;
  };

  const toggleMemberSelection = (memberId: string) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== memberId));
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };

  const renderMemberItem = (member: any) => {
    const isSelected = selectedMembers.includes(member.id);
    const amount = splitType === 'equal' ? calculateSplitAmount() : 
                   (isSelected ? calculateSplitAmount() : 0);

    return (
      <TouchableOpacity
        key={member.id}
        style={[
          styles.memberItem,
          { 
            backgroundColor: ds.colors.surface,
            borderColor: isSelected ? ds.colors.primary : ds.colors.border?.primary || ds.colors.surface,
            borderWidth: 1,
          }
        ]}
        onPress={() => splitType === 'selective' && toggleMemberSelection(member.id)}
        activeOpacity={0.7}
        disabled={splitType === 'equal'}
      >
        <View style={styles.memberInfo}>
          <View style={[styles.memberAvatar, { backgroundColor: ds.colors.primary }]}>
            {member.photo ? (
              <Image source={{ uri: member.photo }} style={styles.memberPhoto} />
            ) : (
              <Ionicons name="person" size={20} color={ds.colors.surface} />
            )}
          </View>
          <View style={styles.memberDetails}>
            <Text style={[styles.memberName, { color: ds.colors.text.primary }]}>
              {member.name}
            </Text>
            <Text style={[styles.memberAmount, { color: ds.colors.text.secondary }]}>
              {formatCurrency(amount)}
            </Text>
          </View>
        </View>
        {splitType === 'selective' && (
          <View style={[
            styles.checkbox,
            { 
              backgroundColor: isSelected ? ds.colors.primary : 'transparent',
              borderColor: ds.colors.primary,
            }
          ]}>
            {isSelected && (
              <Ionicons name="checkmark" size={16} color={ds.colors.surface} />
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: ds.colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={styles.safeArea}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: ds.colors.surface }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={ds.colors.text.primary} />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={[styles.headerTitle, { color: ds.colors.text.primary }]}>
              {t('debts.confirmDebtGroup.header.title')}
            </Text>
            <Text style={[styles.headerSubtitle, { color: ds.colors.text.secondary }]}>
              {params.groupName}
            </Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Value Display */}
          <View style={[styles.valueContainer, { backgroundColor: ds.colors.surface }]}>
            <Text style={[styles.valueLabel, { color: ds.colors.text.secondary }]}>
              {t('debts.confirmDebtGroup.value.label')}
            </Text>
            <Text style={[styles.valueAmount, { color: ds.colors.text.primary }]}>
              {formatCurrency(params.value)}
            </Text>
            <Text style={[styles.valueSplit, { color: ds.colors.text.secondary }]}>
              {`${formatCurrency(calculateSplitAmount())} por pessoa (${splitType === 'equal' ? groupMembers.length : selectedMembers.length} pessoas)`}
            </Text>
          </View>

          {/* Group Members */}
          <View style={styles.membersContainer}>
            <Text style={[styles.membersTitle, { color: ds.colors.text.primary }]}>
              {t('debts.confirmDebtGroup.members.title')}
            </Text>
            {groupMembers.map(renderMemberItem)}
          </View>

          {/* Split Type Selection */}
          <View style={styles.splitContainer}>
            <Text style={[styles.splitTitle, { color: ds.colors.text.primary }]}>
              {t('debts.confirmDebtGroup.split.title')}
            </Text>
            
            <TouchableOpacity
              style={[
                styles.splitOption,
                { 
                  backgroundColor: ds.colors.surface,
                  borderColor: splitType === 'equal' ? ds.colors.primary : ds.colors.border?.primary || ds.colors.surface,
                  borderWidth: 1,
                }
              ]}
              onPress={() => setSplitType('equal')}
              activeOpacity={0.7}
            >
              <View style={styles.splitOptionContent}>
                <View style={[
                  styles.radioButton,
                  { 
                    backgroundColor: splitType === 'equal' ? ds.colors.primary : 'transparent',
                    borderColor: ds.colors.primary,
                  }
                ]}>
                  {splitType === 'equal' && (
                    <Ionicons name="checkmark" size={16} color={ds.colors.surface} />
                  )}
                </View>
                <View style={styles.splitOptionText}>
                  <Text style={[styles.splitOptionTitle, { color: ds.colors.text.primary }]}>
                    {t('debts.confirmDebtGroup.split.equal')}
                  </Text>
                  <Text style={[styles.splitOptionSubtitle, { color: ds.colors.text.secondary }]}>
                    {t('debts.confirmDebtGroup.split.equalDescription')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.splitOption,
                { 
                  backgroundColor: ds.colors.surface,
                  borderColor: splitType === 'selective' ? ds.colors.primary : ds.colors.border?.primary || ds.colors.surface,
                  borderWidth: 1,
                }
              ]}
              onPress={() => setSplitType('selective')}
              activeOpacity={0.7}
            >
              <View style={styles.splitOptionContent}>
                <View style={[
                  styles.radioButton,
                  { 
                    backgroundColor: splitType === 'selective' ? ds.colors.primary : 'transparent',
                    borderColor: ds.colors.primary,
                  }
                ]}>
                  {splitType === 'selective' && (
                    <Ionicons name="checkmark" size={16} color={ds.colors.surface} />
                  )}
                </View>
                <View style={styles.splitOptionText}>
                  <Text style={[styles.splitOptionTitle, { color: ds.colors.text.primary }]}>
                    {t('debts.confirmDebtGroup.split.selective')}
                  </Text>
                  <Text style={[styles.splitOptionSubtitle, { color: ds.colors.text.secondary }]}>
                    {t('debts.confirmDebtGroup.split.selectiveDescription')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Title Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: ds.colors.text.primary }]}>
              {t('debts.confirmDebtGroup.title.label')}
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: ds.colors.surface,
                  color: ds.colors.text.primary,
                  borderColor: ds.colors.border?.primary || ds.colors.surface,
                }
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder={t('debts.confirmDebtGroup.title.placeholder')}
              placeholderTextColor={ds.colors.text.secondary}
              maxLength={50}
            />
          </View>


        </ScrollView>

        {/* Confirm Button */}
        <View style={styles.confirmContainer}>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              { backgroundColor: ds.colors.primary }
            ]}
            onPress={handleConfirm}
            activeOpacity={0.8}
          >
            <Text style={[styles.confirmButtonText, { color: ds.colors.surface }]}>
              {t('debts.confirmDebtGroup.confirm')}
            </Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  valueContainer: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  valueLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  valueAmount: {
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 4,
  },
  valueSplit: {
    fontSize: 14,
  },
  membersContainer: {
    marginBottom: 20,
  },
  membersTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  memberAmount: {
    fontSize: 14,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splitContainer: {
    marginBottom: 20,
  },
  splitTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  splitOption: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  splitOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  splitOptionText: {
    flex: 1,
  },
  splitOptionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  splitOptionSubtitle: {
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  confirmContainer: {
    padding: 20,
    paddingBottom: 34, // Safe area bottom
  },
  confirmButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ConfirmDebtGroupScreen;
