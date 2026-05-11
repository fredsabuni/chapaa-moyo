'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@/lib/useQuery';
import { getOverview } from '@/lib/services/dashboard.service';
import { getChannels } from '@/lib/services/analytics.service';
import { getTransactionStats, listTransactions } from '@/lib/services/transactions.service';
import { getCampaign } from '@/lib/session';
import { CHANNEL_COLORS } from '@/lib/constants';
import { fmtTZS, fmtTZSFull, baseAxis, baseTooltip } from '@/lib/utils';
import type { Transaction } from '@/lib/types';

const ChartCanvas = dynamic(() => import('@/components/ChartCanvas'), { ssr: false });

const RANGES = [7, 14, 30] as const;
type Range = typeof RANGES[number];

function buildDailyFromTransactions(txs: Transaction[], days: number) {
  const result: { label: string; total: number }[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateKey = d.toLocaleDateString('en-CA'); // YYYY-MM-DD
    const label   = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const total   = txs
      .filter(t => t.status === 'SUCCESS' && new Date(t.created_at).toLocaleDateString('en-CA') === dateKey)
      .reduce((s, t) => s + (t.amount ?? 0), 0);
    result.push({ label, total });
  }
  return result;
}

export default function Overview({ onOpenWithdraw }: { onOpenWithdraw: () => void }) {
  const [range, setRange] = useState<Range>(14);

  const overview  = useQuery(getOverview);
  const channels  = useQuery(getChannels);
  const txForChart = useQuery(() => listTransactions({ limit: 500, page: 1 }), []);
  const txStats   = useQuery(getTransactionStats);

  const kpi   = overview.data;
  const tx    = txStats.data;
  const camp  = getCampaign();

  const chData    = Array.isArray(channels.data) ? channels.data : [];
  const txItems   = txForChart.data?.items ?? [];
  const dailyPts  = txItems.length > 0
    ? buildDailyFromTransactions(txItems, range)
    : [];

  // Derive each KPI: live overview → session campaign → computed fallback
  const kpiRaised    = kpi?.raised             ?? kpi?.total_raised   ?? camp?.total_raised   ?? 0;
  const kpiGoal      = kpi?.goal               ?? kpi?.target_amount  ?? camp?.target_amount  ?? 0;
  const kpiPct       = kpi?.pct_funded         ?? kpi?.percent_funded ?? camp?.percent_funded ?? (kpiGoal > 0 ? (kpiRaised / kpiGoal) * 100 : 0);
  const kpiContrib   = kpi?.contributors       ?? chData.reduce((s, c) => s + (c.count ?? 0), 0);
  const kpiAvg       = kpi?.avg_contribution   ?? (kpiContrib > 0 ? Math.round(kpiRaised / kpiContrib) : null);
  const kpiTodayTotal  = kpi?.today_total      ?? tx?.today_total      ?? 0;
  const kpiTxPerHour   = kpi?.transactions_per_hour ?? tx?.last_hour_count ?? 0;
  const kpiWeekly      = kpi?.weekly_growth_pct ?? null;
  const kpiDaysLeft    = kpi?.days_left        ?? (() => {
    if (!camp?.end_date) return null;
    const diff = Math.ceil((new Date(camp.end_date).getTime() - Date.now()) / 86_400_000);
    return diff > 0 ? diff : 0;
  })();

  const isLoaded = !overview.loading;

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
            {isLoaded ? fmtTZSFull(kpiRaised) : '—'}
          </div>
          <div className="of">raised of <b>TZS {isLoaded ? fmtTZS(kpiGoal) : '—'}</b> goal</div>
          <div className="progress-wrap">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: Math.min(kpiPct, 100) + '%' }}></div>
            </div>
            <div className="progress-meta">
              <span>{isLoaded ? kpiPct.toFixed(1) : '—'}% complete</span>
              <span>{kpiDaysLeft != null ? kpiDaysLeft : '—'} days remaining</span>
            </div>
          </div>
        </div>
        <div className="hero-stat">
          <div className="lbl">Contributors</div>
          <div className="val">{kpiContrib > 0 ? kpiContrib.toLocaleString() : (isLoaded ? '0' : '—')}</div>
          {kpiWeekly != null && <div className="delta delta-up">↑ {kpiWeekly}% this week</div>}
        </div>
        <div className="hero-stat">
          <div className="lbl">Avg. Contribution</div>
          <div className="val">{isLoaded ? (kpiAvg != null ? fmtTZSFull(kpiAvg) : '—') : '—'}</div>
        </div>
        <div className="hero-stat">
          <div className="lbl">Today</div>
          <div className="val">{fmtTZS(kpiTodayTotal)}</div>
          <div className="delta delta-up">↑ {kpiTxPerHour} transactions / hr</div>
        </div>
      </div>

      {/* Collections trend — full width */}
      <div className="card">
        <div className="card-head">
          <div>
            <h3>Collections trend</h3>
            <div className="sub">Daily contributions across all channels</div>
          </div>
          <div className="seg">
            {RANGES.map(r => (
              <button key={r} className={range === r ? 'active' : ''} onClick={() => setRange(r)}>
                {r}D
              </button>
            ))}
          </div>
        </div>
        {txForChart.loading ? (
          <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13 }}>Loading…</div>
        ) : dailyPts.length === 0 ? (
          <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13 }}>No data for this period.</div>
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

      {/* Channel breakdown */}
      <div className="card" style={{ marginTop: 20 }}>
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
    </>
  );
}
