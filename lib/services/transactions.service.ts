import { api } from '../api';
import type { Transaction, TransactionStats, ListResponse } from '../types';
import { TRANSACTION_PAGE_LIMIT } from '../constants';

export interface TransactionFilters {
  page?:      number;
  limit?:     number;
  status?:    string;
  channel?:   string;
  date_from?: string;
  date_to?:   string;
}

export function listTransactions(filters: TransactionFilters = {}): Promise<ListResponse<Transaction>> {
  return api.list<Transaction>('/transactions', {
    page:      filters.page  ?? 1,
    limit:     filters.limit ?? TRANSACTION_PAGE_LIMIT,
    status:    filters.status,
    channel:   filters.channel,
    date_from: filters.date_from,
    date_to:   filters.date_to,
  });
}

export const getTransactionStats = () => api.get<TransactionStats>('/transactions/stats');
