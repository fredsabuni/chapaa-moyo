'use client';

import { useState } from 'react';
import { useQuery, useListQuery, useMutation } from '@/lib/useQuery';
import { getOverview } from '@/lib/services/dashboard.service';
import { listDisbursements, initiateDisbursement } from '@/lib/services/disbursements.service';
import { listPaymentAccounts } from '@/lib/services/paymentAccounts.service';
import { STATUS_COLORS, DISBURSEMENT_PAGE_LIMIT } from '@/lib/constants';
import { fmtTZS, fmtTZSFull } from '@/lib/utils';
import DisbursementOtpModal from '@/components/DisbursementOtpModal';
import type { Disbursement, PaymentAccount } from '@/lib/types';

export default function WithdrawalsPage() {
  const [amount, setAmount]         = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [purpose, setPurpose]       = useState('');
  const [amountErr, setAmountErr]   = useState('');
  const [otpOpen, setOtpOpen]       = useState(false);
  const [pending, setPending]       = useState<Disbursement | null>(null);

  const overview  = useQuery(getOverview);
  const accounts  = useQuery(listPaymentAccounts);
  const disburse  = useMutation(initiateDisbursement);

  const list = useListQuery(
    (page) => listDisbursements({ page, limit: DISBURSEMENT_PAGE_LIMIT }),
  );

  const kpi       = overview.data;
  const available = kpi?.available ?? kpi?.chapaa_balance ?? 0;
  const withdrawn = kpi?.withdrawn ?? 0;
  const rawAmt    = parseInt(amount.replace(/\D/g, '') || '0');
  const selected  = accounts.data?.find((a: PaymentAccount) => a.id === selectedId);

  const handleInitiate = async () => {
    if (rawAmt <= 0)        { setAmountErr('Please enter an amount greater than zero.'); return; }
    if (rawAmt > available) { setAmountErr(`Amount exceeds available balance of TZS ${fmtTZSFull(available)}.`); return; }
    if (!selected)          { setAmountErr('Please select a payment account.'); return; }
    setAmountErr('');

    const result = await disburse.mutate({
      amount:             rawAmt,
      payment_account_id: selected.id,
      purpose:            purpose.trim() || 'Manual disbursement',
    });

    if (result) {
      setPending(result);
      setOtpOpen(true);
    } else if (disburse.error) {
      setAmountErr(disburse.error);
    }
  };

  const handleSuccess = () => {
    setOtpOpen(false);
    setPending(null);
    setAmount('');
    setPurpose('');
    list.refresh();
    overview.refresh();
  };

  return (
    <div>
      <div className="pageHead">
        <div>
          <div className="crumb">Moyo · Heart Surgery Fund</div>
          <h1>Fund <em>Disbursements</em></h1>
          <div className="sub">Initiate and track disbursements to hospitals and medical partners for children&apos;s cardiac care.</div>
        </div>
      </div>

      {/* KPI Hero */}
      <div className="kpi-hero" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <div className="hero-main">
          <div className="label"><span className="dot"></span>Total disbursed</div>
          <div className="big-amount"><span className="cur">TZS</span>{kpi ? fmtTZSFull(withdrawn) : '—'}</div>
          <div className="of">across hospitals and medical partners</div>
        </div>
        <div className="hero-stat">
          <div className="lbl">Available</div>
          <div className="val">{kpi ? fmtTZS(available) : '—'}</div>
          <div className="delta delta-up">↑ ready to disburse</div>
        </div>
        <div className="hero-stat">
          <div className="lbl">Disbursements</div>
          <div className="val">{list.total}</div>
        </div>
      </div>

      {/* Initiate form */}
      <div className="card" style={{ marginTop: 20, marginBottom: 20 }}>
        <div className="card-head" style={{ marginBottom: 22 }}>
          <div>
            <h3>Initiate disbursement</h3>
            <div className="sub">Payment accounts are configured in Settings → Payments</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600, marginBottom: 3 }}>Available balance</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700, color: 'var(--teal)' }}>
              TZS {kpi ? fmtTZSFull(available) : '—'}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
          <div>
            <label className="field-label">Amount (TZS)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--muted)', fontWeight: 500, pointerEvents: 'none' }}>TZS</span>
              <input
                className={`field-input${amountErr ? ' field-input-error' : ''}`}
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={rawAmt ? rawAmt.toLocaleString() : ''}
                onChange={e => { setAmount(e.target.value.replace(/\D/g, '')); setAmountErr(''); }}
                style={{ paddingLeft: 52, fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 700 }}
              />
            </div>
            {amountErr && (
              <div style={{ fontSize: 12, color: 'var(--rose)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {amountErr}
              </div>
            )}
          </div>

          <div>
            <label className="field-label">Disbursement to</label>
            {accounts.loading ? (
              <div style={{ padding: 14, fontSize: 13, color: 'var(--muted)' }}>Loading accounts…</div>
            ) : !accounts.data?.length ? (
              <div style={{ padding: '14px', border: '1.5px dashed var(--line)', borderRadius: 10, fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
                No payment accounts set up.{' '}
                <span style={{ color: 'var(--teal)', fontWeight: 600 }}>Go to Settings → Payments</span>{' '}
                to add a bank account.
              </div>
            ) : (
              <select
                className="field-input"
                value={selectedId}
                onChange={e => setSelectedId(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                <option value="">Select account…</option>
                {accounts.data.map((a: PaymentAccount) => (
                  <option key={a.id} value={a.id}>
                    {a.account_name} — {a.bank_name} ({a.account_number})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <label className="field-label">Purpose (optional)</label>
          <input
            className="field-input"
            type="text"
            placeholder="e.g. Cardiac surgery batch #10 — 30 children"
            value={purpose}
            onChange={e => setPurpose(e.target.value)}
          />
        </div>

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn btn-teal"
            style={{ padding: '12px 24px', fontSize: 13 }}
            onClick={handleInitiate}
            disabled={!accounts.data?.length || disburse.loading}
          >
            {disburse.loading ? (
              <span className="login-spinner" style={{ width: 14, height: 14, borderWidth: 2 }}></span>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.64a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                Initiate disbursement
              </>
            )}
          </button>
        </div>
      </div>

      {/* History */}
      <div className="card">
        <div className="card-head">
          <div><h3>Disbursement history</h3><div className="sub">All funds sent to medical partners</div></div>
        </div>

        {list.error && <div style={{ padding: '16px', color: 'var(--rose)', fontSize: 13 }}>{list.error}</div>}

        <table className="table">
          <thead>
            <tr><th>Reference</th><th>Account</th><th>Purpose</th><th>Date</th><th>Status</th><th style={{ textAlign: 'right' }}>Net (TZS)</th></tr>
          </thead>
          <tbody>
            {list.items.map((w, i) => (
              <tr key={w.id ?? i}>
                <td><span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>{w.reference}</span></td>
                <td style={{ fontWeight: 600 }}>
                  {w.payment_account
                    ? `${w.payment_account.account_name} — ${w.payment_account.bank_name}`
                    : w.payment_account_id}
                </td>
                <td style={{ fontSize: 12, color: 'var(--muted)' }}>{w.purpose}</td>
                <td style={{ color: 'var(--muted)', fontSize: 12 }}>
                  {new Date(w.initiated_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                </td>
                <td>
                  <span style={{
                    fontSize: 11, padding: '3px 8px', borderRadius: 6, fontWeight: 600,
                    background: (STATUS_COLORS[w.status] ?? '#9AA3BD') + '22',
                    color: STATUS_COLORS[w.status] ?? '#9AA3BD',
                  }}>
                    {w.status}
                  </span>
                </td>
                <td className="amount-cell" style={{ textAlign: 'right' }}>{fmtTZS(w.net_amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {list.loading && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Loading…</div>
        )}
        {list.hasMore && !list.loading && (
          <div style={{ padding: '16px', textAlign: 'center' }}>
            <button className="btn btn-ghost" onClick={list.loadMore}>Load more</button>
          </div>
        )}
      </div>

      {pending && selected && (
        <DisbursementOtpModal
          open={otpOpen}
          onClose={() => { setOtpOpen(false); setPending(null); }}
          disbursementId={pending.id}
          amount={pending.amount}
          fee={pending.fee}
          netAmount={pending.net_amount}
          account={selected}
          requiresCoApproval={pending.requires_co_approval}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
