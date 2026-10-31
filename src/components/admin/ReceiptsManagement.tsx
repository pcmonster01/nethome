import React, { useState } from 'react';
import { Customer, Bill, Receipt, PaymentMethod, AdminAccount } from '../../types';
import { formatPeso, numberToWordsInPeso } from '../../utils/numberToWords';
import { getStoredAdminAccounts } from '../../utils/storage';
import {
  Printer,
  Search,
  CheckCircle,
  PlusCircle,
  X,
  CreditCard,
  FileCheck,
  ShieldCheck,
  ExternalLink,
  UserCheck,
  Trash2,
} from 'lucide-react';

interface ReceiptsManagementProps {
  receipts: Receipt[];
  bills: Bill[];
  customers: Customer[];
  onRecordPayment: (paymentData: {
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
  onDeleteReceipt?: (receiptNo: string) => void;
  selectedBillForPayment?: Bill | null;
  onClearSelectedBillForPayment?: () => void;
  adminAccounts?: AdminAccount[];
}

export const ReceiptsManagement: React.FC<ReceiptsManagementProps> = ({
  receipts,
  bills,
  customers,
  onRecordPayment,
  onPrintReceipt,
  onDeleteReceipt,
  selectedBillForPayment,
  onClearSelectedBillForPayment,
  adminAccounts: propAdminAccounts,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(!!selectedBillForPayment);
  const [deleteConfirmReceipt, setDeleteConfirmReceipt] = useState<Receipt | null>(null);

  const registeredAdmins = propAdminAccounts || getStoredAdminAccounts();
  const registeredCashiers = registeredAdmins.filter((a) => a.position === 'cashier');
  const defaultCashierName = registeredCashiers.length > 0
    ? `${registeredCashiers[0].firstname} ${registeredCashiers[0].lastname} (Cashier)`
    : 'Ana Ramirez (Cashier)';

  // Form State
  const unpaidBills = bills.filter((b) => b.status === 'unpaid' || b.status === 'overdue');
  const [selectedBillId, setSelectedBillId] = useState<string>(
    selectedBillForPayment?.id || unpaidBills[0]?.id || ''
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('GCash');
  const [referenceNo, setReferenceNo] = useState(`GC-${Math.floor(10000000 + Math.random() * 90000000)}`);
  const [issuedBy, setIssuedBy] = useState(defaultCashierName);
  const [dateIssued, setDateIssued] = useState(new Date().toISOString().slice(0, 10));
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));

  const activeBill = bills.find((b) => b.id === selectedBillId);
  const activeCustomer = customers.find((c) => c.id === activeBill?.customerId);

  // Auto-calculated amount in words
  const amountInWords = activeBill ? numberToWordsInPeso(activeBill.amount_pay) : '';

  const handleOpenRecordPayment = (bill?: Bill) => {
    if (bill) {
      setSelectedBillId(bill.id);
    } else if (unpaidBills.length > 0) {
      setSelectedBillId(unpaidBills[0].id);
    }
    setDateIssued(new Date().toISOString().slice(0, 10));
    setPaymentDate(new Date().toISOString().slice(0, 10));
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillId || !activeBill || !activeCustomer) return;

    onRecordPayment({
      billId: selectedBillId,
      customerId: activeCustomer.id,
      paymentMethod,
      referenceNo,
      issuedBy,
      date: paymentDate,
      dateIssued,
      paymentDate,
    });

    setShowPaymentModal(false);
    if (onClearSelectedBillForPayment) onClearSelectedBillForPayment();
  };

  const filteredReceipts = receipts.filter((r) => {
    return (
      r.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.asPaymentForPeriod.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.referenceNo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalCollected = receipts.reduce((acc, r) => acc + r.amountInPeso, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Official Receipts &amp; Payment Collection
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Issue BIR-standard ISP official receipts with sum in words, period, and amount in peso.
          </p>
        </div>

        <button
          onClick={() => handleOpenRecordPayment()}
          disabled={unpaidBills.length === 0}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors shadow-xs ${
            unpaidBills.length > 0
              ? 'text-white bg-blue-600 hover:bg-blue-700 cursor-pointer'
              : 'text-slate-400 bg-slate-100 cursor-not-allowed'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          Record Payment &amp; Issue Receipt
        </button>
      </div>

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Official Receipts Issued
          </span>
          <div className="text-xl font-bold text-slate-900 font-mono mt-1 tabular-nums">
            {receipts.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Legally cleared transaction slips</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
            Total Collected In Peso
          </span>
          <div className="text-xl font-bold text-emerald-700 font-mono mt-1 tabular-nums">
            {formatPeso(totalCollected)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">100% verified settlement records</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
            Pending Uncollected Bills
          </span>
          <div className="text-xl font-bold text-blue-900 font-mono mt-1 tabular-nums">
            {unpaidBills.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Available for payment recording</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search receipts by OR #, client name, period, or reference number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
          />
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Receipt No (receipt no)</th>
                <th className="py-3 px-4 font-semibold">Date Paid</th>
                <th className="py-3 px-4 font-semibold">Client (client)</th>
                <th className="py-3 px-4 font-semibold">To Pay The Sum Of</th>
                <th className="py-3 px-4 font-semibold">As Payment For Period</th>
                <th className="py-3 px-4 font-semibold text-right">Amount In Peso</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No official receipts found.
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((receipt) => (
                  <tr key={receipt.receiptNo} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {receipt.receiptNo}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-700">
                      <div className="font-semibold text-slate-900">{receipt.paymentDate || receipt.date}</div>
                      {receipt.dateIssued && receipt.dateIssued !== (receipt.paymentDate || receipt.date) && (
                        <div className="text-[10px] text-slate-400">Issued: {receipt.dateIssued}</div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{receipt.client}</div>
                      <div className="font-mono text-[11px] text-slate-500">{receipt.clientAccountNo}</div>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <span className="font-mono text-[11px] text-slate-700 line-clamp-2">
                        {receipt.toPayTheSumOf}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-800 font-medium">
                      {receipt.asPaymentForPeriod}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatPeso(receipt.amountInPeso)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onPrintReceipt(receipt)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                          title="Open Official Receipt for Printing"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print</span>
                        </button>
                        <button
                          onClick={() => setDeleteConfirmReceipt(receipt)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Official Receipt Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full my-8 overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Record Payment &amp; Issue Official Receipt</h3>
                <p className="text-[11px] text-slate-500">
                  Calculates sum in words and generates printable official receipt.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  if (onClearSelectedBillForPayment) onClearSelectedBillForPayment();
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-6 space-y-4">
              {/* Select Unpaid Bill */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Unpaid Bill <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedBillId}
                  onChange={(e) => setSelectedBillId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                >
                  {unpaidBills.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.billNo} — {b.customerName} ({b.period}) — {formatPeso(b.amount_pay)} [{b.status}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Bill Details Summary */}
              {activeBill && activeCustomer && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Client:</span>
                    <span className="font-semibold text-slate-900">
                      {activeCustomer.firstname} {activeCustomer.lastname} ({activeCustomer.accountNo})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment For Period:</span>
                    <span className="font-medium text-slate-800">{activeBill.period}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="font-semibold text-slate-800">Amount In Peso:</span>
                    <span className="font-mono font-bold text-base text-blue-700 tabular-nums">
                      {formatPeso(activeBill.amount_pay)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                      To Pay The Sum Of (Words):
                    </span>
                    <span className="font-mono text-xs text-slate-800 font-medium block mt-0.5 bg-white p-2 rounded border border-slate-200">
                      {amountInWords}
                    </span>
                  </div>
                </div>
              )}

              {/* Payment Method and Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Method <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Collector's Pick-up">Collector&apos;s Pick-up</option>
                    <option value="GCash 09562262394 CR*****O D.">GCash 09562262394 CR*****O D.</option>
                    <option value="GCash">GCash</option>
                    <option value="Maya">Maya</option>
                    <option value="Cash">Cash (Office Counter)</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Online Credit/Debit">Online Credit/Debit Card</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Date Issued <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={dateIssued}
                      onChange={(e) => setDateIssued(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Date Paid: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Reference Number and Cashier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reference / Transaction ID
                  </label>
                  <input
                    type="text"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    placeholder="e.g. GC-9821849102"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Issued By (Cashier) <span className="text-rose-500">*</span></span>
                    {registeredCashiers.length > 0 && (
                      <span className="text-[10px] text-emerald-700 font-normal">
                        {registeredCashiers.length} Cashier{registeredCashiers.length > 1 ? 's' : ''} on staff
                      </span>
                    )}
                  </label>
                  {registeredCashiers.length > 0 ? (
                    <div className="space-y-1.5">
                      <select
                        value={issuedBy}
                        onChange={(e) => setIssuedBy(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 font-medium"
                      >
                        {registeredCashiers.map((c) => (
                          <option key={c.id} value={`${c.firstname} ${c.lastname} (Cashier)`}>
                            {c.firstname} {c.lastname} — Cashier
                          </option>
                        ))}
                        <option value="custom">-- Custom Signatory Entry --</option>
                      </select>
                      {issuedBy === 'custom' && (
                        <input
                          type="text"
                          required
                          placeholder="Enter cashier name and title"
                          onChange={(e) => setIssuedBy(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
                        />
                      )}
                    </div>
                  ) : (
                    <input
                      type="text"
                      required
                      value={issuedBy}
                      onChange={(e) => setIssuedBy(e.target.value)}
                      placeholder="e.g. Ana Ramirez (Cashier)"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  Save Payment &amp; Generate Official Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Receipt Confirmation Modal */}
      {deleteConfirmReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Official Receipt?</h3>
                <p className="text-xs text-slate-500">Receipt: <span className="font-mono font-bold text-slate-800">{deleteConfirmReceipt.receiptNo}</span></p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5 my-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Client:</span>
                <span className="font-semibold text-slate-900">{deleteConfirmReceipt.client}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account No:</span>
                <span className="font-mono font-medium text-slate-800">{deleteConfirmReceipt.clientAccountNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Period:</span>
                <span className="font-medium text-slate-800">{deleteConfirmReceipt.billPeriod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-mono font-bold text-emerald-700">{formatPeso(deleteConfirmReceipt.amountInPeso)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Channel:</span>
                <span className="font-medium text-slate-800">{deleteConfirmReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Issue Date:</span>
                <span className="font-mono text-slate-700">{deleteConfirmReceipt.date}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to permanently delete this official receipt and payment collection record?
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmReceipt(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteReceipt) {
                    onDeleteReceipt(deleteConfirmReceipt.receiptNo);
                  }
                  setDeleteConfirmReceipt(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Confirm Delete Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
