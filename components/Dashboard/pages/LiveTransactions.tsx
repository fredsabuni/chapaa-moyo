'use client';

import { fmtTZSFull } from '@/lib/utils';

const txns = [
  { id: 'TX-8821', name: 'Rehema Njau',    amount: 500000,   channel: 'M-Pesa',    region: 'Dar es Salaam', time: '10:42:18', status: 'confirmed' },
  { id: 'TX-8820', name: 'Omar Shaaban',   amount: 250000,   channel: 'Tigo Pesa', region: 'Zanzibar',      time: '10:41:55', status: 'confirmed' },
  { id: 'TX-8819', name: 'Anonymous',      amount: 2000000,  channel: 'Bank',      region: 'Unknown',       time: '10:41:12', status: 'confirmed' },
  { id: 'TX-8818', name: 'Fatuma Ally',    amount: 100000,   channel: 'Airtel',    region: 'Mwanza',        time: '10:40:44', status: 'confirmed' },
  { id: 'TX-8817', name: 'David Kimaro',   amount: 1500000,  channel: 'M-Pesa',    region: 'Arusha',        time: '10:39:30', status: 'confirmed' },
  { id: 'TX-8816', name: 'Neema Wambura',  amount: 300000,   channel: 'M-Pesa',    region: 'Dar es Salaam', time: '10:38:02', status: 'pending' },
  { id: 'TX-8815', name: 'Rashid Mwita',   amount: 750000,   channel: 'Tigo Pesa', region: 'Dodoma',        time: '10:36:50', status: 'confirmed' },
  { id: 'TX-8814', name: 'ABC Foundation', amount: 10000000, channel: 'Bank',      region: 'Nairobi, KE',   time: '10:35:00', status: 'confirmed' },
  { id: 'TX-8813', name: 'Safia Hamisi',   amount: 200000,   channel: 'Airtel',    region: 'Tanga',         time: '10:33:15', status: 'confirmed' },
  { id: 'TX-8812', name: 'George Lema',    amount: 850000,   channel: 'M-Pesa',    region: 'Mbeya',         time: '10:31:40', status: 'failed' },
];

const statusColor: Record<string, string> = {
  confirmed: '#15B894',
  pending: '#E89B3C',
  failed: '#E5547D',
};

export default function LiveTransactions() {
  return (
    <div>
      <div className="pageHead">
        <div>
          <div className="crumb">Moyo · Heart Surgery Fund</div>
          <h1>Live <em>Transactions</em></h1>
          <div className="sub">Real-time contribution feed — every shilling counted for our children.</div>
        </div>
        <div className="head-actions">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--teal)', fontWeight: 600, background: 'rgba(21,184,148,0.1)', padding: '7px 12px', borderRadius: 999 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--teal)', display: 'inline-block', boxShadow: '0 0 0 3px rgba(21,184,148,0.25)', animation: 'pulse 2s infinite' }}></span>
            12 new in last hour
          </span>
        </div>
      </div>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Tx ID</th><th>Contributor</th><th>Channel</th>
              <th>Region</th><th>Time</th><th>Status</th><th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {txns.map((t, i) => (
              <tr key={i}>
                <td><span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>{t.id}</span></td>
                <td><span style={{ fontWeight: 600 }}>{t.name}</span></td>
                <td><span className="channel-tag">{t.channel}</span></td>
                <td style={{ color: 'var(--muted)', fontSize: 12 }}>{t.region}</td>
                <td style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>{t.time}</td>
                <td>
                  <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, fontWeight: 600, background: statusColor[t.status] + '22', color: statusColor[t.status] }}>
                    {t.status}
                  </span>
                </td>
                <td className="amount-cell">TZS {fmtTZSFull(t.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
