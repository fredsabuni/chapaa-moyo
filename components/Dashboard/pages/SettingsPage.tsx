'use client';

import { useState, useEffect } from 'react';
import { getAccounts, saveAccount, deleteAccount, PaymentAccount } from '@/lib/paymentAccounts';

const campaignInfo = [
  ['Campaign name',   'Moyo — Children Cardiac Surgery Fund'],
  ['Cause category',  'Medical · Paediatric Cardiac Care'],
  ['Organisation',    'Moyo Foundation (Verified)'],
  ['Goal amount',     'TZS 2,500,000,000'],
  ['Campaign end',    'June 30, 2026'],
  ['Public URL',      'chapaa.tz/moyo'],
];

const admins = [
  { nm: 'Moyo Foundation', role: 'Owner · Super admin', av: 'MF', vc: 1 },
  { nm: 'Dr. Amina Seif',  role: 'Medical director',    av: 'AS', vc: 2 },
  { nm: 'James Omondi',    role: 'Finance officer',      av: 'JO', vc: 3 },
];

const BANKS = [
  'NMB Bank', 'CRDB Bank', 'NBC Bank', 'Stanbic Bank',
  'Standard Chartered', 'Absa Bank', 'Exim Bank', 'KCB Bank',
  'Equity Bank', 'Azania Bank', 'Other',
];

const emptyForm = { accountName: '', bankName: '', accountNumber: '', branch: '' };

export default function SettingsPage() {
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(emptyForm);
  const [formErr, setFormErr]   = useState('');

  useEffect(() => { setAccounts(getAccounts()); }, []);

  const valid = form.accountName.trim() && form.bankName && form.accountNumber.trim();

  const handleSave = () => {
    if (!valid) { setFormErr('Please fill in all required fields.'); return; }
    const created = saveAccount({ ...form, accountName: form.accountName.trim(), accountNumber: form.accountNumber.trim(), branch: form.branch.trim() });
    setAccounts(prev => [...prev, created]);
    setForm(emptyForm);
    setFormErr('');
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    deleteAccount(id);
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div>
      <div className="pageHead">
        <div>
          <div className="crumb">Moyo · Heart Surgery Fund</div>
          <h1>Campaign <em>Settings</em></h1>
          <div className="sub">Manage campaign details, payment accounts, and authorised administrators.</div>
        </div>
      </div>

      {/* Campaign info + Admins */}
      <div className="grid-2">
        <div className="card">
          <div className="card-head"><div><h3>Campaign info</h3><div className="sub">Basic details shown on the public page</div></div></div>
          {campaignInfo.map(([l, v], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--line-2)' }}>
              <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>{l}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{v}</span>
            </div>
          ))}
          <button className="btn btn-dark" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>Edit campaign details</button>
        </div>

        <div className="card">
          <div className="card-head"><div><h3>Authorised admins</h3><div className="sub">Admins can view and initiate disbursements</div></div></div>
          {admins.map((a, i) => (
            <div key={i} className="contrib" style={{ padding: '12px 0', borderBottom: '1px solid var(--line-2)' }}>
              <div className={`contrib-avatar v${a.vc}`}>{a.av}</div>
              <div style={{ flex: 1 }}>
                <div className="contrib-name">{a.nm}</div>
                <div className="contrib-meta">{a.role}</div>
              </div>
              {i > 0 && <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 11 }}>Remove</button>}
            </div>
          ))}
          <button className="btn btn-ghost" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>+ Invite admin</button>
        </div>
      </div>

      {/* Payment accounts */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-head" style={{ marginBottom: showForm ? 20 : accounts.length ? 4 : 0 }}>
          <div>
            <h3>Payment accounts</h3>
            <div className="sub">Bank accounts that can receive disbursements from this campaign</div>
          </div>
          {!showForm && (
            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setShowForm(true)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add account
            </button>
          )}
        </div>

        {/* Add-account form */}
        {showForm && (
          <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 14, padding: 22, marginBottom: 22 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 18 }}>New payment account</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="field-label">Account name <span style={{ color: 'var(--rose)' }}>*</span></label>
                <input
                  className="field-input"
                  placeholder="e.g. Moyo Foundation"
                  value={form.accountName}
                  onChange={e => { setForm(f => ({ ...f, accountName: e.target.value })); setFormErr(''); }}
                />
              </div>
              <div>
                <label className="field-label">Bank name <span style={{ color: 'var(--rose)' }}>*</span></label>
                <select
                  className="field-input"
                  value={form.bankName}
                  onChange={e => { setForm(f => ({ ...f, bankName: e.target.value })); setFormErr(''); }}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="">Select bank…</option>
                  {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Account number <span style={{ color: 'var(--rose)' }}>*</span></label>
                <input
                  className="field-input"
                  placeholder="e.g. 40710002841"
                  value={form.accountNumber}
                  onChange={e => { setForm(f => ({ ...f, accountNumber: e.target.value })); setFormErr(''); }}
                  style={{ fontFamily: 'var(--mono)' }}
                />
              </div>
              <div>
                <label className="field-label">Branch <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                <input
                  className="field-input"
                  placeholder="e.g. Dar es Salaam Main"
                  value={form.branch}
                  onChange={e => setForm(f => ({ ...f, branch: e.target.value }))}
                />
              </div>
            </div>

            {formErr && (
              <div style={{ marginTop: 12, fontSize: 12, color: 'var(--rose)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {formErr}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 18 }}>
              <button className="btn btn-ghost" onClick={() => { setShowForm(false); setForm(emptyForm); setFormErr(''); }}>Cancel</button>
              <button className="btn btn-dark" onClick={handleSave} disabled={!valid}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Save account
              </button>
            </div>
          </div>
        )}

        {/* Accounts list */}
        {accounts.length === 0 && !showForm ? (
          <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--muted)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: 'var(--muted-2)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 4 }}>No payment accounts yet</div>
            <div style={{ fontSize: 12 }}>Add a bank account to enable disbursements from this campaign.</div>
          </div>
        ) : (
          accounts.length > 0 && (
            <table className="table" style={{ marginTop: showForm ? 0 : 8 }}>
              <thead>
                <tr><th>Account name</th><th>Bank</th><th>Account number</th><th>Branch</th><th style={{ textAlign: 'center' }}>Action</th></tr>
              </thead>
              <tbody>
                {accounts.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.accountName}</td>
                    <td>{a.bankName}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{a.accountNumber}</td>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>{a.branch || '—'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: '5px 12px', fontSize: 11, color: 'var(--rose)', borderColor: 'rgba(229,84,125,0.25)' }}
                        onClick={() => handleDelete(a.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
}
