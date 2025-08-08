#!/bin/bash

echo "🚀 Deploying Firestore indexes..."

# Verificar se o Firebase CLI está instalado
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI não está instalado. Instale com: npm install -g firebase-tools"
    exit 1
fi

# Fazer login no Firebase (se necessário)
echo "📝 Verificando login no Firebase..."
firebase projects:list > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "🔐 Fazendo login no Firebase..."
    firebase login
fi

# Deploy dos índices
echo "📊 Fazendo deploy dos índices..."
firebase deploy --only firestore:indexes

if [ $? -eq 0 ]; then
    echo "✅ Índices deployados com sucesso!"
    echo "📋 Para verificar o status dos índices, acesse:"
    echo "   https://console.firebase.google.com/project/_/firestore/indexes"
else
    echo "❌ Erro ao fazer deploy dos índices"
    exit 1
fi 