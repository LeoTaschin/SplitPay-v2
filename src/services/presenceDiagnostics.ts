import { ref, set, get, onValue, off } from 'firebase/database';
import { database, auth } from '../config/firebase';
import { presenceService } from './presenceService';

export const runPresenceDiagnostics = async () => {
  console.log('🔍 PRESENCE DIAGNOSTICS STARTED');
  console.log('=====================================');
  
  // Test 1: Check Firebase Database connection
  console.log('\n1️⃣ DATABASE CONNECTION TEST');
  try {
    const testRef = ref(database, 'presence/test');
    await set(testRef, {
      timestamp: Date.now(),
      message: 'Database connection test'
    });
    console.log('✅ Database connection: OK');
    
    const snapshot = await get(testRef);
    console.log('✅ Database read: OK', snapshot.val());
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
  
  // Test 2: Check authentication
  console.log('\n2️⃣ AUTHENTICATION TEST');
  if (!auth.currentUser) {
    console.error('❌ No user authenticated');
    return false;
  }
  console.log('✅ User authenticated:', auth.currentUser.uid);
  
  // Test 3: Test presence service initialization
  console.log('\n3️⃣ PRESENCE SERVICE INITIALIZATION');
  try {
    presenceService.initialize();
    console.log('✅ Presence service initialized');
  } catch (error) {
    console.error('❌ Presence service initialization failed:', error);
  }
  
  // Test 4: Test setting own presence
  console.log('\n4️⃣ SETTING OWN PRESENCE');
  try {
    const userId = auth.currentUser.uid;
    const presenceRef = ref(database, `presence/${userId}`);
    
    await set(presenceRef, {
      isOnline: true,
      lastSeen: Date.now(),
      status: 'online',
      deviceInfo: {
        platform: 'ios',
        appVersion: '1.0.0'
      }
    });
    console.log('✅ Own presence set successfully');
  } catch (error) {
    console.error('❌ Failed to set own presence:', error);
  }
  
  // Test 5: Test listening to own presence
  console.log('\n5️⃣ LISTENING TO OWN PRESENCE');
  return new Promise((resolve) => {
    const userId = auth.currentUser!.uid;
    const presenceRef = ref(database, `presence/${userId}`);
    
    const unsubscribe = onValue(presenceRef, (snapshot) => {
      const data = snapshot.val();
      console.log('📡 Own presence data received:', data);
      
      if (data && data.isOnline) {
        console.log('✅ Own presence listener working');
        unsubscribe();
        resolve(true);
      }
    }, (error) => {
      console.error('❌ Presence listener error:', error);
      unsubscribe();
      resolve(false);
    });
    
    // Timeout after 5 seconds
    setTimeout(() => {
      console.log('⏰ Presence listener timeout');
      unsubscribe();
      resolve(false);
    }, 5000);
  });
};

export const testCrossDevicePresence = async (otherUserId: string) => {
  console.log('\n🔍 CROSS-DEVICE PRESENCE TEST');
  console.log('Testing presence for user:', otherUserId);
  
  return new Promise((resolve) => {
    const presenceRef = ref(database, `presence/${otherUserId}`);
    
    const unsubscribe = onValue(presenceRef, (snapshot) => {
      const data = snapshot.val();
      console.log('📡 Other user presence data:', data);
      
      if (data) {
        console.log('✅ Cross-device presence working');
        console.log('Status:', data.status);
        console.log('Is Online:', data.isOnline);
        console.log('Last Seen:', new Date(data.lastSeen).toLocaleString());
        unsubscribe();
        resolve(true);
      } else {
        console.log('📭 No presence data found for other user');
        unsubscribe();
        resolve(false);
      }
    }, (error) => {
      console.error('❌ Cross-device presence error:', error);
      unsubscribe();
      resolve(false);
    });
    
    // Timeout after 10 seconds
    setTimeout(() => {
      console.log('⏰ Cross-device presence timeout');
      unsubscribe();
      resolve(false);
    }, 10000);
  });
};

export const forceSetPresence = async (userId: string, status: 'online' | 'offline' | 'away' | 'busy') => {
  console.log(`🔧 Force setting presence for ${userId} to ${status}`);
  
  try {
    const presenceRef = ref(database, `presence/${userId}`);
    await set(presenceRef, {
      isOnline: status === 'online',
      lastSeen: Date.now(),
      status,
      deviceInfo: {
        platform: 'ios',
        appVersion: '1.0.0'
      }
    });
    console.log('✅ Presence forced successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to force presence:', error);
    return false;
  }
};

export const checkPresenceRules = () => {
  console.log('\n🔍 PRESENCE RULES CHECK');
  console.log('Make sure your Firebase Realtime Database rules allow:');
  console.log('- Read/write to /presence/{userId} for authenticated users');
  console.log('- Read to /presence/{userId} for other users');
  console.log('- onDisconnect() operations');
  
  // Example rules that should work:
  console.log('\n📋 Example rules:');
  console.log(`
  {
    "rules": {
      "presence": {
        "$userId": {
          ".read": "auth != null",
          ".write": "auth != null && auth.uid == $userId",
          ".validate": "newData.hasChildren(['isOnline', 'lastSeen', 'status'])"
        }
      }
    }
  }
  `);
};
