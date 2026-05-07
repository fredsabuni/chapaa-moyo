export const RAISED = 1842500000;
export const GOAL = 2500000000;
export const PCT = (RAISED / GOAL) * 100;
export const AVAILABLE = 1156000000;
export const WITHDRAWN = RAISED - AVAILABLE;
export const CONTRIBUTORS = 12847;
export const DAYS_LEFT = 47;

export const dailyData = [
  { d: 'Apr 22', v: 38500000,  donors: 412 },
  { d: 'Apr 23', v: 42800000,  donors: 478 },
  { d: 'Apr 24', v: 51200000,  donors: 521 },
  { d: 'Apr 25', v: 47600000,  donors: 489 },
  { d: 'Apr 26', v: 62100000,  donors: 612 },
  { d: 'Apr 27', v: 78400000,  donors: 743 },
  { d: 'Apr 28', v: 71200000,  donors: 681 },
  { d: 'Apr 29', v: 68900000,  donors: 654 },
  { d: 'Apr 30', v: 84700000,  donors: 798 },
  { d: 'May 01', v: 91300000,  donors: 856 },
  { d: 'May 02', v: 76800000,  donors: 712 },
  { d: 'May 03', v: 89200000,  donors: 832 },
  { d: 'May 04', v: 94600000,  donors: 891 },
  { d: 'May 05', v: 102400000, donors: 967 },
];

export const channelData = [
  { name: 'M-Pesa',       value: 824000000, color: '#15B894', pct: 44.7 },
  { name: 'Tigo Pesa',    value: 412000000, color: '#1FD1A8', pct: 22.4 },
  { name: 'Airtel Money', value: 298000000, color: '#04372C', pct: 16.2 },
  { name: 'Bank Transfer',value: 211000000, color: '#0B1330', pct: 11.5 },
  { name: 'Card',         value: 97500000,  color: '#9AA3BD', pct:  5.3 },
];

export const geoData = [
  { flag: '🇹🇿', name: 'Dar es Salaam', value: 612000000, count: 4287, pct: 33.2, children: 58 },
  { flag: '🇹🇿', name: 'Arusha',         value: 287000000, count: 2104, pct: 15.6, children: 27 },
  { flag: '🇹🇿', name: 'Mwanza',         value: 198000000, count: 1856, pct: 10.7, children: 19 },
  { flag: '🇹🇿', name: 'Dodoma',         value: 142000000, count: 1342, pct:  7.7, children: 13 },
  { flag: '🇹🇿', name: 'Mbeya',          value:  98000000, count:  892, pct:  5.3, children:  9 },
  { flag: '🇹🇿', name: 'Tanga',          value:  84500000, count:  741, pct:  4.6, children:  8 },
  { flag: '🇰🇪', name: 'Kenya',          value: 248000000, count: 1421, pct: 13.5, children:  0 },
  { flag: '🌍',  name: 'Diaspora',       value: 355500000, count: 1837, pct: 19.3, children:  8 },
];

export interface Contributor {
  id: number;
  name: string;
  handle: string;
  avatar: string;
  vc: number;
  amount: number;
  count: number;
  channel: string;
  color: string;
  when: string;
  region?: string;
}

export const contributors: Contributor[] = [
  { id: 1, name: 'Amina Kirimi',      handle: '@aminak',                    avatar: 'AK', vc: 1, amount:  5000000, count: 3,  channel: 'M-Pesa',    color: '#15B894', when: '2 minutes ago' },
  { id: 2, name: 'Mwajuma Hassan',    handle: '@mwajh',                     avatar: 'MH', vc: 2, amount:  2500000, count: 7,  channel: 'Tigo Pesa', color: '#1FD1A8', when: '14 minutes ago' },
  { id: 3, name: 'Anonymous',         handle: 'Identity hidden by request', avatar: 'AN', vc: 3, amount: 10000000, count: 1,  channel: 'Bank',      color: '#0B1330', when: '38 minutes ago' },
  { id: 4, name: 'Joseph Mwakapina',  handle: '@josephm',                   avatar: 'JM', vc: 4, amount:   850000, count: 12, channel: 'Airtel',    color: '#04372C', when: '1 hour ago' },
  { id: 5, name: 'Vodacom Foundation',handle: 'Corporate contribution',     avatar: 'VF', vc: 1, amount: 50000000, count: 1,  channel: 'Bank',      color: '#0B1330', when: '2 hours ago' },
  { id: 6, name: 'Grace Mollel',      handle: '@gracem',                    avatar: 'GM', vc: 2, amount:   320000, count: 4,  channel: 'M-Pesa',    color: '#15B894', when: '3 hours ago' },
  { id: 7, name: 'Salim Mzee',        handle: '@salimz',                    avatar: 'SM', vc: 4, amount:  1200000, count: 2,  channel: 'Tigo Pesa', color: '#1FD1A8', when: '4 hours ago' },
  { id: 8, name: 'NMB Bank Staff',    handle: 'Group contribution',         avatar: 'NB', vc: 3, amount: 18500000, count: 1,  channel: 'Bank',      color: '#0B1330', when: '5 hours ago' },
];

export const recentWithdrawals = [
  { date: 'May 03', amount: 280000000, ref: 'WD-9281', status: 'paid' },
  { date: 'Apr 28', amount: 165000000, ref: 'WD-9264', status: 'paid' },
  { date: 'Apr 21', amount: 195000000, ref: 'WD-9217', status: 'paid' },
];
