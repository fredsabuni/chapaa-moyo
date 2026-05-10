'use client';

import dynamic from 'next/dynamic';
import Logo from '@/components/Logo';
import { useQuery } from '@/lib/useQuery';
import { getPublicCampaign, getTopDonors } from '@/lib/services/public.service';
import { fmtTZS, fmtTZSFull, baseAxis, baseTooltip } from '@/lib/utils';

const ChartCanvas = dynamic(() => import('@/components/ChartCanvas'), { ssr: false });

const SLUG = 'moyo';

function relativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

// Skeleton block reused throughout loading state
function Skeleton({ w, h }: { w: string | number; h: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: 8,
      background: 'rgba(255,255,255,0.06)',
      animation: 'pulse 1.6s ease-in-out infinite',
    }} />
  );
}

export default function PublicPage() {
  const campaign = useQuery(() => getPublicCampaign(SLUG));
  const donors   = useQuery(() => getTopDonors(SLUG, 1, 50));

  const c        = campaign.data;
  const donorList = donors.data?.items ?? [];

  const raised    = c?.total_raised    ?? 0;
  const goal      = c?.target_amount   ?? 0;
  const remaining = c?.remaining_amount ?? (goal - raised);
  const pctFunded = c?.pct_funded      ?? (goal > 0 ? (raised / goal) * 100 : 0);

  // Build last-7-days chart from donor data
  const now     = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const weekLabels: string[] = [];
  for (let i = 6; i >= 0; i--) {
    weekLabels.push(new Date(now - i * 24 * 60 * 60 * 1000)
      .toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }
  const dailyTotals = Object.fromEntries(weekLabels.map(l => [l, 0]));
  donorList.forEach(d => {
    if (new Date(d.created_at).getTime() >= weekAgo) {
      const lbl = new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (lbl in dailyTotals) dailyTotals[lbl] += d.amount;
    }
  });
  const computedChart = weekLabels.map(label => ({ label, total: dailyTotals[label] }));

  // Contributors seen this week from fetched donor list
  const thisWeekContributors = donorList.filter(
    d => new Date(d.created_at).getTime() >= weekAgo,
  ).length;
  const totalDonors = donors.data?.meta?.total ?? 0;

  return (
    <div className="pub-wrap">
      {/* ── Nav ──────────────────────────────────────────────────────────────── */}
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

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="pub-hero">
        <div className="pub-hero-inner">
          <div>
            <div className="tag">
              <span className="live-dot"></span>
              Live ·{' '}
              {c ? `Updated ${relativeTime(c.last_updated)}` : 'Loading…'}
            </div>
            <h1>For children whose <em>hearts need help.</em></h1>
            <p className="lede">
              {c?.description ?? 'Moyo is a nationwide cause funding life-saving cardiac surgery for Tanzanian children born with heart disease. Every contribution — however small — brings another child closer to a healthy heartbeat.'}
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
              <button className="btn btn-teal" style={{ padding: '13px 22px' }}>Support a child</button>
              <button className="btn" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', backdropFilter: 'blur(8px)', padding: '13px 22px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Watch story
              </button>
            </div>
          </div>

          {/* ── Stats card ─────────────────────────────────────────────────── */}
          <div className="pub-stats">
            <div className="lbl">Total raised so far</div>

            {campaign.loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
                <Skeleton w="80%" h={52} />
                <Skeleton w="60%" h={18} />
                <Skeleton w="100%" h={8} />
                <div style={{ display: 'flex', gap: 12 }}>
                  <Skeleton w="30%" h={48} />
                  <Skeleton w="30%" h={48} />
                  <Skeleton w="30%" h={48} />
                </div>
              </div>
            ) : (
              <>
                <div className="raised"><span className="cur">TZS</span>{fmtTZSFull(raised)}</div>
                <div className="of">of <b>TZS {fmtTZS(goal)}</b> goal · <span style={{ color: 'var(--teal)' }}>TZS {fmtTZS(remaining)} remaining</span></div>
                <div className="progress-wrap">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: Math.min(pctFunded, 100) + '%' }}></div>
                  </div>
                  <div className="progress-meta">
                    <span>{pctFunded.toFixed(1)}% funded</span>
                    <span>{c?.days_left ?? '—'} days left</span>
                  </div>
                </div>
                <div className="pub-mini-stats">
                  <div className="mini-stat">
                    <div className="v">
                      {c?.contributors != null
                        ? (c.contributors >= 1000
                          ? (c.contributors / 1000).toFixed(1) + 'K'
                          : c.contributors.toLocaleString())
                        : '—'}
                    </div>
                    <div className="l">Contributors</div>
                  </div>
                  <div className="mini-stat">
                    <div className="v">{c?.surgeries_funded ?? '—'}</div>
                    <div className="l">Children helped</div>
                  </div>
                  <div className="mini-stat">
                    <div className="v">{c?.days_left ?? '—'}</div>
                    <div className="l">Days left</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── At a glance ──────────────────────────────────────────────────────── */}
      <section className="pub-section">
        <div className="pub-section-inner">
          <h2>Campaign <em>at a glance</em></h2>
          <p className="sec-sub">Transparency is at the heart of Moyo. Every shilling is accounted for — updated in real time as new contributions arrive to fund children&apos;s cardiac surgeries.</p>

          <div className="pub-cards-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <div className="pub-stat-card">
              <div className="ico-bg"></div>
              <div className="ico">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </div>
              {campaign.loading ? <Skeleton w="70%" h={36} /> : (
                <>
                  <div className="v">{raised ? fmtTZS(raised) : '—'}</div>
                  <div className="l">TZS raised</div>
                  <div className="delta">↑ {c?.stats?.weekly_growth_pct ?? '—'}% this week</div>
                </>
              )}
            </div>

            <div className="pub-stat-card">
              <div className="ico-bg"></div>
              <div className="ico">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              {donors.loading ? <Skeleton w="70%" h={36} /> : (
                <>
                  <div className="v">{thisWeekContributors}</div>
                  <div className="l">Contributors this week</div>
                  <div className="delta">{totalDonors.toLocaleString()} total contributors</div>
                </>
              )}
            </div>
          </div>

          {/* ── Chart ────────────────────────────────────────────────────────── */}
          <div className="card" style={{ marginTop: 24 }}>
            <div className="card-head">
              <div>
                <h3>Daily contributions</h3>
                <div className="sub">Last 7 days · from contributor activity</div>
              </div>
            </div>
            {donors.loading ? (
              <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13 }}>Loading…</div>
            ) : (
              <ChartCanvas
                type="line"
                height={280}
                data={{
                  labels: computedChart.map(d => d.label),
                  datasets: [{
                    data: computedChart.map(d => d.total),
                    borderColor: '#15B894', borderWidth: 2.5, tension: 0.35, fill: true,
                    backgroundColor: (ctx: { chart: { ctx: CanvasRenderingContext2D } }) => {
                      const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 280);
                      g.addColorStop(0, 'rgba(21,184,148,0.32)');
                      g.addColorStop(1, 'rgba(21,184,148,0)');
                      return g;
                    },
                    pointRadius: 3, pointHoverRadius: 6,
                    pointBackgroundColor: '#15B894', pointBorderColor: '#fff', pointBorderWidth: 2,
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
      </section>

      {/* ── Donor wall ───────────────────────────────────────────────────────── */}
      <section className="pub-section alt">
        <div className="pub-section-inner">
          <h2>Voices of <em>compassion</em></h2>
          <p className="sec-sub">These are the people making children&apos;s heart surgeries possible. Every contribution here has a child&apos;s name behind it.</p>

          <div className="donor-wall">
            {donors.loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div className="donor-tile" key={i}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%' }}>
                    <Skeleton w={44} h={44} />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <Skeleton w="70%" h={14} />
                    <Skeleton w="50%" h={12} />
                  </div>
                </div>
              ))
            ) : donorList.map((d, i) => {
              const initials = d.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
              return (
                <div className="donor-tile" key={i}>
                  <div className={`contrib-avatar v${(i % 4) + 1}`}>{initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="nm">{d.name}</div>
                    <div className="am">TZS {d.amount != null ? d.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{relativeTime(d.created_at)}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {donors.data?.meta?.has_more && (
            <div style={{ textAlign: 'center', marginTop: 36 }}>
              <button className="btn btn-ghost" style={{ padding: '12px 22px' }}>
                View all {c?.contributors?.toLocaleString() ?? ''} contributors →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="pub-footer">
        <div className="pub-footer-inner">
          <div className="brand">
            <div className="brand-mark"><Logo /></div>
            <div className="brand-text">
              <div className="nm">Chapaa</div>
              <div className="sub" style={{ color: 'var(--teal-light)' }}>
                {c?.organisation ?? 'Cause contributions for children'}
              </div>
            </div>
          </div>
          <div className="links">
            <a>Terms</a><a>Privacy</a><a>Contact</a><a>Press</a>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
            © 2026 Chapaa · Powered by {c?.organisation ?? 'Moyo Foundation'}
          </div>
        </div>
      </footer>
    </div>
  );
}
