const KEY = 'moyo_authed';

export const DEMO_EMAIL    = 'admin@moyo.tz';
export const DEMO_PHONE    = '+255 700 000 000';
export const DEMO_PASSWORD = 'moyo2026';

export function isAuthed(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(KEY) === 'true';
}

export function login(credential: string, password: string): boolean {
  const credOk = credential === DEMO_EMAIL || credential === DEMO_PHONE || credential === '0700000000';
  const passOk = password === DEMO_PASSWORD;
  if (credOk && passOk) {
    localStorage.setItem(KEY, 'true');
    return true;
  }
  return false;
}

export function logout(): void {
  localStorage.removeItem(KEY);
}
