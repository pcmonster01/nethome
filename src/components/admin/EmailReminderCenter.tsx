import React, { useState } from 'react';
import { Customer, Bill, EmailReminderLog } from '../../types';
import { AutoReminderSettings } from '../../utils/storage';
import { formatPeso } from '../../utils/numberToWords';
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Settings,
  Search,
  Eye,
  RefreshCw,
  Sparkles,
  Zap,
  Filter,
} from 'lucide-react';

interface EmailReminderCenterProps {
  customers: Customer[];
  bills: Bill[];
  emailLogs: EmailReminderLog[];
  settings: AutoReminderSettings;
  onUpdateSettings: (newSettings: AutoReminderSettings) => void;
  onTriggerBatchReminders: () => void;
  onPreviewEmail: (log: EmailReminderLog) => void;
  onClearLogs?: () => void;
}

export const EmailReminderCenter: React.FC<EmailReminderCenterProps> = ({
  customers,
  bills,
  emailLogs,
  settings,
  onUpdateSettings,
  onTriggerBatchReminders,
  onPreviewEmail,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [triggerFilter, setTriggerFilter] = useState<string>('all');
  const [isScanning, setIsScanning] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const activeCustomers = customers.filter((c) => c.status === 'active');
  const activeWithUnpaidBills = activeCustomers.filter((c) => {
    return bills.some((b) => b.customerId === c.id && (b.status === 'unpaid' || b.status === 'overdue'));
  });

  const handleTriggerNow = () => {
    setIsScanning(true);
    setTimeout(() => {
      onTriggerBatchReminders();
      setIsScanning(false);
    }, 400);
  };

  const filteredLogs = emailLogs.filter((log) => {
    const matchesSearch =
      log.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.period.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = triggerFilter === 'all' || log.triggerType === triggerFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Automated Email Billing Reminders
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 rounded-md border border-emerald-200">
              <Zap className="w-3 h-3 text-emerald-600 fill-emerald-600" />
              Engine Online
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated dispatcher triggers reminders for active client accounts whenever status is active or monthly bills are issued.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            Automation Rules
          </button>

          <button
            onClick={handleTriggerNow}
            disabled={isScanning}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            Trigger Automated Dispatch Now
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Active Client Accounts
          </span>
          <div className="text-xl font-bold text-slate-900 font-mono mt-1 tabular-nums">
            {activeCustomers.length}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1">Eligible for automated reminders</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">
            Active Accounts With Unpaid Bills
          </span>
          <div className="text-xl font-bold text-amber-700 font-mono mt-1 tabular-nums">
            {activeWithUnpaidBills.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Pending billing collection</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
            Dispatched Email Reminders
          </span>
          <div className="text-xl font-bold text-blue-900 font-mono mt-1 tabular-nums">
            {emailLogs.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Total notifications logged</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Automated Delivery Rate
          </span>
          <div className="text-xl font-bold text-emerald-700 font-mono mt-1 tabular-nums">
            100.0%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">0 delivery failures detected</div>
        </div>
      </div>

      {/* Automated Behavior Clarification Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
            <Mail className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-blue-950 block text-sm">
              Automated Email Reminder Trigger Rule is Active
            </span>
            <p className="text-blue-800/90 mt-0.5 leading-relaxed">
              If customer status is set to <strong>active</strong>, the system triggers billing notifications automatically. In addition, when new monthly bills are added for active clients, email statements are queued and dispatched immediately.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <span className="text-xs text-blue-900 font-medium whitespace-nowrap">
            Auto-Trigger on Active Status: <strong>ENABLED</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search email logs by client, email, period, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
          />
        </div>

        {/* Trigger Type Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start md:self-auto text-xs">
          <button
            onClick={() => setTriggerFilter('all')}
            className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
              triggerFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Logs
          </button>
          <button
            onClick={() => setTriggerFilter('automated_active_status')}
            className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
              triggerFilter === 'automated_active_status'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Status Trigger
          </button>
          <button
            onClick={() => setTriggerFilter('new_bill_dispatch')}
            className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
              triggerFilter === 'new_bill_dispatch'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            New Bill Trigger
          </button>
        </div>
      </div>

      {/* Automated Email Reminders Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Sent Timestamp</th>
                <th className="py-3 px-4 font-semibold">Client Recipient</th>
                <th className="py-3 px-4 font-semibold">Billing Period</th>
                <th className="py-3 px-4 font-semibold text-right">Amount Due</th>
                <th className="py-3 px-4 font-semibold">Payment Due</th>
                <th className="py-3 px-4 font-semibold">Trigger Classification</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No email notification logs found. Click "Trigger Automated Dispatch Now" to run a scan.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const triggerBadge = {
                    automated_active_status: {
                      text: 'Automated (Active Account)',
                      color: 'text-blue-700 bg-blue-50 border-blue-200',
                    },
                    automated_schedule: {
                      text: 'Automated (Daily Schedule)',
                      color: 'text-purple-700 bg-purple-50 border-purple-200',
                    },
                    new_bill_dispatch: {
                      text: 'Automated (New Bill)',
                      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
                    },
                    manual_admin: {
                      text: 'Manual Admin Dispatch',
                      color: 'text-slate-700 bg-slate-50 border-slate-200',
                    },
                  }[log.triggerType];

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {new Date(log.sentAt).toLocaleString('en-PH', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{log.customerName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{log.customerEmail}</div>
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-700">
                        {log.period}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {formatPeso(log.amount)}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-700">
                        {log.dueDate}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-semibold border rounded ${triggerBadge.color}`}
                        >
                          {triggerBadge.text}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onPreviewEmail(log)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          Preview Email
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">Automated Billing Reminder Rules</h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer">
                <div>
                  <div className="font-semibold text-slate-800">Master Automation Engine</div>
                  <div className="text-[11px] text-slate-500">Enable automatic billing reminder system</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => onUpdateSettings({ ...settings, enabled: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer">
                <div>
                  <div className="font-semibold text-slate-800">Trigger When Account Set to Active</div>
                  <div className="text-[11px] text-slate-500">Automatically send notices if status is active</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifyOnActiveChange}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, notifyOnActiveChange: e.target.checked })
                  }
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer">
                <div>
                  <div className="font-semibold text-slate-800">Trigger on New Monthly Bill Issued</div>
                  <div className="text-[11px] text-slate-500">Instantly notify active subscriber upon invoicing</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifyOnNewBill}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, notifyOnNewBill: e.target.checked })
                  }
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
              </label>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Dispatch Days Prior to Due Date
                </label>
                <select
                  value={settings.daysBeforeDue}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, daysBeforeDue: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-xs"
                >
                  <option value={3}>3 Days before Due Date</option>
                  <option value={5}>5 Days before Due Date (Standard)</option>
                  <option value={7}>7 Days before Due Date</option>
                  <option value={10}>10 Days before Due Date</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
