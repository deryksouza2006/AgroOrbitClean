import axios from 'axios';

const API_BASE_URL = 'https://gs1-java-production.up.railway.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Define ou remove o token de autenticação JWT nos headers.
 * Chamar após login/logout.
 */
export function setAuthToken(token?: string) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

export { API_BASE_URL };
export default api;
