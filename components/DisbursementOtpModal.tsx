'use client';

import { useState, useEffect, useCallback } from 'react';
import { sendOtp, verifyOtp } from '@/lib/services/disbursements.service';
import { fmtTZSFull } from '@/lib/utils';
import type { PaymentAccount } from '@/lib/types';

interface Props {
  open:               boolean;
  onClose:            () => void;
  disbursementId:     string;
  amount:             number;
  fee:                number;
  netAmount:          number;
  account:            PaymentAccount;
  requiresCoApproval: boolean;
  onSuccess:          (reference: string) => void;
}

type Step = 'review' | 'otp' | 'success';

export default function DisbursementOtpModal({
  open, onClose, disbursementId, amount, fee, netAmount, account, requiresCoApproval, onSuccess,
}: Props) {
  const [step, setStep]                     = useState<Step>('review');
  const [otp, setOtp]                       = useState(['', '', '', '', '', '']);
  const [reference, setReference]           = useState('');
  const [maskedPhone, setMaskedPhone]       = useState('+255 *** ****');
  const [resendAt, setResendAt]             = useState<Date | null>(null);
  const [secondsLeft, setSecondsLeft]       = useState(0);
  const [attemptsLeft, setAttemptsLeft]     = useState(3);
  const [otpError, setOtpError]            = useState('');
  const [sendingOtp, setSendingOtp]         = useState(false);
  const [verifying, setVerifying]           = useState(false);

  const otpFull = otp.every(x => x);

  // Countdown for resend button
  useEffect(() => {
    if (!resendAt) return;
    const tick = () => {
      const diff = Math.ceil((resendAt.getTime() - Date.now()) / 1000);
      setSecondsLeft(Math.max(0, diff));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [resendAt]);

  const handleSendOtp = useCallback(async () => {
    setSendingOtp(true);
    try {
      const result = await sendOtp(disbursementId);
      setMaskedPhone(result.message.replace('OTP sent to ', ''));
      setResendAt(new Date(result.resend_available_at));
    } catch {
      // non-fatal — user can retry
    } finally {
      setSendingOtp(false);
    }
  }, [disbursementId]);

  const handleStepToOtp = async () => {
    setStep('otp');
    await handleSendOtp();
  };

  const handleVerify = async () => {
    setVerifying(true);
    setOtpError('');
    try {
      const result = await verifyOtp(disbursementId, otp.join(''));
      setReference(result.reference);
      setStep('success');
      onSuccess(result.reference);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Incorrect OTP.';
      // Extract attempts_remaining if present in error details
      const remaining = attemptsLeft - 1;
      setAttemptsLeft(remaining);
      if (remaining <= 0) {
        setOtpError('Too many attempts. This disbursement has been cancelled.');
        setTimeout(onClose, 3000);
      } else {
        setOtpError(`${msg} ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`);
      }
      setOtp(['', '', '', '', '', '']);
      document.getElementById('dotp-0')?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const handleClose = () => {
    setStep('review');
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    setAttemptsLeft(3);
    onClose();
  };

  const onOtpChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const next = [...otp]; next[i] = v.slice(-1); setOtp(next);
    if (v && i < 5) document.getElementById(`dotp-${i + 1}`)?.focus();
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>

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

        {step !== 'success' && (
          <div className="step-track">
            <div className={`seg-bar ${step === 'review' ? 'active' : 'done'}`}></div>
            <div className={`seg-bar ${step === 'otp' ? 'active' : ''}`}></div>
          </div>
        )}

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
                    <span style={{ fontWeight: 600 }}>{account.account_name}</span>
                    <br />
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {account.bank_name} · {account.account_number}
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
                  <span className="r">TZS {fmtTZSFull(netAmount)}</span>
                </div>
              </div>
              {requiresCoApproval && (
                <div style={{ marginTop: 14, padding: '11px 14px', background: 'var(--teal-soft)', borderRadius: 10, fontSize: 12, color: 'var(--green-deep)', display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
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
                  {sendingOtp ? 'Sending code…' : <>A 6-digit code was sent to <b style={{ color: 'var(--ink)' }}>{maskedPhone}</b>.</>}
                  <br />It expires in 5 minutes.
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
                    disabled={attemptsLeft <= 0}
                  />
                ))}
              </div>
              {otpError && (
                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--rose)', textAlign: 'center' }}>{otpError}</div>
              )}
              <div className="otp-help">
                Didn&apos;t get the code?{' '}
                {secondsLeft > 0 ? (
                  <span style={{ color: 'var(--muted)' }}>Resend in 0:{String(secondsLeft).padStart(2, '0')}</span>
                ) : (
                  <a style={{ cursor: 'pointer' }} onClick={handleSendOtp}>Resend</a>
                )}
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
                <b style={{ color: 'var(--ink)' }}>TZS {fmtTZSFull(netAmount)}</b> is being sent to{' '}
                <b style={{ color: 'var(--ink)' }}>{account.account_name}</b> at {account.bank_name}.
                <br />You&apos;ll receive a confirmation SMS once it lands.
              </p>
              <div className="ref-box">
                <span className="l">Reference</span>
                <span className="r">{reference}</span>
              </div>
            </div>
          )}
        </div>

        <div className="modal-foot">
          {step === 'review' && (
            <>
              <button className="btn btn-ghost" onClick={handleClose}>Cancel</button>
              <button className="btn btn-dark" onClick={handleStepToOtp}>
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
                onClick={handleVerify}
                disabled={!otpFull || verifying || attemptsLeft <= 0}
              >
                {verifying ? <span className="login-spinner" style={{ width: 14, height: 14, borderWidth: 2 }}></span> : 'Verify & disburse'}
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
