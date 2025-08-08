# 📊 Guia de Migração - Melhorias nas Estatísticas

Este guia explica as melhorias implementadas nas métricas do Firebase para garantir que todas as estatísticas tenham dados adequados.

## 🎯 **Melhorias Implementadas**

### **1. Campos Adicionados às Dívidas**

#### **Novos Campos:**
- `paidAt`: Data quando a dívida foi paga
- `paidBy`: ID do usuário que pagou a dívida
- `type`: Tipo da dívida (`'personal'` ou `'group'`)
- `groupId`: ID do grupo (para dívidas de grupo)

#### **Campos Melhorados:**
- `amountPerPerson`: Valor por pessoa em dívidas de grupo

### **2. Métricas Aprimoradas**

#### **✅ PaymentTrend (Tendência de Pagamento)**
- **Antes**: Não funcionava corretamente
- **Agora**: Calcula tempo médio entre criação e pagamento usando `paidAt`

#### **✅ GroupActivity (Atividade em Grupos)**
- **Antes**: Não detectava grupos corretamente
- **Agora**: Identifica grupos através do campo `description` (procura por "Grupo:")

#### **✅ MostActiveFriend (Amigo Mais Ativo)**
- **Antes**: Contava apenas transações totais
- **Agora**: Prioriza atividade recente (últimos 30 dias) + total de transações

#### **✅ DebtDistribution (Distribuição de Dívidas)**
- **Antes**: Não diferenciava tipos corretamente
- **Agora**: Separa dívidas pessoais vs grupo usando campo `type`

## 🚀 **Como Executar as Migrações**

### **Opção 1: Script Automático (Recomendado)**

1. **Configure o Firebase:**
   ```bash
   # Edite o arquivo scripts/migrate.js
   # Substitua as configurações do Firebase pelos seus dados
   ```

2. **Execute o script:**
   ```bash
   node scripts/migrate.js
   ```

### **Opção 2: Migração Manual**

1. **Via Firebase Console:**
   - Acesse o Firebase Console
   - Vá para Firestore Database
   - Para cada dívida paga, adicione:
     - `paidAt`: Data do pagamento
     - `paidBy`: ID do usuário que pagou

2. **Via Código:**
   ```javascript
   import { migrationService } from './src/services/migrationService';
   
   // Executar migrações
   const result = await migrationService.runAllMigrations();
   console.log(result);
   ```

## 📋 **Campos que Serão Adicionados**

### **Dívidas (Collection: `debts`)**
```javascript
{
  // Campos existentes...
  paidAt: Date,        // Nova data de pagamento
  paidBy: string,      // Quem pagou
  type: 'personal',    // Tipo da dívida
  groupId: string,     // ID do grupo (opcional)
  amountPerPerson: number // Valor por pessoa
}
```

### **Usuários (Collection: `users`)**
```javascript
{
  // Campos existentes...
  totalToReceive: number, // Total a receber
  totalToPay: number,     // Total a pagar
  friends: string[]       // Lista de amigos
}
```

## 🔍 **Verificação das Migrações**

### **1. Verificar Dívidas Migradas:**
```javascript
// No Firebase Console, execute:
db.collection('debts').where('paid', '==', true).get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      console.log('Dívida:', doc.data());
      // Verificar se paidAt e paidBy existem
    });
  });
```

### **2. Verificar Usuários Migrados:**
```javascript
// No Firebase Console, execute:
db.collection('users').get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      console.log('Usuário:', doc.data());
      // Verificar se totalToReceive e totalToPay existem
    });
  });
```

## ⚠️ **Importante**

### **Antes de Executar:**
1. **Backup dos dados** (recomendado)
2. **Teste em ambiente de desenvolvimento** primeiro
3. **Verifique as configurações do Firebase**

### **Após a Migração:**
1. **Teste as estatísticas** no app
2. **Verifique se os dados estão corretos**
3. **Monitore por alguns dias** para garantir estabilidade

## 🐛 **Solução de Problemas**

### **Erro: "Permission denied"**
- Verifique as regras do Firestore
- Certifique-se de que o usuário tem permissão de escrita

### **Erro: "Field not found"**
- Alguns campos podem não existir em dívidas antigas
- O script trata isso automaticamente

### **Dados Inconsistentes**
- Execute o script novamente
- Verifique manualmente no Firebase Console

## 📊 **Resultado Esperado**

Após as migrações, todas as estatísticas devem funcionar corretamente:

- ✅ **PaymentTrend**: Mostra tempo médio real de pagamento
- ✅ **GroupActivity**: Detecta grupos corretamente
- ✅ **MostActiveFriend**: Prioriza amigos com atividade recente
- ✅ **DebtDistribution**: Separa dívidas pessoais vs grupo
- ✅ **Todas as outras métricas**: Funcionando com dados reais

## 🎉 **Benefícios**

1. **Dados Mais Precisos**: Todas as estatísticas usam dados reais
2. **Melhor Performance**: Queries otimizadas
3. **Funcionalidades Aprimoradas**: Novos campos permitem features avançadas
4. **Escalabilidade**: Estrutura preparada para crescimento

---

**📞 Suporte**: Se encontrar problemas, verifique os logs do script e os dados no Firebase Console.
