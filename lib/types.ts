// ─── Shared envelope ─────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
  [key: string]: unknown;
}

export interface ListResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  roles: string[];
  avatar_initials?: string;
}

export interface Campaign {
  id: string;
  slug: string;
  name: string;
  category?: string;
  organisation?: string;
  verified?: boolean;
  goal: number;
  raised?: number;
  end_date: string;
  public_url?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  access_expires_at: string;
  refresh_expires_at: string;
  user: User;
  campaign: Campaign;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardOverview {
  campaign_id: string;
  raised: number;
  goal: number;
  pct_funded: number;
  available: number;
  withdrawn: number;
  contributors: number;
  days_left: number;
  today_total: number;
  today_transactions: number;
  avg_contribution: number;
  transactions_per_hour: number;
  weekly_growth_pct: number;
  surgeries_funded: number;
}

// ─── Contributors ─────────────────────────────────────────────────────────────

export interface Contributor {
  id: string;
  name: string;
  handle: string;
  type: 'individual' | 'corporate' | 'anonymous';
  avatar_initials: string;
  channel: string;
  region: string;
  total_amount: number;
  contribution_count: number;
  last_contribution_at: string;
  is_anonymous: boolean;
}

export interface ContributorStats {
  total: number;
  first_time: number;
  returning: number;
  corporate: number;
  individual: number;
  anonymous: number;
  countries: number;
  weekly_new: number;
  first_time_pct: number;
  returning_pct: number;
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export type TransactionStatus = 'confirmed' | 'pending' | 'failed';

export interface Transaction {
  id: string;
  contributor_name: string;
  contributor_id: string | null;
  amount: number;
  channel: string;
  region: string;
  status: TransactionStatus;
  transacted_at: string;
  is_anonymous: boolean;
}

export interface TransactionStats {
  today_total: number;
  today_count: number;
  last_hour_count: number;
  last_hour_total: number;
  pending_count: number;
  failed_today: number;
}

// ─── Disbursements ────────────────────────────────────────────────────────────

export type DisbursementStatus = 'pending_otp' | 'pending' | 'paid' | 'failed' | 'cancelled';

export interface Disbursement {
  id: string;
  reference: string;
  amount: number;
  fee: number;
  net_amount: number;
  status: DisbursementStatus;
  payment_account_id: string;
  payment_account?: {
    account_name: string;
    bank_name: string;
    account_number: string;
  };
  purpose: string;
  initiated_by: string;
  initiated_at: string;
  confirmed_at?: string;
  requires_co_approval: boolean;
  co_approved_by?: string;
  otp_expires_at?: string;
}

export interface OtpSendResult {
  message: string;
  expires_at: string;
  resend_available_at: string;
}

export interface OtpVerifyResult {
  id: string;
  reference: string;
  status: DisbursementStatus;
  net_amount: number;
  message: string;
  estimated_arrival: string;
}

// ─── Payment Accounts ─────────────────────────────────────────────────────────

export interface PaymentAccount {
  id: string;
  account_name: string;
  bank_name: string;
  account_number: string;
  branch?: string;
  created_at: string;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface DailyAnalytics {
  date: string;
  label: string;
  total: number;
  donors: number;
}

export interface ChannelAnalytics {
  channel: string;
  total: number;
  pct: number;
  count: number;
}

export interface RegionAnalytics {
  region: string;
  country: string | null;
  total: number;
  count: number;
  pct: number;
  children_funded: number;
}

export interface ContributionSizeAnalytics {
  label: string;
  min: number;
  max: number | null;
  count: number;
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export interface Report {
  id: string;
  name: string;
  type: 'PDF' | 'CSV' | 'XLSX';
  size_bytes: number;
  size_label: string;
  period: string;
  generated_at: string;
}

export interface ReportDownload {
  url: string;
  expires_at: string;
  filename: string;
  type: string;
}

// ─── Admins ───────────────────────────────────────────────────────────────────

export type AdminRole = 'owner' | 'medical_director' | 'finance_officer' | 'viewer';

export interface Admin {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AdminRole;
  avatar_initials: string;
  joined_at: string;
  last_login_at: string;
  status?: 'active' | 'invited';
}

// ─── Public ───────────────────────────────────────────────────────────────────

export interface PublicCampaign {
  id: string;
  slug: string;
  name: string;
  organisation: string;
  description: string;
  target_amount: number;
  total_raised: number;
  remaining_amount: number;
  pct_funded?: number;
  contributors?: number;
  surgeries_funded?: number;
  days_left?: number;
  end_date: string;
  last_updated: string;
  daily_chart: { label: string; total: number }[];
  regions: { region: string; total: number; pct: number }[];
  stats?: {
    raised_this_week?: number;
    weekly_growth_pct?: number;
    new_contributors_this_week?: number;
    surgeries_this_week?: number;
  };
}

export interface PublicDonor {
  name: string;
  amount: number;
  message?: string;
  created_at: string;
}
