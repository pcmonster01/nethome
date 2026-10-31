import React from 'react';
import { Receipt, Bill, CompanyProfile } from '../types';
import { formatPeso } from '../utils/numberToWords';
import { getStoredCompanyProfile } from '../utils/storage';
import { Printer, X, CheckCircle, ShieldCheck } from 'lucide-react';

interface ReceiptModalProps {
  receipt: Receipt | null;
  bill?: Bill | null;
  companyProfile?: CompanyProfile;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, bill, companyProfile, onClose }) => {
  if (!receipt) return null;

  const profile = companyProfile || getStoredCompanyProfile();
  const billRemarks = (receipt.notes || bill?.notes || '').trim();
  const dateIssued = receipt.dateIssued || receipt.date;
  const paymentDate = receipt.paymentDate || receipt.date || bill?.paidAt?.slice(0, 10);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      {/* Compressed Modal Container */}
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full my-4 overflow-hidden border border-slate-200">
        {/* Modal Action Bar (Hidden in Print) */}
        <div className="no-print flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 text-xs sm:text-sm">Official Receipt Preview</span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-mono font-bold text-slate-700">{receipt.receiptNo}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
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

        {/* Compressed Printable Official Receipt Area */}
        <div className="receipt-printable-area p-5 sm:p-6 bg-white text-slate-900 font-sans">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-2.5 mb-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900 uppercase">
                  {profile.companyName}
                </h1>
                <p className="text-xs text-blue-700 font-semibold mt-0.5">
                  {profile.tagline}
                </p>
                <p className="text-xs text-slate-500 leading-snug">
                  {profile.address}
                </p>
                {/* Temporarily disabled: TIN and hotline part. Adjusted next line */}
                <p className="text-xs text-slate-500 mt-0.5">
                  {profile.email}
                </p>
              </div>

              <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 shrink-0">
                <div className="inline-block px-2.5 py-0.5 bg-slate-100 border border-slate-300 text-[11px] font-bold tracking-wider text-slate-800 uppercase rounded">
                  OFFICIAL RECEIPT
                </div>
                <div className="mt-1.5 text-xs text-slate-600">
                  Receipt No: <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">{receipt.receiptNo}</span>
                </div>
                <div className="text-xs text-slate-600">
                  Date Paid: <span className="font-semibold text-slate-900">{paymentDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Client Details Section (Line and space below payment channel removed) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 text-xs">
            <div>
              <span className="text-slate-500 block uppercase font-medium tracking-wider text-[10px]">Received From (Client)</span>
              <span className="font-bold text-slate-900 text-xs sm:text-sm block mt-0.5">{receipt.client}</span>
              <span className="text-slate-600 block mt-0.5 leading-snug">{receipt.clientAddress}</span>
              <span className="text-slate-600 block mt-0.5">Contact: {receipt.clientContact}</span>
            </div>
            <div className="sm:text-right">
              <span className="text-slate-500 block uppercase font-medium tracking-wider text-[10px]">Subscriber Account No</span>
              <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm block mt-0.5">{receipt.clientAccountNo}</span>
              <span className="text-slate-500 block uppercase font-medium tracking-wider text-[10px] mt-1.5">Payment Channel</span>
              <span className="font-medium text-slate-800 block mt-0.5">
                {receipt.paymentMethod} {receipt.referenceNo ? `· Ref: ${receipt.referenceNo}` : ''}
              </span>
            </div>
          </div>

          {/* Payment Details (To Pay The Sum Of In Words and Description/Period/Amount Table Removed) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 text-xs">
            <div className="sm:col-span-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex flex-col justify-center">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">
                As Payment For Period
              </div>
              <div className="text-xs font-semibold text-slate-900">
                {receipt.asPaymentForPeriod}
              </div>
              {billRemarks && (
                <div className="text-[11px] text-slate-700 mt-1.5 pt-1.5 border-t border-slate-200">
                  <span className="font-semibold text-slate-900">Notes:</span> {billRemarks}
                </div>
              )}
            </div>

            <div className="bg-blue-50/80 p-2.5 rounded-lg border border-blue-200 sm:text-right flex flex-col justify-center">
              <div className="text-[10px] uppercase tracking-wider text-blue-800 font-semibold mb-0.5">
                Amount In Peso
              </div>
              <div className="text-base sm:text-lg font-bold text-blue-950 font-mono tabular-nums">
                {formatPeso(receipt.amountInPeso)}
              </div>
            </div>
          </div>

          {/* Signature & Issuance - Compact compressed spacing */}
          <div className="mt-3 pt-3 border-t border-dashed border-slate-300 flex flex-col sm:flex-row items-end justify-between gap-4 text-xs">
            <div className="text-slate-500 space-y-0.5">
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Payment Verified &amp; Cleared</span>
              </div>
              <p className="text-[11px] text-slate-600">Official Receipt for broadband internet services.</p>
              <p className="text-[10px] text-slate-400">Keep this copy for your records.</p>
            </div>

            <div className="text-center w-56 shrink-0">
              <div className="border-b-2 border-slate-700 pb-1 mb-1 font-bold text-slate-900 text-xs sm:text-sm">
                {receipt.issuedBy}
              </div>
              <div className="text-[10px] text-slate-700 uppercase font-bold tracking-wider">
                Authorized Cashier / Representative
              </div>
              <div className="mt-0.5 text-[9px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded inline-block">
                Position: Cashier (Official Signatory)
              </div>
            </div>
          </div>
        </div>

        {/* Footer info (Hidden in Print) */}
        <div className="no-print px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
            <span>Compressed Official Receipt Format · Cashier Verified</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded text-slate-700 font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
