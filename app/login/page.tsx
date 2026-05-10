'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { isAuthed } from '@/lib/auth';
import { loginUser } from '@/lib/services/auth.service';
import { ApiError } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { getPublicCampaign, getTopDonors } from '@/lib/services/public.service';
import { fmtTZS } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode]         = useState<'email' | 'phone'>('email');
  const [credential, setCred]   = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const campaign = useQuery(() => getPublicCampaign('moyo'));
  const donors   = useQuery(() => getTopDonors('moyo', 1, 1));
  const c = campaign.data;
  const raised       = c?.total_raised ?? 0;
  const pctFunded    = c?.pct_funded ?? (c?.target_amount ? (raised / c.target_amount) * 100 : 0);
  const contributors = c?.contributors ?? donors.data?.meta?.total;
  const blurb = (() => {
    const full = c?.description ?? 'Funding life-saving cardiac surgery for Tanzanian children born with heart disease.';
    return full.length > 100 ? full.slice(0, 97).trimEnd() + '…' : full;
  })();

  useEffect(() => {
    if (isAuthed()) router.replace('/dashboard');
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginUser(credential.trim(), password);
      router.push('/dashboard');
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setError('Email/phone or password is incorrect.');
      } else {
        setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">
          <div className="brand-mark" style={{ width: 44, height: 44, borderRadius: 13 }}>
            <Logo size={24} />
          </div>
          <div className="login-brand-text">
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--ink)' }}>Chapaa</div>
            <div style={{ fontSize: 11, color: 'var(--teal)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>Partner Console</div>
          </div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <h1 className="login-title">Welcome back</h1>
          <p className="login-sub">Sign in to manage your Moyo campaign</p>
        </div>

        <div className="login-toggle">
          <button
            type="button"
            className={mode === 'email' ? 'active' : ''}
            onClick={() => { setMode('email'); setCred(''); setError(''); }}
          >
            Email
          </button>
          <button
            type="button"
            className={mode === 'phone' ? 'active' : ''}
            onClick={() => { setMode('phone'); setCred(''); setError(''); }}
          >
            Phone number
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="login-field">
            <label>{mode === 'email' ? 'Email address' : 'Phone number'}</label>
            {mode === 'phone' ? (
              <div className="phone-input-wrap">
                <span className="phone-prefix">🇹🇿 +255</span>
                <input
                  type="tel"
                  placeholder="700 000 000"
                  value={credential.replace(/^\+?255\s?/, '')}
                  onChange={e => setCred('+255' + e.target.value)}
                  autoComplete="tel"
                  required
                />
              </div>
            ) : (
              <input
                type="email"
                placeholder="you@example.com"
                value={credential}
                onChange={e => { setCred(e.target.value); setError(''); }}
                autoComplete="email"
                required
              />
            )}
          </div>

          <div className="login-field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
              <label style={{ margin: 0 }}>Password</label>
              <a className="forgot-link" href="#">Forgot password?</a>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                autoComplete="current-password"
                required
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                className="pass-toggle"
                onClick={() => setShowPass(v => !v)}
                tabIndex={-1}
              >
                {showPass ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="login-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <span className="login-spinner"></span>
            ) : (
              <>
                Sign in
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <Link href="/">← Back to public page</Link>
        </div>
      </div>

      <div className="login-side">
        <div className="login-side-inner">
          <div className="login-quote">
            <div className="login-quote-mark">"</div>
            <p>{blurb}</p>
            <div className="login-quote-author">
              <div className="contrib-avatar v2" style={{ width: 36, height: 36, fontSize: 12 }}>
                {c?.organisation ? c.organisation.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'MF'}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{c?.organisation ?? 'Moyo Foundation'}</div>
                <div style={{ fontSize: 11, color: 'var(--teal-2)', marginTop: 2 }}>{c?.name ?? 'Children Cardiac Surgery Fund'}</div>
              </div>
            </div>
          </div>
          <div className="login-stats-grid">
            <div className="login-stat">
              <div className="login-stat-v">{campaign.loading ? '…' : (raised ? fmtTZS(raised) : '—')}</div>
              <div className="login-stat-l">TZS raised</div>
            </div>
            <div className="login-stat">
              <div className="login-stat-v">{campaign.loading && donors.loading ? '…' : (contributors?.toLocaleString() ?? '—')}</div>
              <div className="login-stat-l">Contributors</div>
            </div>
            <div className="login-stat">
              <div className="login-stat-v">{campaign.loading ? '…' : (pctFunded ? pctFunded.toFixed(1) + '%' : '—')}</div>
              <div className="login-stat-l">Goal reached</div>
            </div>
            <div className="login-stat">
              <div className="login-stat-v">{campaign.loading ? '…' : (c?.days_left ?? '—')}</div>
              <div className="login-stat-l">Days remaining</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
