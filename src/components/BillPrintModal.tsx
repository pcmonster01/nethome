import React from 'react';
import { Bill, Customer, CompanyProfile } from '../types';
import { formatPeso, numberToWordsInPeso } from '../utils/numberToWords';
import { Printer, X, FileText, Wifi, ShieldCheck, CheckCircle, AlertCircle } from 'lucide-react';

interface BillPrintModalProps {
  bill: Bill | null;
  customer: Customer | null;
  companyProfile?: CompanyProfile;
  onClose: () => void;
}

export const BillPrintModal: React.FC<BillPrintModalProps> = ({
  bill,
  customer,
  onClose,
}) => {
  if (!bill || !customer) return null;

  const handlePrint = () => {
    window.print();
  };

  // Line items support
  const items =
    bill.items && bill.items.length > 0
      ? bill.items
      : [
          {
            id: 'default-item-1',
            serviceDescription: `${customer.net_plan} Subscription`,
            planSpeed: customer.planSpeed,
            billingPeriod: bill.period,
            amount: bill.amount_pay,
          },
        ];

  const totalAmountDue = items.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
  const amountInWords = numberToWordsInPeso(totalAmountDue);
  const isOverdue = bill.status === 'overdue';
  const isPaid = bill.status === 'paid';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      {/* Modal Container calibrated for 8.5 x 14 Legal Size Bond Paper (Portrait Orientation) */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-3 overflow-hidden border border-slate-300">
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <div>
              <span className="font-bold text-slate-800 text-xs sm:text-sm">
                Statement of Account (SOA)
              </span>
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Single Page · Portrait Orientation · 8.5&quot; x 14&quot; Legal Bond Paper
              </span>
            </div>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-mono font-bold text-slate-700">{bill.billNo}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Bill (8.5&quot; x 14&quot; Legal)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Statement of Account (SOA) Area 
            Orientation: Portrait
            Paper Size: 8.5 x 14 Legal Size Bond Paper
            Single Page Layout with crisp typography and zero blank wasted space
        */}
        <div className="bill-printable-area w-full bg-white text-slate-900 font-sans p-6 sm:p-7 border border-slate-300 shadow-2xs">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-3 mb-3">
            <div className="flex flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                  <Wifi className="w-5 h-5" />
                </div>
                <div className="inline-block px-3 py-1 bg-slate-900 text-white text-xs sm:text-sm font-bold tracking-wider uppercase rounded shadow-2xs">
                  STATEMENT OF ACCOUNT
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs text-slate-700 font-medium">
                  Invoice No: <span className="font-mono font-bold text-sm sm:text-base text-slate-950">{bill.billNo}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Subscriber & Due Date Strip */}
          <div className="grid grid-cols-3 gap-3 pb-3 mb-3 text-xs">
            <div className="col-span-2 space-y-1">
              <span className="text-slate-500 uppercase font-bold tracking-wider text-[11px] block">
                Bill To (Subscriber)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-slate-900 text-base">
                  {customer.firstname} {customer.lastname}
                </span>
                <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  Account No: {customer.accountNo}
                </span>
              </div>
              <div className="text-xs text-slate-700 leading-snug">
                <span className="font-semibold text-slate-800">Installation Address:</span> {customer.address}
              </div>
              <div className="text-xs text-slate-700">
                <span className="font-semibold text-slate-800">Subscribed Plan:</span>{' '}
                <strong className="text-slate-900">{customer.net_plan}</strong> ({customer.planSpeed}) ·{' '}
                <span className="font-semibold text-slate-800">Contact:</span> {customer.contactNumber}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-300 flex flex-col justify-between text-right">
              <div>
                <span className="text-slate-600 uppercase font-bold tracking-wider text-[11px] block">
                  Payment Due Date
                </span>
                <span className="text-lg font-bold text-rose-600 font-mono block mt-0.5">
                  {bill.due_date}
                </span>
              </div>
              <div className="mt-1 pt-1.5 border-t border-slate-200 flex items-center justify-end gap-1.5">
                {isPaid ? (
                  <span className="inline-flex items-center gap-1 font-bold text-xs uppercase tracking-wide text-emerald-700">
                    <CheckCircle className="w-3.5 h-3.5" /> PAID / CLEARED
                  </span>
                ) : isOverdue ? (
                  <span className="inline-flex items-center gap-1 font-bold text-xs uppercase tracking-wide text-rose-700">
                    <AlertCircle className="w-3.5 h-3.5" /> OVERDUE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-bold text-xs uppercase tracking-wide text-amber-700">
                    <AlertCircle className="w-3.5 h-3.5" /> UNPAID / PENDING
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Charges Itemized Breakdown Table */}
          <div className="mb-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-y border-slate-300 bg-slate-100 text-slate-800 text-[11px] uppercase tracking-wider">
                  <th className="text-left py-2 px-3 font-bold">Service Description</th>
                  <th className="text-center py-2 px-3 font-bold">Plan Speed</th>
                  <th className="text-center py-2 px-3 font-bold">Covered Period</th>
                  <th className="text-right py-2 px-3 font-bold">Amount (PHP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item, index) => (
                  <tr key={item.id || index}>
                    <td className="py-2.5 px-3 text-slate-900 font-semibold">
                      {item.serviceDescription}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-700">
                      {item.planSpeed || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-700">
                      {item.billingPeriod || bill.period}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-950 tabular-nums">
                      {formatPeso(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                {bill.notes && (
                  <tr>
                    <td colSpan={4} className="py-1.5 px-3 text-slate-600 italic text-xs bg-slate-50 border-t border-slate-200">
                      Remarks / Notes: {bill.notes}
                    </td>
                  </tr>
                )}
                <tr className="border-t-2 border-slate-900 font-bold bg-slate-50">
                  <td colSpan={3} className="py-2.5 px-3 text-right text-slate-900 uppercase text-xs">
                    Total Amount Due:
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-lg text-blue-950 tabular-nums">
                    {formatPeso(totalAmountDue)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* In Words Section (Readable) */}
          <div className="bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-300 mb-3 text-xs flex items-center justify-between">
            <span className="text-slate-600 font-bold uppercase text-[11px]">Total In Words:</span>
            <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">{amountInWords}</span>
          </div>

          {/* Authorized Payment Channels: Text Only */}
          <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50 mb-2 text-xs">
            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1">
              Authorized Payment Channels:
            </div>
            <div className="text-xs font-semibold text-slate-900 flex flex-wrap items-center gap-x-6 gap-y-1">
              <span>Collector&apos;s Pick-up</span>
              <span>GCash: 09562262394 Name: CR*****O D.</span>
            </div>
          </div>
        </div>

        {/* Modal Footer (Hidden on print) */}
        <div className="no-print px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-medium text-slate-700">
              Single Page · Portrait Orientation · 8.5&quot; x 14&quot; Legal Bond Paper Calibrated
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Bill (8.5&quot; x 14&quot; Legal)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs text-slate-700 font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
