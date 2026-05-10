import { api } from '../api';
import type { PaymentAccount } from '../types';

export interface AddAccountPayload {
  account_name:   string;
  bank_name:      string;
  account_number: string;
  branch?:        string;
}

export const listPaymentAccounts = () => api.get<PaymentAccount[]>('/payment-accounts');

export const addPaymentAccount = (payload: AddAccountPayload) =>
  api.post<PaymentAccount>('/payment-accounts', payload);

export const removePaymentAccount = (id: string) =>
  api.del<{ message: string }>(`/payment-accounts/${id}`);
