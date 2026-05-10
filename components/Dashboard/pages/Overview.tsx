'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@/lib/useQuery';
import { getOverview } from '@/lib/services/dashboard.service';
import { getDaily, getChannels, getRegions } from '@/lib/services/analytics.service';
import { CHANNEL_COLORS, REGION_FLAGS, DEFAULT_FLAG } from '@/lib/constants';
import { fmtTZS, fmtTZSFull, baseAxis, baseTooltip } from '@/lib/utils';
import type { DailyRange } from '@/lib/services/analytics.service';

const ChartCanvas = dynamic(() => import('@/components/ChartCanvas'), { ssr: false });

const RANGES: DailyRange[] = ['7', '14', '30'];
const RANGE_LABELS: Partial<Record<DailyRange, string>> = { '7': '7D', '14': '14D', '30': '30D' };

export default function Overview({ onOpenWithdraw }: { onOpenWithdraw: () => void }) {
  const [range, setRange] = useState<DailyRange>('14');

  const overview  = useQuery(getOverview);
  const daily     = useQuery(() => getDaily(range), [range]);
  const channels  = useQuery(getChannels);
  const regions   = useQuery(getRegions);

  const kpi      = overview.data;
  const dailyPts = daily.data    ?? [];
  const chData   = channels.data ?? [];
  const geoData  = regions.data  ?? [];
  const geoMax   = Math.max(...geoData.map(x => x.total), 1);

  return (
    <>
      <div className="pageHead">
        <div>
          <div className="crumb">Moyo · Children Cardiac Surgery Fund</div>
          <h1>Every shilling, <em>a child&apos;s heartbeat</em></h1>
          <div className="sub">Live overview of contributions to the Moyo fund for children with heart disease.</div>
        </div>
        <div className="head-actions">
          <button className="btn btn-ghost" onClick={() => window.print()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print Report
          </button>
          <button className="btn btn-teal" onClick={onOpenWithdraw}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
            Withdraw Funds
          </button>
        </div>
      </div>

      {/* KPI Hero */}
      <div className="kpi-hero">
        <div className="hero-main">
          <div className="label"><span className="dot"></span>Live Campaign</div>
          <div className="big-amount">
            <span className="cur">TZS</span>
            {kpi ? fmtTZSFull(kpi.raised) : '—'}
          </div>
          <div className="of">raised of <b>TZS {kpi ? fmtTZS(kpi.goal) : '—'}</b> goal</div>
          <div className="progress-wrap">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: (kpi?.pct_funded ?? 0) + '%' }}></div>
            </div>
            <div className="progress-meta">
              <span>{kpi ? kpi.pct_funded.toFixed(1) : '—'}% complete</span>
              <span>{kpi?.days_left ?? '—'} days remaining</span>
            </div>
          </div>
        </div>
        <div className="hero-stat">
          <div className="lbl">Contributors</div>
          <div className="val">{kpi ? kpi.contributors.toLocaleString() : '—'}</div>
          <div className="delta delta-up">↑ {kpi?.weekly_growth_pct ?? '—'}% this week</div>
        </div>
        <div className="hero-stat">
          <div className="lbl">Avg. Contribution</div>
          <div className="val">{kpi ? fmtTZS(kpi.avg_contribution) : '—'}</div>
        </div>
        <div className="hero-stat">
          <div className="lbl">Today</div>
          <div className="val">{kpi ? fmtTZS(kpi.today_total) : '—'}</div>
          <div className="delta delta-up">↑ {kpi?.transactions_per_hour ?? '—'} transactions / hr</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Daily trend chart */}
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Collections trend</h3>
              <div className="sub">Daily contributions across all channels</div>
            </div>
            <div className="seg">
              {RANGES.map(r => (
                <button key={r} className={range === r ? 'active' : ''} onClick={() => setRange(r)}>
                  {RANGE_LABELS[r]}
                </button>
              ))}
            </div>
          </div>
          {daily.loading ? (
            <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13 }}>Loading…</div>
          ) : (
            <ChartCanvas
              type="line"
              height={280}
              data={{
                labels: dailyPts.map(d => d.label),
                datasets: [{
                  data: dailyPts.map(d => d.total),
                  borderColor: '#15B894', borderWidth: 2.5, tension: 0.35, fill: true,
                  backgroundColor: (ctx: { chart: { ctx: CanvasRenderingContext2D } }) => {
                    const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 280);
                    g.addColorStop(0, 'rgba(21,184,148,0.32)');
                    g.addColorStop(1, 'rgba(21,184,148,0)');
                    return g;
                  },
                  pointRadius: 0, pointHoverRadius: 5,
                  pointHoverBackgroundColor: '#15B894', pointHoverBorderColor: '#fff', pointHoverBorderWidth: 2,
                }],
              }}
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: { ...baseTooltip, callbacks: { label: (ctx) => 'TZS ' + fmtTZS(ctx.raw as number) } },
                },
                scales: {
                  y: { ...baseAxis, ticks: { ...baseAxis.ticks, callback: (v) => fmtTZS(v as number) } },
                  x: { ...baseAxis, grid: { display: false } },
                },
                interaction: { intersect: false, mode: 'index' },
              }}
            />
          )}
        </div>

        {/* Available to withdraw */}
        <div className="withdraw-card">
          <div className="lbl">Available to Withdraw</div>
          <div className="avail"><span className="cur">TZS</span>{kpi ? fmtTZSFull(kpi.available) : '—'}</div>
          <div className="desc">Net of {kpi ? fmtTZS(kpi.withdrawn) : '—'} TZS already disbursed</div>
          <button className="btn btn-teal" onClick={onOpenWithdraw}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M5 9l7-7 7 7"/></svg>
            Initiate Withdrawal
          </button>
        </div>
      </div>

      <div className="grid-3">
        {/* Channel doughnut */}
        <div className="card">
          <div className="card-head"><div><h3>By channel</h3><div className="sub">Payment method distribution</div></div></div>
          {channels.loading ? (
            <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13 }}>Loading…</div>
          ) : (
            <>
              <div style={{ width: '100%', height: 160, position: 'relative' }}>
                <ChartCanvas
                  type="doughnut"
                  height={160}
                  data={{
                    labels: chData.map(c => c.channel),
                    datasets: [{
                      data: chData.map(c => c.total),
                      backgroundColor: chData.map(c => CHANNEL_COLORS[c.channel] ?? '#9AA3BD'),
                      borderWidth: 0, spacing: 2,
                    }],
                  }}
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } as never}
                />
              </div>
              <div className="channel-list" style={{ marginTop: 14 }}>
                {chData.map((c, i) => (
                  <div className="channel-row" key={i}>
                    <span className="channel-pip" style={{ background: CHANNEL_COLORS[c.channel] ?? '#9AA3BD' }}></span>
                    <span className="nm">{c.channel}</span>
                    <span className="v">{fmtTZS(c.total)}</span>
                    <span className="pct">{c.pct}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Regional breakdown */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-head"><div><h3>By region</h3><div className="sub">Where contributions originate</div></div></div>
          <div style={{ marginTop: 4 }}>
            {regions.loading ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Loading…</div>
            ) : geoData.map((g, i) => (
              <div className="geo-row" key={i} style={{ borderBottom: '1px solid var(--line-2)', paddingBottom: 9 }}>
                <span className="flag">{g.country ? (REGION_FLAGS[g.country] ?? DEFAULT_FLAG) : DEFAULT_FLAG}</span>
                <span className="nm">{g.region}</span>
                <div className="bar-w"><div className="bar-f" style={{ width: (g.total / geoMax) * 100 + '%' }}></div></div>
                <span className="v" style={{ minWidth: 52 }}>{fmtTZS(g.total)}</span>
                <span style={{ fontSize: 10, color: 'var(--muted)', minWidth: 30, textAlign: 'right', fontFamily: 'var(--mono)' }}>{g.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
