'use client';

import { useState, useEffect } from 'react';
import { WITHDRAWN, AVAILABLE } from '@/lib/data';
import { fmtTZS, fmtTZSFull } from '@/lib/utils';
import { getAccounts, PaymentAccount } from '@/lib/paymentAccounts';
import DisbursementOtpModal from '@/components/DisbursementOtpModal';

interface Disbursement {
  ref: string;
  to: string;
  purpose: string;
  date: string;
  status: string;
  amount: number;
}

const seed: Disbursement[] = [
  { ref: 'WD-9281', to: 'Muhimbili National Hospital', purpose: 'Cardiac surgery batch #8 — 52 children', date: 'May 03', status: 'paid',    amount: 280000000 },
  { ref: 'WD-9264', to: 'Aga Khan Hospital, DSM',      purpose: 'Cardiac surgery batch #7 — 38 children', date: 'Apr 28', status: 'paid',    amount: 165000000 },
  { ref: 'WD-9217', to: 'CCBRT Charity Hospital',      purpose: 'Cardiac surgery batch #6 — 52 children', date: 'Apr 21', status: 'paid',    amount: 195000000 },
];

export default function WithdrawalsPage() {
  const [accounts, setAccounts]         = useState<PaymentAccount[]>([]);
  const [amount, setAmount]             = useState('');
  const [selectedId, setSelectedId]     = useState('');
  const [otpOpen, setOtpOpen]           = useState(false);
  const [disbursements, setDisbursements] = useState<Disbursement[]>(seed);
  const [amountErr, setAmountErr]       = useState('');

  useEffect(() => {
    const loaded = getAccounts();
    setAccounts(loaded);
    if (loaded.length) setSelectedId(loaded[0].id);
  }, []);

  const rawAmt   = parseInt(amount.replace(/\D/g, '') || '0');
  const selected = accounts.find(a => a.id === selectedId);

  const handleInitiate = () => {
    if (rawAmt <= 0)          { setAmountErr('Please enter an amount greater than zero'); return; }
    if (rawAmt > AVAILABLE)   { setAmountErr('Amount exceeds available balance'); return; }
    if (!selected)            { setAmountErr('Please select a payment account'); return; }
    setAmountErr('');
    setOtpOpen(true);
  };

  const handleSuccess = (ref: string) => {
    const net = rawAmt - Math.round(rawAmt * 0.005);
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    setDisbursements(prev => [{
      ref,
      to: `${selected!.accountName} — ${selected!.bankName}`,
      purpose: 'Manual disbursement',
      date: today,
      status: 'pending',
      amount: net,
    }, ...prev]);
    setAmount('');
    setOtpOpen(false);
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

      {/* KPI hero */}
      <div className="kpi-hero" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
        <div className="hero-main">
          <div className="label"><span className="dot"></span>Total disbursed</div>
          <div className="big-amount"><span className="cur">TZS</span>{fmtTZSFull(WITHDRAWN)}</div>
          <div className="of">across <b>3 hospitals</b> and medical partners</div>
        </div>
        <div className="hero-stat">
          <div className="lbl">Available</div>
          <div className="val">{fmtTZS(AVAILABLE)}</div>
          <div className="delta delta-up">↑ ready to disburse</div>
        </div>
        <div className="hero-stat">
          <div className="lbl">Disbursements</div>
          <div className="val">{disbursements.length}</div>
          <div className="delta delta-flat">→ all confirmed</div>
        </div>
        <div className="hero-stat">
          <div className="lbl">Surgeries funded</div>
          <div className="val">142</div>
          <div className="delta delta-up">↑ 3 this week</div>
        </div>
      </div>

      {/* Initiate disbursement card */}
      <div className="card" style={{ marginTop: 20, marginBottom: 20 }}>
        <div className="card-head" style={{ marginBottom: 22 }}>
          <div>
            <h3>Initiate disbursement</h3>
            <div className="sub">Payment accounts are configured in Settings → Payments</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600, marginBottom: 3 }}>Available balance</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700, color: 'var(--teal)' }}>
              TZS {fmtTZSFull(AVAILABLE)}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
          {/* Amount */}
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

          {/* Destination account */}
          <div>
            <label className="field-label">Disbursement to</label>
            {accounts.length === 0 ? (
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
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.accountName} — {a.bankName} ({a.accountNumber})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn btn-teal"
            style={{ padding: '12px 24px', fontSize: 13 }}
            onClick={handleInitiate}
            disabled={accounts.length === 0}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.64a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            Initiate disbursement
          </button>
        </div>
      </div>

      {/* Disbursement history */}
      <div className="card">
        <div className="card-head">
          <div><h3>Disbursement history</h3><div className="sub">All funds sent to medical partners</div></div>
        </div>
        <table className="table">
          <thead>
            <tr><th>Reference</th><th>Recipient</th><th>Purpose</th><th>Date</th><th>Status</th><th>Amount</th></tr>
          </thead>
          <tbody>
            {disbursements.map((w, i) => (
              <tr key={i}>
                <td><span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>{w.ref}</span></td>
                <td style={{ fontWeight: 600 }}>{w.to}</td>
                <td style={{ fontSize: 12, color: 'var(--muted)' }}>{w.purpose}</td>
                <td style={{ color: 'var(--muted)', fontSize: 12 }}>{w.date}</td>
                <td>
                  <span style={{
                    fontSize: 11, padding: '3px 8px', borderRadius: 6, fontWeight: 600,
                    background: w.status === 'paid' ? 'rgba(21,184,148,0.15)' : 'rgba(232,155,60,0.15)',
                    color: w.status === 'paid' ? 'var(--teal-2)' : 'var(--amber)',
                  }}>
                    {w.status}
                  </span>
                </td>
                <td className="amount-cell">TZS {fmtTZSFull(w.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <DisbursementOtpModal
          open={otpOpen}
          onClose={() => setOtpOpen(false)}
          amount={rawAmt}
          account={selected}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
