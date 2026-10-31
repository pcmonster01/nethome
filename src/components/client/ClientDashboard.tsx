import React, { useState } from 'react';
import { Customer, Bill, Receipt, EmailReminderLog, PaymentMethod, SupportTicket, TicketCategory } from '../../types';
import { formatPeso, numberToWordsInPeso } from '../../utils/numberToWords';
import {
  Wifi,
  CreditCard,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  MapPin,
  Phone,
  Mail,
  FileText,
  ShieldCheck,
  Zap,
  ArrowRight,
  X,
  ExternalLink,
  Wrench,
  LifeBuoy,
  Send,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';

interface ClientDashboardProps {
  customer: Customer;
  bills: Bill[];
  receipts: Receipt[];
  emailLogs: EmailReminderLog[];
  supportTickets?: SupportTicket[];
  onPayBill: (paymentData: {
    billId: string;
    customerId: string;
    paymentMethod: PaymentMethod;
    referenceNo: string;
    issuedBy: string;
    date: string;
    dateIssued?: string;
    paymentDate?: string;
  }) => void;
  onPrintReceipt: (receipt: Receipt) => void;
  onPrintBill?: (bill: Bill) => void;
  onPreviewEmail: (log: EmailReminderLog) => void;
  onAddSupportTicket?: (ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  customer,
  bills,
  receipts,
  emailLogs,
  supportTickets = [],
  onPayBill,
  onPrintReceipt,
  onPrintBill,
  onPreviewEmail,
  onAddSupportTicket,
  activeTab,
  onTabChange,
}) => {
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedBillToPay, setSelectedBillToPay] = useState<Bill | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('GCash');
  const [referenceNo, setReferenceNo] = useState(`ONLINE-GC-${Math.floor(10000000 + Math.random() * 90000000)}`);
  const [paymentSuccessToast, setPaymentSuccessToast] = useState(false);

  // Repair Report Form State
  const [showReportModal, setShowReportModal] = useState(false);
  const [repairCategory, setRepairCategory] = useState<TicketCategory>('No Internet');
  const [repairSubject, setRepairSubject] = useState('');
  const [repairMessage, setRepairMessage] = useState('');
  const [repairPriority, setRepairPriority] = useState<'normal' | 'high' | 'urgent'>('urgent');
  const [contactPhone, setContactPhone] = useState(customer.contactNumber || '');
  const [reportSuccessNotice, setReportSuccessNotice] = useState<string>('');

  // Client's bills and tickets
  const clientBills = bills.filter((b) => b.customerId === customer.id);
  const unpaidBills = clientBills.filter((b) => b.status === 'unpaid' || b.status === 'overdue');
  const clientReceipts = receipts.filter((r) => r.customerId === customer.id);
  const clientEmails = emailLogs.filter((l) => l.customerId === customer.id);
  const clientTickets = (supportTickets || []).filter(
    (t) => t.customerId === customer.id || t.accountNo === customer.accountNo
  );

  // Total Unpaid Balance
  const totalUnpaidBalance = unpaidBills.reduce((acc, curr) => acc + curr.amount_pay, 0);

  // Earliest due date among unpaid bills
  const earliestDueDate = unpaidBills.length > 0 ? unpaidBills[0].due_date : customer.due_date;
  const hasOverdue = unpaidBills.some((b) => b.status === 'overdue');

  const handleStartPayment = (bill?: Bill) => {
    if (bill) {
      setSelectedBillToPay(bill);
    } else if (unpaidBills.length > 0) {
      setSelectedBillToPay(unpaidBills[0]);
    }
    setReferenceNo(`ONLINE-${paymentMethod.toUpperCase()}-${Math.floor(10000000 + Math.random() * 90000000)}`);
    setShowPayModal(true);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillToPay) return;

    const today = new Date().toISOString().slice(0, 10);
    onPayBill({
      billId: selectedBillToPay.id,
      customerId: customer.id,
      paymentMethod,
      referenceNo,
      issuedBy: 'Net-Home Online Portal Gateway',
      date: today,
      dateIssued: today,
      paymentDate: today,
    });

    setShowPayModal(false);
    setPaymentSuccessToast(true);
    setTimeout(() => setPaymentSuccessToast(false), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Payment Success Toast */}
      {paymentSuccessToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-sm block text-emerald-950">Payment Settled Successfully!</span>
              <span>Your official receipt has been issued and your account balance has been updated.</span>
            </div>
          </div>
          <button
            onClick={() => onTabChange('receipts')}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors cursor-pointer"
          >
            View Official Receipt
          </button>
        </div>
      )}

      {/* Account Greeting & Status Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Welcome back, {customer.lastname}!
            </h1>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                customer.status === 'active'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  customer.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              />
              Account {customer.status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
            <span>Account #: <strong className="font-mono text-slate-700">{customer.accountNo}</strong></span>
            <span aria-hidden="true">·</span>
            <span>Plan: <strong className="text-slate-700">{customer.net_plan}</strong></span>
            <span aria-hidden="true">·</span>
            <span>Cycle Due: <strong className="text-slate-700">{customer.due_date}</strong></span>
          </div>
        </div>

        {/* Quick Actions: Report for Repair and Notification badge */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setRepairSubject('');
              setRepairMessage('');
              setReportSuccessNotice('');
              setShowReportModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            title="Send message to Net-Home technical support for line or modem repair"
          >
            <Wrench className="w-4 h-4" />
            <span>Report for Repair</span>
          </button>

          <div className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
            <Zap className="w-4 h-4 text-blue-600 shrink-0" />
            <div className="hidden sm:block">
              <div className="font-semibold text-slate-800 text-[11px]">Automated Alerts</div>
              <div className="text-[10px] text-slate-500">
                SMS/Email due notices active
              </div>
            </div>
          </div>
        </div>
      </div>

      {reportSuccessNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-sm block text-emerald-950">Repair Report Sent Successfully!</span>
              <span>{reportSuccessNotice}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setReportSuccessNotice('')}
            className="text-emerald-700 hover:text-emerald-900 font-semibold underline text-xs cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Hero: Unpaid Balance Widget (Primary User Requirement) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Unpaid Balance Card */}
        <div
          className={`lg:col-span-2 p-6 sm:p-8 rounded-2xl border transition-all ${
            totalUnpaidBalance > 0
              ? hasOverdue
                ? 'bg-rose-50/70 border-rose-200 shadow-sm'
                : 'bg-amber-50/60 border-amber-200 shadow-sm'
              : 'bg-emerald-50/50 border-emerald-200 shadow-xs'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Total Outstanding Unpaid Balance
                </span>
                {totalUnpaidBalance > 0 && hasOverdue && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded">
                    OVERDUE NOTICE
                  </span>
                )}
              </div>

              <div className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 font-mono mt-2 tabular-nums">
                {formatPeso(totalUnpaidBalance)}
              </div>

              <p className="text-xs text-slate-600 mt-2">
                {totalUnpaidBalance > 0 ? (
                  <span>
                    You have <strong className="text-slate-900">{unpaidBills.length} unpaid bill(s)</strong>.
                    Payment due date: <strong className="font-mono text-slate-900">{earliestDueDate}</strong>.
                  </span>
                ) : (
                  <span className="text-emerald-800 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    All caught up! Your account is in good standing with zero unpaid balance.
                  </span>
                )}
              </p>
            </div>

            {totalUnpaidBalance > 0 && (
              <div className="shrink-0 flex flex-col items-start sm:items-end gap-1">
                <button
                  type="button"
                  disabled
                  title="Online payment setup will be available in a future update"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-400 bg-slate-200/80 border border-slate-300 rounded-xl cursor-not-allowed opacity-80 shadow-none"
                >
                  <CreditCard className="w-4 h-4 text-slate-400" />
                  <span>Pay Outstanding Balance</span>
                </button>
                <span className="text-[11px] text-slate-500 font-medium">
                  Online payment setup coming soon
                </span>
              </div>
            )}
          </div>

          {/* Pending Bills breakdown if multiple */}
          {unpaidBills.length > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-200/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Itemized Unpaid Invoices
              </span>
              <div className="space-y-2">
                {unpaidBills.map((ub) => (
                  <div
                    key={ub.id}
                    className="flex items-center justify-between p-3 bg-white/90 rounded-lg border border-slate-200 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-900">{ub.period}</span>
                      <span className="text-slate-500 text-[11px] ml-2">Invoice: {ub.billNo}</span>
                      <div className="text-[11px] text-slate-500">Due on: {ub.due_date}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-900 tabular-nums text-sm">
                        {formatPeso(ub.amount_pay)}
                      </span>
                      <button
                        type="button"
                        disabled
                        title="Online payment setup will be available in a future update"
                        className="px-3 py-1 bg-slate-100 text-slate-400 border border-slate-200 rounded-md font-semibold text-xs cursor-not-allowed opacity-75"
                      >
                        Pay Bill
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Current Internet Subscription Plan Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Subscribed Plan Details
              </span>
              <Wifi className="w-4 h-4 text-blue-600" />
            </div>

            <div className="mt-3">
              <h3 className="text-lg font-bold text-slate-900">{customer.net_plan}</h3>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                Speed: {customer.planSpeed} Unlimited Fiber
              </div>
              <div className="text-lg font-bold text-blue-700 font-mono mt-2 tabular-nums">
                {formatPeso(customer.monthlyFee)} <span className="text-xs font-normal text-slate-500">/ month</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Installed: <strong>{customer.date_installed}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{customer.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{customer.contactNumber}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>NET-LINK High-Speed Mesh</span>
            <span className="text-emerald-700 font-medium">99.9% Uptime SLA</span>
          </div>
        </div>
      </div>

      {/* Tabs Section: Invoices, Receipts, and Notifications */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="border-b border-slate-200 px-6 pt-4 flex gap-6 text-xs font-semibold">
          <button
            onClick={() => onTabChange('history')}
            className={`pb-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'history' || activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            All Monthly Statements ({clientBills.length})
          </button>
          <button
            onClick={() => onTabChange('receipts')}
            className={`pb-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'receipts'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            My Official Receipts ({clientReceipts.length})
          </button>
          <button
            onClick={() => onTabChange('notifications')}
            className={`pb-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'notifications'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Email Reminders &amp; Notices ({clientEmails.length})
          </button>
          <button
            onClick={() => onTabChange('reports')}
            className={`pb-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'reports'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            My Repair Reports ({clientTickets.length})
          </button>
        </div>

        {/* Tab 1: Monthly Bills History */}
        {(activeTab === 'history' || activeTab === 'overview') && (
          <div className="p-6">
            {clientBills.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No monthly billing statements issued yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Invoice Ref</th>
                      <th className="py-2.5 px-4 font-semibold">Billing Period</th>
                      <th className="py-2.5 px-4 font-semibold">Payment Due Date</th>
                      <th className="py-2.5 px-4 font-semibold">Date Paid</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Amount In Peso</th>
                      <th className="py-2.5 px-4 font-semibold">Status</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clientBills.map((b) => {
                      const matchedReceipt = receipts.find(
                        (r) => r.billId === b.id || (b.receiptId && r.receiptNo === b.receiptId)
                      );
                      const datePaid =
                        matchedReceipt?.paymentDate ||
                        matchedReceipt?.date ||
                        (b.paidAt ? b.paidAt.slice(0, 10) : null);

                      return (
                        <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                            {b.billNo}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-800">
                            {b.period}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">
                            {b.due_date}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">
                            {b.status === 'paid' && datePaid ? (
                              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{datePaid}</span>
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                            {formatPeso(b.amount_pay)}
                          </td>
                          <td className="py-3 px-4">
                            {b.status === 'paid' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                              </span>
                            )}
                            {b.status === 'unpaid' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                                <Clock className="w-3.5 h-3.5" /> Unpaid
                              </span>
                            )}
                            {b.status === 'overdue' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700">
                                <AlertTriangle className="w-3.5 h-3.5" /> Overdue
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {onPrintBill && (
                                <button
                                  onClick={() => onPrintBill(b)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-md transition-colors shadow-2xs cursor-pointer"
                                  title="Print Monthly Bill Statement"
                                >
                                  <Printer className="w-3 h-3 text-slate-500" />
                                  Print Bill
                                </button>
                              )}

                              {b.status === 'paid' ? (
                                <button
                                  onClick={() => {
                                    const r = receipts.find((rec) => rec.billId === b.id);
                                    if (r) onPrintReceipt(r);
                                  }}
                                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                                >
                                  <FileText className="w-3 h-3" />
                                  Official Receipt
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled
                                  title="Online payment setup will be available in a future update"
                                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded-md shadow-none cursor-not-allowed opacity-75"
                                >
                                  <CreditCard className="w-3 h-3 text-slate-400" />
                                  Pay Now
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: My Official Receipts */}
        {activeTab === 'receipts' && (
          <div className="p-6">
            {clientReceipts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No official receipts issued yet. Settle an unpaid invoice to generate your first receipt.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Receipt No</th>
                      <th className="py-2.5 px-4 font-semibold">Date Paid</th>
                      <th className="py-2.5 px-4 font-semibold">Payment For Period</th>
                      <th className="py-2.5 px-4 font-semibold">Payment Channel</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Amount In Peso</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clientReceipts.map((rec) => (
                      <tr key={rec.receiptNo} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {rec.receiptNo}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {rec.paymentDate || rec.date}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {rec.asPaymentForPeriod}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {rec.paymentMethod} {rec.referenceNo ? `(${rec.referenceNo})` : ''}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                          {formatPeso(rec.amountInPeso)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onPrintReceipt(rec)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            Print Official Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Notifications / Email Reminders */}
        {activeTab === 'notifications' && (
          <div className="p-6">
            {clientEmails.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No email reminder notifications in your mailbox.
              </div>
            ) : (
              <div className="space-y-3">
                {clientEmails.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <span className="font-bold text-slate-900">{log.subject}</span>
                      </div>
                      <p className="text-slate-600 mt-1 line-clamp-1">{log.messageBody}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                        <span>Period: <strong>{log.period}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>Due Date: <strong>{log.dueDate}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>Amount: <strong>{formatPeso(log.amount)}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>{new Date(log.sentAt).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onPreviewEmail(log)}
                      className="self-start sm:self-auto px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-blue-700 rounded-lg font-semibold text-xs transition-colors cursor-pointer shrink-0"
                    >
                      Read Full Notice
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Customer Repair Reports & Messages */}
        {activeTab === 'reports' && (
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Technical Support &amp; Repair Reports
                </h3>
                <p className="text-xs text-slate-500">
                  Track the dispatch status and technician notes for your reported internet and equipment concerns.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setRepairSubject('');
                  setRepairMessage('');
                  setShowReportModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Submit New Repair Request</span>
              </button>
            </div>

            {clientTickets.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                <LifeBuoy className="w-9 h-9 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-600">No repair reports on file</p>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm mx-auto">
                  If you encounter a blinking red LOS light, damaged drop fiber cable, or slow browsing, send us a repair report.
                </p>
                <button
                  type="button"
                  onClick={() => setShowReportModal(true)}
                  className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Report an Issue</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {clientTickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 bg-slate-50/90 rounded-xl border border-slate-200 text-xs space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200/70">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{t.id}</span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {t.category}
                        </span>
                        {t.priority === 'urgent' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800">
                            URGENT
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {t.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200 text-[11px]">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Pending Inspection
                          </span>
                        )}
                        {t.status === 'in_progress' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-200 text-[11px]">
                            <Wrench className="w-3 h-3 text-blue-600 animate-pulse" />
                            Lineman Dispatched / In Progress
                          </span>
                        )}
                        {t.status === 'resolved' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Resolved &amp; Restored
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-slate-900 text-sm">{t.subject}</div>
                      <p className="text-slate-600 mt-1 leading-relaxed whitespace-pre-wrap">{t.message}</p>
                    </div>

                    {t.assignedTo && (
                      <div className="text-[11px] text-blue-800 bg-blue-50/80 p-2.5 rounded-lg border border-blue-100 flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Assigned Technician / Lineman: <strong>{t.assignedTo}</strong></span>
                      </div>
                    )}

                    {t.adminNotes && (
                      <div className="text-[11px] text-emerald-900 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                        <span className="font-bold block">Technical Team Response:</span>
                        <p className="mt-0.5">{t.adminNotes}</p>
                      </div>
                    )}

                    <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1 border-t border-slate-200/50">
                      <span>Submitted: {new Date(t.createdAt).toLocaleString()}</span>
                      {t.resolvedAt && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-700 font-medium">Restored: {new Date(t.resolvedAt).toLocaleString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Online Payment Modal */}
      {showPayModal && selectedBillToPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full my-8 overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Settle Internet Subscription Bill</h3>
                <p className="text-[11px] text-slate-500">
                  Select payment channel. An Official Receipt will be issued immediately upon settlement.
                </p>
              </div>
              <button
                onClick={() => setShowPayModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="p-6 space-y-4">
              {/* Payment Summary */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Billing Period:</span>
                  <span className="font-bold text-slate-900">{selectedBillToPay.period}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Account Number:</span>
                  <span className="font-mono text-slate-900">{customer.accountNo}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Due Date:</span>
                  <span className="font-mono text-amber-700 font-semibold">{selectedBillToPay.due_date}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-900">Amount Due:</span>
                  <span className="font-mono text-xl font-bold text-blue-700 tabular-nums">
                    {formatPeso(selectedBillToPay.amount_pay)}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Choose Payment Channel
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    "Collector's Pick-up",
                    'GCash 09562262394 CR*****O D.',
                  ].map((method) => (
                    <button
                      type="button"
                      key={method}
                      onClick={() => {
                        setPaymentMethod(method as PaymentMethod);
                        if (method === "Collector's Pick-up") {
                          setReferenceNo(`COLLECT-${Math.floor(100000 + Math.random() * 900000)}`);
                        } else {
                          setReferenceNo(`GC-${Math.floor(10000000 + Math.random() * 90000000)}`);
                        }
                      }}
                      className={`p-2.5 rounded-lg border text-left font-semibold transition-colors cursor-pointer ${
                        paymentMethod === method
                          ? 'border-blue-600 bg-blue-50/70 text-blue-700 shadow-2xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{method}</span>
                        {paymentMethod === method && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {paymentMethod === 'GCash 09562262394 CR*****O D.' && (
                  <div className="mt-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-900 flex items-center justify-between">
                    <div>
                      <span className="font-bold">GCash Mobile:</span> 09562262394
                      <span className="mx-1.5 text-blue-300">|</span>
                      <span className="font-bold">Name:</span> CR*****O D.
                    </div>
                    <span className="font-mono text-[10px] text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                      Scan or Send Money
                    </span>
                  </div>
                )}

                {paymentMethod === "Collector's Pick-up" && (
                  <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900">
                    <span className="font-bold">Doorstep Pickup:</span> Authorized field collector will visit {customer.address} with printed Official Receipt.
                  </div>
                )}
              </div>

              {/* Simulated Transaction Ref */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Electronic Reference / Auth Code
                </label>
                <input
                  type="text"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-mono"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm &amp; Settle Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report for Repair Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full my-8 border border-slate-200 text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-rose-50 to-amber-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Send Repair Request / Report Issue</h3>
                  <p className="text-[11px] text-slate-500">
                    Net-Home technical support will dispatch a field technician or inspect your line.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!repairSubject.trim() || !repairMessage.trim()) return;

                if (onAddSupportTicket) {
                  onAddSupportTicket({
                    customerId: customer.id,
                    accountNo: customer.accountNo,
                    customerName: `${customer.firstname} ${customer.lastname}`,
                    contactNumber: contactPhone || customer.contactNumber,
                    email: customer.email,
                    address: customer.address,
                    category: repairCategory,
                    subject: repairSubject.trim(),
                    message: repairMessage.trim(),
                    priority: 'urgent',
                  });
                }

                setRepairSubject('');
                setRepairMessage('');
                setRepairCategory('No Internet');
                setRepairPriority('urgent');
                setShowReportModal(false);
                setReportSuccessNotice(
                  `Your repair report "${repairSubject.trim()}" has been dispatched to Net-Home technical support. A technician will contact you shortly.`
                );
                onTabChange('reports');
              }}
              className="p-6 space-y-4"
            >
              {/* Subscriber Summary Banner */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-slate-700 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Subscriber</span>
                  <span className="font-bold">{customer.firstname} {customer.lastname}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Account No</span>
                  <span className="font-mono font-bold text-slate-900">{customer.accountNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Plan</span>
                  <span className="font-semibold text-blue-700">{customer.net_plan}</span>
                </div>
              </div>

              {/* Issue Category */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Issue Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={repairCategory}
                  onChange={(e) => setRepairCategory(e.target.value as TicketCategory)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                >
                  <option value="No Internet">No Internet</option>
                  <option value="Other Issue">Other Issue</option>
                  <option value="Billing Issue">Billing Issue</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder=""
                  value={repairSubject}
                  onChange={(e) => setRepairSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder=""
                  value={repairMessage}
                  onChange={(e) => setRepairMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Urgency & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Urgency Level
                  </label>
                  <select
                    value={repairPriority}
                    onChange={(e) => setRepairPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                  >
                    <option value="urgent">Urgent-Total Outtage</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Callback Mobile Number
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Repair Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
