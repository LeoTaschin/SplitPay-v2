import { ref, set, onValue } from 'firebase/database';
import { database, auth } from '../config/firebase';

export const testDisconnectDetection = async () => {
  console.log('🧪 Testing Disconnect Detection...');
  
  if (!auth.currentUser) {
    console.log('❌ No user logged in');
    return;
  }

  const userId = auth.currentUser.uid;
  const presenceRef = ref(database, `presence/${userId}`);
  
  // Set up listener to watch for changes
  const unsubscribe = onValue(presenceRef, (snapshot) => {
    const data = snapshot.val();
    console.log('📡 Disconnect test - Presence update:', data);
  });

  // Set user as online
  console.log('🔍 Setting user as online...');
  await set(presenceRef, {
    isOnline: true,
    status: 'online',
    lastSeen: Date.now(),
    deviceInfo: {
      platform: 'ios',
      appVersion: '1.0.0'
    }
  });

  console.log('✅ User set as online');
  console.log('📱 Now close the app or disconnect from internet');
  console.log('⏰ The status should change to offline within 1-2 minutes');

  // Cleanup listener after 10 seconds
  setTimeout(() => {
    unsubscribe();
    console.log('🔍 Disconnect test listener cleaned up');
  }, 10000);

  return unsubscribe;
};

export const forceOfflineStatus = async () => {
  console.log('🧪 Force Setting User as Offline...');
  
  if (!auth.currentUser) {
    console.log('❌ No user logged in');
    return;
  }

  const userId = auth.currentUser.uid;
  const presenceRef = ref(database, `presence/${userId}`);
  
  try {
    await set(presenceRef, {
      isOnline: false,
      status: 'offline',
      lastSeen: Date.now(),
      deviceInfo: {
        platform: 'ios',
        appVersion: '1.0.0'
      }
    });
    
    console.log('✅ User forced to offline status');
  } catch (error) {
    console.error('❌ Failed to force offline status:', error);
  }
};
