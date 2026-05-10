import { api } from '../api';
import type {
  Disbursement,
  OtpSendResult,
  OtpVerifyResult,
  ListResponse,
} from '../types';
import { DISBURSEMENT_PAGE_LIMIT } from '../constants';

export interface DisbursementFilters {
  page?:   number;
  limit?:  number;
  status?: string;
}

export interface InitiatePayload {
  amount:             number;
  payment_account_id: string;
  purpose:            string;
}

export function listDisbursements(filters: DisbursementFilters = {}): Promise<ListResponse<Disbursement>> {
  return api.list<Disbursement>('/disbursements', {
    page:   filters.page   ?? 1,
    limit:  filters.limit  ?? DISBURSEMENT_PAGE_LIMIT,
    status: filters.status,
  });
}

export const initiateDisbursement = (payload: InitiatePayload) =>
  api.post<Disbursement>('/disbursements', payload);

export const sendOtp = (disbursementId: string) =>
  api.post<OtpSendResult>(`/disbursements/${disbursementId}/otp/send`, {});

export const verifyOtp = (disbursementId: string, otp: string) =>
  api.post<OtpVerifyResult>(`/disbursements/${disbursementId}/otp/verify`, { otp });
