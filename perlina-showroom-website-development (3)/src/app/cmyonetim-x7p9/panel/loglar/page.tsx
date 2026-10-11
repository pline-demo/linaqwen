"use client";
import { useEffect, useState } from "react";

interface LogEntry {
  id: number;
  action: string;
  description: string | null;
  subjectType: string | null;
  subjectId: number | null;
  ipAddress: string | null;
  createdAt: string | null;
  username: string | null;
  fullName: string | null;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch("/api/admin/logs")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setLogs(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter
    ? logs.filter(l => l.description?.toLowerCase().includes(filter.toLowerCase()) || l.username?.toLowerCase().includes(filter.toLowerCase()) || l.action?.toLowerCase().includes(filter.toLowerCase()))
    : logs;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="spinner w-8 h-8" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-family-heading)] text-2xl font-semibold text-charcoal">Aktivite Logları</h1>
        <p className="text-sm text-warm-gray-light mt-1">{logs.length} kayıt</p>
      </div>

      <div className="mb-4">
        <input type="text" value={filter} onChange={e => setFilter(e.target.value)} className="form-input max-w-md" placeholder="Ara... (kullanıcı, işlem, açıklama)" />
      </div>

      <div className="admin-card overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Kullanıcı</th>
              <th>İşlem</th>
              <th>Açıklama</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(log => (
              <tr key={log.id}>
                <td className="text-xs text-warm-gray-light whitespace-nowrap">
                  {log.createdAt ? new Date(log.createdAt).toLocaleString("tr-TR") : "—"}
                </td>
                <td className="text-sm font-medium">{log.fullName || log.username || "—"}</td>
                <td className="text-xs">
                  <span className="badge badge-info">{log.action}</span>
                </td>
                <td className="text-sm text-warm-gray">{log.description || "—"}</td>
                <td className="text-xs text-warm-gray-light">{log.ipAddress || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center py-8 text-warm-gray-light">Log kaydı bulunamadı.</p>}
      </div>
    </div>
  );
}
