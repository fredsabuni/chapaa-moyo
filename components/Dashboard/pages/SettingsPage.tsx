'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@/lib/useQuery';
import { getCampaign } from '@/lib/services/campaign.service';
import { listAdmins, removeAdmin, inviteAdmin } from '@/lib/services/admins.service';
import { ADMIN_ROLE_LABELS } from '@/lib/constants';
import type { Admin, AdminRole } from '@/lib/types';

const ROLES: { value: AdminRole; label: string }[] = [
  { value: 'medical_director', label: 'Medical director' },
  { value: 'finance_officer',  label: 'Finance officer' },
  { value: 'viewer',           label: 'Viewer' },
];

const emptyAdminForm = { name: '', email: '', phone: '', role: 'finance_officer' as AdminRole };

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
                ['Target amount',  c.target_amount != null ? `TZS ${c.target_amount.toLocaleString()}` : '—'],
                ['Total raised',   c.total_raised  != null ? `TZS ${c.total_raised.toLocaleString()}`  : '—'],
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
            (Array.isArray(admins.data) ? admins.data : []).map((a: Admin, i: number) => (
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

    </div>
  );
}
