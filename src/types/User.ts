export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'PRODUCER' | 'ADMIN' | 'TECHNICIAN';
  createdAt?: string;
  lastAccessAt?: string;
}
