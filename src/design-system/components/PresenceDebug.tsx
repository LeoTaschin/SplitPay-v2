import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { presenceService } from '../../services/presenceService';
import { auth } from '../../config/firebase';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { testDatabaseConnection, testPresenceData, createTestPresence } from '../../services/testDatabase';
import { runCompleteDiagnostics, quickDiagnostics } from '../../services/runDiagnostics';
import { testDisconnectDetection, forceOfflineStatus } from '../../services/testDisconnect';

export const PresenceDebug: React.FC = () => {
  const ds = useDesignSystem();
  const [currentStatus, setCurrentStatus] = useState('offline');
  const [ownPresence, setOwnPresence] = useState<any>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Listen to own presence
    const unsubscribe = presenceService.listenToUserPresence(
      auth.currentUser.uid,
      (presence) => {
        console.log('🔍 PresenceDebug: Own presence update:', presence);
        setOwnPresence(presence);
        setCurrentStatus(presence.status);
      }
    );

    return () => unsubscribe();
  }, []);

  const setStatus = (status: 'online' | 'offline' | 'away' | 'busy') => {
    presenceService.setStatus(status);
    setCurrentStatus(status);
  };

  const initializeService = () => {
    presenceService.initialize();
  };

  const runDatabaseTest = async () => {
    await testDatabaseConnection();
  };

  const testCurrentUserPresence = async () => {
    if (auth.currentUser) {
      await testPresenceData(auth.currentUser.uid);
    }
  };

  const createTestPresenceForCurrentUser = async () => {
    if (auth.currentUser) {
      await createTestPresence(auth.currentUser.uid);
    }
  };

  const runCompleteDiagnosticsTest = async () => {
    await runCompleteDiagnostics();
  };

  const runQuickDiagnosticsTest = async () => {
    await quickDiagnostics();
  };

  const testDisconnectDetectionTest = async () => {
    await testDisconnectDetection();
  };

  const forceOfflineStatusTest = async () => {
    await forceOfflineStatus();
  };

  return (
    <View style={[styles.container, { backgroundColor: ds.colors.surface }]}>
      <Text style={[styles.title, { color: ds.colors.text.primary }]}>
        🧪 Presence Debug
      </Text>
      
      <View style={styles.section}>
        <Text style={[styles.label, { color: ds.colors.text.secondary }]}>
          Current User: {auth.currentUser?.uid || 'Not logged in'}
        </Text>
        <Text style={[styles.label, { color: ds.colors.text.secondary }]}>
          Current Status: {currentStatus}
        </Text>
        <Text style={[styles.label, { color: ds.colors.text.secondary }]}>
          Is Online: {ownPresence?.isOnline ? 'Yes' : 'No'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: ds.colors.text.primary }]}>
          Set Status:
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#10B981' }]}
            onPress={() => setStatus('online')}
          >
            <Text style={styles.buttonText}>Online</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#F59E0B' }]}
            onPress={() => setStatus('away')}
          >
            <Text style={styles.buttonText}>Away</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#EF4444' }]}
            onPress={() => setStatus('busy')}
          >
            <Text style={styles.buttonText}>Busy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#9CA3AF' }]}
            onPress={() => setStatus('offline')}
          >
            <Text style={styles.buttonText}>Offline</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: ds.colors.text.primary }]}>
          Tests:
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: ds.colors.primary }]}
            onPress={initializeService}
          >
            <Text style={styles.buttonText}>Initialize Service</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#3B82F6' }]}
            onPress={runDatabaseTest}
          >
            <Text style={styles.buttonText}>Test Database</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#8B5CF6' }]}
            onPress={testCurrentUserPresence}
          >
            <Text style={styles.buttonText}>Test Presence</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#059669' }]}
            onPress={createTestPresenceForCurrentUser}
          >
            <Text style={styles.buttonText}>Create Test</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: ds.colors.text.primary }]}>
          Complete Diagnostics:
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#DC2626' }]}
            onPress={runCompleteDiagnosticsTest}
          >
            <Text style={styles.buttonText}>Full Test</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#7C3AED' }]}
            onPress={runQuickDiagnosticsTest}
          >
            <Text style={styles.buttonText}>Quick Test</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: ds.colors.text.primary }]}>
          Disconnect Tests:
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#F59E0B' }]}
            onPress={testDisconnectDetectionTest}
          >
            <Text style={styles.buttonText}>Test Disconnect</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#DC2626' }]}
            onPress={forceOfflineStatusTest}
          >
            <Text style={styles.buttonText}>Force Offline</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: ds.colors.text.primary }]}>
          Raw Presence Data:
        </Text>
        <Text style={[styles.dataText, { color: ds.colors.text.secondary }]}>
          {JSON.stringify(ownPresence, null, 2)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  dataText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
});
