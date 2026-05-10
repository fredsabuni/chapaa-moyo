import { publicPost, api } from '../api';
import { setSession, clearSession } from '../session';
import type { AuthSession } from '../types';

export async function loginUser(credential: string, password: string): Promise<AuthSession> {
  const session = await publicPost<AuthSession>('/auth/login', { credential, password });
  setSession(session);
  return session;
}

export async function logoutUser(): Promise<void> {
  try {
    await api.post('/auth/logout', {});
  } finally {
    clearSession();
  }
}
