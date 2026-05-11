'use client';

import { useState } from 'react';
import { useQuery, useListQuery } from '@/lib/useQuery';
import { listContributors, getContributorStats } from '@/lib/services/contributors.service';
import { CHANNEL_COLORS } from '@/lib/constants';
import { fmtTZS } from '@/lib/utils';
import { CONTRIBUTOR_PAGE_LIMIT } from '@/lib/constants';

const CHANNELS = ['', 'M-Pesa', 'Tigo Pesa', 'Airtel Money', 'Bank', 'Card'];
const TYPES    = ['', 'individual', 'corporate', 'anonymous'];

export default function ContributorsPage() {
  const [channel, setChannel] = useState('');
  const [type, setType]       = useState('');

  const stats = useQuery(getContributorStats);

  const list = useListQuery(
    (page) => listContributors({ page, limit: CONTRIBUTOR_PAGE_LIMIT, channel, type }),
    [channel, type],
  );

  const kpi = stats.data;

  return (
    <div>
      <div className="pageHead">
        <div>
          <div className="crumb">Moyo · Heart Surgery Fund</div>
          <h1>Our <em>Contributors</em></h1>
          <div className="sub">Every person here is helping a child with a heart condition get the surgery they need.</div>
        </div>
      </div>

      {/* KPI Hero */}
      <div className="kpi-hero" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
        <div className="hero-main">
          <div className="label"><span className="dot"></span>All-time contributors</div>
          <div className="big-amount">{kpi ? (kpi.total ?? 0).toLocaleString() : '—'}</div>
          <div className="of">from <b>{kpi?.countries ?? '—'} countries &amp; regions</b></div>
        </div>
        <div className="hero-stat">
          <div className="lbl">First-time</div>
          <div className="val">{kpi ? (kpi.first_time ?? 0).toLocaleString() : '—'}</div>
          <div className="delta delta-up">↑ {kpi?.first_time_pct ?? '—'}%</div>
        </div>
        <div className="hero-stat">
          <div className="lbl">Returning</div>
          <div className="val">{kpi ? (kpi.returning ?? 0).toLocaleString() : '—'}</div>
          <div className="delta delta-up">↑ {kpi?.returning_pct ?? '—'}%</div>
        </div>
        <div className="hero-stat">
          <div className="lbl">Corporates</div>
          <div className="val">{kpi?.corporate ?? '—'}</div>
          <div className="delta delta-flat">→ stable</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-head">
          <div><h3>All contributors</h3><div className="sub">Sorted by most recent contribution</div></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              className="field-input"
              value={channel}
              onChange={e => setChannel(e.target.value)}
              style={{ padding: '7px 12px', fontSize: 12, cursor: 'pointer', height: 34 }}
            >
              {CHANNELS.map(c => <option key={c} value={c}>{c || 'All channels'}</option>)}
            </select>
            <select
              className="field-input"
              value={type}
              onChange={e => setType(e.target.value)}
              style={{ padding: '7px 12px', fontSize: 12, cursor: 'pointer', height: 34 }}
            >
              {TYPES.map(t => <option key={t} value={t}>{t || 'All types'}</option>)}
            </select>
          </div>
        </div>

        {list.error && (
          <div style={{ padding: '16px', color: 'var(--rose)', fontSize: 13 }}>{list.error}</div>
        )}

        <table className="table">
          <thead>
            <tr><th>Contributor</th><th>Region</th><th>Channel</th><th>Contributions</th><th>Last activity</th><th style={{ textAlign: 'right' }}>Total (TZS)</th></tr>
          </thead>
          <tbody>
            {list.items.map((c, i) => (
              <tr key={c.id ?? i}>
                <td>
                  <div className="contrib">
                    <div className={`contrib-avatar v${(i % 4) + 1}`}>{c.avatar_initials}</div>
                    <div>
                      <div className="contrib-name">{c.name}</div>
                      <div className="contrib-meta">{c.handle}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: 12, color: 'var(--muted)' }}>{c.region}</td>
                <td>
                  <span className="channel-tag">
                    <span className="pip" style={{ background: CHANNEL_COLORS[c.channel] ?? '#9AA3BD' }}></span>
                    {c.channel}
                  </span>
                </td>
                <td>{c.contribution_count}</td>
                <td style={{ color: 'var(--muted)', fontSize: 12 }}>
                  {new Date(c.last_contribution_at).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="amount-cell" style={{ textAlign: 'right' }}>{fmtTZS(c.total_amount)}</td>
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
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No contributors found.</div>
        )}
      </div>
    </div>
  );
}
