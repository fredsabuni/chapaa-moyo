export const CHANNEL_COLORS: Record<string, string> = {
  'M-Pesa':        '#15B894',
  'Tigo Pesa':     '#1FD1A8',
  'Airtel Money':  '#04372C',
  'Airtel':        '#04372C',
  'Bank Transfer': '#0B1330',
  'Bank':          '#0B1330',
  'Card':          '#9AA3BD',
};

export const REGION_FLAGS: Record<string, string> = {
  TZ: '🇹🇿',
  KE: '🇰🇪',
  UG: '🇺🇬',
  RW: '🇷🇼',
  BI: '🇧🇮',
};

export const DEFAULT_FLAG = '🌍';

// For public endpoint regions which only return name strings (no country code)
export const REGION_FLAG_BY_NAME: Record<string, string> = {
  'Dar es Salaam': '🇹🇿',
  'Arusha':        '🇹🇿',
  'Mwanza':        '🇹🇿',
  'Dodoma':        '🇹🇿',
  'Mbeya':         '🇹🇿',
  'Tanga':         '🇹🇿',
  'Morogoro':      '🇹🇿',
  'Moshi':         '🇹🇿',
  'Kenya':         '🇰🇪',
  'Uganda':        '🇺🇬',
  'Rwanda':        '🇷🇼',
  'Diaspora':      '🌍',
};

export const ADMIN_ROLE_LABELS: Record<string, string> = {
  owner:            'Owner · Super admin',
  medical_director: 'Medical director',
  finance_officer:  'Finance officer',
  viewer:           'Viewer',
};

export const STATUS_COLORS: Record<string, string> = {
  SUCCESS:     '#15B894',
  confirmed:   '#15B894',
  paid:        '#15B894',
  PENDING:     '#E89B3C',
  pending:     '#E89B3C',
  pending_otp: '#E89B3C',
  FAILED:      '#E5547D',
  failed:      '#E5547D',
  cancelled:   '#9AA3BD',
};

export const DISBURSEMENT_PAGE_LIMIT = 20;
export const TRANSACTION_PAGE_LIMIT  = 20;
export const CONTRIBUTOR_PAGE_LIMIT  = 20;
