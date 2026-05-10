'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@/lib/useQuery';
import { getOverview } from '@/lib/services/dashboard.service';
import { listPaymentAccounts } from '@/lib/services/paymentAccounts.service';
import { initiateDisbursement, sendOtp, verifyOtp } from '@/lib/services/disbursements.service';
import { fmtTZSFull } from '@/lib/utils';
import type { PaymentAccount, Disbursement } from '@/lib/types';

export default function WithdrawModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep]                 = useState(1);
  const [amount, setAmount]             = useState('');
  const [selectedId, setSelectedId]     = useState('');
  const [otp, setOtp]                   = useState(['', '', '', '', '', '']);
  const [disbursement, setDisbursement] = useState<Disbursement | null>(null);
  const [maskedPhone, setMaskedPhone]   = useState('+255 *** ****');
  const [resendAt, setResendAt]         = useState<Date | null>(null);
  const [secondsLeft, setSecondsLeft]   = useState(0);
  const [otpError, setOtpError]         = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [loading, setLoading]           = useState(false);
  const [amountErr, setAmountErr]       = useState('');

  const overview  = useQuery(getOverview);
  const accounts  = useQuery(listPaymentAccounts);

  const available = overview.data?.available ?? 0;
  const amt       = parseInt(amount.replace(/\D/g, '') || '0');
  const selected  = accounts.data?.find((a: PaymentAccount) => a.id === selectedId) ?? null;
  const fee       = disbursement?.fee     ?? Math.round(amt * 0.005);
  const net       = disbursement?.net_amount ?? amt - fee;
  const otpFull   = otp.every(x => x);

  // Countdown for OTP resend
  useEffect(() => {
    if (!resendAt) return;
    const tick = () => setSecondsLeft(Math.max(0, Math.ceil((resendAt.getTime() - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [resendAt]);

  useEffect(() => {
    if (open) {
      setStep(1);
      setAmount('');
      setOtp(['', '', '', '', '', '']);
      setOtpError('');
      setAttemptsLeft(3);
      setDisbursement(null);
      setAmountErr('');
    }
  }, [open]);

  // Auto-select first account
  useEffect(() => {
    if (accounts.data?.length && !selectedId) setSelectedId(accounts.data[0].id);
  }, [accounts.data, selectedId]);

  const handleSendOtp = useCallback(async (disbId: string) => {
    const result = await sendOtp(disbId);
    setMaskedPhone(result.message.replace('OTP sent to ', ''));
    setResendAt(new Date(result.resend_available_at));
  }, []);

  const handleStepOneNext = () => {
    if (amt <= 0)        { setAmountErr('Please enter an amount greater than zero.'); return; }
    if (amt > available) { setAmountErr(`Amount exceeds available balance of TZS ${fmtTZSFull(available)}.`); return; }
    if (!selected)       { setAmountErr('Please select a payment account.'); return; }
    setAmountErr('');
    setStep(2);
  };

  const handleConfirm = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const result = await initiateDisbursement({
        amount:             amt,
        payment_account_id: selected.id,
        purpose:            'Withdrawal via dashboard',
      });
      setDisbursement(result);
      await handleSendOtp(result.id);
      setStep(3);
    } catch (e) {
      setAmountErr(e instanceof Error ? e.message : 'Failed to initiate. Please try again.');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!disbursement) return;
    setLoading(true);
    setOtpError('');
    try {
      await verifyOtp(disbursement.id, otp.join(''));
      setStep(4);
    } catch (e) {
      const remaining = attemptsLeft - 1;
      setAttemptsLeft(remaining);
      if (remaining <= 0) {
        setOtpError('Too many attempts. This disbursement has been cancelled.');
        setTimeout(onClose, 3000);
      } else {
        setOtpError(`${e instanceof Error ? e.message : 'Incorrect OTP.'} ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`);
      }
      setOtp(['', '', '', '', '', '']);
    } finally {
      setLoading(false);
    }
  };

  const onOtpChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const next = [...otp]; next[i] = v.slice(-1); setOtp(next);
    if (v && i < 5) document.getElementById(`modal-otp-${i + 1}`)?.focus();
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h3>{step < 4 ? 'Withdraw funds' : 'Withdrawal initiated'}</h3>
            {step < 4 && <div className="step">Step {step} of 3</div>}
          </div>
          <button className="modal-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {step < 4 && (
          <div className="step-track">
            {[1, 2, 3].map(s => (
              <div key={s} className={`seg-bar ${step > s ? 'done' : step === s ? 'active' : ''}`}></div>
            ))}
          </div>
        )}

        <div className="modal-body">
          {/* Step 1 — Amount + destination */}
          {step === 1 && (
            <>
              <div className="field">
                <label>Available balance</label>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 28, color: 'var(--ink)', letterSpacing: '-0.02em', fontWeight: 700 }}>
                  TZS {fmtTZSFull(available)}
                </div>
              </div>
              <div className="field">
                <label>Amount to withdraw</label>
                <div className="input-prefix">
                  <span className="pf">TZS</span>
                  <input
                    type="text"
                    value={amt ? amt.toLocaleString() : ''}
                    onChange={e => { setAmount(e.target.value.replace(/\D/g, '')); setAmountErr(''); }}
                    placeholder="0"
                  />
                </div>
                {amountErr && (
                  <div style={{ fontSize: 12, color: 'var(--rose)', marginTop: 6 }}>{amountErr}</div>
                )}
              </div>
              <div className="field">
                <label>Disbursement to</label>
                {accounts.loading ? (
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>Loading accounts…</div>
                ) : !accounts.data?.length ? (
                  <div style={{ padding: 14, border: '1.5px dashed var(--line)', borderRadius: 10, fontSize: 13, color: 'var(--muted)' }}>
                    No payment accounts. Go to <b>Settings → Payments</b>.
                  </div>
                ) : (
                  <div className="channel-grid">
                    {accounts.data.map((a: PaymentAccount) => (
                      <div
                        key={a.id}
                        className={`channel-opt ${selectedId === a.id ? 'selected' : ''}`}
                        onClick={() => setSelectedId(a.id)}
                      >
                        <div className="ico-box" style={{ background: '#0B1330', color: '#fff', fontSize: 11, fontWeight: 700 }}>
                          {a.bank_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="nm">{a.bank_name}</div>
                          <div className="acct">····{a.account_number.slice(-4)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Step 2 — Review */}
          {step === 2 && selected && (
            <>
              <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--muted)' }}>
                Please review the details below. Once confirmed, an OTP will be sent to your registered admin phone.
              </div>
              <div className="summary-box">
                <div className="summary-row"><span className="l">Withdrawal amount</span><span className="r">TZS {fmtTZSFull(amt)}</span></div>
                <div className="summary-row"><span className="l">Platform fee (0.5%)</span><span className="r">– TZS {fmtTZSFull(fee)}</span></div>
                <div className="summary-row">
                  <span className="l">Disbursement to</span>
                  <span className="r" style={{ fontFamily: 'var(--sans)' }}>
                    {selected.account_name} — {selected.bank_name}<br />
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>····{selected.account_number.slice(-4)}</span>
                  </span>
                </div>
                <div className="summary-row"><span className="l">Estimated arrival</span><span className="r" style={{ fontFamily: 'var(--sans)' }}>Within 2 hours</span></div>
                <div className="summary-row total"><span className="l">Net to receive</span><span className="r">TZS {fmtTZSFull(net)}</span></div>
              </div>
              {amt > 100000000 && (
                <div style={{ marginTop: 14, padding: '11px 14px', background: 'var(--teal-soft)', borderRadius: 10, fontSize: 12, color: 'var(--green-deep)', display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span>Withdrawals over TZS 100M require co-approval from a second authorised admin within 30 minutes.</span>
                </div>
              )}
            </>
          )}

          {/* Step 3 — OTP */}
          {step === 3 && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 18 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--teal-soft)', color: 'var(--teal)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <h4 style={{ fontFamily: 'var(--sans)', fontSize: 20, lineHeight: 1.2, fontWeight: 700, letterSpacing: '-0.015em' }}>Verify with 2FA</h4>
                <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6 }}>
                  We&apos;ve sent a 6-digit code to <b style={{ color: 'var(--ink)' }}>{maskedPhone}</b>
                </p>
              </div>
              <div className="otp-grid">
                {otp.map((v, i) => (
                  <input
                    key={i} id={`modal-otp-${i}`} value={v}
                    onChange={e => onOtpChange(i, e.target.value)}
                    onKeyDown={e => { if (e.key === 'Backspace' && !v && i > 0) document.getElementById(`modal-otp-${i - 1}`)?.focus(); }}
                    inputMode="numeric" maxLength={1}
                    disabled={attemptsLeft <= 0}
                  />
                ))}
              </div>
              {otpError && <div style={{ marginTop: 10, fontSize: 12, color: 'var(--rose)', textAlign: 'center' }}>{otpError}</div>}
              <div className="otp-help">
                Didn&apos;t get the code?{' '}
                {secondsLeft > 0
                  ? <span style={{ color: 'var(--muted)' }}>Resend in 0:{String(secondsLeft).padStart(2, '0')}</span>
                  : <a style={{ cursor: 'pointer' }} onClick={() => disbursement && handleSendOtp(disbursement.id)}>Resend</a>
                }
              </div>
            </>
          )}

          {/* Step 4 — Success */}
          {step === 4 && selected && (
            <div className="success-box">
              <div className="success-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#04372C" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h4>Withdrawal initiated</h4>
              <p>TZS {fmtTZSFull(net)} is on its way to <b style={{ color: 'var(--ink)' }}>{selected.bank_name}</b>.<br />You&apos;ll get a confirmation SMS once it lands.</p>
              <div className="ref-box">
                <span className="l">Reference</span>
                <span className="r">{disbursement?.reference ?? '—'}</span>
              </div>
            </div>
          )}
        </div>

        <div className="modal-foot">
          {step === 1 && (
            <>
              <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button className="btn btn-dark" onClick={handleStepOneNext} disabled={!amt || !accounts.data?.length}>Continue</button>
            </>
          )}
          {step === 2 && (
            <>
              <button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
              <button className="btn btn-dark" onClick={handleConfirm} disabled={loading}>
                {loading ? <span className="login-spinner" style={{ width: 14, height: 14, borderWidth: 2 }}></span> : 'Send verification code'}
              </button>
            </>
          )}
          {step === 3 && (
            <>
              <button className="btn btn-ghost" onClick={() => setStep(2)}>Back</button>
              <button className="btn btn-teal" onClick={handleVerify} disabled={!otpFull || loading || attemptsLeft <= 0}>
                {loading ? <span className="login-spinner" style={{ width: 14, height: 14, borderWidth: 2 }}></span> : 'Verify & withdraw'}
              </button>
            </>
          )}
          {step === 4 && (
            <button className="btn btn-dark" onClick={onClose} style={{ marginLeft: 'auto' }}>Done</button>
          )}
        </div>
      </div>
    </div>
  );
}
