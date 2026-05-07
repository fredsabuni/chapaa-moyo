'use client';

import { contributors, CONTRIBUTORS } from '@/lib/data';
import { fmtTZSFull } from '@/lib/utils';

const regions = ['Dar es Salaam', 'Arusha', 'Dodoma', 'Mwanza', 'Diaspora', 'Kenya'];

const allContribs = [
  ...contributors,
  { id: 9,  name: 'Halima Mtoro',   handle: '@halimat',   avatar: 'HM', vc: 1, amount: 450000,   count: 5,  channel: 'M-Pesa',    color: '#15B894', when: '6 hours ago', region: 'Arusha' },
  { id: 10, name: 'Patrick Ngowi',  handle: '@patrickn',  avatar: 'PN', vc: 2, amount: 2000000,  count: 2,  channel: 'Bank',      color: '#0B1330', when: '7 hours ago', region: 'Dar es Salaam' },
  { id: 11, name: 'Zawadi Msuya',   handle: '@zawadim',   avatar: 'ZM', vc: 3, amount: 100000,   count: 8,  channel: 'Tigo Pesa', color: '#1FD1A8', when: '8 hours ago', region: 'Mwanza' },
  { id: 12, name: 'CCBRT Hospital', handle: 'Partner org',avatar: 'CC', vc: 4, amount: 75000000, count: 1,  channel: 'Bank',      color: '#0B1330', when: '9 hours ago', region: 'Dar es Salaam' },
].map((c, i) => ({ ...c, region: c.region ?? regions[i % 6] }));

export default function ContributorsPage() {
  return (
    <div>
      <div className="pageHead">
        <div>
          <div className="crumb">Moyo · Heart Surgery Fund</div>
          <h1>Our <em>Contributors</em></h1>
          <div className="sub">Every person here is helping a child with a heart condition get the surgery they need.</div>
        </div>
      </div>
      <div className="kpi-hero" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
        <div className="hero-main">
          <div className="label"><span className="dot"></span>All-time contributors</div>
          <div className="big-amount">{CONTRIBUTORS.toLocaleString()}</div>
          <div className="of">from <b>8 countries &amp; regions</b></div>
        </div>
        <div className="hero-stat"><div className="lbl">First-time</div><div className="val">8,241</div><div className="delta delta-up">↑ 64.2%</div></div>
        <div className="hero-stat"><div className="lbl">Returning</div><div className="val">4,606</div><div className="delta delta-up">↑ 35.8%</div></div>
        <div className="hero-stat"><div className="lbl">Corporates</div><div className="val">47</div><div className="delta delta-flat">→ stable</div></div>
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-head">
          <div><h3>All contributors</h3><div className="sub">Sorted by most recent contribution</div></div>
        </div>
        <table className="table">
          <thead>
            <tr><th>Contributor</th><th>Region</th><th>Channel</th><th>Contributions</th><th>Last activity</th><th>Total amount</th></tr>
          </thead>
          <tbody>
            {allContribs.map(c => (
              <tr key={c.id}>
                <td>
                  <div className="contrib">
                    <div className={`contrib-avatar v${c.vc}`}>{c.avatar}</div>
                    <div>
                      <div className="contrib-name">{c.name}</div>
                      <div className="contrib-meta">{c.handle}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: 12, color: 'var(--muted)' }}>{c.region}</td>
                <td>
                  <span className="channel-tag">
                    <span className="pip" style={{ background: c.color }}></span>
                    {c.channel}
                  </span>
                </td>
                <td>{c.count}</td>
                <td style={{ color: 'var(--muted)', fontSize: 12 }}>{c.when}</td>
                <td className="amount-cell">TZS {fmtTZSFull(c.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
