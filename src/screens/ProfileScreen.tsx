import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import {
  Mail,
  Phone,
  Shield,
  Calendar,
  Clock,
  LogOut,
} from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../constants/theme';
import { formatDate } from '../utils/formatDate';
import ScreenContainer from '../components/ScreenContainer';

const ROLE_LABELS: Record<string, string> = {
  PRODUCER: 'Produtor Rural',
  ADMIN: 'Administrador',
  TECHNICIAN: 'Técnico',
};

type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH';
const SEVERITY_OPTS: { key: SeverityLevel; label: string }[] = [
  { key: 'LOW', label: 'Baixa' },
  { key: 'MEDIUM', label: 'Média' },
  { key: 'HIGH', label: 'Alta' },
];

export default function ProfileScreen() {
  const drawerNav = useNavigation();
  const { user, signOut } = useAuth();

  const [droughtAlert, setDroughtAlert] = useState(true);
  const [fireAlert, setFireAlert] = useState(true);
  const [stressAlert, setStressAlert] = useState(false);
  const [sensorAlert, setSensorAlert] = useState(true);
  const [minSeverity, setMinSeverity] = useState<SeverityLevel>('MEDIUM');

  function handleLogout() {
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'DR';

  return (
    <ScreenContainer
      title="Perfil do Produtor"
      subtitle="Gerencie seus dados e preferências de notificação."
      onMenuPress={() => drawerNav.dispatch(DrawerActions.openDrawer())}
    >
      <View style={styles.userCard}>
        <View style={styles.avatarLg}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userRole}>{ROLE_LABELS[user?.role ?? 'PRODUCER']}</Text>

        <View style={styles.detailsGrid}>
          <DetailRow icon={<Mail size={16} color={theme.primary} />} label="E-mail" value={user?.email ?? '-'} />
          <DetailRow icon={<Phone size={16} color={theme.primary} />} label="Telefone" value={user?.phone ?? 'Não informado'} />
          <DetailRow icon={<Shield size={16} color={theme.primary} />} label="Tipo de usuário" value={ROLE_LABELS[user?.role ?? 'PRODUCER']} />
          <DetailRow icon={<Calendar size={16} color={theme.primary} />} label="Conta criada em" value={user?.createdAt ? formatDate(user.createdAt) : '-'} />
          <DetailRow icon={<Clock size={16} color={theme.primary} />} label="Último acesso" value={user?.lastAccessAt ? `Hoje às ${new Date(user.lastAccessAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : '-'} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferências de Alerta</Text>
        <SwitchRow label="Alertas de seca" value={droughtAlert} onChange={setDroughtAlert} />
        <SwitchRow label="Alertas de queimada" value={fireAlert} onChange={setFireAlert} />
        <SwitchRow label="Estresse vegetativo" value={stressAlert} onChange={setStressAlert} />
        <SwitchRow label="Sensor crítico" value={sensorAlert} onChange={setSensorAlert} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nível Mínimo de Severidade</Text>
        <View style={styles.severityRow}>
          {SEVERITY_OPTS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.severityBtn, minSeverity === opt.key && styles.severityBtnActive]}
              onPress={() => setMinSeverity(opt.key)}
            >
              <Text style={[styles.severityLabel, minSeverity === opt.key && styles.severityLabelActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <LogOut size={18} color={theme.red} />
        <Text style={styles.logoutLabel}>Sair da conta</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>{icon}</View>
      <View style={styles.detailText}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

function SwitchRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: theme.border, true: theme.primaryDark }}
        thumbColor={value ? theme.primary : theme.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  userCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  avatarLg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarText: {
    color: theme.primary,
    fontSize: 22,
    fontWeight: '800',
  },
  userName: {
    color: theme.text,
    fontSize: 20,
    fontWeight: '800',
  },
  userRole: {
    color: theme.textMuted,
    fontSize: 14,
    marginBottom: 10,
  },
  detailsGrid: {
    width: '100%',
    gap: 0,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: `${theme.primary}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailText: { flex: 1 },
  detailLabel: { color: theme.textMuted, fontSize: 11 },
  detailValue: { color: theme.text, fontSize: 14, fontWeight: '600' },
  section: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    marginBottom: 10,
    gap: 4,
  },
  sectionTitle: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  switchLabel: {
    color: theme.text,
    fontSize: 14,
  },
  severityRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  severityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: theme.border,
    alignItems: 'center',
    backgroundColor: theme.surfaceLight,
  },
  severityBtnActive: {
    borderColor: theme.primary,
    backgroundColor: `${theme.primary}22`,
  },
  severityLabel: {
    color: theme.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  severityLabelActive: {
    color: theme.primary,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: `${theme.red}22`,
    borderWidth: 1,
    borderColor: `${theme.red}55`,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 4,
  },
  logoutLabel: {
    color: theme.red,
    fontSize: 15,
    fontWeight: '700',
  },
});
