'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  RAISED, GOAL, PCT, AVAILABLE, WITHDRAWN, CONTRIBUTORS, DAYS_LEFT,
  dailyData, channelData, geoData, recentWithdrawals,
} from '@/lib/data';
import { fmtTZS, fmtTZSFull, baseAxis, baseTooltip } from '@/lib/utils';

const ChartCanvas = dynamic(() => import('@/components/ChartCanvas'), { ssr: false });

export default function Overview({ onOpenWithdraw }: { onOpenWithdraw: () => void }) {
  const [range, setRange] = useState('14d');

  const slicedData = range === '7d' ? dailyData.slice(-7)
    : range === '14d' ? dailyData.slice(-14)
    : range === '30d' ? dailyData
    : dailyData;

  const geoMax = Math.max(...geoData.map(x => x.value));

  return (
    <>
      <div className="pageHead">
        <div>
          <div className="crumb">Moyo · Children Cardiac Surgery Fund</div>
          <h1>Every shilling, <em>a child&apos;s heartbeat</em></h1>
          <div className="sub">Live overview of contributions to the Moyo fund for children with heart disease — each contribution funds life-saving cardiac surgery.</div>
        </div>
        <div className="head-actions">
          <button className="btn btn-ghost" onClick={() => window.print()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print Report
          </button>
          <button className="btn btn-ghost">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
          <button className="btn btn-teal" onClick={onOpenWithdraw}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
            Withdraw Funds
          </button>
        </div>
      </div>

      <div className="kpi-hero">
        <div className="hero-main">
          <div className="label"><span className="dot"></span>Live Campaign</div>
          <div className="big-amount"><span className="cur">TZS</span>{fmtTZSFull(RAISED)}</div>
          <div className="of">raised of <b>TZS {fmtTZS(GOAL)}</b> goal</div>
          <div className="progress-wrap">
            <div className="progress-bar"><div className="progress-fill" style={{ width: PCT + '%' }}></div></div>
            <div className="progress-meta">
              <span>{PCT.toFixed(1)}% complete</span>
              <span>{DAYS_LEFT} days remaining</span>
            </div>
          </div>
        </div>
        <div className="hero-stat">
          <div className="lbl">Contributors</div>
          <div className="val">{CONTRIBUTORS.toLocaleString()}</div>
          <div className="delta delta-up">↑ 12.4% this week</div>
        </div>
        <div className="hero-stat">
          <div className="lbl">Avg. Contribution</div>
          <div className="val">143K</div>
          <div className="delta delta-up">↑ 8.2% vs last week</div>
        </div>
        <div className="hero-stat">
          <div className="lbl">Today</div>
          <div className="val">102.4M</div>
          <div className="delta delta-up">↑ 14 transactions / hr</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Collections trend</h3>
              <div className="sub">Daily contributions across all channels</div>
            </div>
            <div className="seg">
              {['7d', '14d', '30d', 'all'].map(r => (
                <button key={r} className={range === r ? 'active' : ''} onClick={() => setRange(r)}>
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <ChartCanvas
            type="line"
            height={280}
            data={{
              labels: slicedData.map(d => d.d),
              datasets: [{
                data: slicedData.map(d => d.v),
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
        </div>

        <div className="withdraw-card">
          <div className="lbl">Available to Withdraw</div>
          <div className="avail"><span className="cur">TZS</span>{fmtTZSFull(AVAILABLE)}</div>
          <div className="desc">Net of {fmtTZS(WITHDRAWN)} TZS already disbursed</div>
          <button className="btn btn-teal" onClick={onOpenWithdraw}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M5 9l7-7 7 7"/></svg>
            Initiate Withdrawal
          </button>
          <div className="recent">
            <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', fontWeight: 600, marginBottom: 8 }}>Recent payouts</div>
            {recentWithdrawals.map((w, i) => (
              <div className="recent-row" key={i}>
                <div>
                  <span className="r">{fmtTZS(w.amount)}</span>
                  <span className={`badge ${w.status === 'paid' ? 'badge-paid' : 'badge-pend'}`}>{w.status}</span>
                </div>
                <div className="l">{w.date} · {w.ref}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-3">
        <div className="card">
          <div className="card-head"><div><h3>By channel</h3><div className="sub">Payment method distribution</div></div></div>
          <div style={{ width: '100%', height: 160, position: 'relative' }}>
            <ChartCanvas
              type="doughnut"
              height={160}
              data={{
                labels: channelData.map(c => c.name),
                datasets: [{ data: channelData.map(c => c.value), backgroundColor: channelData.map(c => c.color), borderWidth: 0, spacing: 2 }],
              }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } as never}
            />
          </div>
          <div className="channel-list" style={{ marginTop: 14 }}>
            {channelData.map((c, i) => (
              <div className="channel-row" key={i}>
                <span className="channel-pip" style={{ background: c.color }}></span>
                <span className="nm">{c.name}</span>
                <span className="v">{fmtTZS(c.value)}</span>
                <span className="pct">{c.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-head"><div><h3>By region</h3><div className="sub">Where contributions originate</div></div></div>
          <div style={{ marginTop: 4 }}>
            {geoData.map((g, i) => (
              <div className="geo-row" key={i} style={{ borderBottom: '1px solid var(--line-2)', paddingBottom: 9 }}>
                <span className="flag">{g.flag}</span>
                <span className="nm">{g.name}</span>
                <div className="bar-w"><div className="bar-f" style={{ width: (g.value / geoMax) * 100 + '%' }}></div></div>
                <span className="v" style={{ minWidth: 52 }}>{fmtTZS(g.value)}</span>
                <span style={{ fontSize: 10, color: 'var(--muted)', minWidth: 30, textAlign: 'right', fontFamily: 'var(--mono)' }}>{g.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
