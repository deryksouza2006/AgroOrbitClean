import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
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

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

export default function RegisterScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!isRequired(name)) newErrors.name = 'Nome obrigatório';
    if (!isRequired(email)) newErrors.email = 'E-mail obrigatório';
    else if (!isValidEmail(email)) newErrors.email = 'E-mail inválido';
    if (!isRequired(password)) newErrors.password = 'Senha obrigatória';
    else if (password.length < 6) newErrors.password = 'Mínimo de 6 caracteres';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    setLoading(true);
    try {
      const { user, token } = await authService.register({
        name,
        email,
        phone: phone || undefined,
        password,
      });
      signIn(user, token);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao criar conta.';
      Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.kav}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logoIcon}>
              <Sprout size={28} color={theme.primary} />
            </View>
            <Text style={styles.title}>Criar conta</Text>
            <Text style={styles.subtitle}>Cadastre-se como produtor rural</Text>
          </View>

          <View style={styles.form}>
            <AppInput
              label="Nome completo"
              value={name}
              onChangeText={setName}
              placeholder="Ex: Daniel Rural"
              error={errors.name}
            />
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
              label="Telefone (opcional)"
              value={phone}
              onChangeText={setPhone}
              placeholder="(11) 99999-9999"
              keyboardType="phone-pad"
            />
            <AppInput
              label="Senha"
              value={password}
              onChangeText={setPassword}
              placeholder="Mínimo 6 caracteres"
              secureTextEntry
              error={errors.password}
            />
            <AppButton label="Criar conta" onPress={handleRegister} loading={loading} />
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.link}>
            <Text style={styles.linkText}>
              Já tem conta?{' '}
              <Text style={styles.linkHighlight}>Entrar</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.link}>
            <Text style={styles.backText}>← Voltar</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  kav: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 24,
    justifyContent: 'center',
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
