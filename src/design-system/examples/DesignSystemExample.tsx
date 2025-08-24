import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Importar Design System
import { 
  useDesignSystem,
  Button,
  Card,
  Input,
  Badge,
  Avatar,
  Divider,
  Loading,
} from '../index';

export const DesignSystemExample: React.FC = () => {
  const ds = useDesignSystem();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: ds.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: ds.colors.text.primary }]}>
            Design System
          </Text>
          <Text style={[styles.subtitle, { color: ds.colors.text.secondary }]}>
            Exemplos de componentes e tokens
          </Text>
        </View>

        {/* Seção: Botões */}
        <Card title="Botões" variant="elevated" style={styles.section}>
          <View style={styles.buttonRow}>
            <Button
              title="Primário"
              variant="primary"
              size="medium"
              onPress={() => {}}
            />
            <Button
              title="Secundário"
              variant="secondary"
              size="medium"
              onPress={() => {}}
            />
          </View>
          
          <View style={styles.buttonRow}>
            <Button
              title="Outline"
              variant="outline"
              size="medium"
              onPress={() => {}}
            />
            <Button
              title="Ghost"
              variant="ghost"
              size="medium"
              onPress={() => {}}
            />
          </View>
          
          <View style={styles.buttonRow}>
            <Button
              title="Danger"
              variant="danger"
              size="medium"
              onPress={() => {}}
            />
            <Button
              title="Loading"
              variant="primary"
              size="medium"
              loading={loading}
              onPress={handleLogin}
            />
          </View>
          
          <Button
            title="Botão Largo"
            variant="primary"
            size="large"
            fullWidth
            leftIcon="add"
            onPress={() => {}}
          />
        </Card>

        {/* Seção: Inputs */}
        <Card title="Campos de Entrada" variant="elevated" style={styles.section}>
          <Input
            label="Email"
            placeholder="Digite seu email"
            value={email}
            onChangeText={setEmail}
            type="email"
            leftIcon="mail"
            helperText="Digite um email válido"
          />
          
          <Input
            label="Senha"
            placeholder="Digite sua senha"
            value={password}
            onChangeText={setPassword}
            type="password"
            leftIcon="lock-closed"
            rightIcon="eye"
            style={{ marginTop: ds.spacing.md }}
          />
          
          <Input
            label="Telefone"
            placeholder="(11) 99999-9999"
            value=""
            onChangeText={() => {}}
            type="phone"
            leftIcon="call"
            style={{ marginTop: ds.spacing.md }}
          />
        </Card>

        {/* Seção: Badges */}
        <Card title="Badges" variant="elevated" style={styles.section}>
          <View style={styles.badgeRow}>
            <Badge title="Primário" description="Badge primário" variant="primary" />
            <Badge title="Secundário" description="Badge secundário" variant="secondary" />
            <Badge title="Sucesso" description="Badge de sucesso" variant="success" />
          </View>
          
          <View style={styles.badgeRow}>
            <Badge title="Aviso" description="Badge de aviso" variant="warning" />
            <Badge title="Erro" description="Badge de erro" variant="error" />
            <Badge title="Info" description="Badge informativo" variant="info" />
          </View>
          
          <View style={styles.badgeRow}>
            <Badge title="Pequeno" description="Badge pequeno" size="small" variant="primary" />
            <Badge title="Médio" description="Badge médio" size="medium" variant="primary" />
            <Badge title="Grande" description="Badge grande" size="large" variant="primary" />
          </View>
        </Card>

        {/* Seção: Avatars */}
        <Card title="Avatars" variant="elevated" style={styles.section}>
          <View style={styles.avatarRow}>
            <Avatar name="João Silva" size="small" />
            <Avatar name="Maria Santos" size="medium" />
            <Avatar name="Pedro Costa" size="large" />
            <Avatar name="Ana Lima" size="xlarge" />
          </View>
          
          <View style={styles.avatarRow}>
            <Avatar icon="person" size="medium" />
            <Avatar icon="star" size="medium" />
            <Avatar icon="heart" size="medium" />
            <Avatar icon="settings" size="medium" />
          </View>
        </Card>

        {/* Seção: Divisores */}
        <Card title="Divisores" variant="elevated" style={styles.section}>
          <Text style={[styles.text, { color: ds.colors.text.primary }]}>
            Divisor sólido
          </Text>
          <Divider margin={ds.spacing.sm} />
          
          <Text style={[styles.text, { color: ds.colors.text.primary }]}>
            Divisor tracejado
          </Text>
          <Divider variant="dashed" margin={ds.spacing.sm} />
          
          <Text style={[styles.text, { color: ds.colors.text.primary }]}>
            Divisor pontilhado
          </Text>
          <Divider variant="dotted" margin={ds.spacing.sm} />
        </Card>

        {/* Seção: Loading */}
        <Card title="Loading" variant="elevated" style={styles.section}>
          <Loading text="Carregando..." />
          <Divider margin={ds.spacing.md} />
          <Loading variant="dots" text="Processando..." />
          <Divider margin={ds.spacing.md} />
          <Loading variant="pulse" text="Aguarde..." />
        </Card>

        {/* Seção: Tokens */}
        <Card title="Tokens de Design" variant="elevated" style={styles.section}>
          <Text style={[styles.text, { color: ds.colors.text.primary }]}>
            Espaçamentos: xs={ds.spacing.xs}, sm={ds.spacing.sm}, md={ds.spacing.md}
          </Text>
          <Text style={[styles.text, { color: ds.colors.text.secondary }]}>
            Cores: Primary={ds.colors.primary}, Secondary={ds.colors.secondary}
          </Text>
          <Text style={[styles.text, { color: ds.colors.text.tertiary }]}>
            Tema: {ds.isDark ? 'Escuro' : 'Claro'}
          </Text>
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  section: {
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  text: {
    fontSize: 14,
    marginBottom: 8,
  },
}); 