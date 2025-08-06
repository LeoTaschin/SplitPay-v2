#!/bin/bash

# Script para fazer deploy dos índices do Firestore
# Execute: chmod +x deploy-indexes.sh && ./deploy-indexes.sh

echo "🚀 Deployando índices do Firestore..."

# Verificar se o Firebase CLI está instalado
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI não encontrado. Instale com: npm install -g firebase-tools"
    exit 1
fi

# Verificar se está logado no Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Não está logado no Firebase. Execute: firebase login"
    exit 1
fi

# Fazer deploy dos índices
echo "📊 Criando índices..."
firebase deploy --only firestore:indexes

echo "✅ Índices deployados com sucesso!"
echo "⏳ Aguarde alguns minutos para os índices ficarem ativos..."
echo "📋 Índices criados:"
echo "   - debts: creditorId + createdAt"
echo "   - debts: debtorId + createdAt"
echo "   - debts: creditorId + paid"
echo "   - debts: debtorId + paid"
echo "   - debts: type + paid"
echo "   - debts: creditorId + paid + createdAt" 