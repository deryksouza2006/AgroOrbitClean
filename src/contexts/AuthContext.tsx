import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/User';
import { setAuthToken } from '../services/api';

const STORAGE_KEY_TOKEN = '@agroorbit:token';
const STORAGE_KEY_USER = '@agroorbit:user';

interface AuthContextData {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  initializing: boolean;
  signIn: (user: User, token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Restaurar sessão salva ao abrir o app
  useEffect(() => {
    (async () => {
      try {
        const savedToken = await AsyncStorage.getItem(STORAGE_KEY_TOKEN);
        const savedUser = await AsyncStorage.getItem(STORAGE_KEY_USER);
        if (savedToken && savedUser) {
          const parsedUser: User = JSON.parse(savedUser);
          setAuthToken(savedToken);
          setToken(savedToken);
          setUser(parsedUser);
        }
      } catch {
        // Se falhar ao ler, ignora e pede login novamente
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (newUser: User, newToken: string) => {
    setAuthToken(newToken);
    setUser(newUser);
    setToken(newToken);
    await AsyncStorage.setItem(STORAGE_KEY_TOKEN, newToken);
    await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
  }, []);

  const signOut = useCallback(async () => {
    setAuthToken(undefined);
    setUser(null);
    setToken(null);
    await AsyncStorage.multiRemove([STORAGE_KEY_TOKEN, STORAGE_KEY_USER]);
  }, []);

  // Enquanto carrega sessão salva, não renderizar nada
  if (initializing) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        initializing,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
