import { collection, doc, setDoc, getDoc, getDocs, query, where, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { auth } from '../config/firebase';

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUsername: string;
  toUsername: string;
  fromPhotoURL?: string; // URL da foto do usuário que enviou a solicitação
  status: 'pending' | 'accepted'; // 'rejected' requests are deleted
  createdAt: Date;
  updatedAt: Date;
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  username: string;
  friendUsername: string;
  createdAt: Date;
}

export const sendFriendRequest = async (toUserId: string, toUsername: string): Promise<boolean> => {
  try {
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }

    const fromUserId = auth.currentUser.uid;
    const fromUserDoc = await getDoc(doc(db, 'users', fromUserId));
    const fromUserData = fromUserDoc.data();
    const fromUsername = fromUserData?.username || 'Unknown User';
    const fromPhotoURL = fromUserData?.photoURL || undefined;

    // Check if request already exists and is pending
    const requestsRef = collection(db, 'friendRequests');
    const existingRequestQuery = query(
      requestsRef,
      where('fromUserId', '==', fromUserId),
      where('toUserId', '==', toUserId)
    );
    
    const existingRequests = await getDocs(existingRequestQuery);
    if (!existingRequests.empty) {
      // Check if there's a pending request
      const pendingRequest = existingRequests.docs.find(doc => doc.data().status === 'pending');
      if (pendingRequest) {
        throw new Error('Friend request already sent');
      }
      // If there's a rejected request, delete it to allow a new one
      const rejectedRequest = existingRequests.docs.find(doc => doc.data().status === 'rejected');
      if (rejectedRequest) {
        await deleteDoc(doc(db, 'friendRequests', rejectedRequest.id));
        console.log('🗑️ Deleted rejected friend request to allow new one');
      }
    }

    // Check if they are already friends
    const friendsRef = collection(db, 'friends');
    const friendQuery = query(
      friendsRef,
      where('userId', '==', fromUserId),
      where('friendId', '==', toUserId)
    );
    
    const existingFriends = await getDocs(friendQuery);
    if (!existingFriends.empty) {
      throw new Error('Already friends');
    }

    // Create friend request
    const requestId = `${fromUserId}_${toUserId}`;
    const friendRequest: FriendRequest = {
      id: requestId,
      fromUserId,
      toUserId,
      fromUsername,
      toUsername,
      fromPhotoURL,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(doc(db, 'friendRequests', requestId), friendRequest);
    
    console.log('✅ Friend request sent successfully');
    return true;

  } catch (error) {
    console.error('❌ Error sending friend request:', error);
    throw error;
  }
};

export const acceptFriendRequest = async (requestId: string): Promise<boolean> => {
  try {
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }

    const currentUserId = auth.currentUser.uid;
    
    // Get the friend request
    const requestDoc = await getDoc(doc(db, 'friendRequests', requestId));
    if (!requestDoc.exists()) {
      throw new Error('Friend request not found');
    }

    const requestData = requestDoc.data() as FriendRequest;
    
    // Verify the request is for the current user
    if (requestData.toUserId !== currentUserId) {
      throw new Error('Unauthorized to accept this request');
    }

    // Update request status
    await updateDoc(doc(db, 'friendRequests', requestId), {
      status: 'accepted',
      updatedAt: new Date()
    });

    // Create friendship records for both users
    const friendship1: Friend = {
      id: `${requestData.fromUserId}_${requestData.toUserId}`,
      userId: requestData.fromUserId,
      friendId: requestData.toUserId,
      username: requestData.fromUsername,
      friendUsername: requestData.toUsername,
      createdAt: new Date()
    };

    const friendship2: Friend = {
      id: `${requestData.toUserId}_${requestData.fromUserId}`,
      userId: requestData.toUserId,
      friendId: requestData.fromUserId,
      username: requestData.toUsername,
      friendUsername: requestData.fromUsername,
      createdAt: new Date()
    };

    // Save both friendship records
    await setDoc(doc(db, 'friends', friendship1.id), friendship1);
    await setDoc(doc(db, 'friends', friendship2.id), friendship2);

    // Update the friends array in both users' documents
    const user1Ref = doc(db, 'users', requestData.fromUserId);
    const user2Ref = doc(db, 'users', requestData.toUserId);
    
    // Get current friends arrays
    const [user1Doc, user2Doc] = await Promise.all([
      getDoc(user1Ref),
      getDoc(user2Ref)
    ]);
    
    const user1Data = user1Doc.data();
    const user2Data = user2Doc.data();
    
    const user1Friends = user1Data?.friends || [];
    const user2Friends = user2Data?.friends || [];
    
    // Add each other to friends arrays if not already present
    if (!user1Friends.includes(requestData.toUserId)) {
      user1Friends.push(requestData.toUserId);
    }
    if (!user2Friends.includes(requestData.fromUserId)) {
      user2Friends.push(requestData.fromUserId);
    }
    
    // Update both users' documents
    await Promise.all([
      updateDoc(user1Ref, { friends: user1Friends }),
      updateDoc(user2Ref, { friends: user2Friends })
    ]);

    // Delete the friend request after accepting
    await deleteDoc(doc(db, 'friendRequests', requestId));

    console.log('✅ Friend request accepted and deleted successfully');
    return true;

  } catch (error) {
    console.error('❌ Error accepting friend request:', error);
    throw error;
  }
};

