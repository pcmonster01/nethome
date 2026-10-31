import React from 'react';
import { EmailReminderLog } from '../types';
import { Mail, X, Calendar, User, CheckCircle2 } from 'lucide-react';
import { formatPeso } from '../utils/numberToWords';

interface EmailPreviewModalProps {
  log: EmailReminderLog | null;
  onClose: () => void;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({ log, onClose }) => {
  if (!log) return null;

  const triggerLabel = {
    automated_active_status: 'Automated: Active Account Status Trigger',
    automated_schedule: 'Automated: Daily Schedule Trigger',
    new_bill_dispatch: 'Automated: New Bill Generated Trigger',
    manual_admin: 'Admin Triggered Email Dispatch',
  }[log.triggerType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-slate-800 text-sm">Automated Email Notification Preview</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Email Meta Envelope */}
        <div className="p-5 bg-slate-50/70 border-b border-slate-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="font-semibold text-slate-800 w-16">From:</span>
              <span>Net-Home Billing System &lt;billing@nethome.ph&gt;</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {new Date(log.sentAt).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-semibold text-slate-800 w-16">To:</span>
            <span className="font-medium text-slate-900">{log.customerName}</span>
            <span className="text-slate-500">&lt;{log.customerEmail}&gt;</span>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-semibold text-slate-800 w-16">Subject:</span>
            <span className="font-semibold text-slate-900">{log.subject}</span>
          </div>

          <div className="pt-2 flex items-center gap-3 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1 text-blue-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {triggerLabel}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-medium">Status: Delivered to Mailbox</span>
          </div>
        </div>

        {/* Visual HTML Email Content */}
        <div className="p-6 bg-slate-100 max-h-[60vh] overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xs border border-slate-200 overflow-hidden max-w-xl mx-auto">
            {/* Header banner */}
            <div className="bg-blue-600 px-6 py-5 text-white">
              <div className="font-bold text-lg tracking-tight">NET-HOME BROADBAND</div>
              <div className="text-xs text-blue-100 mt-0.5">Automated Monthly Billing Reminder</div>
            </div>

            {/* Email Body */}
            <div className="p-6 text-sm text-slate-700 space-y-4">
              <div>
                <p className="font-semibold text-slate-900">Dear {log.customerName},</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  We hope you are enjoying your high-speed fiber connection. This is a reminder regarding your current billing statement for <strong>{log.period}</strong>.
                </p>
              </div>

              {/* Bill Details Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Billing Period:</span>
                  <span className="font-medium text-slate-900">{log.period}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Payment Due Date:</span>
                  <span className="font-bold text-amber-700">{log.dueDate}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-800">Amount to Pay:</span>
                  <span className="font-bold font-mono text-base text-blue-700 tabular-nums">
                    {formatPeso(log.amount)}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-2">
                <p className="font-semibold text-slate-800">Authorized Payment Channels:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                    <span className="font-semibold text-slate-800 block">Collector&apos;s Pick-up</span>
                    <span className="text-slate-500">Authorized field collection representative</span>
                  </div>
                  <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded">
                    <span className="font-semibold text-blue-950 block">GCash: 09562262394</span>
                    <span className="text-slate-600 font-mono text-[10px]">Name: CR*****O D.</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-400 leading-normal">
                Net-Home Broadband Networks Inc. · Support: support@nethome.ph · Pasig City, Philippines
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
