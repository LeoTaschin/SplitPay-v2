import { testDatabaseConnection, testPresenceData, createTestPresence } from './testDatabase';
import { debugUserIds } from './debugIds';
import { presenceService } from './presenceService';
import { auth } from '../config/firebase';

export const runCompleteDiagnostics = async (friends: any[] = []) => {
  console.log('🚀 Starting Complete Diagnostics...');
  console.log('=====================================');
  
  // Test 1: Check authentication
  console.log('\n1️⃣ AUTHENTICATION TEST');
  console.log('Current user ID:', auth.currentUser?.uid);
  console.log('Current user email:', auth.currentUser?.email);
  console.log('Is authenticated:', !!auth.currentUser);
  
  if (!auth.currentUser) {
    console.log('❌ No user authenticated - stopping diagnostics');
    return false;
  }
  
  // Test 2: Database connection
  console.log('\n2️⃣ DATABASE CONNECTION TEST');
  const dbTestResult = await testDatabaseConnection();
  if (!dbTestResult) {
    console.log('❌ Database connection failed - stopping diagnostics');
    return false;
  }
  
  // Test 3: Initialize presence service
  console.log('\n3️⃣ PRESENCE SERVICE INITIALIZATION');
  try {
    presenceService.initialize();
    console.log('✅ Presence service initialized');
  } catch (error) {
    console.error('❌ Failed to initialize presence service:', error);
  }
  
  // Test 4: Create test presence for current user
  console.log('\n4️⃣ CREATE TEST PRESENCE');
  const createResult = await createTestPresence(auth.currentUser.uid);
  if (!createResult) {
    console.log('❌ Failed to create test presence');
  }
  
  // Test 5: Test presence data retrieval
  console.log('\n5️⃣ TEST PRESENCE DATA RETRIEVAL');
  const presenceData = await testPresenceData(auth.currentUser.uid);
  if (!presenceData) {
    console.log('❌ No presence data found');
  } else {
    console.log('✅ Presence data found:', presenceData);
  }
  
  // Test 6: Debug friend IDs
  if (friends.length > 0) {
    console.log('\n6️⃣ FRIEND IDS ANALYSIS');
    const idAnalysis = debugUserIds(friends);
    console.log('ID Analysis result:', idAnalysis);
  }
  
  // Test 7: Test presence listener
  console.log('\n7️⃣ PRESENCE LISTENER TEST');
  return new Promise((resolve) => {
    const unsubscribe = presenceService.listenToUserPresence(
      auth.currentUser!.uid,
      (presence) => {
        console.log('✅ Presence listener working:', presence);
        unsubscribe();
        resolve(true);
      }
    );
    
    // Timeout after 5 seconds
    setTimeout(() => {
      console.log('⏰ Presence listener timeout');
      unsubscribe();
      resolve(false);
    }, 5000);
  });
};

export const quickDiagnostics = async () => {
  console.log('⚡ Quick Diagnostics...');
  
  const results = {
    authenticated: !!auth.currentUser,
    userId: auth.currentUser?.uid,
    userEmail: auth.currentUser?.email,
    databaseWorking: false,
    presenceServiceWorking: false,
    presenceDataExists: false
  };
  
  // Test database
  try {
    results.databaseWorking = await testDatabaseConnection();
  } catch (error) {
    console.error('Database test failed:', error);
  }
  
  // Test presence service
  try {
    presenceService.initialize();
    results.presenceServiceWorking = true;
  } catch (error) {
    console.error('Presence service test failed:', error);
  }
  
  // Test presence data
  if (auth.currentUser) {
    try {
      const data = await testPresenceData(auth.currentUser.uid);
      results.presenceDataExists = !!data;
    } catch (error) {
      console.error('Presence data test failed:', error);
    }
  }
  
  console.log('📊 Quick Diagnostics Results:', results);
  return results;
};
