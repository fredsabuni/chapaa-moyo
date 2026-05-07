'use client';

import dynamic from 'next/dynamic';
import { geoData, channelData, dailyData } from '@/lib/data';
import { fmtTZS, baseAxis, baseTooltip } from '@/lib/utils';

const ChartCanvas = dynamic(() => import('@/components/ChartCanvas'), { ssr: false });

export default function AnalyticsPage() {
  const geoMax = Math.max(...geoData.map(x => x.value));

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
        <div className="card">
          <div className="card-head"><div><h3>By region</h3><div className="sub">Contributions per region</div></div></div>
          <div style={{ marginTop: 4 }}>
            {geoData.map((g, i) => (
              <div className="geo-row" key={i}>
                <span className="flag">{g.flag}</span>
                <span className="nm">{g.name}</span>
                <div className="bar-w"><div className="bar-f" style={{ width: (g.value / geoMax) * 100 + '%' }}></div></div>
                <span className="v">{fmtTZS(g.value)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-head"><div><h3>By channel</h3><div className="sub">Payment method breakdown</div></div></div>
          <div className="channel-list">
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
        <div className="card">
          <div className="card-head"><div><h3>Contribution size</h3><div className="sub">Distribution of individual contributions</div></div></div>
          <ChartCanvas
            type="bar"
            height={220}
            data={{
              labels: ['< 10K', '10–50K', '50–200K', '200K–1M', '> 1M'],
              datasets: [{
                data: [2841, 4218, 3102, 1987, 699],
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
        </div>
      </div>
      <div className="card">
        <div className="card-head"><div><h3>14-day contributions trend</h3><div className="sub">Daily totals across all channels</div></div></div>
        <ChartCanvas
          type="line"
          height={260}
          data={{
            labels: dailyData.map(d => d.d),
            datasets: [{
              data: dailyData.map(d => d.v),
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
      </div>
    </div>
  );
}
