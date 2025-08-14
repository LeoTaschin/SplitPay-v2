// Test script for presence system
import { presenceService } from './presenceService';
import { auth } from '../config/firebase';

export const testPresenceSystem = () => {
  console.log('🧪 Testing Presence System...');
  
  // Test 1: Check if auth is available
  console.log('✅ Auth available:', !!auth);
  console.log('✅ Current user:', auth.currentUser?.uid);
  
  // Test 2: Initialize presence service
  try {
    presenceService.initialize();
    console.log('✅ Presence service initialized');
  } catch (error) {
    console.error('❌ Failed to initialize presence service:', error);
  }
  
  // Test 3: Set different statuses
  setTimeout(() => {
    presenceService.setStatus('online');
    console.log('✅ Set status to online');
  }, 1000);
  
  setTimeout(() => {
    presenceService.setStatus('away');
    console.log('✅ Set status to away');
  }, 2000);
  
  setTimeout(() => {
    presenceService.setStatus('busy');
    console.log('✅ Set status to busy');
  }, 3000);
  
  // Test 4: Listen to own presence
  if (auth.currentUser) {
    const unsubscribe = presenceService.listenToUserPresence(
      auth.currentUser.uid,
      (presence) => {
        console.log('📡 Own presence update:', presence);
      }
    );
    
    // Cleanup after 10 seconds
    setTimeout(() => {
      unsubscribe();
      console.log('✅ Cleaned up presence listener');
    }, 10000);
  }
};

// Run test if this file is executed directly
if (require.main === module) {
  testPresenceSystem();
}
