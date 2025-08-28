import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useLanguage } from '../../context/LanguageContext';
import { Avatar } from './Avatar';
import { OnlineIndicator } from './OnlineIndicator';
import { usePresence } from '../../hooks/usePresence';
import { useNavigation } from '@react-navigation/native';
import { DEBUG_CONFIG } from '../../config/debug';

interface FriendItemProps {
  friend: {
    id: string;
    username: string;
    email: string;
    photoURL?: string;
    balance: number;
  };
  style?: ViewStyle;
  onPress?: () => void;
  onLongPress?: () => void;
  onSwipeToSettle?: (friend: {
    id: string;
    username: string;
    email: string;
    photoURL?: string;
    balance: number;
  }) => void;
}

export const FriendItem: React.FC<FriendItemProps> = ({
  friend,
  style,
  onPress,
  onLongPress,
  onSwipeToSettle,
}) => {
  const ds = useDesignSystem();
  const { t } = useLanguage();
  const navigation = useNavigation();
  const { presence, getStatusText } = usePresence(friend.id);
  
  // Log mudanças de presença
  React.useEffect(() => {
    if (presence) {
      DEBUG_CONFIG.log('UI', `Presença atualizada`, {
        username: friend.username,
        status: presence.status,
        lastSeen: presence.lastSeen
      });
    }
  }, [presence?.status, friend.username]);
  const translateX = useRef(new Animated.Value(0)).current;
  const swipeThreshold = -120; // Distância mínima para ativar o swipe (menos sensível)

  // Debug logs
  DEBUG_CONFIG.log('UI', `Renderizando FriendItem`, {
    username: friend.username,
    id: friend.id.slice(-4),
    presence: presence?.status || 'offline',
    balance: friend.balance
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Math.abs(value));
  };

  const getBalanceStatus = () => {
    let status;
    
    if (friend.balance === 0) {
      status = {
        icon: 'checkmark-circle',
        color: ds.colors.text.primary,
        text: t('friends.balanced'),
        amountColor: ds.colors.text.primary,
        type: 'balanced'
      };
    } else if (friend.balance > 0) {
      status = {
        icon: 'arrow-up-circle',
        color: '#10B981',
        text: t('friends.owesYou'),
        amountColor: '#10B981',
        type: 'owes_you'
      };
    } else {
      status = {
        icon: 'arrow-down-circle',
        color: '#EF4444',
        text: t('friends.youOwe'),
        amountColor: '#EF4444',
        type: 'you_owe'
      };
    }
    
    DEBUG_CONFIG.log('UI', `Status de balance calculado`, {
      username: friend.username,
      balance: friend.balance,
      status: status.type
    });
    
    return status;
  };

  const status = getBalanceStatus();

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { 
      useNativeDriver: true,
      listener: (event: any) => {
        const { translationX } = event.nativeEvent;
        
        // Se o movimento for para a direita, força voltar para 0
        if (translationX > 0) {
          translateX.setValue(0);
        }
      }
    }
  );

  const handleStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, velocityX } = event.nativeEvent;
      
      // Só processa se o movimento foi para a esquerda (valores negativos)
      if (translationX < 0) {
        // Verifica se o swipe foi rápido o suficiente OU longe o suficiente
        const isFastSwipe = velocityX < -500; // Swipe rápido para esquerda
        const isLongSwipe = translationX < swipeThreshold; // Swipe longo
        
        DEBUG_CONFIG.log('UI', `Swipe detectado`, {
          username: friend.username,
          translationX: Math.round(translationX),
          velocityX: Math.round(velocityX),
          isFastSwipe,
          isLongSwipe,
          threshold: swipeThreshold
        });
        
        if ((isFastSwipe || isLongSwipe) && onSwipeToSettle) {
          // Swipe ativado - acertar dívida
          DEBUG_CONFIG.log('SUCCESS', `Swipe ativado para acertar dívida`, {
            username: friend.username,
            balance: friend.balance
          });
          onSwipeToSettle(friend);
        }
      }
      
      // Resetar posição com animação suave
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  };

  const handlePress = () => {
    DEBUG_CONFIG.log('UI', `FriendItem pressionado`, {
      username: friend.username,
      hasCustomPress: !!onPress
    });
    
    if (onPress) {
      onPress();
    } else {
      // Navegar para o perfil do amigo
      DEBUG_CONFIG.log('UI', `Navegando para perfil do amigo`, {
        username: friend.username,
        friendId: friend.id.slice(-4)
      });
      (navigation as any).navigate('FriendProfile', {
        friendId: friend.id,
        friendData: friend,
      });
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Background do swipe */}
      <View style={[styles.swipeBackground, { backgroundColor: ds.colors.primary }]}>
        <Ionicons name="cash-outline" size={24} color="white" />
        <Text style={styles.swipeText}>Acertar</Text>
      </View>
      
      {/* Indicador de swipe no canto direito */}
      <View style={styles.swipeIndicator}>
        <View style={[styles.swipeArrow, { backgroundColor: ds.colors.primary + '20' }]}>
          <Ionicons name="chevron-back" size={16} color={ds.colors.primary} />
        </View>
        <Text style={[styles.swipeHint, { color: ds.colors.primary }]}>
          {t('friends.swipeToSettle')}
        </Text>
      </View>
      
      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleStateChange}
        activeOffsetX={[-20, 0]} // Só ativa quando arrasta para esquerda (valores negativos)
        activeOffsetY={[-50, 50]} // Só ativa se não arrastar muito para cima/baixo
        shouldCancelWhenOutside={true} // Cancela quando sai da área
      >
        <Animated.View
          style={[
            styles.container,
            { backgroundColor: ds.colors.surface },
            style,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <TouchableOpacity 
            style={styles.touchable}
            onPress={handlePress}
            onLongPress={onLongPress}
            activeOpacity={0.7}
          >
      {/* Header com Avatar */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Avatar
            source={friend.photoURL}
            name={friend.username}
            size="medium"
            variant="circle"
          />
          <OnlineIndicator 
            presence={presence}
            size="medium"
            showBorder={true}
          />
        </View>
        
        <View style={styles.info}>
          <Text 
            style={[styles.username, { color: ds.colors.text.primary }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {friend.username}
          </Text>
          <Text 
            style={[styles.email, { color: ds.colors.text.secondary }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {friend.email}
          </Text>
        </View>
        
        <View style={styles.balanceContainer}>
          <View style={[
            styles.balanceBadge, 
            { 
              backgroundColor: friend.balance === 0 
                ? ds.colors.surface 
                : status.color + '15' 
            }
          ]}>
            <Text style={[
              styles.balance, 
              { color: status.amountColor }
            ]}>
              {formatCurrency(friend.balance)}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Footer com Status da Dívida */}
      <View style={styles.footer}>
        <View style={styles.statusContainer}>
          <Ionicons name="information-circle-outline" size={14} color={ds.colors.text.secondary} />
          <Text style={[styles.statusText, { color: ds.colors.text.secondary }]}>
            {status.text}
          </Text>
        </View>
      </View>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 12,
  },
  swipeBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    marginRight: 16,
  },
  swipeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  swipeIndicator: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -20 }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  swipeHint: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 60,
  },
  container: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: 'white',
  },
  touchable: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    lineHeight: 18,
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balanceBadge: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  balance: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
  },

});
