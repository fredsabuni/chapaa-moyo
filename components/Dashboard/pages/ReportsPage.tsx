'use client';

const reports = [
  { name: 'Weekly Summary — Week 18',       date: 'May 05, 2026', size: '284 KB', type: 'PDF' },
  { name: 'Weekly Summary — Week 17',       date: 'Apr 28, 2026', size: '271 KB', type: 'PDF' },
  { name: 'Monthly Report — April 2026',    date: 'May 01, 2026', size: '1.2 MB', type: 'PDF' },
  { name: 'Contributor Export — Apr 2026',  date: 'May 01, 2026', size: '892 KB', type: 'CSV' },
  { name: 'Disbursement Audit — Q1 2026',   date: 'Apr 01, 2026', size: '548 KB', type: 'PDF' },
  { name: 'Regional Breakdown — Apr 2026',  date: 'May 01, 2026', size: '340 KB', type: 'XLSX' },
];

export default function ReportsPage() {
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
        <table className="table">
          <thead>
            <tr><th>Report name</th><th>Generated</th><th>Format</th><th>Size</th><th style={{ textAlign: 'center' }}>Action</th></tr>
          </thead>
          <tbody>
            {reports.map((r, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{r.name}</td>
                <td style={{ color: 'var(--muted)', fontSize: 12 }}>{r.date}</td>
                <td><span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, fontWeight: 600, background: 'var(--bg)', border: '1px solid var(--line)' }}>{r.type}</span></td>
                <td style={{ color: 'var(--muted)', fontSize: 12, fontFamily: 'var(--mono)' }}>{r.size}</td>
                <td style={{ textAlign: 'center' }}><button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 11 }}>Download</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
