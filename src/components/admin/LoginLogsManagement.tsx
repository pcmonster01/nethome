import React, { useState } from 'react';
import { LoginAuditLog } from '../../types';
import {
  FileText,
  Download,
  Trash2,
  Search,
  Shield,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  Laptop,
  Smartphone,
  Filter,
} from 'lucide-react';
import { exportToJson } from '../../utils/exportJson';

interface LoginLogsManagementProps {
  loginLogs: LoginAuditLog[];
  onClearLogs: () => void;
}

export const LoginLogsManagement: React.FC<LoginLogsManagementProps> = ({
  loginLogs,
  onClearLogs,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'client'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredLogs = loginLogs.filter((log) => {
    const matchesSearch =
      log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.position && log.position.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.deviceInfo && log.deviceInfo.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === 'all' || log.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleDownloadLogFile = () => {
    let content = '========================================================================================\n';
    content += '              NET-HOME BROADBAND NETWORKS - AUTHENTICATION & LOGIN AUDIT LOG FILE        \n';
    content += `              Generated: ${new Date().toISOString()} | Total Entries: ${loginLogs.length}\n`;
    content += '========================================================================================\n\n';

    loginLogs.forEach((l) => {
      content += `[${l.timestamp}] STATUS=${l.status.toUpperCase()} | ROLE=${l.role.toUpperCase()}`;
      if (l.position) content += ` (POSITION: ${l.position})`;
      content += ` | USER="${l.name}" | ID="${l.identifier}"`;
      if (l.deviceInfo) content += ` | DEVICE="${l.deviceInfo}"`;
      content += '\n';
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nethome-auth-login-audit-${new Date().toISOString().slice(0, 10)}.log`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCsv = () => {
    const headers = ['Log ID', 'Timestamp', 'Role', 'Position', 'User Name', 'Identifier/Email', 'Status', 'Device'];
    const rows = loginLogs.map((l) => [
      l.id,
      l.timestamp,
      l.role,
      l.position || '—',
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.identifier.replace(/"/g, '""')}"`,
      l.status,
      `"${(l.deviceInfo || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nethome-login-audit-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Download Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Login Activity &amp; Authentication Logs
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log file capturing subscriber portal and administrative staff sign-in events with timestamps and security verification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadLogFile}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
            title="Download formatted .log file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Log File (.log)</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-xs cursor-pointer"
            title="Export as CSV spreadsheet"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => exportToJson(`login_audit_logs_${new Date().toISOString().slice(0, 10)}.json`, loginLogs)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg transition-colors shadow-xs cursor-pointer"
            title="Export login audit logs to JSON"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            disabled={loginLogs.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-xs cursor-pointer"
            title="Clear all login audit activity records"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Clear Logs ({loginLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by user name, email, or device..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold text-xs">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin Staff</option>
              <option value="client">Client Subscribers</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold text-xs">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed Attempt</option>
            </select>
          </div>
        </div>
      </div>

      {/* Log Entries Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Role &amp; Position</th>
                <th className="py-3 px-4 font-semibold">User</th>
                <th className="py-3 px-4 font-semibold">Username / Email Identifier</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Device / Client</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-sans">
                    No login logs found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{new Date(log.timestamp).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {log.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          <Shield className="w-3 h-3 text-purple-600" />
                          <span>Admin {log.position ? `(${log.position})` : ''}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <User className="w-3 h-3 text-blue-600" />
                          <span>Client Subscriber</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-sans font-bold text-slate-900">
                      {log.name}
                    </td>

                    <td className="py-3 px-4 text-slate-700">
                      {log.identifier}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {log.status === 'success' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Success</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-semibold text-[11px]">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Failed Attempt</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-500 truncate max-w-xs font-sans text-xs">
                      {log.deviceInfo || 'Web Browser'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clear Logs In-App Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-200 text-xs animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Clear Authentication Logs</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              Are you sure you want to clear all {loginLogs.length} login activity records? This action cannot be reversed.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearLogs();
                  setShowClearConfirm(false);
                }}
                className="px-3.5 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Clear All Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
