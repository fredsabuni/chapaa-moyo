'use client';

import { useState } from 'react';
import { PaymentAccount } from '@/lib/paymentAccounts';
import { fmtTZSFull } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  amount: number;
  account: PaymentAccount;
  onSuccess: (ref: string) => void;
}

export default function DisbursementOtpModal({ open, onClose, amount, account, onSuccess }: Props) {
  const [step, setStep] = useState<'review' | 'otp' | 'success'>('review');
  const [otp, setOtp]   = useState(['', '', '', '', '', '']);
  const [ref]           = useState('WD-' + (9000 + Math.floor(Math.random() * 999)));

  const FEE = 0.005;
  const fee = Math.round(amount * FEE);
  const net = amount - fee;
  const otpFull = otp.every(x => x);

  const onOtpChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const next = [...otp]; next[i] = v.slice(-1); setOtp(next);
    if (v && i < 5) document.getElementById(`dotp-${i + 1}`)?.focus();
  };

  const handleClose = () => {
    setStep('review');
    setOtp(['', '', '', '', '', '']);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-head">
          <div>
            <h3>{step === 'success' ? 'Disbursement sent' : 'Confirm disbursement'}</h3>
            {step !== 'success' && (
              <div className="step">
                {step === 'review' ? 'Step 1 of 2 · Review details' : 'Step 2 of 2 · Verify identity'}
              </div>
            )}
          </div>
          <button className="modal-close" onClick={handleClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Progress */}
        {step !== 'success' && (
          <div className="step-track">
            <div className={`seg-bar ${step === 'review' ? 'active' : 'done'}`}></div>
            <div className={`seg-bar ${step === 'otp' ? 'active' : ''}`}></div>
          </div>
        )}

        {/* Body */}
        <div className="modal-body">

          {step === 'review' && (
            <>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 18 }}>
                Review these details carefully. An OTP will be sent to your registered admin phone to confirm.
              </p>
              <div className="summary-box">
                <div className="summary-row">
                  <span className="l">Disbursement amount</span>
                  <span className="r">TZS {fmtTZSFull(amount)}</span>
                </div>
                <div className="summary-row">
                  <span className="l">Platform fee (0.5%)</span>
                  <span className="r">– TZS {fmtTZSFull(fee)}</span>
                </div>
                <div className="summary-row" style={{ alignItems: 'flex-start' }}>
                  <span className="l">Destination</span>
                  <span className="r" style={{ fontFamily: 'var(--sans)', textAlign: 'right' }}>
                    <span style={{ fontWeight: 600 }}>{account.accountName}</span>
                    <br />
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {account.bankName} · {account.accountNumber}
                      {account.branch ? ` · ${account.branch}` : ''}
                    </span>
                  </span>
                </div>
                <div className="summary-row">
                  <span className="l">Estimated arrival</span>
                  <span className="r" style={{ fontFamily: 'var(--sans)' }}>Within 2 hours</span>
                </div>
                <div className="summary-row total">
                  <span className="l">Net to receive</span>
                  <span className="r">TZS {fmtTZSFull(net)}</span>
                </div>
              </div>

              {amount > 100000000 && (
                <div style={{ marginTop: 14, padding: '11px 14px', background: 'var(--teal-soft)', borderRadius: 10, fontSize: 12, color: 'var(--green-deep)', display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span>Disbursements over TZS 100M require co-approval from a second authorised admin within 30 minutes.</span>
                </div>
              )}
            </>
          )}

          {step === 'otp' && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--teal-soft)', color: 'var(--teal)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <h4 style={{ fontFamily: 'var(--sans)', fontSize: 20, fontWeight: 700, letterSpacing: '-0.015em' }}>Enter OTP</h4>
                <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>
                  A 6-digit code was sent to <b style={{ color: 'var(--ink)' }}>+255 *** 4421</b>.<br />
                  It expires in 5 minutes.
                </p>
              </div>
              <div className="otp-grid">
                {otp.map((v, i) => (
                  <input
                    key={i}
                    id={`dotp-${i}`}
                    value={v}
                    onChange={e => onOtpChange(i, e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Backspace' && !v && i > 0)
                        document.getElementById(`dotp-${i - 1}`)?.focus();
                    }}
                    inputMode="numeric"
                    maxLength={1}
                  />
                ))}
              </div>
              <div className="otp-help">
                Didn&apos;t get the code? <a>Resend in 0:42</a>
              </div>
            </>
          )}

          {step === 'success' && (
            <div className="success-box">
              <div className="success-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#04372C" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h4>Disbursement initiated</h4>
              <p>
                <b style={{ color: 'var(--ink)' }}>TZS {fmtTZSFull(net)}</b> is being sent to{' '}
                <b style={{ color: 'var(--ink)' }}>{account.accountName}</b> at {account.bankName}.
                <br />You&apos;ll receive a confirmation SMS once it lands.
              </p>
              <div className="ref-box">
                <span className="l">Reference</span>
                <span className="r">{ref}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-foot">
          {step === 'review' && (
            <>
              <button className="btn btn-ghost" onClick={handleClose}>Cancel</button>
              <button className="btn btn-dark" onClick={() => setStep('otp')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.64a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                Send OTP to phone
              </button>
            </>
          )}
          {step === 'otp' && (
            <>
              <button className="btn btn-ghost" onClick={() => setStep('review')}>Back</button>
              <button
                className="btn btn-teal"
                onClick={() => { setStep('success'); onSuccess(ref); }}
                disabled={!otpFull}
              >
                Verify &amp; disburse
              </button>
            </>
          )}
          {step === 'success' && (
            <button className="btn btn-dark" onClick={handleClose} style={{ marginLeft: 'auto' }}>Done</button>
          )}
        </div>

      </div>
    </div>
  );
}
