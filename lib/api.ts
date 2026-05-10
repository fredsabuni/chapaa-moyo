import {
  getAccessToken,
  getRefreshToken,
  isAccessTokenExpiringSoon,
  isRefreshTokenExpired,
  patchTokens,
  clearSession,
} from './session';
import type { ListResponse, PaginationMeta } from './types';

export const BASE_URL = 'https://api.chapaa.co.tz/api/v1';

// ─── Error ────────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Token refresh (de-duplicated) ────────────────────────────────────────────

let refreshPromise: Promise<void> | null = null;

function redirectToLogin(): void {
  if (typeof window !== 'undefined') window.location.replace('/login');
}

async function doRefresh(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (!refreshToken || isRefreshTokenExpired()) {
    clearSession();
    redirectToLogin();
    throw new ApiError('SESSION_EXPIRED', 'Session expired. Please log in again.', 401);
  }

  const res  = await fetch(`${BASE_URL}/auth/refresh`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body:    JSON.stringify({ refresh_token: refreshToken }),
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    clearSession();
    redirectToLogin();
    throw new ApiError('REFRESH_FAILED', 'Could not refresh session.', res.status);
  }

  patchTokens(json.data);
}

async function ensureFreshToken(): Promise<void> {
  if (!isAccessTokenExpiringSoon()) return;
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => { refreshPromise = null; });
  }
  await refreshPromise;
}

// ─── Core fetch ───────────────────────────────────────────────────────────────

function buildHeaders(init: RequestInit): HeadersInit {
  const token = getAccessToken();
  return {
    Accept:           'application/json',
    ...(token        ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.body    ? { 'Content-Type': 'application/json' } : {}),
    ...(init.headers ?? {}),
  };
}

async function parseResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok || json.success === false) {
    const err = json.error ?? {};
    throw new ApiError(
      err.code    ?? 'UNKNOWN',
      err.message ?? 'Request failed',
      res.status,
      err,
    );
  }
  return json as T;
}

async function coreFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  await ensureFreshToken();

  const headers = buildHeaders(init);
  let res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  // Single retry after a fresh token refresh on 401
  if (res.status === 401) {
    refreshPromise = null;
    await doRefresh();
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { ...headers, Authorization: `Bearer ${getAccessToken()}` },
    });
  }

  return parseResponse<T>(res);
}

// ─── Typed helpers ────────────────────────────────────────────────────────────

interface RawEnvelope<T> { success: boolean; data: T; meta?: PaginationMeta; }

async function fetchSingle<T>(path: string, init: RequestInit = {}): Promise<T> {
  const env = await coreFetch<RawEnvelope<T>>(path, init);
  return env.data;
}

async function fetchList<T>(path: string, init: RequestInit = {}): Promise<ListResponse<T>> {
  const env = await coreFetch<RawEnvelope<T[]>>(path, init);
  return {
    items: env.data,
    meta:  env.meta ?? { page: 1, limit: 0, total: 0, has_more: false },
  };
}

function qs(params?: Record<string, string | number | undefined>): string {
  if (!params) return '';
  const p = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => [k, String(v)]),
  );
  const str = p.toString();
  return str ? `?${str}` : '';
}

// ─── Public API surface ───────────────────────────────────────────────────────

export const api = {
  get:  <T>(path: string) =>
    fetchSingle<T>(path),

  list: <T>(path: string, params?: Record<string, string | number | undefined>) =>
    fetchList<T>(path + qs(params)),

  post: <T>(path: string, body: unknown) =>
    fetchSingle<T>(path, { method: 'POST', body: JSON.stringify(body) }),

  patch: <T>(path: string, body: unknown) =>
    fetchSingle<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),

  del: <T>(path: string) =>
    fetchSingle<T>(path, { method: 'DELETE' }),
};

// Public fetch (no auth header — for login, public endpoints)
export async function publicPost<T>(path: string, body: unknown): Promise<T> {
  const res  = await fetch(`${BASE_URL}${path}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body:    JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    const err = json.error ?? {};
    throw new ApiError(err.code ?? 'UNKNOWN', err.message ?? 'Request failed', res.status, err);
  }
  return json.data as T;
}

export async function publicGet<T>(path: string): Promise<T> {
  const res  = await fetch(`${BASE_URL}${path}`, {
    headers: { Accept: 'application/json' },
  });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    const err = json.error ?? {};
    throw new ApiError(err.code ?? 'UNKNOWN', err.message ?? 'Request failed', res.status, err);
  }
  return json.data as T;
}
