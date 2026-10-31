import React, { useState } from 'react';
import { Customer, Bill, BillItem, BillStatus, PaymentMethod } from '../../types';
import { formatPeso, numberToWordsInPeso } from '../../utils/numberToWords';
import {
  FileText,
  PlusCircle,
  Calendar,
  Layers,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  Printer,
  DollarSign,
  Send,
  X,
  CreditCard,
  Download,
  Edit2,
  Trash2,
  Plus,
  Filter,
  Zap,
} from 'lucide-react';
import { exportBillsToCsv } from '../../utils/csvExport';

interface MonthlyBillingProps {
  customers: Customer[];
  bills: Bill[];
  onAddBill: (billData: {
    customerId: string;
    period: string;
    amount_pay: number;
    due_date: string;
    notes?: string;
    items?: BillItem[];
  }) => void;
  onUpdateBill?: (updatedBill: Bill) => void;
  onBatchGenerateBills: (period: string, dueDate: string) => void;
  onOpenRecordPayment: (bill: Bill) => void;
  onViewReceipt: (receiptId: string) => void;
  onSendSingleReminder: (bill: Bill) => void;
  onPrintBill: (bill: Bill) => void;
  onDeleteBill?: (billId: string) => void;
}

export const MonthlyBilling: React.FC<MonthlyBillingProps> = ({
  customers,
  bills,
  onAddBill,
  onUpdateBill,
  onBatchGenerateBills,
  onOpenRecordPayment,
  onViewReceipt,
  onSendSingleReminder,
  onPrintBill,
  onDeleteBill,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'paid' | 'overdue'>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [deleteConfirmBill, setDeleteConfirmBill] = useState<Bill | null>(null);

  // Single Bill Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [periodInput, setPeriodInput] = useState('Nov 01 - Nov 30, 2026');
  const [dueDateInput, setDueDateInput] = useState('2026-11-25');
  const [notesInput, setNotesInput] = useState('');
  const [addBillItems, setAddBillItems] = useState<BillItem[]>([
    {
      id: 'item-1',
      serviceDescription: `${customers[0]?.net_plan || 'Fiber Broadband'} Subscription`,
      planSpeed: customers[0]?.planSpeed || '100 Mbps',
      billingPeriod: 'Nov 01 - Nov 30, 2026',
      amount: customers[0]?.monthlyFee || 1500,
    },
  ]);

  // Edit Bill Form State
  const [editPeriod, setEditPeriod] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editStatus, setEditStatus] = useState<BillStatus>('unpaid');
  const [editNotes, setEditNotes] = useState('');
  const [editBillItems, setEditBillItems] = useState<BillItem[]>([]);

  // Batch Generation Form
  const [batchPeriod, setBatchPeriod] = useState('Nov 01 - Nov 30, 2026');
  const [batchDueDate, setBatchDueDate] = useState('2026-11-25');

  // When customer changes in single add modal, update default item
  const handleCustomerSelect = (custId: string) => {
    setSelectedCustomerId(custId);
    const cust = customers.find((c) => c.id === custId);
    if (cust) {
      setAddBillItems([
        {
          id: `item-${Date.now()}`,
          serviceDescription: `${cust.net_plan} Subscription`,
          planSpeed: cust.planSpeed,
          billingPeriod: periodInput,
          amount: cust.monthlyFee,
        },
      ]);
    }
  };

  // Add Item in Add Modal
  const handleAddBreakdownItem = () => {
    const cust = customers.find((c) => c.id === selectedCustomerId);
    setAddBillItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        serviceDescription: '',
        planSpeed: cust?.planSpeed || 'N/A',
        billingPeriod: periodInput,
        amount: 0,
      },
    ]);
  };

  const handleRemoveAddBreakdownItem = (id: string) => {
    if (addBillItems.length <= 1) return; // Keep at least one item
    setAddBillItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateAddBreakdownItem = (id: string, field: keyof BillItem, value: any) => {
    setAddBillItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Sum total for Add Modal
  const addTotalAmount = addBillItems.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const addTotalInWords = numberToWordsInPeso(addTotalAmount);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !periodInput || !dueDateInput) {
      return;
    }
    onAddBill({
      customerId: selectedCustomerId,
      period: periodInput,
      amount_pay: addTotalAmount,
      due_date: dueDateInput,
      notes: notesInput,
      items: addBillItems,
    });
    setShowAddModal(false);
  };

  // Open Edit Modal
  const handleOpenEditModal = (bill: Bill) => {
    const cust = customers.find((c) => c.id === bill.customerId);
    setEditingBill(bill);
    setEditPeriod(bill.period);
    setEditDueDate(bill.due_date);
    setEditStatus(bill.status);
    setEditNotes(bill.notes || '');

    if (bill.items && bill.items.length > 0) {
      setEditBillItems(bill.items);
    } else {
      setEditBillItems([
        {
          id: `edit-item-1`,
          serviceDescription: `${cust?.net_plan || 'Fiber Broadband'} Subscription`,
          planSpeed: cust?.planSpeed || '100 Mbps',
          billingPeriod: bill.period,
          amount: bill.amount_pay,
        },
      ]);
    }
  };

  // Edit Modal Item Handlers
  const handleAddEditBreakdownItem = () => {
    const cust = customers.find((c) => c.id === editingBill?.customerId);
    setEditBillItems((prev) => [
      ...prev,
      {
        id: `edit-item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        serviceDescription: '',
        planSpeed: cust?.planSpeed || 'N/A',
        billingPeriod: editPeriod,
        amount: 0,
      },
    ]);
  };

  const handleRemoveEditBreakdownItem = (id: string) => {
    if (editBillItems.length <= 1) return;
    setEditBillItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateEditBreakdownItem = (id: string, field: keyof BillItem, value: any) => {
    setEditBillItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Sum total for Edit Modal
  const editTotalAmount = editBillItems.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const editTotalInWords = numberToWordsInPeso(editTotalAmount);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBill) return;

    if (onUpdateBill) {
      const updatedBill: Bill = {
        ...editingBill,
        period: editPeriod,
        due_date: editDueDate,
        status: editStatus,
        notes: editNotes,
        amount_pay: editTotalAmount,
        items: editBillItems,
      };
      onUpdateBill(updatedBill);
    }
    setEditingBill(null);
  };

  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchPeriod || !batchDueDate) return;
    onBatchGenerateBills(batchPeriod, batchDueDate);
    setShowBatchModal(false);
  };

  // Current Month Detection for Billing Manager Urgent Collections Focus
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthNum = String(currentDate.getMonth() + 1).padStart(2, '0');
  const currentYearMonth = `${currentYear}-${currentMonthNum}`;
  const currentMonthLong = currentDate.toLocaleString('en-US', { month: 'long' });
  const currentMonthShort = currentDate.toLocaleString('en-US', { month: 'short' });

  const isCurrentMonthBill = (bill: Bill) => {
    const inBillingDate = bill.billingDate?.startsWith(currentYearMonth);
    const inDueDate = bill.due_date?.startsWith(currentYearMonth);
    const inPeriod =
      bill.period?.toLowerCase().includes(currentMonthLong.toLowerCase()) ||
      bill.period?.toLowerCase().includes(currentMonthShort.toLowerCase());
    return Boolean(inBillingDate || inDueDate || inPeriod);
  };

  const distinctPeriods = Array.from(new Set(bills.map((b) => b.period).filter(Boolean)));

  // Filter bills by Search, Status Dropdown ('unpaid' or 'paid'), and Month Dropdown ('current' month or all)
  const filteredBills = bills.filter((b) => {
    const matchesSearch =
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.period.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.billNo.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === 'unpaid') {
      matchesStatus = b.status === 'unpaid' || b.status === 'overdue';
    } else if (statusFilter === 'paid') {
      matchesStatus = b.status === 'paid';
    } else if (statusFilter === 'overdue') {
      matchesStatus = b.status === 'overdue';
    }

    let matchesMonth = true;
    if (monthFilter === 'current') {
      matchesMonth = isCurrentMonthBill(b);
    } else if (monthFilter !== 'all') {
      matchesMonth = b.period === monthFilter;
    }

    return matchesSearch && matchesStatus && matchesMonth;
  });

  // Urgent collections metrics
  const currentMonthUnpaidBills = bills.filter(
    (b) => (b.status === 'unpaid' || b.status === 'overdue') && isCurrentMonthBill(b)
  );
  const currentMonthUnpaidSum = currentMonthUnpaidBills.reduce((acc, b) => acc + b.amount_pay, 0);
  const isUrgentFocusActive = statusFilter === 'unpaid' && monthFilter === 'current';

  const totalBilled = bills.reduce((acc, curr) => acc + curr.amount_pay, 0);
  const totalPaid = bills
    .filter((b) => b.status === 'paid')
    .reduce((acc, curr) => acc + curr.amount_pay, 0);
  const totalUnpaid = bills
    .filter((b) => b.status === 'unpaid' || b.status === 'overdue')
    .reduce((acc, curr) => acc + curr.amount_pay, 0);

  const activeCustomerCount = customers.filter((c) => c.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Monthly Billing Statements &amp; Invoicing
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Issue and modify customer invoices, add statement breakdown items, sum totals, and print official bills.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => exportBillsToCsv(filteredBills)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-xs cursor-pointer"
            title={`Export ${filteredBills.length} billing statements to CSV`}
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export to CSV ({filteredBills.length})</span>
          </button>

          <button
            onClick={() => setShowBatchModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Layers className="w-4 h-4 text-slate-500" />
            Batch Bill Active Clients ({activeCustomerCount})
          </button>

          <button
            onClick={() => {
              if (customers.length > 0 && !selectedCustomerId) {
                const c = customers[0];
                setSelectedCustomerId(c.id);
                setAddBillItems([
                  {
                    id: 'item-1',
                    serviceDescription: `${c.net_plan} Subscription`,
                    planSpeed: c.planSpeed,
                    billingPeriod: periodInput,
                    amount: c.monthlyFee,
                  },
                ]);
              }
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Issue Monthly Bill
          </button>
        </div>
      </div>

      {/* Financial Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Billed To Date
          </span>
          <div className="text-xl font-bold text-slate-900 font-mono mt-1 tabular-nums">
            {formatPeso(totalBilled)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{bills.length} total generated statements</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
            Settled Collections (Paid)
          </span>
          <div className="text-xl font-bold text-emerald-700 font-mono mt-1 tabular-nums">
            {formatPeso(totalPaid)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {bills.filter((b) => b.status === 'paid').length} statements cleared with receipts
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">
            Total Unpaid Receivables
          </span>
          <div className="text-xl font-bold text-amber-700 font-mono mt-1 tabular-nums">
            {formatPeso(totalUnpaid)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {bills.filter((b) => b.status === 'unpaid' || b.status === 'overdue').length} active unpaid balances
          </div>
        </div>
      </div>

      {/* Urgent Collections Notification Banner when focus mode is active */}
      {isUrgentFocusActive && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-200/80 text-amber-800 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <span className="font-bold text-amber-900">Urgent Collections Focus Active:</span>{' '}
              <span>
                Filtering to <strong>Unpaid</strong> statements for <strong>{currentMonthLong} {currentYear}</strong>. Total urgent receivable:{' '}
                <strong className="font-mono text-amber-950 font-bold text-sm">
                  {formatPeso(currentMonthUnpaidSum)}
                </strong>{' '}
                ({currentMonthUnpaidBills.length} subscriber {currentMonthUnpaidBills.length === 1 ? 'account' : 'accounts'}).
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('all');
              setMonthFilter('all');
            }}
            className="self-end sm:self-auto px-3 py-1 bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Clear Focus
          </button>
        </div>
      )}

      {/* Search and Filters Bar with Dropdowns */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by client name, invoice #, or billing period..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
            />
          </div>

          {/* Filter Dropdowns Controls */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            {/* Status Filter Dropdown */}
            <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <label htmlFor="billingStatusDropdown" className="text-xs font-semibold text-slate-600 shrink-0">
                Status:
              </label>
              <select
                id="billingStatusDropdown"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full sm:w-auto px-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-slate-800 cursor-pointer"
              >
                <option value="all">All Statuses ({bills.length})</option>
                <option value="unpaid">
                  Unpaid Only ({bills.filter((b) => b.status === 'unpaid' || b.status === 'overdue').length})
                </option>
                <option value="paid">
                  Paid Only ({bills.filter((b) => b.status === 'paid').length})
                </option>
                <option value="overdue">
                  Overdue Only ({bills.filter((b) => b.status === 'overdue').length})
                </option>
              </select>
            </div>

            {/* Current Month & Period Filter Dropdown */}
            <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <label htmlFor="billingMonthDropdown" className="text-xs font-semibold text-slate-600 shrink-0">
                Month:
              </label>
              <select
                id="billingMonthDropdown"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-slate-800 cursor-pointer"
              >
                <option value="all">All Months / Periods</option>
                <option value="current">
                  Current Month ({currentMonthLong} {currentYear})
                </option>
                {distinctPeriods.map((period) => (
                  <option key={period} value={period}>
                    {period}
                  </option>
                ))}
              </select>
            </div>

            {/* Urgent Collections One-Click Toggle for Manager */}
            <button
              type="button"
              onClick={() => {
                if (isUrgentFocusActive) {
                  setStatusFilter('all');
                  setMonthFilter('all');
                } else {
                  setStatusFilter('unpaid');
                  setMonthFilter('current');
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 border ${
                isUrgentFocusActive
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
              }`}
              title="Focus on urgent collections: Current month unpaid bills"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Urgent Focus ({currentMonthUnpaidBills.length})</span>
            </button>
          </div>
        </div>

        {/* Filter Summary & Active Constraints Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-slate-900">{filteredBills.length}</strong> of{' '}
              <strong className="text-slate-900">{bills.length}</strong> statements
            </span>
            {monthFilter === 'current' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Period: Current Month ({currentMonthLong} {currentYear})
              </span>
            )}
            {statusFilter === 'unpaid' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                Status: Unpaid Only
              </span>
            )}
            {statusFilter === 'paid' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Status: Paid Only
              </span>
            )}
          </div>

          {(statusFilter !== 'all' || monthFilter !== 'all' || searchTerm) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setMonthFilter('all');
                setSearchTerm('');
              }}
              className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer text-xs hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Invoice No</th>
                <th className="py-3 px-4 font-semibold">Client Name</th>
                <th className="py-3 px-4 font-semibold">Billing Period</th>
                <th className="py-3 px-4 font-semibold text-right">Amount to Pay</th>
                <th className="py-3 px-4 font-semibold">Due Date</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No billing statements match the filter.
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => {
                  const isPaid = bill.status === 'paid';
                  const isOverdue = bill.status === 'overdue';
                  const isUnpaid = bill.status === 'unpaid';

                  return (
                    <tr key={bill.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                        {bill.billNo}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{bill.customerName}</div>
                        <div className="text-[11px] text-slate-500">{bill.customerEmail}</div>
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-700">
                        {bill.period}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {formatPeso(bill.amount_pay)}
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                          {bill.due_date}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {isPaid && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                            <CheckCircle className="w-3.5 h-3.5" /> Paid
                          </span>
                        )}
                        {isUnpaid && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                            <Clock className="w-3.5 h-3.5" /> Unpaid
                          </span>
                        )}
                        {isOverdue && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700">
                            <AlertTriangle className="w-3.5 h-3.5" /> Overdue
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Modify Invoice Button */}
                          <button
                            onClick={() => handleOpenEditModal(bill)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-blue-600 rounded-md transition-colors shadow-2xs cursor-pointer"
                            title="Modify Invoice Details &amp; Add Items in Statement Breakdown"
                          >
                            <Edit2 className="w-3 h-3 text-slate-500" />
                            Modify
                          </button>

                          {/* Print Bill Button */}
                          <button
                            onClick={() => onPrintBill(bill)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-md transition-colors shadow-2xs cursor-pointer"
                            title="Print Monthly Bill Statement to Client"
                          >
                            <Printer className="w-3 h-3 text-slate-500" />
                            Print Bill
                          </button>

                          {isPaid ? (
                            <button
                              onClick={() => bill.receiptId && onViewReceipt(bill.receiptId)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                              title="Print Official Receipt"
                            >
                              <FileText className="w-3 h-3" />
                              Official Receipt
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => onSendSingleReminder(bill)}
                                className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                                title="Send Email Reminder Now"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onOpenRecordPayment(bill)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-xs cursor-pointer"
                                title="Collect Payment and Issue Official Receipt"
                              >
                                <CreditCard className="w-3 h-3" />
                                Pay &amp; Issue Receipt
                              </button>
                            </>
                          )}

                          {/* Delete Invoice Button */}
                          <button
                            onClick={() => setDeleteConfirmBill(bill)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Single Bill Modal with Multi-Item Statement Breakdown */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Issue Monthly Bill to Client</h3>
                <p className="text-[11px] text-slate-500">
                  Add items in the statement breakdown. Total amount due and words update automatically.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              {/* Client Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Client <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.lastname}, {c.firstname} ({c.accountNo}) — {c.net_plan} [{c.status}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Billing Period and Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Billing Period (period) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={periodInput}
                    onChange={(e) => setPeriodInput(e.target.value)}
                    placeholder="e.g. Nov 01 - Nov 30, 2026"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Due Date (due_date) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDateInput}
                    onChange={(e) => setDueDateInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Statement Breakdown Items Section (Requested Feature) */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Statement Breakdown Line Items
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Add items with Service description, plan speed, billing period, and amount.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddBreakdownItem}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Item
                  </button>
                </div>

                {/* Items List */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {addBillItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3 bg-white rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs shadow-2xs"
                    >
                      <div className="sm:col-span-4">
                        <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-0.5">
                          Service Description
                        </label>
                        <input
                          type="text"
                          required
                          value={item.serviceDescription}
                          onChange={(e) =>
                            handleUpdateAddBreakdownItem(item.id, 'serviceDescription', e.target.value)
                          }
                          placeholder="e.g. Fiber Internet Plan"
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-0.5">
                          Plan Speed
                        </label>
                        <input
                          type="text"
                          value={item.planSpeed}
                          onChange={(e) =>
                            handleUpdateAddBreakdownItem(item.id, 'planSpeed', e.target.value)
                          }
                          placeholder="e.g. 100 Mbps"
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none font-mono"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-0.5">
                          Billing Period
                        </label>
                        <input
                          type="text"
                          required
                          value={item.billingPeriod}
                          onChange={(e) =>
                            handleUpdateAddBreakdownItem(item.id, 'billingPeriod', e.target.value)
                          }
                          placeholder="Nov 01 - Nov 30"
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-0.5">
                          Amount (₱)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={item.amount}
                          onChange={(e) =>
                            handleUpdateAddBreakdownItem(item.id, 'amount', Number(e.target.value))
                          }
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none font-mono font-bold"
                        />
                      </div>
                      <div className="sm:col-span-1 flex justify-end pt-3 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveAddBreakdownItem(item.id)}
                          disabled={addBillItems.length <= 1}
                          className={`p-1.5 rounded transition-colors ${
                            addBillItems.length > 1
                              ? 'text-rose-500 hover:bg-rose-50 cursor-pointer'
                              : 'text-slate-300 cursor-not-allowed'
                          }`}
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dynamic Sum & Words Card */}
                <div className="bg-blue-50/80 border border-blue-200 rounded-lg p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                      Total Amount Due (Sum of Items):
                    </span>
                    <span className="text-base font-bold font-mono text-blue-900 tabular-nums">
                      {formatPeso(addTotalAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-700 block">
                      Total Amount in Words:
                    </span>
                    <span className="text-xs font-mono font-semibold text-blue-950 block bg-white/80 p-1.5 rounded border border-blue-200/60 mt-0.5">
                      {addTotalInWords}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bill Remarks / Adjustments (Optional)
                </label>
                <input
                  type="text"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="e.g. Regular monthly subscription + router add-on"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 text-blue-900 text-xs rounded-lg flex items-start gap-2">
                <Send className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Automated Email Dispatch Enabled:</strong> If this client is active, an automated email billing notification will be generated and dispatched with these item breakdown details.
                </span>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  Issue Monthly Bill ({formatPeso(addTotalAmount)})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modify / Edit Invoice Modal (Requested Feature) */}
      {editingBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Modify Invoice &amp; Statement Breakdown
                </h3>
                <p className="text-[11px] text-slate-500">
                  Editing Invoice <strong className="font-mono text-slate-800">{editingBill.billNo}</strong> for {editingBill.customerName}.
                </p>
              </div>
              <button
                onClick={() => setEditingBill(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {/* Billing Period and Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Billing Period <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editPeriod}
                    onChange={(e) => setEditPeriod(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Due Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Invoice Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as BillStatus)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="unpaid">Unpaid / Pending</option>
                    <option value="overdue">Overdue</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              {/* Statement Breakdown Items Section */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Statement Breakdown Line Items
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Add, remove, or modify items. Sum of items calculates total amount due.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddEditBreakdownItem}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Item
                  </button>
                </div>

                {/* Items List */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {editBillItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-white rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs shadow-2xs"
                    >
                      <div className="sm:col-span-4">
                        <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-0.5">
                          Service Description
                        </label>
                        <input
                          type="text"
                          required
                          value={item.serviceDescription}
                          onChange={(e) =>
                            handleUpdateEditBreakdownItem(item.id, 'serviceDescription', e.target.value)
                          }
                          placeholder="e.g. Fiber 100 Mbps Plan"
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-0.5">
                          Plan Speed
                        </label>
                        <input
                          type="text"
                          value={item.planSpeed}
                          onChange={(e) =>
                            handleUpdateEditBreakdownItem(item.id, 'planSpeed', e.target.value)
                          }
                          placeholder="e.g. 100 Mbps"
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none font-mono"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-0.5">
                          Billing Period
                        </label>
                        <input
                          type="text"
                          required
                          value={item.billingPeriod}
                          onChange={(e) =>
                            handleUpdateEditBreakdownItem(item.id, 'billingPeriod', e.target.value)
                          }
                          placeholder="Period"
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-0.5">
                          Amount (₱)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={item.amount}
                          onChange={(e) =>
                            handleUpdateEditBreakdownItem(item.id, 'amount', Number(e.target.value))
                          }
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none font-mono font-bold"
                        />
                      </div>
                      <div className="sm:col-span-1 flex justify-end pt-3 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveEditBreakdownItem(item.id)}
                          disabled={editBillItems.length <= 1}
                          className={`p-1.5 rounded transition-colors ${
                            editBillItems.length > 1
                              ? 'text-rose-500 hover:bg-rose-50 cursor-pointer'
                              : 'text-slate-300 cursor-not-allowed'
                          }`}
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dynamic Sum & Words Card */}
                <div className="bg-blue-50/80 border border-blue-200 rounded-lg p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                      Total Amount Due (Sum of Items):
                    </span>
                    <span className="text-base font-bold font-mono text-blue-900 tabular-nums">
                      {formatPeso(editTotalAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-700 block">
                      Total Amount in Words:
                    </span>
                    <span className="text-xs font-mono font-semibold text-blue-950 block bg-white/80 p-1.5 rounded border border-blue-200/60 mt-0.5">
                      {editTotalInWords}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Invoice Remarks / Adjustments
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Account adjusted with promotional credit"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBill(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  Save Invoice Changes ({formatPeso(editTotalAmount)})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Generate Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full my-8 overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Batch Monthly Bill Generation</h3>
                <p className="text-[11px] text-slate-500">
                  Generate monthly statements for all {activeCustomerCount} currently active clients in one click.
                </p>
              </div>
              <button
                onClick={() => setShowBatchModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBatchSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Billing Period Label <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={batchPeriod}
                  onChange={(e) => setBatchPeriod(e.target.value)}
                  placeholder="e.g. Nov 01 - Nov 30, 2026"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Batch Payment Due Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={batchDueDate}
                  onChange={(e) => setBatchDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-lg space-y-1">
                <div className="font-semibold">Batch Summary:</div>
                <div>· Active Subscribers to Bill: <strong>{activeCustomerCount} clients</strong></div>
                <div>· Automated email billing notifications will be triggered for each active account.</div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  Generate All Bills ({activeCustomerCount})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Invoice Confirmation Modal */}
      {deleteConfirmBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Invoice?</h3>
                <p className="text-xs text-slate-500">Invoice: <span className="font-mono font-bold text-slate-800">{deleteConfirmBill.billNo}</span></p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5 my-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-semibold text-slate-900">{deleteConfirmBill.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Billing Period:</span>
                <span className="font-medium text-slate-800">{deleteConfirmBill.period}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Due:</span>
                <span className="font-mono font-bold text-slate-900">{formatPeso(deleteConfirmBill.amount_pay)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Status:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  deleteConfirmBill.status === 'paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : deleteConfirmBill.status === 'overdue'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {deleteConfirmBill.status}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to permanently delete this invoice? This will remove the statement from monthly billing records and subscriber history.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmBill(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteBill) {
                    onDeleteBill(deleteConfirmBill.id);
                  }
                  setDeleteConfirmBill(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Confirm Delete Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
