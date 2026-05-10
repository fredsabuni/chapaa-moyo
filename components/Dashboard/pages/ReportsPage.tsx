'use client';

import { useQuery, useMutation } from '@/lib/useQuery';
import { listReports, getReportDownload } from '@/lib/services/reports.service';

export default function ReportsPage() {
  const { data: reports, loading, error } = useQuery(listReports);
  const download = useMutation(getReportDownload);

  const handleDownload = async (id: string) => {
    const result = await download.mutate(id);
    if (result) window.open(result.url, '_blank');
  };

  return (
    <div>
      <div className="pageHead">
        <div>
          <div className="crumb">Moyo · Heart Surgery Fund</div>
          <h1>Campaign <em>Reports</em></h1>
          <div className="sub">Downloadable reports for auditing, partners, and medical institutions.</div>
        </div>
        <div className="head-actions">
          <button className="btn btn-ghost" onClick={() => window.print()}>Print Report</button>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div><h3>Available reports</h3><div className="sub">Generated automatically at the end of each period</div></div>
        </div>

        {error && <div style={{ padding: '16px', color: 'var(--rose)', fontSize: 13 }}>{error}</div>}
        {loading && <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Loading…</div>}

        {reports && reports.length > 0 && (
          <table className="table">
            <thead>
              <tr><th>Report name</th><th>Generated</th><th>Format</th><th>Size</th><th style={{ textAlign: 'center' }}>Action</th></tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.name}</td>
                  <td style={{ color: 'var(--muted)', fontSize: 12 }}>
                    {new Date(r.generated_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                  </td>
                  <td>
                    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, fontWeight: 600, background: 'var(--bg)', border: '1px solid var(--line)' }}>{r.type}</span>
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: 12, fontFamily: 'var(--mono)' }}>{r.size_label}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: '6px 12px', fontSize: 11 }}
                      onClick={() => handleDownload(r.id)}
                      disabled={download.loading}
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && reports?.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No reports available yet.</div>
        )}
      </div>
    </div>
  );
}
