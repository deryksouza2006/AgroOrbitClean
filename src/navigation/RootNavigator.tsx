import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootParamList } from './types';
import { useAuth } from '../contexts/AuthContext';
import AuthStack from './AuthStack';
import AppDrawer from './AppDrawer';

const Stack = createNativeStackNavigator<RootParamList>();

export default function RootNavigator() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Stack.Navigator
      key={isAuthenticated ? `app-${user?.id ?? 'unknown'}` : 'auth'}
      screenOptions={{ headerShown: false }}
    >
      {isAuthenticated ? (
        <Stack.Screen name="App" component={AppDrawer} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}
