import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { presenceService } from '../../services/presenceService';
import { auth } from '../../config/firebase';
import { 
  runPresenceDiagnostics, 
  testCrossDevicePresence, 
  forceSetPresence,
  checkPresenceRules 
} from '../../services/presenceDiagnostics';
import { autoTestPresence, testCrossDeviceDetection } from '../../services/autoPresenceTest';

export const PresenceTestPanel: React.FC = () => {
  const ds = useDesignSystem();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('offline');
  const [ownPresence, setOwnPresence] = useState<any>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Listen to own presence
    const unsubscribe = presenceService.listenToUserPresence(
      auth.currentUser.uid,
      (presence) => {
        console.log('🔍 PresenceTestPanel: Own presence update:', presence);
        setOwnPresence(presence);
        setCurrentStatus(presence.status);
      }
    );

    return () => unsubscribe();
  }, []);

  const runDiagnostics = async () => {
    setIsRunningTest(true);
    try {
      console.log('🔍 Running presence diagnostics...');
      const result = await runPresenceDiagnostics();
      if (result) {
        Alert.alert('Diagnóstico', 'Sistema de presença funcionando corretamente!');
      } else {
        Alert.alert('Diagnóstico', 'Problemas encontrados no sistema de presença. Verifique os logs.');
      }
    } catch (error) {
      console.error('❌ Diagnostics error:', error);
      Alert.alert('Erro', 'Erro ao executar diagnóstico');
    } finally {
      setIsRunningTest(false);
    }
  };

  const testOtherUser = async () => {
    Alert.prompt(
      'Testar Outro Usuário',
      'Digite o ID do usuário para testar:',
      async (userId) => {
        if (userId) {
          setIsRunningTest(true);
          try {
            const result = await testCrossDevicePresence(userId);
            if (result) {
              Alert.alert('Teste', 'Presença do outro usuário detectada!');
            } else {
              Alert.alert('Teste', 'Nenhuma presença encontrada para este usuário.');
            }
          } catch (error) {
            console.error('❌ Cross-device test error:', error);
            Alert.alert('Erro', 'Erro ao testar presença do outro usuário');
          } finally {
            setIsRunningTest(false);
          }
        }
      }
    );
  };

  // Removed manual status setting - now automatic

  const forceStatus = async (status: 'online' | 'offline' | 'away' | 'busy') => {
    if (!auth.currentUser) return;
    
    try {
      await forceSetPresence(auth.currentUser.uid, status);
      Alert.alert('Status', `Status forçado para: ${status}`);
    } catch (error) {
      console.error('❌ Force status error:', error);
      Alert.alert('Erro', 'Erro ao forçar status');
    }
  };

  const showRules = () => {
    checkPresenceRules();
    Alert.alert('Regras', 'Verifique os logs para ver as regras recomendadas');
  };

  if (!isVisible) {
    return (
      <TouchableOpacity
        style={[styles.floatingButton, { backgroundColor: ds.colors.primary }]}
        onPress={() => setIsVisible(true)}
      >
        <Ionicons name="bug" size={24} color="white" />
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: ds.colors.surface }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: ds.colors.text.primary }]}>
          Teste de Presença
        </Text>
        <TouchableOpacity onPress={() => setIsVisible(false)}>
          <Ionicons name="close" size={24} color={ds.colors.text.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Current Status */}
        <View style={styles.statusSection}>
          <Text style={[styles.sectionTitle, { color: ds.colors.text.primary }]}>
            Status Atual
          </Text>
          <Text style={[styles.statusText, { color: ds.colors.text.secondary }]}>
            {currentStatus} {ownPresence?.isOnline ? '(Online)' : '(Offline)'}
          </Text>
          {ownPresence && (
            <Text style={[styles.lastSeen, { color: ds.colors.text.secondary }]}>
              Última atividade: {new Date(ownPresence.lastSeen).toLocaleString()}
            </Text>
          )}
        </View>

        {/* Status Info */}
        <View style={styles.controlsSection}>
          <Text style={[styles.sectionTitle, { color: ds.colors.text.primary }]}>
            Status Automático
          </Text>
          <Text style={[styles.statusInfo, { color: ds.colors.text.secondary }]}>
            • App aberto = Online
          </Text>
          <Text style={[styles.statusInfo, { color: ds.colors.text.secondary }]}>
            • App fechado = Offline
          </Text>
          <Text style={[styles.statusInfo, { color: ds.colors.text.secondary }]}>
            • Heartbeat a cada 30s
          </Text>
        </View>

        {/* Test Controls */}
        <View style={styles.testSection}>
          <Text style={[styles.sectionTitle, { color: ds.colors.text.primary }]}>
            Testes
          </Text>
          
          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: ds.colors.primary }]}
            onPress={runDiagnostics}
            disabled={isRunningTest}
          >
            <Ionicons name="medical" size={20} color="white" />
            <Text style={styles.buttonText}>
              {isRunningTest ? 'Executando...' : 'Diagnóstico Completo'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: '#059669' }]}
            onPress={async () => {
              setIsRunningTest(true);
              try {
                const result = await autoTestPresence();
                Alert.alert('Teste Automático', result ? '✅ Sistema funcionando!' : '❌ Problemas detectados');
              } catch (error) {
                Alert.alert('Erro', 'Erro no teste automático');
              } finally {
                setIsRunningTest(false);
              }
            }}
            disabled={isRunningTest}
          >
            <Ionicons name="play-circle" size={20} color="white" />
            <Text style={styles.buttonText}>
              {isRunningTest ? 'Testando...' : 'Teste Automático'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: ds.colors.secondary }]}
            onPress={testOtherUser}
            disabled={isRunningTest}
          >
            <Ionicons name="people" size={20} color="white" />
            <Text style={styles.buttonText}>Testar Outro Usuário</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: '#8B5CF6' }]}
            onPress={() => forceStatus('online')}
          >
            <Ionicons name="flash" size={20} color="white" />
            <Text style={styles.buttonText}>Forçar Online (Debug)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: '#6B7280' }]}
            onPress={showRules}
          >
            <Ionicons name="document-text" size={20} color="white" />
            <Text style={styles.buttonText}>Verificar Regras</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
    maxHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    gap: 16,
  },
  statusSection: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
  },
  lastSeen: {
    fontSize: 12,
  },
  controlsSection: {
    gap: 8,
  },
  statusInfo: {
    fontSize: 12,
    lineHeight: 16,
  },
  testSection: {
    gap: 8,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
