import { ref, onValue, set, onDisconnect, serverTimestamp as rtdbServerTimestamp } from 'firebase/database';
import { database, auth } from '../config/firebase';

export interface UserPresence {
  userId: string;
  isOnline: boolean;
  lastSeen: number;
  status: 'online' | 'offline' | 'away' | 'busy';
  deviceInfo?: {
    platform: 'ios' | 'android' | 'web';
    appVersion: string;
  };
}

class PresenceService {
  private presenceRef: any;
  private disconnectRef: any;
  private isInitialized = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private statusListeners: Map<string, (presence: UserPresence) => void> = new Map();

  initialize() {
    if (this.isInitialized) return;
    
    if (!auth) {
      console.error('❌ presenceService: Auth is not available');
      return;
    }
    
    if (!auth.currentUser) {
      console.log('🔍 presenceService: No current user, skipping initialization');
      return;
    }

    const userId = auth.currentUser.uid;
    console.log('🔍 presenceService: Initializing for user:', userId);
    
    this.presenceRef = ref(database, `presence/${userId}`);
    this.disconnectRef = ref(database, `presence/${userId}/isOnline`);

    // Set user as online
    this.setOnlineStatus(true);

    // Set up disconnect handler
    onDisconnect(this.disconnectRef).set(false);
    console.log('🔍 presenceService: Disconnect handler set up');

    // Start heartbeat
    this.startHeartbeat();

    this.isInitialized = true;
    console.log('✅ presenceService: Initialization complete');
  }

  private setOnlineStatus(isOnline: boolean) {
    if (!this.presenceRef) return;

    set(this.presenceRef, {
      isOnline,
      lastSeen: rtdbServerTimestamp(),
      status: isOnline ? 'online' : 'offline',
      deviceInfo: {
        platform: 'ios', // You can detect this dynamically
        appVersion: '1.0.0' // Get from app config
      }
    });
  }

  private startHeartbeat() {
    // Update presence every 30 seconds
    this.heartbeatInterval = setInterval(() => {
      if (auth && auth.currentUser) {
        console.log('💓 presenceService: Sending heartbeat for user:', auth.currentUser.uid);
        this.setOnlineStatus(true);
      }
    }, 30000);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  setStatus(status: 'online' | 'offline' | 'away' | 'busy') {
    if (!this.presenceRef) return;

    set(this.presenceRef, {
      isOnline: status === 'online',
      lastSeen: rtdbServerTimestamp(),
      status,
      deviceInfo: {
        platform: 'ios',
        appVersion: '1.0.0'
      }
    });
  }

  // Listen to a specific user's presence
  listenToUserPresence(userId: string, callback: (presence: UserPresence) => void) {
    console.log('🔍 presenceService: Setting up listener for user', userId);
    const userPresenceRef = ref(database, `presence/${userId}`);
    
    const unsubscribe = onValue(userPresenceRef, (snapshot) => {
      const data = snapshot.val();
      console.log('📡 presenceService: Raw data for user', userId, data);
      
      if (data) {
        // Handle server timestamp conversion
        let lastSeen = Date.now();
        if (data.lastSeen) {
          if (typeof data.lastSeen === 'object' && data.lastSeen._seconds) {
            // Convert Firebase timestamp to milliseconds
            lastSeen = data.lastSeen._seconds * 1000;
          } else if (typeof data.lastSeen === 'number') {
            lastSeen = data.lastSeen;
          }
        }
        
        const presence: UserPresence = {
          userId,
          isOnline: data.isOnline || false,
          lastSeen,
          status: data.status || 'offline',
          deviceInfo: data.deviceInfo
        };
        console.log('📡 presenceService: Processed presence for user', userId, presence);
        callback(presence);
      } else {
        console.log('📡 presenceService: No data found for user', userId);
        // Send default offline presence
        const defaultPresence: UserPresence = {
          userId,
          isOnline: false,
          lastSeen: Date.now(),
          status: 'offline'
        };
        callback(defaultPresence);
      }
    });

    this.statusListeners.set(userId, callback);
    return unsubscribe;
  }

  // Stop listening to a specific user's presence
  stopListeningToUserPresence(userId: string) {
    this.statusListeners.delete(userId);
  }

  // Get formatted last seen text
  getLastSeenText(lastSeen: number): string {
    const now = Date.now();
    const diff = now - lastSeen;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `Há ${minutes} min`;
    if (hours < 24) return `Há ${hours}h`;
    if (days < 7) return `Há ${days} dias`;
    return 'Há mais de uma semana';
  }

  // Cleanup when user logs out
  cleanup() {
    console.log('🔍 presenceService: Starting cleanup');
    
    if (this.presenceRef) {
      console.log('🔍 presenceService: Setting user as offline');
      this.setOnlineStatus(false);
    }
    
    this.stopHeartbeat();
    this.statusListeners.clear();
    this.isInitialized = false;
    
    console.log('✅ presenceService: Cleanup complete');
  }
}

export const presenceService = new PresenceService();
