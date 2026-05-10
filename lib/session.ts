import type { AuthSession, User, Campaign } from './types';

const KEYS = {
  accessToken:       'moyo_access_token',
  refreshToken:      'moyo_refresh_token',
  accessExpiresAt:   'moyo_access_expires_at',
  refreshExpiresAt:  'moyo_refresh_expires_at',
  user:              'moyo_user',
  campaign:          'moyo_campaign',
} as const;

function store(key: string, value: string): void {
  if (typeof window !== 'undefined') localStorage.setItem(key, value);
}

function read(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
}

function drop(key: string): void {
  if (typeof window !== 'undefined') localStorage.removeItem(key);
}

// ─── Write ────────────────────────────────────────────────────────────────────

export function setSession(session: AuthSession): void {
  store(KEYS.accessToken,      session.access_token);
  store(KEYS.refreshToken,     session.refresh_token);
  store(KEYS.accessExpiresAt,  session.access_expires_at);
  store(KEYS.refreshExpiresAt, session.refresh_expires_at);
  store(KEYS.user,             JSON.stringify(session.user));
  store(KEYS.campaign,         JSON.stringify(session.campaign));
}

export function patchTokens(data: {
  access_token?: string;
  access_expires_at?: string;
  refresh_token?: string;
  refresh_expires_at?: string;
}): void {
  if (data.access_token)      store(KEYS.accessToken,      data.access_token);
  if (data.access_expires_at) store(KEYS.accessExpiresAt,  data.access_expires_at);
  if (data.refresh_token)     store(KEYS.refreshToken,     data.refresh_token);
  if (data.refresh_expires_at)store(KEYS.refreshExpiresAt, data.refresh_expires_at);
}

export function clearSession(): void {
  Object.values(KEYS).forEach(drop);
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  return read(KEYS.accessToken);
}

export function getRefreshToken(): string | null {
  return read(KEYS.refreshToken);
}

export function getUser(): User | null {
  const raw = read(KEYS.user);
  if (!raw) return null;
  try { return JSON.parse(raw) as User; } catch { return null; }
}

export function getCampaign(): Campaign | null {
  const raw = read(KEYS.campaign);
  if (!raw) return null;
  try { return JSON.parse(raw) as Campaign; } catch { return null; }
}

// ─── Expiry helpers ───────────────────────────────────────────────────────────

function isPast(iso: string | null): boolean {
  if (!iso) return true;
  return Date.now() >= new Date(iso).getTime();
}

export function isAccessTokenExpired(): boolean {
  return isPast(read(KEYS.accessExpiresAt));
}

export function isRefreshTokenExpired(): boolean {
  return isPast(read(KEYS.refreshExpiresAt));
}

export function isAccessTokenExpiringSoon(thresholdMs = 60_000): boolean {
  const exp = read(KEYS.accessExpiresAt);
  if (!exp) return true;
  return Date.now() >= new Date(exp).getTime() - thresholdMs;
}

// ─── Guard ────────────────────────────────────────────────────────────────────

export function hasValidSession(): boolean {
  return !!getAccessToken() && !isRefreshTokenExpired();
}
