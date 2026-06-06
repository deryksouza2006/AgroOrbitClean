import { User } from '../types/User';
import api from './api';
import { apiRoutes } from '../constants/apiRoutes';
import { fromApiUser } from '../utils/apiMappers';

interface LoginParams {
  email: string;
  password: string;
}

interface RegisterParams {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export const authService = {
  async login(
    paramsOrEmail: LoginParams | string,
    maybePassword?: string,
  ): Promise<{ user: User; token: string }> {
    const email = typeof paramsOrEmail === 'string' ? paramsOrEmail : paramsOrEmail.email;
    const password = typeof paramsOrEmail === 'string' ? (maybePassword ?? '') : paramsOrEmail.password;
    try {
      const response = await api.post(apiRoutes.auth.login, { email, password });
      const data = response.data;
      const token: string = data.token ?? data.accessToken ?? '';
      const userData = data.user ?? data;
      const user = fromApiUser(userData as Record<string, unknown>);
      return { user, token };
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
        if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
          throw new Error('E-mail ou senha inválidos.');
        }
        if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message);
        }
      }
      throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão.');
    }
  },

  async register(
    paramsOrName: RegisterParams | string,
    maybeEmail?: string,
    maybePassword?: string,
  ): Promise<{ user: User; token: string }> {
    const name = typeof paramsOrName === 'string' ? paramsOrName : paramsOrName.name;
    const email = typeof paramsOrName === 'string' ? (maybeEmail ?? '') : paramsOrName.email;
    const password = typeof paramsOrName === 'string' ? (maybePassword ?? '') : paramsOrName.password;
    const phone = typeof paramsOrName === 'object' ? paramsOrName.phone : undefined;
    try {
      const body: Record<string, unknown> = {
        name,
        email,
        password,
        role: 'ROLE_PRODUCER',
      };
      if (phone) body.phone = phone;
      const response = await api.post(apiRoutes.auth.register, body);
      const data = response.data;
      const token: string = data.token ?? data.accessToken ?? '';
      const userData = data.user ?? data;
      const user = fromApiUser(userData as Record<string, unknown>);
      return { user, token };
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
        if (axiosError.response?.status === 409) {
          throw new Error('Este e-mail já está cadastrado.');
        }
        if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message);
        }
      }
      throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão.');
    }
  },

  async getProfile(): Promise<User> {
    const response = await api.get('/auth/me');
    return fromApiUser(response.data as Record<string, unknown>);
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put('/auth/me', data);
    return fromApiUser(response.data as Record<string, unknown>);
  },
};
