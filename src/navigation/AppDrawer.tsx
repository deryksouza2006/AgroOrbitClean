import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  LayoutDashboard,
  MapPin,
  Sprout,
  TriangleAlert,
  ClipboardList,
  UserCircle,
  X,
  LogOut,
} from 'lucide-react-native';
import { DrawerParamList } from './types';
import { theme } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import DashboardScreen from '../screens/DashboardScreen';
import AlertsScreen from '../screens/AlertsScreen';
import RecommendationsScreen from '../screens/RecommendationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FarmsStack from './FarmsStack';
import CropAreasStack from './CropAreasStack';

const Drawer = createDrawerNavigator<DrawerParamList>();

const MENU_ITEMS = [
  { name: 'Dashboard' as const, label: 'Dashboard', Icon: LayoutDashboard },
  { name: 'Fazendas' as const, label: 'Fazendas', Icon: MapPin },
  { name: 'Talhões' as const, label: 'Talhões', Icon: Sprout },
  { name: 'Alertas' as const, label: 'Alertas', Icon: TriangleAlert },
  { name: 'Recomendações' as const, label: 'Recomendações', Icon: ClipboardList },
  { name: 'Perfil' as const, label: 'Perfil', Icon: UserCircle },
];

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user, signOut } = useAuth();
  const { state, navigation } = props;
  const activeIndex = state.index;
  const insets = useSafeAreaInsets();

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'DR';

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 12),
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Sprout size={24} color={theme.primary} />
          <Text style={styles.logoText}>AgroOrbit</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.closeDrawer()}>
          <X size={22} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.menuContainer}
      >
        {MENU_ITEMS.map((item, index) => {
          const isActive = activeIndex === index;
          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.menuItem, isActive && styles.menuItemActive]}
              onPress={() => {
                if (item.name === 'Talhões') {
                  navigation.navigate(
                    'Talhões' as never,
                    {
                      screen: 'CropAreasScreen',
                      params: {
                        mode: 'all',
                        farmId: undefined,
                        farmName: undefined,
                      },
                    } as never,
                  );
                  return;
                }

                navigation.navigate(item.name as never);
              }}
            >
              <item.Icon
                size={20}
                color={isActive ? theme.primary : theme.textMuted}
              />
              <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </DrawerContentScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name ?? 'Produtor'}</Text>
            <Text style={styles.userRole}>
              {user?.role === 'PRODUCER' ? 'Produtor' : user?.role ?? ''}
            </Text>
          </View>
          <TouchableOpacity onPress={signOut}>
            <LogOut size={18} color={theme.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function AppDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: { backgroundColor: theme.surface, width: 280 },
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="Fazendas" component={FarmsStack} />
      <Drawer.Screen name="Talhões" component={CropAreasStack} />
      <Drawer.Screen name="Alertas" component={AlertsScreen} />
      <Drawer.Screen name="Recomendações" component={RecommendationsScreen} />
      <Drawer.Screen name="Perfil" component={ProfileScreen} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
    letterSpacing: 0.5,
  },
  menuContainer: {
    paddingTop: 12,
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 4,
    gap: 12,
  },
  menuItemActive: {
    backgroundColor: theme.primaryDark,
  },
  menuLabel: {
    fontSize: 15,
    color: theme.textMuted,
    fontWeight: '500',
  },
  menuLabelActive: {
    color: theme.primary,
    fontWeight: '600',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
    padding: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: theme.text,
    fontWeight: '600',
    fontSize: 14,
  },
  userRole: {
    color: theme.textMuted,
    fontSize: 12,
  },
});
