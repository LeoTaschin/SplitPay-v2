import { useState, useEffect, useRef } from 'react';
import { presenceService, UserPresence } from '../services/presenceService';
import { useLanguage } from '../context/LanguageContext';

export const usePresence = (userId: string) => {
  const { t } = useLanguage();
  const [presence, setPresence] = useState<UserPresence>({
    userId,
    isOnline: false,
    lastSeen: Date.now(),
    status: 'offline'
  });
  const [isLoading, setIsLoading] = useState(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!userId) return;

    console.log('🔍 usePresence: Listening to user', userId);
    setIsLoading(true);
    
    // Listen to user presence
    const unsubscribe = presenceService.listenToUserPresence(userId, (newPresence) => {
      console.log('📡 usePresence: Received presence update for', userId, newPresence);
      setPresence(newPresence);
      setIsLoading(false);
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        console.log('🔍 usePresence: Cleaning up listener for', userId);
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [userId]);

  const getStatusText = () => {
    if (presence.isOnline) {
      switch (presence.status) {
        case 'online':
          return t('friends.status.online');
        case 'away':
          return t('friends.status.away');
        case 'busy':
          return t('friends.status.busy');
        default:
          return t('friends.status.online');
      }
    } else {
      // Don't show status text when offline
      return '';
    }
  };

  return {
    presence,
    isLoading,
    getStatusText,
  };
};
