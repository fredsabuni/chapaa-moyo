'use client';

import { useState } from 'react';
import { useQuery, useListQuery } from '@/lib/useQuery';
import { listTransactions, getTransactionStats } from '@/lib/services/transactions.service';
import { STATUS_COLORS, TRANSACTION_PAGE_LIMIT } from '@/lib/constants';
import { fmtTZS } from '@/lib/utils';

const STATUS_OPTIONS  = ['', 'confirmed', 'pending', 'failed'];
const CHANNEL_OPTIONS = ['', 'M-Pesa', 'Tigo Pesa', 'Airtel Money', 'Bank', 'Card'];

export default function LiveTransactions() {
  const [status, setStatus]   = useState('');
  const [channel, setChannel] = useState('');

  const stats = useQuery(getTransactionStats);
  const list  = useListQuery(
    (page) => listTransactions({ page, limit: TRANSACTION_PAGE_LIMIT, status, channel }),
    [status, channel],
  );

  const kpi = stats.data;

  return (
    <div>
      <div className="pageHead">
        <div>
          <div className="crumb">Moyo · Heart Surgery Fund</div>
          <h1>Live <em>Transactions</em></h1>
          <div className="sub">Real-time contribution feed — every shilling counted for our children.</div>
        </div>
        <div className="head-actions">
          {kpi && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--teal)', fontWeight: 600, background: 'rgba(21,184,148,0.1)', padding: '7px 12px', borderRadius: 999 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--teal)', display: 'inline-block', boxShadow: '0 0 0 3px rgba(21,184,148,0.25)', animation: 'pulse 2s infinite' }}></span>
              {kpi.last_hour_count} new in last hour
            </span>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div><h3>Transaction feed</h3><div className="sub">{kpi ? `${kpi.today_count.toLocaleString()} today · ${kpi.pending_count} pending` : 'Loading…'}</div></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              className="field-input"
              value={status}
              onChange={e => setStatus(e.target.value)}
              style={{ padding: '7px 12px', fontSize: 12, cursor: 'pointer', height: 34 }}
            >
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s || 'All statuses'}</option>)}
            </select>
            <select
              className="field-input"
              value={channel}
              onChange={e => setChannel(e.target.value)}
              style={{ padding: '7px 12px', fontSize: 12, cursor: 'pointer', height: 34 }}
            >
              {CHANNEL_OPTIONS.map(c => <option key={c} value={c}>{c || 'All channels'}</option>)}
            </select>
          </div>
        </div>

        {list.error && (
          <div style={{ padding: '16px', color: 'var(--rose)', fontSize: 13 }}>{list.error}</div>
        )}

        <table className="table">
          <thead>
            <tr>
              <th>Tx ID</th><th>Contributor</th><th>Channel</th>
              <th>Region</th><th>Time</th><th>Status</th><th style={{ textAlign: 'right' }}>Amount (TZS)</th>
            </tr>
          </thead>
          <tbody>
            {list.items.map((t, i) => (
              <tr key={t.id ?? i}>
                <td><span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>{t.id}</span></td>
                <td><span style={{ fontWeight: 600 }}>{t.contributor_name}</span></td>
                <td><span className="channel-tag">{t.channel}</span></td>
                <td style={{ color: 'var(--muted)', fontSize: 12 }}>{t.region}</td>
                <td style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>
                  {new Date(t.transacted_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </td>
                <td>
                  <span style={{
                    fontSize: 11, padding: '3px 8px', borderRadius: 6, fontWeight: 600,
                    background: (STATUS_COLORS[t.status] ?? '#9AA3BD') + '22',
                    color: STATUS_COLORS[t.status] ?? '#9AA3BD',
                  }}>
                    {t.status}
                  </span>
                </td>
                <td className="amount-cell" style={{ textAlign: 'right' }}>{fmtTZS(t.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {list.loading && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Loading…</div>
        )}

        {list.hasMore && !list.loading && (
          <div style={{ padding: '16px', textAlign: 'center' }}>
            <button className="btn btn-ghost" onClick={list.loadMore}>Load more</button>
          </div>
        )}

        {!list.loading && list.items.length === 0 && !list.error && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No transactions found.</div>
        )}
      </div>
    </div>
  );
}
