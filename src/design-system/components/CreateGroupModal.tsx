import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { useDesignSystem } from '../hooks/useDesignSystem';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../hooks/useAuth';
import { getUserFriends } from '../../services/userService';
import { GroupService } from '../../services/groupService';
import { CreateGroupFriendItem } from './CreateGroupFriendItem';
import { GroupConfirmationItem } from './GroupConfirmationItem';

interface Friend {
  id: string;
  username: string;
  email: string;
  photoURL?: string | null;
}

interface CreateGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onGroupCreated: (groupData: any) => void;
}

type Step = 1 | 2 | 3;

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  visible,
  onClose,
  onGroupCreated
}) => {
  const ds = useDesignSystem();
  const { t } = useLanguage();
  const { user } = useAuth();
  
  // Step management
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const slideAnim = useState(new Animated.Value(0))[0];
  const progressAnim = useState(new Animated.Value(1))[0];
  
  // Form data
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupPhoto, setGroupPhoto] = useState<string | null>(null);
  
  // State
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
      loadFriends();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Animar progresso quando mudar
  useEffect(() => {
    const progress = calculateProgress();
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentStep, selectedFriends.length, groupName, groupPhoto]);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const userFriends = await getUserFriends(user!.uid);
      setFriends(userFriends);
    } catch (error) {
      console.error('CreateGroupModal: Erro ao carregar amigos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (creating) return;
    
    // Reset form
    setCurrentStep(1);
    setSelectedFriends([]);
    setGroupName('');
    setGroupDescription('');
    setGroupPhoto(null);
    onClose();
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleFriendToggle = (friendId: string) => {
    setSelectedFriends(prev => 
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setGroupPhoto(result.assets[0].uri);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      return;
    }

    try {
      setCreating(true);
      
      console.log('CreateGroupModal: Iniciando criação do grupo...');
      
      // 1. Criar o grupo no Firestore
      const groupData = {
        name: groupName.trim(),
        description: groupDescription.trim(),
        photoURL: '', // Será atualizada após upload da foto
        members: [user!.uid, ...selectedFriends],
        createdBy: user!.uid,
      };

      const groupId = await GroupService.createGroup(groupData);
      console.log('CreateGroupModal: Grupo criado com ID:', groupId);
      
      // 2. Se há foto, fazer upload para o Storage
      let finalPhotoURL = '';
      if (groupPhoto) {
        try {
          finalPhotoURL = await GroupService.uploadGroupPhoto(groupPhoto, groupId);
          console.log('CreateGroupModal: Foto do grupo enviada:', finalPhotoURL);
          
          // 3. Atualizar o grupo com a URL da foto
          await GroupService.updateGroup(groupId, { photoURL: finalPhotoURL });
          console.log('CreateGroupModal: Grupo atualizado com foto');
        } catch (photoError) {
          console.warn('CreateGroupModal: Erro ao enviar foto, continuando sem foto:', photoError);
        }
      }
      
      // 4. Preparar dados finais do grupo
      const finalGroupData = {
        id: groupId,
        ...groupData,
        photoURL: finalPhotoURL,
      };
      
      console.log('CreateGroupModal: Grupo criado com sucesso:', finalGroupData);
      
      // Reset form
      setCurrentStep(1);
      setSelectedFriends([]);
      setGroupName('');
      setGroupDescription('');
      setGroupPhoto(null);
      
      // Fechar modal e notificar sucesso
      onClose();
      onGroupCreated(finalGroupData);
      
    } catch (error) {
      console.error('CreateGroupModal: Erro ao criar grupo:', error);
      // TODO: Mostrar erro para o usuário
    } finally {
      setCreating(false);
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return selectedFriends.length > 0;
      case 2:
        return groupName.trim().length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const selectedFriendsList = friends.filter(friend => selectedFriends.includes(friend.id));
  const totalMembers = selectedFriends.length + 1; // +1 for the current user

  const calculateProgress = () => {
    if (currentStep === 1) {
      // Na primeira etapa, progresso baseado na seleção de amigos
      if (selectedFriends.length === 0) {
        return 1; // 1% quando não há seleção
      }
      // 33% quando pelo menos um amigo foi selecionado
      return 33;
    } else if (currentStep === 2) {
      // Na segunda etapa, progresso baseado no preenchimento
      let progress = 33; // Base da etapa 2
      if (groupName.trim()) progress += 16; // +16% se tem nome
      if (groupPhoto) progress += 16; // +16% se tem foto
      return progress;
    } else {
      // Na terceira etapa, progresso completo
      return 100;
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={[styles.progressBar, { backgroundColor: ds.colors.border.primary }]}>
        <Animated.View 
          style={[
            styles.progressFill, 
            { 
              backgroundColor: ds.colors.primary,
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              })
            }
          ]} 
        />
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: ds.colors.text.primary }]}>
        {t('groups.createModal.step1Title')}
      </Text>
      <Text style={[styles.stepSubtitle, { color: ds.colors.text.secondary }]}>
        {t('groups.createModal.step1Subtitle')}
      </Text>
      
      {friends.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color={ds.colors.text.secondary} />
          <Text style={[styles.emptyStateTitle, { color: ds.colors.text.primary }]}>
            {t('groups.createModal.noFriendsToAdd')}
          </Text>
        </View>
      ) : (
                 <ScrollView style={styles.friendsList} showsVerticalScrollIndicator={false}>
           {friends.map((friend) => (
             <CreateGroupFriendItem
               key={friend.id}
               friend={friend}
               isSelected={selectedFriends.includes(friend.id)}
               onPress={() => handleFriendToggle(friend.id)}
             />
           ))}
         </ScrollView>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: ds.colors.text.primary }]}>
        {t('groups.createModal.step2Title')}
      </Text>
      <Text style={[styles.stepSubtitle, { color: ds.colors.text.secondary }]}>
        {t('groups.createModal.step2Subtitle')}
      </Text>
      
      <ScrollView style={styles.step2Content} showsVerticalScrollIndicator={false}>
        {/* Group Name and Photo Row */}
        <View style={styles.namePhotoRow}>
          <View style={styles.photoContainer}>
            <TouchableOpacity 
              style={[styles.photoButton, { borderColor: ds.colors.border.primary }]}
              onPress={handlePickImage}
            >
              {groupPhoto ? (
                <Image source={{ uri: groupPhoto }} style={styles.groupPhoto} />
              ) : (
                <Ionicons name="camera" size={24} color={ds.colors.text.secondary} />
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.nameContainer}>
            <Text style={[styles.inputLabel, { color: ds.colors.text.primary }]}>
              {t('groups.groupName')} *
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: ds.colors.surface,
                  color: ds.colors.text.primary,
                  borderColor: ds.colors.border.primary
                }
              ]}
              value={groupName}
              onChangeText={setGroupName}
              placeholder={t('groups.createModal.groupNamePlaceholder')}
              placeholderTextColor={ds.colors.text.secondary}
              maxLength={50}
            />
          </View>
        </View>

        {/* Group Description */}
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: ds.colors.text.primary }]}>
            {t('groups.groupDescription')}
          </Text>
          <TextInput
            style={[
              styles.textArea,
              { 
                backgroundColor: ds.colors.surface,
                color: ds.colors.text.primary,
                borderColor: ds.colors.border.primary
              }
            ]}
            value={groupDescription}
            onChangeText={setGroupDescription}
            placeholder={t('groups.createModal.groupDescriptionPlaceholder')}
            placeholderTextColor={ds.colors.text.secondary}
            multiline
            numberOfLines={3}
            maxLength={200}
          />
        </View>
      </ScrollView>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: ds.colors.text.primary }]}>
        {t('groups.createModal.step3Title')}
      </Text>
      <Text style={[styles.stepSubtitle, { color: ds.colors.text.secondary }]}>
        {t('groups.createModal.step3Subtitle')}
      </Text>
      
      <ScrollView style={styles.step3Content} showsVerticalScrollIndicator={false}>
        {/* Group Preview */}
        <View style={styles.previewContainer}>
          <Text style={[styles.previewTitle, { color: ds.colors.text.primary }]}>
            {t('groups.createModal.groupPreview')}
          </Text>
          
          <View style={[styles.groupPreview, { backgroundColor: ds.colors.surface }]}>
            <View style={styles.previewHeader}>
              {groupPhoto ? (
                <Image source={{ uri: groupPhoto }} style={styles.previewPhoto} />
              ) : (
                <View style={[styles.previewPhotoPlaceholder, { backgroundColor: ds.colors.primary }]}>
                  <Ionicons name="people" size={24} color="white" />
                </View>
              )}
              <View style={styles.previewInfo}>
                <Text style={[styles.previewName, { color: ds.colors.text.primary }]}>
                  {groupName || t('groups.groupName')}
                </Text>
                <Text style={[styles.previewMembers, { color: ds.colors.text.secondary }]}>
                  {totalMembers} {totalMembers === 1 ? t('groups.participant') : t('groups.participants')}
                </Text>
              </View>
            </View>
            
            {groupDescription && (
              <Text style={[styles.previewDescription, { color: ds.colors.text.secondary }]}>
                {groupDescription}
              </Text>
            )}
          </View>
        </View>

        {/* Selected Members */}
        <View style={styles.membersContainer}>
          <Text style={[styles.membersTitle, { color: ds.colors.text.primary }]}>
            {t('groups.createModal.selectedMembers')} ({selectedFriendsList.length})
          </Text>
          
          <View style={styles.membersList}>
            {selectedFriendsList.map((friend) => (
              <GroupConfirmationItem
                key={friend.id}
                friend={friend}
                style={{ backgroundColor: ds.colors.surface }}
                onRemove={handleFriendToggle}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <BlurView intensity={20} style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          onPress={handleClose}
          activeOpacity={1}
        />
        <Animated.View 
          style={[
            styles.modalContent,
            { backgroundColor: ds.colors.background },
            {
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [Dimensions.get('window').height, 0],
                }),
              }],
            },
          ]}
        >
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleClose} disabled={creating}>
              <Ionicons name="close" size={24} color={ds.colors.text.secondary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: ds.colors.text.primary }]}>
              {t('groups.createGroup')}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Progress Bar */}
          {renderProgressBar()}

          {/* Step Content */}
          {renderCurrentStep()}

          {/* Footer */}
          <View style={styles.footer}>
            {currentStep > 1 && (
              <TouchableOpacity
                style={[styles.footerButton, styles.previousButton, { borderColor: ds.colors.border.primary }]}
                onPress={handlePrevious}
                disabled={creating}
              >
                <Text style={[styles.footerButtonText, { color: ds.colors.text.secondary }]}>
                  {t('groups.createModal.previous')}
                </Text>
              </TouchableOpacity>
            )}
            
            {currentStep < 3 ? (
              <TouchableOpacity
                style={[
                  styles.footerButton,
                  styles.nextButton,
                  { 
                    backgroundColor: canGoNext() ? ds.colors.primary : ds.colors.text.secondary,
                    opacity: (currentStep === 1 && selectedFriends.length === 0) || 
                           (currentStep === 2 && !groupName.trim()) ? 0.2 : 1
                  }
                ]}
                onPress={handleNext}
                disabled={!canGoNext() || creating}
              >
                <Text style={[
                  styles.nextButtonText,
                  { 
                    color: (currentStep === 1 && selectedFriends.length === 0) || 
                           (currentStep === 2 && !groupName.trim())
                      ? ds.colors.text.primary 
                      : 'white'
                  }
                ]}>
                  {t('groups.createModal.next')}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.footerButton,
                  styles.createButton,
                  { 
                    backgroundColor: canGoNext() ? ds.colors.primary : ds.colors.text.secondary
                  }
                ]}
                onPress={handleCreateGroup}
                disabled={!canGoNext() || creating}
              >
                {creating ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.createButtonText}>
                    {t('groups.createModal.create')}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: Dimensions.get('window').height * 0.95,
    minHeight: Dimensions.get('window').height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  friendsList: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  step2Content: {
    flex: 1,
  },
  namePhotoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  nameContainer: {
    flex: 1,
  },
  photoContainer: {
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  photoButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  photoPlaceholder: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  step3Content: {
    flex: 1,
  },
  previewContainer: {
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  groupPreview: {
    borderRadius: 16,
    padding: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  previewPhotoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  previewMembers: {
    fontSize: 14,
  },
  previewDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  membersContainer: {
    marginBottom: 20,
  },
  membersTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  membersList: {
    gap: 8,
  },

  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingBottom: 20,
  },
  footerButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previousButton: {
    borderWidth: 1,
  },
  nextButton: {
    // backgroundColor handled inline
  },
  createButton: {
    // backgroundColor handled inline
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
