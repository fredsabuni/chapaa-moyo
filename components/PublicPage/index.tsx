'use client';

import dynamic from 'next/dynamic';
import Logo from '@/components/Logo';
import { RAISED, GOAL, PCT, CONTRIBUTORS, DAYS_LEFT, contributors, geoData, dailyData } from '@/lib/data';
import { fmtTZS, fmtTZSFull, baseAxis, baseTooltip } from '@/lib/utils';

const ChartCanvas = dynamic(() => import('@/components/ChartCanvas'), { ssr: false });

const topDonors = contributors.filter(c => c.name !== 'Anonymous Donor').slice(0, 8);

export default function PublicPage() {
  const geoMax = Math.max(...geoData.map(x => x.value));

  return (
    <div className="pub-wrap">
      <nav className="pub-nav">
        <div className="brand">
          <div className="brand-mark"><Logo /></div>
          <div className="brand-text">
            <div className="nm" style={{ color: 'var(--ink)' }}>Chapaa</div>
            <div className="sub" style={{ color: 'var(--teal)' }}>Moyo</div>
          </div>
        </div>
        <div className="nav-links">
          <a>About</a><a>Campaign</a><a>Updates</a><a>Donors</a>
        </div>
        <button className="btn btn-teal">Support a child</button>
      </nav>

      <section className="pub-hero">
        <div className="pub-hero-inner">
          <div>
            <div className="tag"><span className="live-dot"></span>Live · Updated 2 mins ago</div>
            <h1>For children whose <em>hearts need help.</em></h1>
            <p className="lede">
              Moyo is a nationwide cause funding life-saving cardiac surgery for Tanzanian children born with heart disease. Every contribution — however small — brings another child closer to a healthy heartbeat.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
              <button className="btn btn-teal" style={{ padding: '13px 22px' }}>Support a child</button>
              <button className="btn" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', backdropFilter: 'blur(8px)', padding: '13px 22px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Watch story
              </button>
            </div>
          </div>

          <div className="pub-stats">
            <div className="lbl">Total raised so far</div>
            <div className="raised"><span className="cur">TZS</span>{fmtTZSFull(RAISED)}</div>
            <div className="of">of <b>TZS {fmtTZS(GOAL)}</b> goal</div>
            <div className="progress-wrap">
              <div className="progress-bar"><div className="progress-fill" style={{ width: PCT + '%' }}></div></div>
              <div className="progress-meta">
                <span>{PCT.toFixed(1)}% funded</span>
                <span>{DAYS_LEFT} days left</span>
              </div>
            </div>
            <div className="pub-mini-stats">
              <div className="mini-stat">
                <div className="v">{(CONTRIBUTORS / 1000).toFixed(1)}K</div>
                <div className="l">Contributors</div>
              </div>
              <div className="mini-stat">
                <div className="v">142</div>
                <div className="l">Children helped</div>
              </div>
              <div className="mini-stat">
                <div className="v">{DAYS_LEFT}</div>
                <div className="l">Days left</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pub-section">
        <div className="pub-section-inner">
          <h2>Campaign <em>at a glance</em></h2>
          <p className="sec-sub">Transparency is at the heart of Moyo. Every shilling is accounted for — updated in real time as new contributions arrive to fund children&apos;s cardiac surgeries.</p>

          <div className="pub-cards-grid">
            <div className="pub-stat-card">
              <div className="ico-bg"></div>
              <div className="ico"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></div>
              <div className="v">{(RAISED / 1e9).toFixed(2)}B</div>
              <div className="l">TZS raised</div>
              <div className="delta">↑ 12.4% this week</div>
            </div>
            <div className="pub-stat-card">
              <div className="ico-bg"></div>
              <div className="ico"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
              <div className="v">{CONTRIBUTORS.toLocaleString()}</div>
              <div className="l">Caring contributors</div>
              <div className="delta">↑ 487 this week</div>
            </div>
            <div className="pub-stat-card">
              <div className="ico-bg"></div>
              <div className="ico"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
              <div className="v">142</div>
              <div className="l">Surgeries funded</div>
              <div className="delta">3 this week</div>
            </div>
          </div>

          <div className="pub-graph-grid">
            <div className="card">
              <div className="card-head"><div><h3>Daily contributions</h3><div className="sub">Last 14 days</div></div></div>
              <ChartCanvas
                type="line"
                height={280}
                data={{
                  labels: dailyData.map(d => d.d),
                  datasets: [{
                    data: dailyData.map(d => d.v),
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
            <div className="card">
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
        </div>
      </section>

      <section className="pub-section alt">
        <div className="pub-section-inner">
          <h2>Voices of <em>compassion</em></h2>
          <p className="sec-sub">These are the people making children&apos;s heart surgeries possible. Every contribution here has a child&apos;s name behind it.</p>
          <div className="donor-wall">
            {topDonors.map(d => (
              <div className="donor-tile" key={d.id}>
                <div className={`contrib-avatar v${d.vc}`}>{d.avatar}</div>
                <div>
                  <div className="nm">{d.name}</div>
                  <div className="am">TZS {fmtTZS(d.amount)}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <button className="btn btn-ghost" style={{ padding: '12px 22px' }}>View all contributors →</button>
          </div>
        </div>
      </section>

      <footer className="pub-footer">
        <div className="pub-footer-inner">
          <div className="brand">
            <div className="brand-mark"><Logo /></div>
            <div className="brand-text">
              <div className="nm">Chapaa</div>
              <div className="sub" style={{ color: 'var(--teal-light)' }}>Cause contributions for children</div>
            </div>
          </div>
          <div className="links">
            <a>Terms</a><a>Privacy</a><a>Contact</a><a>Press</a>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>© 2026 Chapaa · Powered by Moyo Foundation</div>
        </div>
      </footer>
    </div>
  );
}
