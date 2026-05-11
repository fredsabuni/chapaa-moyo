'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@/lib/useQuery';
import { getCampaign } from '@/lib/services/campaign.service';
import { listAdmins, removeAdmin, inviteAdmin } from '@/lib/services/admins.service';
import { listPaymentAccounts, addPaymentAccount, removePaymentAccount } from '@/lib/services/paymentAccounts.service';
import { ADMIN_ROLE_LABELS } from '@/lib/constants';
import type { PaymentAccount, Admin, AdminRole } from '@/lib/types';

const BANKS = [
  'NMB Bank', 'CRDB Bank', 'NBC Bank', 'Stanbic Bank',
  'Standard Chartered', 'Absa Bank', 'Exim Bank', 'KCB Bank',
  'Equity Bank', 'Azania Bank', 'Other',
];

const ROLES: { value: AdminRole; label: string }[] = [
  { value: 'medical_director', label: 'Medical director' },
  { value: 'finance_officer',  label: 'Finance officer' },
  { value: 'viewer',           label: 'Viewer' },
];

const emptyAccountForm = { account_name: '', bank_name: '', account_number: '', branch: '' };
const emptyAdminForm   = { name: '', email: '', phone: '', role: 'finance_officer' as AdminRole };

export default function SettingsPage() {
  // Campaign
  const campaign = useQuery(getCampaign);

  // Admins
  const admins        = useQuery(listAdmins);
  const removeAdminMu = useMutation((id: string) => removeAdmin(id));
  const inviteAdminMu = useMutation((payload: typeof emptyAdminForm) => inviteAdmin(payload));
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [adminForm, setAdminForm]           = useState(emptyAdminForm);
  const [adminFormErr, setAdminFormErr]     = useState('');

  // Payment accounts
  const accounts        = useQuery(listPaymentAccounts);
  const addAccountMu    = useMutation((payload: typeof emptyAccountForm) => addPaymentAccount(payload));
  const removeAccountMu = useMutation((id: string) => removePaymentAccount(id));
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [accountForm, setAccountForm]         = useState(emptyAccountForm);
  const [accountFormErr, setAccountFormErr]   = useState('');

  // ─── Admins handlers ────────────────────────────────────────────────────────
  const handleRemoveAdmin = async (id: string) => {
    await removeAdminMu.mutate(id);
    admins.refresh();
  };

  const handleInviteAdmin = async () => {
    if (!adminForm.name.trim() || !adminForm.email.trim() || !adminForm.phone.trim()) {
      setAdminFormErr('Please fill in all required fields.'); return;
    }
    const result = await inviteAdminMu.mutate(adminForm);
    if (result) {
      setShowInviteForm(false);
      setAdminForm(emptyAdminForm);
      setAdminFormErr('');
      admins.refresh();
    } else {
      setAdminFormErr(inviteAdminMu.error ?? 'Invite failed.');
    }
  };

  // ─── Account handlers ────────────────────────────────────────────────────────
  const handleAddAccount = async () => {
    if (!accountForm.account_name.trim() || !accountForm.bank_name || !accountForm.account_number.trim()) {
      setAccountFormErr('Please fill in all required fields.'); return;
    }
    const result = await addAccountMu.mutate(accountForm);
    if (result) {
      setShowAccountForm(false);
      setAccountForm(emptyAccountForm);
      setAccountFormErr('');
      accounts.refresh();
    } else {
      setAccountFormErr(addAccountMu.error ?? 'Could not add account.');
    }
  };

  const handleRemoveAccount = async (id: string) => {
    await removeAccountMu.mutate(id);
    accounts.refresh();
  };

  const c = campaign.data;

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
        {/* Campaign info */}
        <div className="card">
          <div className="card-head"><div><h3>Campaign info</h3><div className="sub">Basic details shown on the public page</div></div></div>
          {campaign.loading ? (
            <div style={{ padding: '20px 0', color: 'var(--muted)', fontSize: 13 }}>Loading…</div>
          ) : c ? (
            <>
              {[
                ['Campaign name',  c.name],
                ['Subtitle',       c.subtitle ?? '—'],
                ['Organisation',   `${c.organisation ?? '—'}${c.flags?.is_verified ? ' ✓ Verified' : ''}`],
                ['Target amount',  `TZS ${c.target_amount.toLocaleString()}`],
                ['Total raised',   `TZS ${c.total_raised.toLocaleString()}`],
                ['Campaign end',   new Date(c.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })],
                ['Public URL',     c.public_url ?? '—'],
              ].map(([l, v], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--line-2)' }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>{l}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{v}</span>
                </div>
              ))}
            </>
          ) : null}
          <button className="btn btn-dark" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>Edit campaign details</button>
        </div>

        {/* Admins */}
        <div className="card">
          <div className="card-head">
            <div><h3>Authorised admins</h3><div className="sub">Admins can view and initiate disbursements</div></div>
          </div>

          {admins.loading ? (
            <div style={{ padding: '20px 0', color: 'var(--muted)', fontSize: 13 }}>Loading…</div>
          ) : (
            (admins.data ?? []).map((a: Admin, i: number) => (
              <div key={a.id} className="contrib" style={{ padding: '12px 0', borderBottom: '1px solid var(--line-2)' }}>
                <div className={`contrib-avatar v${(i % 4) + 1}`}>{a.avatar_initials}</div>
                <div style={{ flex: 1 }}>
                  <div className="contrib-name">{a.name}</div>
                  <div className="contrib-meta">{ADMIN_ROLE_LABELS[a.role] ?? a.role}</div>
                </div>
                {a.role !== 'owner' && (
                  <button
                    className="btn btn-ghost"
                    style={{ padding: '5px 10px', fontSize: 11 }}
                    onClick={() => handleRemoveAdmin(a.id)}
                    disabled={removeAdminMu.loading}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))
          )}

          {showInviteForm && (
            <div style={{ marginTop: 16, background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 12, padding: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Invite admin</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label className="field-label">Full name <span style={{ color: 'var(--rose)' }}>*</span></label>
                  <input className="field-input" placeholder="e.g. Grace Mollel" value={adminForm.name}
                    onChange={e => setAdminForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="field-label">Email <span style={{ color: 'var(--rose)' }}>*</span></label>
                  <input className="field-input" type="email" placeholder="grace@moyo.tz" value={adminForm.email}
                    onChange={e => setAdminForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label className="field-label">Phone (E.164) <span style={{ color: 'var(--rose)' }}>*</span></label>
                  <input className="field-input" type="tel" placeholder="+255712000099" value={adminForm.phone}
                    onChange={e => setAdminForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="field-label">Role</label>
                  <select className="field-input" value={adminForm.role}
                    onChange={e => setAdminForm(f => ({ ...f, role: e.target.value as AdminRole }))}
                    style={{ cursor: 'pointer' }}>
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
              </div>
              {adminFormErr && <div style={{ marginTop: 10, fontSize: 12, color: 'var(--rose)' }}>{adminFormErr}</div>}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
                <button className="btn btn-ghost" onClick={() => { setShowInviteForm(false); setAdminFormErr(''); }}>Cancel</button>
                <button className="btn btn-dark" onClick={handleInviteAdmin} disabled={inviteAdminMu.loading}>
                  {inviteAdminMu.loading ? 'Sending…' : 'Send invite'}
                </button>
              </div>
            </div>
          )}

          {!showInviteForm && (
            <button className="btn btn-ghost" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}
              onClick={() => setShowInviteForm(true)}>
              + Invite admin
            </button>
          )}
        </div>
      </div>

      {/* Payment accounts */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-head" style={{ marginBottom: showAccountForm ? 20 : 4 }}>
          <div><h3>Payment accounts</h3><div className="sub">Bank accounts that can receive disbursements from this campaign</div></div>
          {!showAccountForm && (
            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setShowAccountForm(true)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add account
            </button>
          )}
        </div>

        {showAccountForm && (
          <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 14, padding: 22, marginBottom: 22 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 18 }}>New payment account</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="field-label">Account name <span style={{ color: 'var(--rose)' }}>*</span></label>
                <input className="field-input" placeholder="e.g. Moyo Foundation" value={accountForm.account_name}
                  onChange={e => { setAccountForm(f => ({ ...f, account_name: e.target.value })); setAccountFormErr(''); }} />
              </div>
              <div>
                <label className="field-label">Bank name <span style={{ color: 'var(--rose)' }}>*</span></label>
                <select className="field-input" value={accountForm.bank_name}
                  onChange={e => { setAccountForm(f => ({ ...f, bank_name: e.target.value })); setAccountFormErr(''); }}
                  style={{ cursor: 'pointer' }}>
                  <option value="">Select bank…</option>
                  {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Account number <span style={{ color: 'var(--rose)' }}>*</span></label>
                <input className="field-input" placeholder="e.g. 40710002841" value={accountForm.account_number}
                  onChange={e => { setAccountForm(f => ({ ...f, account_number: e.target.value })); setAccountFormErr(''); }}
                  style={{ fontFamily: 'var(--mono)' }} />
              </div>
              <div>
                <label className="field-label">Branch <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                <input className="field-input" placeholder="e.g. Dar es Salaam Main" value={accountForm.branch}
                  onChange={e => setAccountForm(f => ({ ...f, branch: e.target.value }))} />
              </div>
            </div>
            {accountFormErr && (
              <div style={{ marginTop: 12, fontSize: 12, color: 'var(--rose)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {accountFormErr}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 18 }}>
              <button className="btn btn-ghost" onClick={() => { setShowAccountForm(false); setAccountForm(emptyAccountForm); setAccountFormErr(''); }}>Cancel</button>
              <button className="btn btn-dark" onClick={handleAddAccount} disabled={addAccountMu.loading}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {addAccountMu.loading ? 'Saving…' : 'Save account'}
              </button>
            </div>
          </div>
        )}

        {accounts.loading ? (
          <div style={{ padding: '20px', color: 'var(--muted)', fontSize: 13 }}>Loading…</div>
        ) : !accounts.data?.length && !showAccountForm ? (
          <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--muted)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: 'var(--muted-2)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 4 }}>No payment accounts yet</div>
            <div style={{ fontSize: 12 }}>Add a bank account to enable disbursements from this campaign.</div>
          </div>
        ) : accounts.data?.length ? (
          <table className="table" style={{ marginTop: showAccountForm ? 0 : 8 }}>
            <thead>
              <tr><th>Account name</th><th>Bank</th><th>Account number</th><th>Branch</th><th style={{ textAlign: 'center' }}>Action</th></tr>
            </thead>
            <tbody>
              {(accounts.data as PaymentAccount[]).map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600 }}>{a.account_name}</td>
                  <td>{a.bank_name}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{a.account_number}</td>
                  <td style={{ color: 'var(--muted)', fontSize: 12 }}>{a.branch || '—'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: '5px 12px', fontSize: 11, color: 'var(--rose)', borderColor: 'rgba(229,84,125,0.25)' }}
                      onClick={() => handleRemoveAccount(a.id)}
                      disabled={removeAccountMu.loading}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    </div>
  );
}
