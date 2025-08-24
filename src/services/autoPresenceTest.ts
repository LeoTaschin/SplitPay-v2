import { ref, set, get, onValue } from 'firebase/database';
import { database, auth } from '../config/firebase';
import { presenceService } from './presenceService';

export const autoTestPresence = async () => {
  console.log('🤖 AUTO PRESENCE TEST STARTED');
  console.log('=====================================');
  
  if (!auth.currentUser) {
    console.error('❌ No user authenticated');
    return false;
  }

  const userId = auth.currentUser.uid;
  console.log('👤 Testing for user:', userId);

  // Test 1: Initialize presence service
  console.log('\n1️⃣ INITIALIZING PRESENCE SERVICE');
  try {
    presenceService.initialize();
    console.log('✅ Presence service initialized');
  } catch (error) {
    console.error('❌ Failed to initialize presence service:', error);
    return false;
  }

  // Test 2: Check if presence data was written
  console.log('\n2️⃣ CHECKING PRESENCE DATA');
  return new Promise((resolve) => {
    const presenceRef = ref(database, `presence/${userId}`);
    
    const unsubscribe = onValue(presenceRef, (snapshot) => {
      const data = snapshot.val();
      console.log('📡 Presence data received:', data);
      
      if (data && data.isOnline === true) {
        console.log('✅ User is online!');
        console.log('Status:', data.status);
        console.log('Last Seen:', new Date(data.lastSeen).toLocaleString());
        unsubscribe();
        resolve(true);
      } else if (data) {
        console.log('⚠️ User presence found but not online:', data);
        unsubscribe();
        resolve(false);
      } else {
        console.log('📭 No presence data found');
        unsubscribe();
        resolve(false);
      }
    }, (error) => {
      console.error('❌ Error reading presence data:', error);
      unsubscribe();
      resolve(false);
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      console.log('⏰ Auto test timeout');
      unsubscribe();
      resolve(false);
    }, 10000);
  });
};

export const testCrossDeviceDetection = async (otherUserId: string) => {
  console.log('\n🔍 TESTING CROSS-DEVICE DETECTION');
  console.log('Looking for user:', otherUserId);
  
  return new Promise((resolve) => {
    const presenceRef = ref(database, `presence/${otherUserId}`);
    
    const unsubscribe = onValue(presenceRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        console.log('✅ Other user presence detected!');
        console.log('User ID:', otherUserId);
        console.log('Is Online:', data.isOnline);
        console.log('Status:', data.status);
        console.log('Last Seen:', new Date(data.lastSeen).toLocaleString());
        unsubscribe();
        resolve(true);
      } else {
        console.log('📭 No presence data for other user');
        unsubscribe();
        resolve(false);
      }
    }, (error) => {
      console.error('❌ Error reading other user presence:', error);
      unsubscribe();
      resolve(false);
    });

    // Timeout after 15 seconds
    setTimeout(() => {
      console.log('⏰ Cross-device test timeout');
      unsubscribe();
      resolve(false);
    }, 15000);
  });
};

export const simulateAppStateChanges = () => {
  console.log('\n🔄 SIMULATING APP STATE CHANGES');
  
  // Simulate app going to background
  setTimeout(() => {
    console.log('📱 Simulating app going to background...');
    // In a real app, this would be handled by AppState
  }, 5000);
  
  // Simulate app coming back to foreground
  setTimeout(() => {
    console.log('📱 Simulating app coming back to foreground...');
    if (auth.currentUser) {
      presenceService.initialize();
    }
  }, 10000);
  
  // Simulate app closing
  setTimeout(() => {
    console.log('📱 Simulating app closing...');
    presenceService.cleanup();
  }, 15000);
};
