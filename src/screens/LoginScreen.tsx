import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Sprout } from 'lucide-react-native';
import { AuthStackParamList } from '../navigation/types';
import { theme } from '../constants/theme';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { isValidEmail, isRequired } from '../utils/validators';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const newErrors: { email?: string; password?: string } = {};
    if (!isRequired(email)) newErrors.email = 'E-mail obrigatório';
    else if (!isValidEmail(email)) newErrors.email = 'E-mail inválido';
    if (!isRequired(password)) newErrors.password = 'Senha obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    try {
      const { user, token } = await authService.login({ email, password });
      signIn(user, token);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao fazer login.';
      Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inner}
      >
        <View style={styles.header}>
          <View style={styles.logoIcon}>
            <Sprout size={28} color={theme.primary} />
          </View>
          <Text style={styles.title}>Entrar no AgroOrbit</Text>
          <Text style={styles.subtitle}>Acesse sua conta de produtor</Text>
        </View>

        <View style={styles.form}>
          <AppInput
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          <AppInput
            label="Senha"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            error={errors.password}
          />
          <AppButton label="Entrar" onPress={handleLogin} loading={loading} />
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.link}>
          <Text style={styles.linkText}>
            Não tem conta?{' '}
            <Text style={styles.linkHighlight}>Criar conta</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.link}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    gap: 24,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: theme.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.text,
  },
  subtitle: {
    color: theme.textMuted,
    fontSize: 14,
  },
  form: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 20,
    gap: 4,
  },
  link: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  linkText: {
    color: theme.textMuted,
    fontSize: 14,
  },
  linkHighlight: {
    color: theme.primary,
    fontWeight: '600',
  },
  backText: {
    color: theme.textMuted,
    fontSize: 14,
  },
});
