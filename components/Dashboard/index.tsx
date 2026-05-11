'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { logout } from '@/lib/auth';
import { getUser } from '@/lib/session';
import Overview from './pages/Overview';
import LiveTransactions from './pages/LiveTransactions';
import WithdrawalsPage from './pages/WithdrawalsPage';
import SettingsPage from './pages/SettingsPage';

type Page = 'overview' | 'transactions' | 'withdrawals' | 'settings';

export default function Dashboard({ onOpenWithdraw }: { onOpenWithdraw: () => void }) {
  const router = useRouter();
  const [activePage, setActivePage] = useState<Page>('overview');

  const user = getUser();
  const initials = user?.avatar_initials ?? user?.name?.slice(0, 2).toUpperCase() ?? 'MF';
  const displayName = user?.name ?? 'Moyo Foundation';

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navItem = (page: Page, icon: React.ReactNode, label: string, badge?: string) => (
    <div
      className={`nav-item ${activePage === page ? 'active' : ''}`}
      onClick={() => setActivePage(page)}
    >
      {icon}
      {label}
      {badge && <span className="nav-badge">{badge}</span>}
    </div>
  );

  return (
    <div className="dash-wrap">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Logo /></div>
          <div className="brand-text">
            <div className="nm">Chapaa</div>
            <div className="sub">Partner Console</div>
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-label">Campaign</div>
          {navItem('overview',
            <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
            'Overview'
          )}
          {navItem('transactions',
            <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 12h4l3-9 4 18 3-9h4"/></svg>,
            'Live Transactions'
          )}
          {navItem('withdrawals',
            <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2v20M2 12h20"/></svg>,
            'Disbursements'
          )}
        </div>

        <div className="nav-section">
          <div className="nav-label">Account</div>
          {navItem('settings',
            <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
            'Settings'
          )}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link
            href="/"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 500, textDecoration: 'none', transition: 'all 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            View public page
          </Link>

          <div className="sidebar-foot">
            <div className="avatar">{initials}</div>
            <div style={{ flex: 1 }}>
              <div className="nm">{displayName}</div>
              <div className="role">Verified partner</div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--rose)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </div>
      </aside>

      <main className="main">
        {activePage === 'overview'      && <Overview onOpenWithdraw={onOpenWithdraw} />}
        {activePage === 'transactions'  && <LiveTransactions />}
        {activePage === 'withdrawals'   && <WithdrawalsPage />}
        {activePage === 'settings'      && <SettingsPage />}
      </main>
    </div>
  );
}
