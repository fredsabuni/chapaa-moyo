export interface PaymentAccount {
  id: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  branch: string;
}

const KEY = 'moyo_payment_accounts';

const DEFAULTS: PaymentAccount[] = [
  { id: '1', accountName: 'Moyo Foundation', bankName: 'NMB Bank',  accountNumber: '40710002841', branch: 'Dar es Salaam Main' },
  { id: '2', accountName: 'Moyo Foundation', bankName: 'CRDB Bank', accountNumber: '01J1500009173', branch: 'Kariakoo Branch' },
];

export function getAccounts(): PaymentAccount[] {
  if (typeof window === 'undefined') return DEFAULTS;
  const raw = localStorage.getItem(KEY);
  if (!raw) return DEFAULTS;
  try { return JSON.parse(raw); } catch { return DEFAULTS; }
}

export function saveAccount(data: Omit<PaymentAccount, 'id'>): PaymentAccount {
  const accounts = getAccounts();
  const account: PaymentAccount = { ...data, id: Date.now().toString() };
  localStorage.setItem(KEY, JSON.stringify([...accounts, account]));
  return account;
}

export function deleteAccount(id: string): void {
  const updated = getAccounts().filter(a => a.id !== id);
  localStorage.setItem(KEY, JSON.stringify(updated));
}
