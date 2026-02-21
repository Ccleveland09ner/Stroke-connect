import { apiClient } from './client';
import type { RegisterData } from '../types/auth';

export async function login(usernameOrName: string, password: string) {
  const { data } = await apiClient.post('/api/login', {
    username: usernameOrName,
    password,
  });
  return data;
}

export async function register(payload: RegisterData) {
  const { data } = await apiClient.post('/api/register', {
    ...payload,
    username: payload.username ?? payload.name,
  });
  return data;
}
