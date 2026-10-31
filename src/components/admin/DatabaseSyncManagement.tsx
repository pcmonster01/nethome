import React, { useState } from 'react';
import {
  Customer,
  Bill,
  Receipt,
  NetPlan,
  AdminAccount,
  CompanyProfile,
  EmailReminderLog,
  LoginAuditLog,
} from '../../types';
import {
  syncDatabaseWithPublished,
  reindexSubscribersData,
  DatabaseSyncResult,
} from '../../utils/storage';
import {
  RefreshCw,
  Database,
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
  Server,
  ShieldCheck,
  Users,
  FileText,
  Receipt as ReceiptIcon,
  Wifi,
  Sparkles,
} from 'lucide-react';

interface DatabaseSyncManagementProps {
  customers: Customer[];
  bills: Bill[];
  receipts: Receipt[];
  netPlans: NetPlan[];
  adminAccounts: AdminAccount[];
  companyProfile: CompanyProfile;
  emailLogs: EmailReminderLog[];
  loginLogs: LoginAuditLog[];
  onRefreshAllData: (syncedData?: any) => void;
  showToast: (msg: string) => void;
}

export const DatabaseSyncManagement: React.FC<DatabaseSyncManagementProps> = ({
  customers,
  bills,
  receipts,
  netPlans,
  adminAccounts,
  companyProfile,
  emailLogs,
  loginLogs,
  onRefreshAllData,
  showToast,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<DatabaseSyncResult | null>(null);
  const [importJsonText, setImportJsonText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importError, setImportError] = useState('');

  const handleSyncToPublished = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      // First ensure subscriber data is clean and valid
      const reindexed = reindexSubscribersData();
      const result = await syncDatabaseWithPublished();
      setSyncResult(result);
      if (result.success) {
        showToast('System database records successfully synchronized to the published database!');
        onRefreshAllData({ customers: reindexed });
      } else {
        showToast('Database synchronization encountered a warning: ' + result.message);
      }
    } catch (err: any) {
      setSyncResult({
        success: false,
        message: err?.message || 'Failed to sync database records.',
        syncedAt: new Date().toISOString(),
        counts: {
          customers: customers.length,
          bills: bills.length,
          receipts: receipts.length,
          adminAccounts: adminAccounts.length,
          netPlans: netPlans.length,
        },
      });
      showToast('Error syncing database records.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportBackup = () => {
    const backupData = {
      system: 'Net-Home Broadband Networks Corp.',
      exportedAt: new Date().toISOString(),
      database: {
        customers,
        bills,
        receipts,
        netPlans,
        adminAccounts,
        companyProfile,
        emailLogs,
        loginLogs,
      },
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nethome-database-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Database backup downloaded successfully.');
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportError('');
    if (!importJsonText.trim()) {
      setImportError('Please paste valid JSON database content.');
      return;
    }

    try {
      const parsed = JSON.parse(importJsonText);
      const db = parsed.database || parsed;

      if (!Array.isArray(db.customers) && !Array.isArray(db.bills)) {
        throw new Error('Invalid format: Expected customers or bills array in JSON.');
      }

      setIsSyncing(true);
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(db),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      showToast('Database records imported and synchronized successfully!');
      setShowImportModal(false);
      setImportJsonText('');
      window.location.reload();
    } catch (err: any) {
      setImportError(err.message || 'Invalid JSON format. Please verify the content.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
            <Server className="w-3.5 h-3.5 text-blue-400" />
            <span>Centralized Database Synchronization Service</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-400" />
            <span>System Database &amp; Published Database Synchronization</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Synchronize all subscriber login credentials, monthly billing statements, payment receipts, internet plans, and company profiles with the published server database so they are instantly accessible on both development and published portals.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleSyncToPublished}
            disabled={isSyncing}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing...' : 'Sync to Published Database'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportBackup}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all cursor-pointer"
            title="Export complete database backup as JSON"
          >
            <Download className="w-4 h-4" />
            <span>Export Snapshot</span>
          </button>
        </div>
      </div>

      {/* Sync Feedback Result Banner */}
      {syncResult && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 text-xs animate-in fade-in slide-in-from-top-2 ${
            syncResult.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {syncResult.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <div className="font-bold text-sm">
              {syncResult.success ? 'Synchronization Successful' : 'Synchronization Failed'}
            </div>
            <p className="mt-0.5 text-xs">{syncResult.message}</p>
            {syncResult.success && syncResult.counts && (
              <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] font-mono text-emerald-800">
                <span>Subscribers Synced: <strong>{syncResult.counts.customers}</strong></span>
                <span>·</span>
                <span>Billing Invoices: <strong>{syncResult.counts.bills}</strong></span>
                <span>·</span>
                <span>Official Receipts: <strong>{syncResult.counts.receipts}</strong></span>
                <span>·</span>
                <span>Net Plans: <strong>{syncResult.counts.netPlans}</strong></span>
                <span>·</span>
                <span>Timestamp: <strong>{new Date(syncResult.syncedAt).toLocaleTimeString()}</strong></span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Database Statistics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Subscribers</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{customers.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Active login records</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Billing Invoices</span>
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{bills.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Monthly statements</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Official Receipts</span>
            <ReceiptIcon className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{receipts.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Payment history</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Internet Plans</span>
            <Wifi className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{netPlans.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Broadband tiers</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Admin Staff</span>
            <ShieldCheck className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{adminAccounts.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Authorized staff</span>
        </div>
      </div>

      {/* Synchronization Architecture & Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Live Database Status</h3>
              <p className="text-xs text-slate-500">Connected to persistent backend storage</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Database Engine:</span>
              <span className="font-semibold text-slate-900">Express API + File Database</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Sync Endpoint:</span>
              <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                /api/sync
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Database Path:</span>
              <span className="font-mono text-xs text-slate-700">/data/database.json</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-600">Cross-Portal Consistency:</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active &amp; Synced
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={handleSyncToPublished}
              disabled={isSyncing}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync All Records Now</span>
            </button>
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import JSON</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-xs space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-slate-900">How Synchronization Works</h3>
          </div>
          <ul className="space-y-2 text-slate-600 leading-relaxed list-disc list-inside">
            <li>
              <strong>Instant Portability:</strong> Whenever a subscriber or billing statement is added, it is automatically written to both browser cache and the centralized server database.
            </li>
            <li>
              <strong>Published Portal Access:</strong> When users open the published application URL (<code>https://ais-pre-...</code>), records from the server are loaded immediately.
            </li>
            <li>
              <strong>Subscribers Login Credentials:</strong> Re-indexing confirms that every subscriber has clean, sanitized usernames and passwords ready for client portal login.
            </li>
            <li>
              <strong>Offline Resilience:</strong> If network connectivity is momentarily interrupted, local storage caches records safely until the next synchronization.
            </li>
          </ul>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 border border-slate-200 text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>Import &amp; Restore Database Snapshot</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <p className="text-slate-600">
                Paste the exported JSON database structure below to restore all subscribers, monthly bills, and settings into the published database.
              </p>

              {importError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg font-medium">
                  {importError}
                </div>
              )}

              <textarea
                rows={10}
                required
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='{"customers": [...], "bills": [...]}'
                className="w-full font-mono text-xs p-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSyncing}
                  className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {isSyncing ? 'Importing...' : 'Import and Sync Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
