# Sistema de Presença Online - SplitPay

## Visão Geral

O sistema de presença permite mostrar o status online/offline dos amigos em tempo real, incluindo:
- Status online/offline/ausente/ocupado
- Indicador visual no avatar
- Texto de status no footer
- Timestamp de última atividade

## Componentes Implementados

### 1. PresenceService (`src/services/presenceService.ts`)
- Gerencia o status online do usuário atual
- Escuta mudanças de status de outros usuários
- Heartbeat automático a cada 30 segundos
- Detecção automática de desconexão

### 2. OnlineIndicator (`src/design-system/components/OnlineIndicator.tsx`)
- Indicador visual circular no avatar
- Cores diferentes para cada status:
  - Verde: Online
  - Amarelo: Ausente
  - Vermelho: Ocupado
  - Cinza: Offline

### 3. usePresence Hook (`src/hooks/usePresence.ts`)
- Hook personalizado para gerenciar status de um usuário específico
- Retorna dados de presença e texto formatado
- Limpeza automática de listeners

## Como Usar

### 1. Inicialização Automática
O sistema é inicializado automaticamente no `App.tsx` quando o usuário faz login.

### 2. Usar no FriendItem
```tsx
import { usePresence } from '../../hooks/usePresence';
import { OnlineIndicator } from './OnlineIndicator';

const FriendItem = ({ friend }) => {
  const { presence, getStatusText } = usePresence(friend.id);
  
  return (
    <View>
      <Avatar>
        <OnlineIndicator presence={presence} />
      </Avatar>
      <Text>{getStatusText()}</Text>
    </View>
  );
};
```

### 3. Configurar Status Manual
```tsx
import { presenceService } from '../services/presenceService';

// Definir status
presenceService.setStatus('away');
presenceService.setStatus('busy');
presenceService.setStatus('online');
```

## Estrutura de Dados no Firebase

```json
{
  "presence": {
    "userId": {
      "isOnline": true,
      "lastSeen": 1640995200000,
      "status": "online",
      "deviceInfo": {
        "platform": "ios",
        "appVersion": "1.0.0"
      }
    }
  }
}
```

## Configurações

### Firebase Realtime Database Rules
```json
{
  "rules": {
    "presence": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid == $uid"
      }
    }
  }
}
```

## Traduções

As traduções estão em `src/locales/pt.json`:
```json
{
  "friends": {
    "status": {
      "online": "Online",
      "offline": "Offline",
      "away": "Ausente",
      "busy": "Ocupado"
    }
  }
}
```

## Performance

- Heartbeat a cada 30 segundos
- Listeners são limpos automaticamente
- Otimizado para minimizar uso de dados
- Detecção automática de desconexão

## Próximos Passos

1. Adicionar configurações de privacidade
2. Implementar status customizados
3. Adicionar notificações de status
4. Melhorar detecção de inatividade
