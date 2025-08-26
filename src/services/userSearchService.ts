import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { auth } from '../config/firebase';
import { areUsersFriends } from './friendService';

export interface SearchableUser {
  id: string;
  username: string;
  email: string;
  photoURL?: string;
  displayName?: string;
}

export const searchUsers = async (searchQuery: string, excludeUserIds: string[] = []): Promise<SearchableUser[]> => {
  try {
    console.log('🔍 Searching users with query:', searchQuery);
    
    if (!auth.currentUser) {
      console.log('❌ No user authenticated');
      return [];
    }

    const currentUserId = auth.currentUser.uid;
    const usersRef = collection(db, 'users');
    
    // Create a case-insensitive search query
    const searchLower = searchQuery.toLowerCase();
    
    // Search by username (case-insensitive)
    const usernameQuery = query(
      usersRef,
      where('username', '>=', searchLower),
      where('username', '<=', searchLower + '\uf8ff'),
      orderBy('username'),
      limit(20)
    );

    // Search by email (case-insensitive)
    const emailQuery = query(
      usersRef,
      where('email', '>=', searchLower),
      where('email', '<=', searchLower + '\uf8ff'),
      orderBy('email'),
      limit(20)
    );

    // Search by displayName (case-insensitive)
    const displayNameQuery = query(
      usersRef,
      where('displayName', '>=', searchLower),
      where('displayName', '<=', searchLower + '\uf8ff'),
      orderBy('displayName'),
      limit(20)
    );

    // Execute all queries
    const [usernameResults, emailResults, displayNameResults] = await Promise.all([
      getDocs(usernameQuery),
      getDocs(emailQuery),
      getDocs(displayNameQuery)
    ]);

    // Combine and deduplicate results
    const allUsers = new Map<string, SearchableUser>();

    // Process username results
    usernameResults.forEach(doc => {
      const userData = doc.data();
      if (doc.id !== currentUserId && !excludeUserIds.includes(doc.id)) {
        allUsers.set(doc.id, {
          id: doc.id,
          username: userData.username || '',
          email: userData.email || '',
          photoURL: userData.photoURL || undefined,
          displayName: userData.displayName || undefined
        });
      }
    });

    // Process email results
    emailResults.forEach(doc => {
      const userData = doc.data();
      if (doc.id !== currentUserId && !excludeUserIds.includes(doc.id)) {
        allUsers.set(doc.id, {
          id: doc.id,
          username: userData.username || '',
          email: userData.email || '',
          photoURL: userData.photoURL || undefined,
          displayName: userData.displayName || undefined
        });
      }
    });

    // Process displayName results
    displayNameResults.forEach(doc => {
      const userData = doc.data();
      if (doc.id !== currentUserId && !excludeUserIds.includes(doc.id)) {
        allUsers.set(doc.id, {
          id: doc.id,
          username: userData.username || '',
          email: userData.email || '',
          photoURL: userData.photoURL || undefined,
          displayName: userData.displayName || undefined
        });
      }
    });

    // Convert to array and sort by relevance
    const results = Array.from(allUsers.values());
    
    // Sort by relevance (exact matches first, then partial matches)
    results.sort((a, b) => {
      const aUsername = a.username.toLowerCase();
      const bUsername = b.username.toLowerCase();
      const aEmail = a.email.toLowerCase();
      const bEmail = b.email.toLowerCase();
      const aDisplayName = (a.displayName || '').toLowerCase();
      const bDisplayName = (b.displayName || '').toLowerCase();
      
      // Check for exact matches
      const aExactMatch = aUsername === searchLower || aEmail === searchLower || aDisplayName === searchLower;
      const bExactMatch = bUsername === searchLower || bEmail === searchLower || bDisplayName === searchLower;
      
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      
      // Check for starts with
      const aStartsWith = aUsername.startsWith(searchLower) || aEmail.startsWith(searchLower) || aDisplayName.startsWith(searchLower);
      const bStartsWith = bUsername.startsWith(searchLower) || bEmail.startsWith(searchLower) || bDisplayName.startsWith(searchLower);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      // Alphabetical order
      return aUsername.localeCompare(bUsername);
    });

    console.log(`✅ Found ${results.length} users matching "${searchQuery}"`);
    
    // Filter out users who are already friends
    const filteredResults = [];
    console.log('🔍 userSearchService - Iniciando filtro de amigos...');
    
    for (const user of results) {
      console.log('🔍 userSearchService - Verificando usuário:', user.username);
      const areFriends = await areUsersFriends(currentUserId, user.id);
      console.log('🔍 userSearchService - Resultado da verificação:', { 
        username: user.username, 
        userId: user.id, 
        areFriends 
      });
      
      if (!areFriends) {
        filteredResults.push(user);
        console.log('🔍 userSearchService - Usuário adicionado aos resultados:', user.username);
      } else {
        console.log('🔍 userSearchService - Usuário filtrado (já é amigo):', user.username);
      }
    }
    
    console.log(`✅ After filtering friends: ${filteredResults.length} users available`);
    return filteredResults.slice(0, 20); // Limit to 20 results

  } catch (error) {
    console.error('❌ Error searching users:', error);
    return [];
  }
};

export const searchUsersByUsername = async (username: string, excludeUserIds: string[] = []): Promise<SearchableUser[]> => {
  try {
    if (!auth.currentUser) return [];

    const currentUserId = auth.currentUser.uid;
    const usersRef = collection(db, 'users');
    
    const q = query(
      usersRef,
      where('username', '==', username),
      limit(10)
    );

    const querySnapshot = await getDocs(q);
    const users: SearchableUser[] = [];

    querySnapshot.forEach(doc => {
      const userData = doc.data();
      if (doc.id !== currentUserId && !excludeUserIds.includes(doc.id)) {
        users.push({
          id: doc.id,
          username: userData.username || '',
          email: userData.email || '',
          photoURL: userData.photoURL || undefined,
          displayName: userData.displayName || undefined
        });
      }
    });

    return users;
  } catch (error) {
    console.error('❌ Error searching users by username:', error);
    return [];
  }
};

export const searchUsersByEmail = async (email: string, excludeUserIds: string[] = []): Promise<SearchableUser[]> => {
  try {
    if (!auth.currentUser) return [];

    const currentUserId = auth.currentUser.uid;
    const usersRef = collection(db, 'users');
    
    const q = query(
      usersRef,
      where('email', '==', email),
      limit(10)
    );

    const querySnapshot = await getDocs(q);
    const users: SearchableUser[] = [];

    querySnapshot.forEach(doc => {
      const userData = doc.data();
      if (doc.id !== currentUserId && !excludeUserIds.includes(doc.id)) {
        users.push({
          id: doc.id,
          username: userData.username || '',
          email: userData.email || '',
          photoURL: userData.photoURL || undefined,
          displayName: userData.displayName || undefined
        });
      }
    });

    return users;
  } catch (error) {
    console.error('❌ Error searching users by email:', error);
    return [];
  }
};
