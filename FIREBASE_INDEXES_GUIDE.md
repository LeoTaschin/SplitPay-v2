# 🔥 Guia Rápido - Índices do Firestore

## ❌ Problema
```
FirebaseError: The query requires an index. You can create it here: https://console.firebase.google.com/v1/r/project/tapago-7c380/firestore/indexes?create_composite=...
```

## ✅ Solução

### **Opção 1: Link Direto (Mais Rápido)**
1. Clique no link do erro no console
2. Clique em "Criar índice"
3. Aguarde alguns minutos para o índice ficar ativo

### **Opção 2: Firebase CLI (Recomendado)**
```bash
# 1. Instalar Firebase CLI (se não tiver)
npm install -g firebase-tools

# 2. Fazer login
firebase login

# 3. Deploy dos índices
firebase deploy --only firestore:indexes
```

### **Opção 3: Script Automatizado**
```bash
# Dar permissão de execução
chmod +x deploy-indexes.sh

# Executar script
./deploy-indexes.sh
```

## 📊 Índices Necessários

O arquivo `firestore.indexes.json` contém todos os índices necessários:

1. **`debts: creditorId + createdAt`** - Média mensal
2. **`debts: debtorId + createdAt`** - Média mensal (devedor)
3. **`debts: creditorId + paid`** - Dívidas pagas/não pagas
4. **`debts: debtorId + paid`** - Dívidas pagas/não pagas
5. **`debts: type + paid`** - Atividade em grupos
6. **`debts: creditorId + paid + createdAt`** - Tendência de pagamento

## ⏱️ Tempo de Ativação

- **Índices simples**: 1-2 minutos
- **Índices compostos**: 2-5 minutos
- **Índices com 3+ campos**: 5-10 minutos

## 🔍 Verificar Status

1. Vá para Firebase Console → Firestore → Índices
2. Procure por índices com status "Building" ou "Enabled"
3. Aguarde até ficar "Enabled"

## 🚀 Após Criar os Índices

O analytics service funcionará normalmente com:
- ✅ Média mensal
- ✅ Maior dívida
- ✅ Amigo mais ativo
- ✅ Atividade em grupos
- ✅ Tendência de pagamento
- ✅ Distribuição de dívidas

## 📝 Notas Importantes

- Os índices são criados automaticamente pelo Firebase
- Não há custo adicional para índices
- Índices melhoram a performance das consultas
- Sempre use filtros eficientes para economizar leituras 