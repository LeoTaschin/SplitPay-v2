import { auth } from '../config/firebase';

export const debugUserIds = (friends: any[]) => {
  console.log('🔍 Debugging User IDs...');
  console.log('Current user ID:', auth.currentUser?.uid);
  console.log('Current user email:', auth.currentUser?.email);
  
  console.log('Friends data:');
  friends.forEach((friend, index) => {
    console.log(`  ${index + 1}. ${friend.username}:`);
    console.log(`     - ID: ${friend.id}`);
    console.log(`     - Email: ${friend.email}`);
    console.log(`     - UID matches current user: ${friend.id === auth.currentUser?.uid}`);
  });
  
  // Check if any friend has the same ID as current user
  const sameIdFriend = friends.find(friend => friend.id === auth.currentUser?.uid);
  if (sameIdFriend) {
    console.log('⚠️  WARNING: Found friend with same ID as current user!');
    console.log('   This could cause presence issues.');
  }
  
  // Check for duplicate IDs
  const ids = friends.map(f => f.id);
  const uniqueIds = [...new Set(ids)];
  if (ids.length !== uniqueIds.length) {
    console.log('⚠️  WARNING: Duplicate friend IDs found!');
    console.log('   Original IDs:', ids);
    console.log('   Unique IDs:', uniqueIds);
  }
  
  return {
    currentUserId: auth.currentUser?.uid,
    friendIds: ids,
    uniqueIds,
    hasSameIdAsCurrentUser: !!sameIdFriend,
    hasDuplicateIds: ids.length !== uniqueIds.length
  };
};