export const rejectFriendRequest = async (requestId: string): Promise<boolean> => {
  try {
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }

    const currentUserId = auth.currentUser.uid;
    
    // Get the friend request
    const requestDoc = await getDoc(doc(db, 'friendRequests', requestId));
    if (!requestDoc.exists()) {
      throw new Error('Friend request not found');
    }

    const requestData = requestDoc.data() as FriendRequest;
    
    // Verify the request is for the current user
    if (requestData.toUserId !== currentUserId) {
      throw new Error('Unauthorized to reject this request');
    }

    // Delete the request completely instead of just marking as rejected
    await deleteDoc(doc(db, 'friendRequests', requestId));

    console.log('✅ Friend request rejected and deleted successfully');
    return true;

  } catch (error) {
    console.error('❌ Error rejecting friend request:', error);
    throw error;
  }
};

export const removeFriend = async (friendId: string): Promise<boolean> => {
  try {
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }

    const currentUserId = auth.currentUser.uid;
    
    // Remove friendship records for both users
    const friendship1Id = `${currentUserId}_${friendId}`;
    const friendship2Id = `${friendId}_${currentUserId}`;

    await deleteDoc(doc(db, 'friends', friendship1Id));
    await deleteDoc(doc(db, 'friends', friendship2Id));

    // Update the friends array in both users' documents
    const currentUserRef = doc(db, 'users', currentUserId);
    const friendUserRef = doc(db, 'users', friendId);
    
    // Get current friends arrays
    const [currentUserDoc, friendUserDoc] = await Promise.all([
      getDoc(currentUserRef),
      getDoc(friendUserRef)
    ]);
    
    const currentUserData = currentUserDoc.data();
    const friendUserData = friendUserDoc.data();
    
    const currentUserFriends = currentUserData?.friends || [];
    const friendUserFriends = friendUserData?.friends || [];
    
    // Remove each other from friends arrays
    const updatedCurrentUserFriends = currentUserFriends.filter((id: string) => id !== friendId);
    const updatedFriendUserFriends = friendUserFriends.filter((id: string) => id !== currentUserId);
    
    // Update both users' documents
    await Promise.all([
      updateDoc(currentUserRef, { friends: updatedCurrentUserFriends }),
      updateDoc(friendUserRef, { friends: updatedFriendUserFriends })
    ]);

    console.log('✅ Friend removed successfully');
    return true;

  } catch (error) {
    console.error('❌ Error removing friend:', error);
    throw error;
  }
};

export const getPendingFriendRequests = async (): Promise<FriendRequest[]> => {
  try {
    if (!auth.currentUser) {
      return [];
    }

    const currentUserId = auth.currentUser.uid;
    const requestsRef = collection(db, 'friendRequests');
    
    const pendingRequestsQuery = query(
      requestsRef,
      where('toUserId', '==', currentUserId),
      where('status', '==', 'pending')
    );

    const querySnapshot = await getDocs(pendingRequestsQuery);
    const requests: FriendRequest[] = [];

    querySnapshot.forEach(doc => {
      const data = doc.data();
      requests.push({
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as FriendRequest);
    });

    return requests;

  } catch (error) {
    console.error('❌ Error getting pending friend requests:', error);
    return [];
  }
};

export const areUsersFriends = async (userId1: string, userId2: string): Promise<boolean> => {
  try {
    const friendsRef = collection(db, 'friends');
    const friendQuery = query(
      friendsRef,
      where('userId', '==', userId1),
      where('friendId', '==', userId2)
    );
    
    const existingFriends = await getDocs(friendQuery);
    return !existingFriends.empty;
  } catch (error) {
    console.error('❌ Error checking if users are friends:', error);
    return false;
  }
};
