import React, { useState } from 'react';
import { Customer, CustomerStatus, NetPlan } from '../../types';
import { getStoredNetPlans, reindexSubscribersData, deleteAllCustomersData } from '../../utils/storage';
import { formatPeso } from '../../utils/numberToWords';
import {
  Search,
  UserPlus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Wifi,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Send,
  Download,
  Key,
  Copy,
  ExternalLink,
  Lock,
  RotateCcw,
} from 'lucide-react';
import { exportCustomersToCsv } from '../../utils/csvExport';
import { exportToJson } from '../../utils/exportJson';

interface CustomerManagementProps {
  customers: Customer[];
  netPlans?: NetPlan[];
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer, oldStatus?: CustomerStatus) => void;
  onDeleteCustomer: (customerId: string) => void;
  onDeleteAllCustomers?: () => void;
  onTriggerCustomerReminder: (customer: Customer) => void;
}

export const CustomerManagement: React.FC<CustomerManagementProps> = ({
  customers,
  netPlans,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onDeleteAllCustomers,
  onTriggerCustomerReminder,
}) => {
  const availablePlans = netPlans && netPlans.length > 0 ? netPlans : getStoredNetPlans();
  const defaultPlanName = availablePlans[0]?.name || 'Fiber Broadband';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [copiedPortalUrl, setCopiedPortalUrl] = useState(false);
  const [isReindexing, setIsReindexing] = useState(false);
  const [reindexNotice, setReindexNotice] = useState('');
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  const handleReindexSubscribers = () => {
    setIsReindexing(true);
    setReindexNotice('');
    try {
      const repaired = reindexSubscribersData();
      repaired.forEach((cust) => {
        onUpdateCustomer(cust);
      });
      setReindexNotice(`Subscribers data reindexed successfully! Verified and synchronized ${repaired.length} subscriber accounts with active portal credentials.`);
      setTimeout(() => {
        setReindexNotice('');
      }, 6000);
    } catch (err) {
      console.error('Failed to reindex subscribers', err);
      setReindexNotice('Failed to reindex subscribers. Please try again.');
    } finally {
      setIsReindexing(false);
    }
  };

  // Form State with required fields
  const [formData, setFormData] = useState<{
    id?: string;
    accountNo?: string;
    firstname: string;
    lastname: string;
    username: string;
    password: string;
    email: string;
    contactNumber: string;
    address: string;
    net_plan: string;
    date_installed: string;
    due_date: string;
    status: CustomerStatus;
    notes?: string;
  }>({
    firstname: '',
    lastname: '',
    username: '',
    password: 'client123',
    email: '',
    contactNumber: '',
    address: '',
    net_plan: defaultPlanName,
    date_installed: new Date().toISOString().slice(0, 10),
    due_date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-25`,
    status: 'active',
    notes: '',
  });

  const [formError, setFormError] = useState('');

  // Filter customers
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      `${c.firstname} ${c.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.username && c.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.accountNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.net_plan.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openCreateModal = () => {
    const now = new Date();
    const defaultCalDueDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-25`;

    setFormData({
      firstname: '',
      lastname: '',
      username: '',
      password: 'client123',
      email: '',
      contactNumber: '+63 9',
      address: '',
      net_plan: defaultPlanName,
      date_installed: new Date().toISOString().slice(0, 10),
      due_date: defaultCalDueDate,
      status: 'active',
      notes: '',
    });
    setFormError('');
    setModalMode('create');
  };

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    let editDueDate = customer.due_date;
    if (!editDueDate || !/^\d{4}-\d{2}-\d{2}$/.test(editDueDate)) {
      const match = editDueDate?.match(/\d+/);
      const day = match ? parseInt(match[0], 10) : 25;
      const now = new Date();
      editDueDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(Math.min(Math.max(day, 1), 28)).padStart(2, '0')}`;
    }

    setFormData({
      id: customer.id,
      accountNo: customer.accountNo,
      firstname: customer.firstname,
      lastname: customer.lastname,
      username: customer.username || `${customer.firstname.toLowerCase()}.${customer.lastname.toLowerCase()}`,
      password: customer.password || 'client123',
      email: customer.email,
      contactNumber: customer.contactNumber,
      address: customer.address,
      net_plan: customer.net_plan,
      date_installed: customer.date_installed,
      due_date: editDueDate,
      status: customer.status,
      notes: customer.notes || '',
    });
    setFormError('');
    setModalMode('edit');
  };

  const handlePlanChange = (planName: string) => {
    setFormData((prev) => ({
      ...prev,
      net_plan: planName,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstname.trim() || !formData.lastname.trim()) {
      setFormError('First name and last name are required.');
      return;
    }
    if (!formData.contactNumber.trim()) {
      setFormError('Contact number is required.');
      return;
    }
    if (!formData.address.trim()) {
      setFormError('Address is required.');
      return;
    }

    const assignedUsername =
      formData.username.trim() ||
      `${formData.firstname.toLowerCase().replace(/\s+/g, '')}.${formData.lastname.toLowerCase().replace(/\s+/g, '')}`;
    const assignedPassword = formData.password.trim() || 'client123';

    const matchedPlan =
      availablePlans.find((p) => p.name === formData.net_plan) || availablePlans[0];
    const planSpeedValue = matchedPlan?.speed || 'High-Speed';
    const planMonthlyFee = matchedPlan ? matchedPlan.monthlyRate : 1299;

    if (modalMode === 'create') {
      let maxNum = 0;
      for (const c of customers) {
        const match = c.id?.match(/^CUST-(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      }
      let nextNum = Math.max(maxNum + 1, customers.length + 1);
      while (customers.some((c) => c.id === `CUST-${String(nextNum).padStart(3, '0')}`)) {
        nextNum++;
      }
      const newId = `CUST-${String(nextNum).padStart(3, '0')}`;

      let randomAcc = `AF-${Math.floor(100000 + Math.random() * 900000)}`;
      while (customers.some((c) => c.accountNo === randomAcc)) {
        randomAcc = `AF-${Math.floor(100000 + Math.random() * 900000)}`;
      }

      const generatedEmail =
        formData.email.trim() ||
        `${formData.firstname.toLowerCase().replace(/\s+/g, '')}.${formData.lastname.toLowerCase().replace(/\s+/g, '')}@gmail.com`;

      const newCustomer: Customer = {
        id: newId,
        accountNo: randomAcc,
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        username: assignedUsername,
        password: assignedPassword,
        email: generatedEmail,
        contactNumber: formData.contactNumber.trim(),
        address: formData.address.trim(),
        net_plan: formData.net_plan,
        planSpeed: planSpeedValue,
        monthlyFee: planMonthlyFee,
        date_installed: formData.date_installed,
        due_date: formData.due_date,
        status: formData.status,
        notes: formData.notes?.trim(),
      };

      onAddCustomer(newCustomer);
    } else if (modalMode === 'edit' && selectedCustomer) {
      const targetId = selectedCustomer.id;
      const targetAccountNo = selectedCustomer.accountNo;
      const oldStatus = selectedCustomer.status;
      const updatedCustomer: Customer = {
        ...selectedCustomer,
        id: targetId,
        accountNo: targetAccountNo,
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        username: assignedUsername,
        password: assignedPassword,
        email: formData.email.trim() || selectedCustomer.email,
        contactNumber: formData.contactNumber.trim(),
        address: formData.address.trim(),
        net_plan: formData.net_plan,
        planSpeed: planSpeedValue,
        monthlyFee: planMonthlyFee,
        date_installed: formData.date_installed,
        due_date: formData.due_date,
        status: formData.status,
        notes: formData.notes?.trim(),
      };

      onUpdateCustomer(updatedCustomer, oldStatus);
    }

    setModalMode(null);
    setSelectedCustomer(null);
  };

  return (
    <div className="space-y-6">
      {/* Action Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Customer Subscriber Registry
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage broadband subscribers, modify accounts, adjust internet plans, and trigger automated reminders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleReindexSubscribers}
            disabled={isReindexing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors shadow-xs cursor-pointer"
            title="Re-synchronize, repair, and verify all subscriber account login credentials"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isReindexing ? 'animate-spin' : ''}`} />
            <span>{isReindexing ? 'Reindexing...' : 'Reindex Subscribers Data'}</span>
          </button>

          <button
            onClick={() => exportCustomersToCsv(filteredCustomers)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-xs cursor-pointer"
            title={`Export ${filteredCustomers.length} subscriber records to CSV`}
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export to CSV ({filteredCustomers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => exportToJson(`subscribers_${new Date().toISOString().slice(0, 10)}.json`, customers)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg transition-colors shadow-xs cursor-pointer"
            title={`Export ${customers.length} subscriber records to JSON`}
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Export JSON ({customers.length})</span>
          </button>

          {customers.length > 0 && (
            <button
              type="button"
              onClick={() => setShowDeleteAllConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors shadow-xs cursor-pointer"
              title="Permanently delete all client records from the database"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Delete All Clients ({customers.length})</span>
            </button>
          )}

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Customer</span>
          </button>
        </div>
      </div>

      {reindexNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{reindexNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setReindexNotice('')}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold cursor-pointer underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Client Portal Address Announcement Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-xl p-4 shadow-sm border border-blue-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600/60 border border-blue-400/30 flex items-center justify-center shrink-0">
            <Key className="w-5 h-5 text-blue-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">Client Portal Web Address</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 border border-blue-400/30">
                Direct Client Link
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              Clients log in using their assigned <strong>User name</strong> and <strong>Password</strong> at:{' '}
              <code className="bg-black/40 px-2 py-0.5 rounded text-white font-mono text-[11px] font-semibold border border-white/10">
                {typeof window !== 'undefined' ? `${window.location.origin}/clients` : 'https://net-home-link.ai.studio/clients'}
              </code>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => {
              const url = `${window.location.origin}/clients`;
              navigator.clipboard?.writeText(url);
              setCopiedPortalUrl(true);
              setTimeout(() => setCopiedPortalUrl(false), 2500);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-white"
            title="Copy client portal URL"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedPortalUrl ? 'Copied!' : 'Copy URL'}</span>
          </button>
          <a
            href="/clients"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, '', '/clients');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-400 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-white shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open /clients</span>
          </a>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by client name, username, account #, phone, or plan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* Status Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start md:self-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({customers.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active ({customers.filter((c) => c.status === 'active').length})
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              statusFilter === 'inactive'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Inactive ({customers.filter((c) => c.status === 'inactive').length})
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Subscriber &amp; Login</th>
                <th className="py-3 px-4 font-semibold">Contact &amp; Address</th>
                <th className="py-3 px-4 font-semibold">Net Plan</th>
                <th className="py-3 px-4 font-semibold">Date Installed</th>
                <th className="py-3 px-4 font-semibold">Monthly Due</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No customers found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const isActive = cust.status === 'active';
                  return (
                    <tr
                      key={cust.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 text-sm">
                          {cust.lastname}, {cust.firstname}
                        </div>
                        <div className="font-mono text-[11px] text-slate-500 mt-0.5">
                          {cust.accountNo}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono text-slate-700 bg-slate-100/90 px-2 py-0.5 rounded border border-slate-200 w-fit">
                          <Key className="w-3 h-3 text-blue-600 shrink-0" />
                          <span>User: <strong className="text-blue-900">{cust.username || '—'}</strong></span>
                          <span className="text-slate-300">·</span>
                          <span>Pass: <strong className="text-slate-700">{cust.password || 'client123'}</strong></span>
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="text-slate-800 flex items-center gap-1.5 truncate">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{cust.contactNumber}</span>
                        </div>
                        <div className="text-slate-500 flex items-center gap-1.5 truncate text-[11px] mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{cust.address}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 flex items-center gap-1">
                          <Wifi className="w-3 h-3 text-blue-600 shrink-0" />
                          <span>{cust.net_plan}</span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                          {formatPeso(cust.monthlyFee)}/mo
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 font-mono">
                        {cust.date_installed}
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        <span className="font-medium">{cust.due_date}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                            isActive ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                          />
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isActive && (
                            <button
                              onClick={() => onTriggerCustomerReminder(cust)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Trigger Automated Billing Reminder Email"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(cust)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Modify Customer Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(cust.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Customer"
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Delete Customer Record?</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Are you sure you want to delete this customer record? Associated billing history and reminders will be retained for archival purposes.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteCustomer(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Customer Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full my-8 overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {modalMode === 'create' ? 'Register New Customer Entry' : 'Modify Customer Information'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {modalMode === 'create'
                    ? 'Enter customer details. Setting status to Active automatically enables billing notifications.'
                    : 'Update subscriber credentials, net plan, and service active status.'}
                </p>
              </div>
              <button
                onClick={() => setModalMode(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Name fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstname}
                    onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                    placeholder="e.g. Juan"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastname}
                    onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                    placeholder="e.g. Dela Cruz"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Contact Number and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    placeholder="+63 917 123 4567"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address (For Reminders)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@gmail.com"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Client Portal Credentials (Assigned by Admin) */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-blue-950">
                      Client Portal Login Credentials
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-mono font-medium">
                    Portal: /clients
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Assign the <strong>User name</strong> and <strong>Password</strong> for this subscriber to log in directly at the Client Portal (<code className="text-blue-700 font-semibold font-mono">/clients</code>).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      User name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          username: e.target.value.toLowerCase().replace(/\s+/g, ''),
                        })
                      }
                      placeholder="e.g. juan.delacruz"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            password: Math.random().toString(36).slice(-8),
                          })
                        }
                        className="text-[10px] text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                      >
                        Auto-generate
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Client portal password"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Installation Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Unit #, Street, Barangay, City, Metro Manila"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Net Plan Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Internet Plan (net_plan) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.net_plan}
                  onChange={(e) => handlePlanChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {availablePlans.map((plan) => (
                    <option key={plan.id || plan.name} value={plan.name}>
                      {plan.name} — {formatPeso(plan.monthlyRate)} / month
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Installed and Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date Installed <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date_installed}
                    onChange={(e) => setFormData({ ...formData, date_installed: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly Due Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-slate-900"
                  />
                </div>
              </div>

              {/* Status Radio / Selector (Active or Not) */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-800">
                    Account Status (active or not)
                  </span>
                  <span className="text-[11px] text-blue-600 font-medium">
                    Automated reminders trigger when active
                  </span>
                </div>
                <div className="flex items-center gap-6 text-xs">
                  <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status === 'active'}
                      onChange={() => setFormData({ ...formData, status: 'active' })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-emerald-700 font-semibold">Active</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={formData.status === 'inactive'}
                      onChange={() => setFormData({ ...formData, status: 'inactive' })}
                      className="text-slate-600 focus:ring-slate-500"
                    />
                    <span className="text-slate-500">Inactive / Suspended</span>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Account Notes / Equipment (Optional)
                </label>
                <input
                  type="text"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. ONU Fiber Router SN: ZTE-881903"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  {modalMode === 'create' ? 'Save New Customer' : 'Update Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete All Clients Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-200 text-xs animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Delete All Clients Data</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              Are you sure you want to permanently delete all {customers.length} client and subscriber records from the database? This will clear all subscriber profiles, assigned usernames, and passwords.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteAllConfirm(false)}
                className="px-3 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteAllCustomers) {
                    onDeleteAllCustomers();
                  } else {
                    deleteAllCustomersData();
                    window.location.reload();
                  }
                  setShowDeleteAllConfirm(false);
                }}
                className="px-3.5 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Delete All Clients
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
