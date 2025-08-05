# SplitPay Design System

Este é o Design System do SplitPay, um sistema de design consistente e escalável para o aplicativo.

## 🎨 Visão Geral

O Design System do SplitPay é baseado em tokens de design que garantem consistência visual em todo o aplicativo. Ele inclui:

- **Tokens de Design**: Cores, espaçamentos, tipografia, border-radius e sombras
- **Componentes Base**: Botões, inputs, cards, badges, avatars e mais
- **Hooks Utilitários**: Para facilitar o uso do design system
- **Suporte a Temas**: Claro e escuro

## 📁 Estrutura

```
src/design-system/
├── index.ts                 # Exportações principais
├── tokens/                  # Tokens de design
│   ├── colors.ts           # Paleta de cores
│   ├── spacing.ts          # Sistema de espaçamento
│   ├── typography.ts       # Tipografia
│   ├── border-radius.ts    # Border radius
│   └── shadows.ts          # Sombras
├── components/             # Componentes base
│   ├── Button.tsx         # Botões
│   ├── Input.tsx          # Campos de entrada
│   ├── Card.tsx           # Cards
│   ├── Badge.tsx          # Badges
│   ├── Avatar.tsx         # Avatars
│   ├── Divider.tsx        # Divisores
│   └── Loading.tsx        # Indicadores de carregamento
├── hooks/                  # Hooks utilitários
│   └── useDesignSystem.ts # Hook principal
└── utils/                  # Utilitários
    └── theme-utils.ts     # Funções utilitárias
```

## 🚀 Como Usar

### Hook Principal

```typescript
import { useDesignSystem } from '../design-system';

const MyComponent = () => {
  const ds = useDesignSystem();
  
  return (
    <View style={{ 
      backgroundColor: ds.colors.background,
      padding: ds.spacing.md 
    }}>
      <Text style={ds.text.h1}>Título</Text>
    </View>
  );
};
```

### Componentes

```typescript
import { Button, Card, Input } from '../design-system';

const MyScreen = () => {
  return (
    <Card title="Exemplo" variant="elevated">
      <Input 
        label="Email"
        placeholder="Digite seu email"
        type="email"
        leftIcon="mail"
      />
      <Button 
        title="Enviar"
        variant="primary"
        size="large"
        fullWidth
      />
    </Card>
  );
};
```

## 🎨 Tokens de Design

### Cores

O sistema de cores é baseado na paleta oficial do SplitPay:

#### Paleta de Cores do SplitPay

**Tema Claro:**
- **Primary**: `#4CAF50` (Verde principal)
- **Secondary**: `#357ABD` (Azul secundário)
- **Accent**: `#50C878` (Verde accent)
- **Background**: `#FFFFFF` (Branco)
- **Surface**: `#F5F5F5` (Cinza claro)
- **Text Primary**: `#000000` (Preto)
- **Text Secondary**: `#616161` (Cinza médio)
- **Border**: `#E5E5E5` (Cinza claro)
- **Success**: `#34C759` (Verde sucesso)
- **Error**: `#E53935` (Vermelho erro)
- **Warning**: `#FFB300` (Amarelo aviso)

**Tema Escuro:**
- **Primary**: `#4CAF50` (Verde principal - mesmo)
- **Secondary**: `#357ABD` (Azul secundário)
- **Accent**: `#50C878` (Verde accent)
- **Background**: `#121212` (Cinza muito escuro)
- **Surface**: `#1E1E1E` (Cinza escuro)
- **Text Primary**: `#FFFFFF` (Branco)
- **Text Secondary**: `#E0E0E0` (Cinza claro)
- **Border**: `#2D2D2D` (Cinza escuro)
- **Success**: `#34C759` (Verde sucesso)
- **Error**: `#E53935` (Vermelho erro)
- **Warning**: `#FFB300` (Amarelo aviso)

```typescript
const ds = useDesignSystem();

// Cores principais do SplitPay
ds.colors.primary      // Verde principal (#4CAF50)
ds.colors.secondary    // Azul secundário (#357ABD)
ds.colors.accent       // Verde accent (#50C878)

// Cores de fundo
ds.colors.background   // Fundo principal (branco/escuro)
ds.colors.surface      // Superfícies (#F5F5F5/#1E1E1E)
ds.colors.surfaceVariant // Superfícies variantes

// Cores de texto
ds.colors.text.primary    // Texto principal (#000000/#FFFFFF)
ds.colors.text.secondary  // Texto secundário (#616161/#E0E0E0)
ds.colors.text.tertiary   // Texto terciário

// Cores de feedback
ds.colors.feedback.success // Verde sucesso (#34C759)
ds.colors.feedback.error   // Vermelho erro (#E53935)
ds.colors.feedback.warning // Amarelo aviso (#FFB300)
ds.colors.feedback.info    // Azul info (#357ABD)
```

