# Serviços do SplitPay

## Estrutura de Arquivos

```
src/services/
├── auth.ts              # Autenticação de usuários
├── debtService.ts       # Gerenciamento de dívidas
├── userService.ts       # Gerenciamento de usuários
├── analyticsService.ts  # Analytics e estatísticas
└── index.ts            # Exportações centralizadas
```

## Analytics Service

O `analyticsService.ts` contém funções para calcular estatísticas avançadas do dashboard:

### Funções Disponíveis

#### `getMonthlyAverage(userId: string)`
- **Descrição**: Calcula a média mensal de gastos dos últimos 3 meses
- **Retorna**: `{ average: number, period: string }`
- **Uso**: Dashboard - Card "Média Mensal"

#### `getBiggestDebt(userId: string)`
- **Descrição**: Encontra a maior dívida não paga do usuário
- **Retorna**: `{ amount: number, description?: string, createdAt: Date }`
- **Uso**: Dashboard - Card "Maior Dívida"

#### `getMostActiveFriend(userId: string)`
- **Descrição**: Identifica o amigo com mais transações
- **Retorna**: `{ name: string, transactionCount: number, photoURL?: string, totalAmount: number }`
- **Uso**: Dashboard - Card "Amigo Mais Ativo"

#### `getGroupActivity(userId: string)`
- **Descrição**: Calcula estatísticas de atividade em grupos
- **Retorna**: `{ groupCount: number, activeTransactions: number, totalGroupAmount: number }`
- **Uso**: Dashboard - Card "Atividade em Grupos"

#### `getPaymentTrend(userId: string)`
- **Descrição**: Calcula o tempo médio para pagamento de dívidas
- **Retorna**: `{ averageDays: number, totalPaidDebts: number }`
- **Uso**: Dashboard - Card "Tendência de Pagamento"

#### `getDebtDistribution(userId: string)`
- **Descrição**: Calcula a distribuição entre dívidas pessoais e de grupo
- **Retorna**: `{ personalPercentage: number, groupPercentage: number, personalAmount: number, groupAmount: number }`
- **Uso**: Dashboard - Card "Distribuição de Dívidas"

### Dados Baseados no Firebase

✅ **Dados Reais (Implementados)**:
- Dívidas não pagas
- Total não pago
- Amigo com mais dívida
- Dívida mais antiga
- Média mensal
- Maior dívida
- Amigo mais ativo
- Atividade em grupos
- Tendência de pagamento
- Distribuição de dívidas

### Performance

Todas as funções são otimizadas para:
- Consultas paralelas com `Promise.all()`
- Filtros eficientes no Firestore
- Cache de dados quando possível
- Tratamento de erros robusto

### Uso no Dashboard

```typescript
import { 
  getMonthlyAverage, 
  getBiggestDebt, 
  getMostActiveFriend,
  getGroupActivity,
  getPaymentTrend,
  getDebtDistribution 
} from '../services/analyticsService';

// Buscar todos os dados de uma vez
const [
  monthlyAverage,
  biggestDebt,
  mostActiveFriend,
  groupActivity,
  paymentTrend,
  debtDistribution
] = await Promise.all([
  getMonthlyAverage(userId),
  getBiggestDebt(userId),
  getMostActiveFriend(userId),
  getGroupActivity(userId),
  getPaymentTrend(userId),
  getDebtDistribution(userId)
]);
``` 