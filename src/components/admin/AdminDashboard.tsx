import React, { useState } from 'react';
import {
  Customer,
  Bill,
  BillItem,
  Receipt,
  EmailReminderLog,
  PaymentMethod,
  CustomerStatus,
  AdminAccount,
  CompanyProfile,
  LoginAuditLog,
  AuthUser,
  NetPlan,
  SupportTicket,
} from '../../types';
import { AutoReminderSettings } from '../../utils/storage';
import { CustomerManagement } from './CustomerManagement';
import { MonthlyBilling } from './MonthlyBilling';
import { NetPlansManagement } from './NetPlansManagement';
import { ReceiptsManagement } from './ReceiptsManagement';
import { EmailReminderCenter } from './EmailReminderCenter';
import { AdminAccountsManagement } from './AdminAccountsManagement';
import { CompanyProfileManagement } from './CompanyProfileManagement';
import { LoginLogsManagement } from './LoginLogsManagement';
import { DatabaseSyncManagement } from './DatabaseSyncManagement';
import { SupportTicketsManagement } from './SupportTicketsManagement';
import { Users, FileText, Printer, Mail, Shield, Building2, ScrollText, Wifi, Database, LifeBuoy, Wrench } from 'lucide-react';

interface AdminDashboardProps {
  customers: Customer[];
  bills: Bill[];
  receipts: Receipt[];
  emailLogs: EmailReminderLog[];
  settings: AutoReminderSettings;
  adminAccounts: AdminAccount[];
  companyProfile: CompanyProfile;
  loginLogs: LoginAuditLog[];
  netPlans: NetPlan[];
  currentUser: AuthUser | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer, oldStatus?: CustomerStatus) => void;
  onDeleteCustomer: (customerId: string) => void;
  onDeleteAllCustomers?: () => void;
  onTriggerCustomerReminder: (customer: Customer) => void;
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
  onPrintBill: (bill: Bill) => void;
  onPreviewEmail: (log: EmailReminderLog) => void;
  onUpdateSettings: (newSettings: AutoReminderSettings) => void;
  onTriggerBatchReminders: () => void;
  onAddAdminAccount: (account: AdminAccount) => void;
  onUpdateAdminAccount: (account: AdminAccount) => void;
  onDeleteAdminAccount: (id: string) => void;
  onUpdateCompanyProfile: (newProfile: CompanyProfile) => void;
  onClearLoginLogs: () => void;
  onAddNetPlan: (plan: NetPlan) => void;
  onUpdateNetPlan: (plan: NetPlan) => void;
  onDeleteNetPlan: (planId: string) => void;
  onDeleteBill?: (billId: string) => void;
  onDeleteReceipt?: (receiptNo: string) => void;
  onRefreshAllData?: (syncedData?: any) => void;
  showToast?: (msg: string) => void;
  supportTickets?: SupportTicket[];
  onUpdateTicket?: (ticket: SupportTicket) => void;
  onDeleteTicket?: (ticketId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  customers,
  bills,
  receipts,
  emailLogs,
  settings,
  adminAccounts,
  companyProfile,
  loginLogs,
  netPlans,
  currentUser,
  activeTab,
  onTabChange,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onDeleteAllCustomers,
  onTriggerCustomerReminder,
  onAddBill,
  onUpdateBill,
  onBatchGenerateBills,
  onRecordPayment,
  onPrintReceipt,
  onPrintBill,
  onDeleteBill,
  onDeleteReceipt,
  onPreviewEmail,
  onUpdateSettings,
  onTriggerBatchReminders,
  onAddAdminAccount,
  onUpdateAdminAccount,
  onDeleteAdminAccount,
  onUpdateCompanyProfile,
  onClearLoginLogs,
  onAddNetPlan,
  onUpdateNetPlan,
  onDeleteNetPlan,
  onRefreshAllData,
  showToast,
  supportTickets = [],
  onUpdateTicket = () => {},
  onDeleteTicket = () => {},
}) => {
  const [selectedBillForPayment, setSelectedBillForPayment] = useState<Bill | null>(null);

  const handleOpenRecordPaymentFromBill = (bill: Bill) => {
    setSelectedBillForPayment(bill);
    onTabChange('receipts');
  };

  const handleViewReceiptById = (receiptId: string) => {
    const r = receipts.find((rec) => rec.receiptNo === receiptId || rec.billId === receiptId);
    if (r) {
      onPrintReceipt(r);
    }
  };

  const handleSendSingleReminderFromBill = (bill: Bill) => {
    const cust = customers.find((c) => c.id === bill.customerId);
    if (cust) {
      onTriggerCustomerReminder(cust);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation tabs for Admin */}
      <div className="bg-white rounded-xl border border-slate-200 p-1 flex flex-wrap items-center gap-1 shadow-xs text-xs">
        <button
          onClick={() => onTabChange('customers')}
          className={`flex items-center gap-1.5 px-3 py-2 font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'customers'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Subscribers ({customers.length})</span>
        </button>

        <button
          onClick={() => onTabChange('billing')}
          className={`flex items-center gap-1.5 px-3 py-2 font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'billing'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Monthly Billing ({bills.length})</span>
        </button>

        <button
          onClick={() => onTabChange('net_plans')}
          className={`flex items-center gap-1.5 px-3 py-2 font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'net_plans'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Wifi className="w-3.5 h-3.5" />
          <span>Net Plans ({netPlans.length})</span>
        </button>

        <button
          onClick={() => onTabChange('receipts')}
          className={`flex items-center gap-1.5 px-3 py-2 font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'receipts'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Official Receipts ({receipts.length})</span>
        </button>

        <button
          onClick={() => onTabChange('reminders')}
          className={`flex items-center gap-1.5 px-3 py-2 font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'reminders'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Email Reminders ({emailLogs.length})</span>
        </button>

        <button
          onClick={() => onTabChange('repair_requests')}
          className={`flex items-center gap-1.5 px-3 py-2 font-semibold rounded-lg transition-colors cursor-pointer relative ${
            activeTab === 'repair_requests' || activeTab === 'support_tickets'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Repair Request</span>
          <span className="opacity-80">({supportTickets.length})</span>
          {supportTickets.filter((t) => t.status === 'pending').length > 0 && (
            <span className="inline-flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-pulse shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-300 opacity-90"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-100"></span>
              </span>
              <span>{supportTickets.filter((t) => t.status === 'pending').length} New</span>
            </span>
          )}
        </button>

        <button
          onClick={() => onTabChange('admin_accounts')}
          className={`flex items-center gap-1.5 px-3 py-2 font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'admin_accounts'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Admin Staff Accounts ({adminAccounts.length})</span>
        </button>

        <button
          onClick={() => onTabChange('company_profile')}
          className={`flex items-center gap-1.5 px-3 py-2 font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'company_profile'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Company Profile (Manager)</span>
        </button>

        <button
          onClick={() => onTabChange('login_logs')}
          className={`flex items-center gap-1.5 px-3 py-2 font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'login_logs'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ScrollText className="w-3.5 h-3.5" />
          <span>Login Audit Logs ({loginLogs.length})</span>
        </button>

        <button
          onClick={() => onTabChange('database_sync')}
          className={`flex items-center gap-1.5 px-3 py-2 font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'database_sync'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Database Sync</span>
        </button>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'customers' && (
        <CustomerManagement
          customers={customers}
          netPlans={netPlans}
          onAddCustomer={onAddCustomer}
          onUpdateCustomer={onUpdateCustomer}
          onDeleteCustomer={onDeleteCustomer}
          onDeleteAllCustomers={onDeleteAllCustomers}
          onTriggerCustomerReminder={onTriggerCustomerReminder}
        />
      )}

      {activeTab === 'billing' && (
        <MonthlyBilling
          customers={customers}
          bills={bills}
          onAddBill={onAddBill}
          onUpdateBill={onUpdateBill}
          onBatchGenerateBills={onBatchGenerateBills}
          onOpenRecordPayment={handleOpenRecordPaymentFromBill}
          onViewReceipt={handleViewReceiptById}
          onSendSingleReminder={handleSendSingleReminderFromBill}
          onPrintBill={onPrintBill}
          onDeleteBill={onDeleteBill}
        />
      )}

      {activeTab === 'net_plans' && (
        <NetPlansManagement
          netPlans={netPlans}
          customers={customers}
          onAddPlan={onAddNetPlan}
          onUpdatePlan={onUpdateNetPlan}
          onDeletePlan={onDeleteNetPlan}
        />
      )}

      {activeTab === 'receipts' && (
        <ReceiptsManagement
          receipts={receipts}
          bills={bills}
          customers={customers}
          onRecordPayment={onRecordPayment}
          onPrintReceipt={onPrintReceipt}
          onDeleteReceipt={onDeleteReceipt}
          selectedBillForPayment={selectedBillForPayment}
          onClearSelectedBillForPayment={() => setSelectedBillForPayment(null)}
          adminAccounts={adminAccounts}
        />
      )}

      {activeTab === 'reminders' && (
        <EmailReminderCenter
          customers={customers}
          bills={bills}
          emailLogs={emailLogs}
          settings={settings}
          onUpdateSettings={onUpdateSettings}
          onTriggerBatchReminders={onTriggerBatchReminders}
          onPreviewEmail={onPreviewEmail}
        />
      )}

      {(activeTab === 'repair_requests' || activeTab === 'support_tickets') && (
        <SupportTicketsManagement
          supportTickets={supportTickets}
          adminAccounts={adminAccounts}
          onUpdateTicket={onUpdateTicket}
          onDeleteTicket={onDeleteTicket}
          showToast={showToast}
        />
      )}

      {activeTab === 'admin_accounts' && (
        <AdminAccountsManagement
          adminAccounts={adminAccounts}
          onAddAdminAccount={onAddAdminAccount}
          onUpdateAdminAccount={onUpdateAdminAccount}
          onDeleteAdminAccount={onDeleteAdminAccount}
          currentUserId={currentUser?.id}
        />
      )}

      {activeTab === 'company_profile' && (
        <CompanyProfileManagement
          companyProfile={companyProfile}
          currentUser={currentUser}
          onUpdateCompanyProfile={onUpdateCompanyProfile}
        />
      )}

      {activeTab === 'login_logs' && (
        <LoginLogsManagement
          loginLogs={loginLogs}
          onClearLogs={onClearLoginLogs}
        />
      )}

      {activeTab === 'database_sync' && (
        <DatabaseSyncManagement
          customers={customers}
          bills={bills}
          receipts={receipts}
          netPlans={netPlans}
          adminAccounts={adminAccounts}
          companyProfile={companyProfile}
          emailLogs={emailLogs}
          loginLogs={loginLogs}
          onRefreshAllData={onRefreshAllData || (() => {})}
          showToast={showToast || (() => {})}
        />
      )}
    </div>
  );
};
