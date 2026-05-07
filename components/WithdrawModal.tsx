'use client';

import { useState, useEffect } from 'react';
import { AVAILABLE } from '@/lib/data';
import { fmtTZSFull } from '@/lib/utils';

const channels = [
  { id: 'nmb',   name: 'NMB Bank',  acct: '****  2841',    icon: 'N', color: '#FFB800', tx: '#1A1A1A' },
  { id: 'crdb',  name: 'CRDB Bank', acct: '****  9173',    icon: 'C', color: '#00A859', tx: '#fff' },
  { id: 'mpesa', name: 'M-Pesa',    acct: '+255 *** 4421', icon: 'M', color: '#E60000', tx: '#fff' },
  { id: 'tigo',  name: 'Tigo Pesa', acct: '+255 *** 7805', icon: 'T', color: '#0066CC', tx: '#fff' },
];

export default function WithdrawModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [channel, setChannel] = useState('nmb');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [refCode] = useState('WD-' + Math.floor(9000 + Math.random() * 1000));

  useEffect(() => {
    if (open) { setStep(1); setOtp(['', '', '', '', '', '']); }
  }, [open]);

  if (!open) return null;

  const FEE = 0.005;
  const amt = parseInt(amount || '0');
  const fee = Math.round(amt * FEE);
  const net = amt - fee;
  const sel = channels.find(c => c.id === channel)!;
  const otpFull = otp.every(x => x);

  const onOtpChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const next = [...otp]; next[i] = v.slice(-1); setOtp(next);
    if (v && i < 5) {
      const el = document.getElementById('otp-' + (i + 1));
      el?.focus();
    }
  };

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
          {step === 1 && (
            <>
              <div className="field">
                <label>Available balance</label>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 28, color: 'var(--ink)', letterSpacing: '-0.02em', fontWeight: 700 }}>
                  TZS {fmtTZSFull(AVAILABLE)}
                </div>
              </div>
              <div className="field">
                <label>Amount to withdraw</label>
                <div className="input-prefix">
                  <span className="pf">TZS</span>
                  <input
                    type="text"
                    value={amt ? amt.toLocaleString() : ''}
                    onChange={e => setAmount(e.target.value.replace(/\D/g, ''))}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="field">
                <label>Disbursement to</label>
                <div className="channel-grid">
                  {channels.map(c => (
                    <div
                      key={c.id}
                      className={`channel-opt ${channel === c.id ? 'selected' : ''}`}
                      onClick={() => setChannel(c.id)}
                    >
                      <div className="ico-box" style={{ background: c.color, color: c.tx }}>{c.icon}</div>
                      <div>
                        <div className="nm">{c.name}</div>
                        <div className="acct">{c.acct}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--muted)' }}>
                Please review the details below. Once confirmed, an OTP will be sent to your registered admin phone.
              </div>
              <div className="summary-box">
                <div className="summary-row"><span className="l">Withdrawal amount</span><span className="r">TZS {fmtTZSFull(amt)}</span></div>
                <div className="summary-row"><span className="l">Platform fee (0.5%)</span><span className="r">– TZS {fmtTZSFull(fee)}</span></div>
                <div className="summary-row"><span className="l">Disbursement to</span><span className="r" style={{ fontFamily: 'var(--sans)' }}>{sel.name} {sel.acct}</span></div>
                <div className="summary-row"><span className="l">Estimated arrival</span><span className="r" style={{ fontFamily: 'var(--sans)' }}>Within 2 hours</span></div>
                <div className="summary-row total"><span className="l">Net to receive</span><span className="r">TZS {fmtTZSFull(net)}</span></div>
              </div>
              <div style={{ marginTop: 14, padding: '11px 14px', background: 'var(--teal-soft)', borderRadius: 10, fontSize: 12, color: 'var(--green-deep)', display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>Withdrawals over TZS 100M require co-approval from a second authorised admin within 30 minutes.</span>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 18 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--teal-soft)', color: 'var(--teal)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <h4 style={{ fontFamily: 'var(--sans)', fontSize: 20, lineHeight: 1.2, fontWeight: 700, letterSpacing: '-0.015em' }}>Verify with 2FA</h4>
                <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6 }}>We&apos;ve sent a 6-digit code to <b style={{ color: 'var(--ink)' }}>+255 *** 4421</b></p>
              </div>
              <div className="otp-grid">
                {otp.map((v, i) => (
                  <input
                    key={i} id={`otp-${i}`} value={v}
                    onChange={e => onOtpChange(i, e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Backspace' && !v && i > 0) {
                        document.getElementById(`otp-${i - 1}`)?.focus();
                      }
                    }}
                    inputMode="numeric" maxLength={1}
                  />
                ))}
              </div>
              <div className="otp-help">Didn&apos;t get the code? <a>Resend in 0:42</a></div>
            </>
          )}

          {step === 4 && (
            <div className="success-box">
              <div className="success-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#04372C" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h4>Withdrawal initiated</h4>
              <p>TZS {fmtTZSFull(net)} is on its way to <b style={{ color: 'var(--ink)' }}>{sel.name} {sel.acct}</b>.<br />You&apos;ll get a confirmation SMS once it lands.</p>
              <div className="ref-box">
                <span className="l">Reference</span>
                <span className="r">{refCode}</span>
              </div>
            </div>
          )}
        </div>

        <div className="modal-foot">
          {step === 1 && (
            <>
              <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button className="btn btn-dark" onClick={() => setStep(2)} disabled={!amt}>Continue</button>
            </>
          )}
          {step === 2 && (
            <>
              <button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
              <button className="btn btn-dark" onClick={() => setStep(3)}>Send verification code</button>
            </>
          )}
          {step === 3 && (
            <>
              <button className="btn btn-ghost" onClick={() => setStep(2)}>Back</button>
              <button className="btn btn-teal" onClick={() => setStep(4)} disabled={!otpFull}>Verify &amp; withdraw</button>
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
