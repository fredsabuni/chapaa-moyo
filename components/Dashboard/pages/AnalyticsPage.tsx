'use client';

import dynamic from 'next/dynamic';
import { useQuery } from '@/lib/useQuery';
import { getChannels, getRegions, getDaily, getSizes } from '@/lib/services/analytics.service';
import { CHANNEL_COLORS, REGION_FLAGS, DEFAULT_FLAG } from '@/lib/constants';
import { fmtTZS, baseAxis, baseTooltip } from '@/lib/utils';

const ChartCanvas = dynamic(() => import('@/components/ChartCanvas'), { ssr: false });

export default function AnalyticsPage() {
  const daily    = useQuery(() => getDaily('14'));
  const channels = useQuery(getChannels);
  const regions  = useQuery(getRegions);
  const sizes    = useQuery(getSizes);

  const geoData  = Array.isArray(regions.data)  ? regions.data  : [];
  const chData   = Array.isArray(channels.data) ? channels.data : [];
  const sizeData = Array.isArray(sizes.data)    ? sizes.data    : [];
  const dailyPts = Array.isArray(daily.data)    ? daily.data    : [];
  const geoMax   = geoData.reduce((m, x) => Math.max(m, x.total), 1);

  return (
    <div>
      <div className="pageHead">
        <div>
          <div className="crumb">Moyo · Heart Surgery Fund</div>
          <h1>Campaign <em>Analytics</em></h1>
          <div className="sub">Deep insights into contribution patterns and reach across Tanzania and beyond.</div>
        </div>
      </div>

      <div className="grid-3">
        {/* Regional breakdown */}
        <div className="card">
          <div className="card-head"><div><h3>By region</h3><div className="sub">Contributions per region</div></div></div>
          {regions.loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Loading…</div>
          ) : (
            <div style={{ marginTop: 4 }}>
              {geoData.map((g, i) => (
                <div className="geo-row" key={i}>
                  <span className="flag">{g.country ? (REGION_FLAGS[g.country] ?? DEFAULT_FLAG) : DEFAULT_FLAG}</span>
                  <span className="nm">{g.region}</span>
                  <div className="bar-w"><div className="bar-f" style={{ width: (g.total / geoMax) * 100 + '%' }}></div></div>
                  <span className="v">{fmtTZS(g.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Channel breakdown */}
        <div className="card">
          <div className="card-head"><div><h3>By channel</h3><div className="sub">Payment method breakdown</div></div></div>
          {channels.loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Loading…</div>
          ) : (
            <div className="channel-list">
              {chData.map((c, i) => (
                <div className="channel-row" key={i}>
                  <span className="channel-pip" style={{ background: CHANNEL_COLORS[c.channel] ?? '#9AA3BD' }}></span>
                  <span className="nm">{c.channel}</span>
                  <span className="v">{fmtTZS(c.total)}</span>
                  <span className="pct">{c.pct}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contribution size distribution */}
        <div className="card">
          <div className="card-head"><div><h3>Contribution size</h3><div className="sub">Distribution of individual contributions</div></div></div>
          {sizes.loading ? (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13 }}>Loading…</div>
          ) : (
            <ChartCanvas
              type="bar"
              height={220}
              data={{
                labels: sizeData.map(s => s.label),
                datasets: [{
                  data: sizeData.map(s => s.count),
                  backgroundColor: '#15B894',
                  borderRadius: { topLeft: 5, topRight: 5, bottomLeft: 0, bottomRight: 0 },
                  borderSkipped: false,
                  maxBarThickness: 32,
                }],
              }}
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: { ...baseTooltip, callbacks: { label: (ctx) => (ctx.raw as number).toLocaleString() + ' contributors' } },
                },
                scales: { y: { ...baseAxis }, x: { ...baseAxis, grid: { display: false } } },
              }}
            />
          )}
        </div>
      </div>

      {/* 14-day trend */}
      <div className="card">
        <div className="card-head"><div><h3>14-day contributions trend</h3><div className="sub">Daily totals across all channels</div></div></div>
        {daily.loading ? (
          <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13 }}>Loading…</div>
        ) : (
          <ChartCanvas
            type="line"
            height={260}
            data={{
              labels: dailyPts.map(d => d.label),
              datasets: [{
                data: dailyPts.map(d => d.total),
                borderColor: '#15B894', borderWidth: 2.5, tension: 0.35, fill: true,
                backgroundColor: (ctx: { chart: { ctx: CanvasRenderingContext2D } }) => {
                  const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 260);
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
    </div>
  );
}
