'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from '@/components/Dashboard';
import WithdrawModal from '@/components/WithdrawModal';
import { isAuthed } from '@/lib/auth';

export default function DashboardPage() {
  const router = useRouter();
  const [checked, setChecked]       = useState(false);
  const [withdrawOpen, setWithdraw] = useState(false);

  useEffect(() => {
    if (!isAuthed()) {
      router.replace('/login');
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
        <div className="login-spinner" style={{ width: 28, height: 28, borderWidth: 3 }}></div>
      </div>
    );
  }

  return (
    <>
      <Dashboard onOpenWithdraw={() => setWithdraw(true)} />
      <WithdrawModal open={withdrawOpen} onClose={() => setWithdraw(false)} />
    </>
  );
}
