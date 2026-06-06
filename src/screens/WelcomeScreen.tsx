import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Sprout, Satellite, Wifi, TriangleAlert } from 'lucide-react-native';
import { AuthStackParamList } from '../navigation/types';
import { theme } from '../constants/theme';
import AppButton from '../components/AppButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoSection}>
          <View style={styles.logoIcon}>
            <Sprout size={40} color={theme.primary} />
          </View>
          <Text style={styles.logoTitle}>AgroOrbit</Text>
          <Text style={styles.logoTagline}>Monitoramento Agrícola Inteligente</Text>
        </View>

        <View style={styles.features}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: `${theme.blue}22` }]}>
              <Satellite size={22} color={theme.blue} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Dados de Satélite</Text>
              <Text style={styles.featureDesc}>
                Monitoramento via Sentinel Hub com índice NDVI em tempo real
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: `${theme.primary}22` }]}>
              <Wifi size={22} color={theme.primary} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Sensores IoT</Text>
              <Text style={styles.featureDesc}>
                Leituras de temperatura, umidade e solo via ESP32
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: `${theme.yellow}22` }]}>
              <TriangleAlert size={22} color={theme.yellow} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Alertas Agrícolas</Text>
              <Text style={styles.featureDesc}>
                Detecção de seca, queimada e estresse vegetativo
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.buttons}>
          <AppButton
            label="Entrar"
            onPress={() => navigation.navigate('Login')}
          />
          <AppButton
            label="Criar conta"
            onPress={() => navigation.navigate('Register')}
            variant="outline"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 24,
    justifyContent: 'space-between',
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: 40,
    gap: 10,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: theme.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: theme.text,
    letterSpacing: 1,
  },
  logoTagline: {
    fontSize: 15,
    color: theme.textMuted,
    textAlign: 'center',
  },
  features: {
    gap: 16,
    paddingVertical: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: theme.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureText: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '700',
  },
  featureDesc: {
    color: theme.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  buttons: {
    gap: 12,
  },
});