### Espaçamento

Sistema baseado em múltiplos de 4:

```typescript
ds.spacing.xs    // 4px
ds.spacing.sm    // 8px
ds.spacing.md    // 16px
ds.spacing.lg    // 24px
ds.spacing.xl    // 32px
ds.spacing.xxl   // 40px
```

### Tipografia

```typescript
// Títulos
ds.text.h1
ds.text.h2
ds.text.h3
ds.text.h4

// Texto do corpo
ds.text.body.large
ds.text.body.medium
ds.text.body.small

// Especializados
ds.text.caption
ds.text.button.large
ds.text.button.medium
ds.text.button.small
ds.text.label
```

## 🧩 Componentes

### Button

```typescript
<Button
  title="Clique aqui"
  variant="primary" // primary | secondary | outline | ghost | danger
  size="medium"     // small | medium | large
  leftIcon="add"
  rightIcon="arrow-forward"
  fullWidth
  loading
  disabled
  onPress={() => {}}
/>
```

### Input

```typescript
<Input
  label="Email"
  placeholder="Digite seu email"
  type="email" // text | email | password | number | phone
  variant="default" // default | outlined | filled
  size="medium" // small | medium | large
  leftIcon="mail"
  rightIcon="eye"
  error="Email inválido"
  helperText="Digite um email válido"
  onChangeText={(text) => {}}
/>
```

### Card

```typescript
<Card
  title="Título do Card"
  subtitle="Subtítulo"
  variant="elevated" // default | elevated | outlined
  size="medium"      // small | medium | large
  leftIcon="star"
  rightIcon="more"
  onPress={() => {}}
>
  <Text>Conteúdo do card</Text>
</Card>
```

### Badge

```typescript
<Badge
  label="Novo"
  variant="primary" // primary | secondary | success | warning | error | info
  size="medium"     // small | medium | large
  icon="checkmark"
/>
```

### Avatar

```typescript
<Avatar
  source="https://example.com/avatar.jpg"
  name="João Silva"
  size="medium" // small | medium | large | xlarge
  variant="circle" // circle | rounded
  icon="person"
/>
```

## 🌙 Suporte a Temas

O Design System suporta temas claro e escuro automaticamente:

```typescript
const ds = useDesignSystem();

// Verificar tema atual
ds.isDark  // true/false
ds.isLight // true/false

// As cores mudam automaticamente baseado no tema
ds.colors.background // Fundo claro/escuro
ds.colors.text.primary // Texto claro/escuro
```

## 📏 Utilitários

### Espaçamento

```typescript
// Espaçamento baseado em múltiplos
ds.space(1)  // 16px
ds.space(2)  // 32px
ds.space(0.5) // 8px
```

### Cores Dinâmicas

```typescript
// Acessar cores por caminho
ds.getColor('text.primary')
ds.getColor('feedback.success')
ds.getColor('border.focus')
```

### Sombras

```typescript
// Sombras responsivas
ds.getShadow('sm')      // Sombra pequena
ds.getShadow('md')      // Sombra média
ds.getShadow('lg')      // Sombra grande
ds.getShadow('card.medium') // Sombra específica para cards
```

## 🔧 Customização

Para customizar o Design System, edite os tokens em `src/design-system/tokens/`:

```typescript
// Em colors.ts
export const lightColorTokens = {
  primary: '#2196F3', // Sua cor primária
  // ... outras cores
};
```

## 📚 Boas Práticas

1. **Use sempre os tokens**: Não use valores hardcoded
2. **Componentes sobre estilos**: Prefira componentes do Design System
3. **Consistência**: Mantenha consistência visual
4. **Acessibilidade**: Considere contraste e tamanhos de fonte
5. **Responsividade**: Use espaçamentos relativos

## 🐛 Troubleshooting

### Problema: Cores não mudam com o tema
**Solução**: Certifique-se de que está usando `useDesignSystem()` em vez de `useTheme()`

### Problema: Componente não aparece
**Solução**: Verifique se importou corretamente do Design System

### Problema: Tipos TypeScript não funcionam
**Solução**: Certifique-se de que os tipos estão sendo exportados corretamente 