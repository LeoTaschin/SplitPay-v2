import { ref, set, get, onValue } from 'firebase/database';
import { database } from '../config/firebase';
import { auth } from '../config/firebase';

export const testDatabaseConnection = async () => {
  console.log('🧪 Testing Database Connection...');
  
  try {
    // Test 1: Check if database is available
    console.log('✅ Database object:', !!database);
    
    // Test 2: Try to write data
    const testRef = ref(database, 'test/connection');
    await set(testRef, {
      timestamp: Date.now(),
      message: 'Test connection successful',
      userId: auth.currentUser?.uid || 'anonymous'
    });
    console.log('✅ Write test successful');
    
    // Test 3: Try to read data
    const snapshot = await get(testRef);
    const data = snapshot.val();
    console.log('✅ Read test successful:', data);
    
    // Test 4: Test real-time listener
    const listenerRef = ref(database, 'test/listener');
    const unsubscribe = onValue(listenerRef, (snapshot) => {
      const listenerData = snapshot.val();
      console.log('✅ Real-time listener working:', listenerData);
    });
    
    // Write to trigger listener
    await set(listenerRef, {
      timestamp: Date.now(),
      message: 'Listener test'
    });
    
    // Cleanup
    setTimeout(() => {
      unsubscribe();
      console.log('✅ Listener cleanup successful');
    }, 2000);
    
    return true;
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return false;
  }
};

export const testPresenceData = async (userId: string) => {
  console.log('🧪 Testing Presence Data for user:', userId);
  
  try {
    // Test 1: Check if presence data exists
    const presenceRef = ref(database, `presence/${userId}`);
    const snapshot = await get(presenceRef);
    const data = snapshot.val();
    
    console.log('📊 Current presence data for', userId, ':', data);
    
    if (data) {
      console.log('✅ Presence data found');
      console.log('   - isOnline:', data.isOnline);
      console.log('   - status:', data.status);
      console.log('   - lastSeen:', data.lastSeen);
    } else {
      console.log('❌ No presence data found for user:', userId);
    }
    
    return data;
  } catch (error) {
    console.error('❌ Presence data test failed:', error);
    return null;
  }
};

export const createTestPresence = async (userId: string) => {
  console.log('🧪 Creating test presence for user:', userId);
  
  try {
    const presenceRef = ref(database, `presence/${userId}`);
    await set(presenceRef, {
      isOnline: true,
      status: 'online',
      lastSeen: Date.now(),
      deviceInfo: {
        platform: 'ios',
        appVersion: '1.0.0'
      }
    });
    
    console.log('✅ Test presence created successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to create test presence:', error);
    return false;
  }
};
