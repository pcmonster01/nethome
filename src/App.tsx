import React, { useState, useEffect } from 'react';
import {
  Customer,
  Bill,
  BillItem,
  Receipt,
  EmailReminderLog,
  AuthUser,
  PaymentMethod,
  CustomerStatus,
  AdminAccount,
  CompanyProfile,
  LoginAuditLog,
  NetPlan,
  SupportTicket,
} from './types';
import {
  getStoredCustomers,
  reindexSubscribersData,
  deleteAllCustomersData,
  saveCustomers,
  getStoredBills,
  saveBills,
  getStoredReceipts,
  saveReceipts,
  getStoredEmailLogs,
  saveEmailLogs,
  getStoredAutoSettings,
  saveAutoSettings,
  getStoredUser,
  saveStoredUser,
  getStoredAdminAccounts,
  saveAdminAccounts,
  getStoredCompanyProfile,
  saveCompanyProfile,
  getStoredLoginLogs,
  saveLoginLogs,
  getStoredNetPlans,
  saveNetPlans,
  getStoredSupportTickets,
  saveSupportTickets,
  createSupportTicket,
  AutoReminderSettings,
  syncDatabaseWithPublished,
  fetchPublishedDatabase,
} from './utils/storage';
import {
  triggerAutomatedRemindersForActiveClients,
  triggerReminderForActivatedCustomer,
  triggerReminderForNewBill,
} from './utils/emailReminderEngine';
import { formatPeso, numberToWordsInPeso } from './utils/numberToWords';
import { Navbar } from './components/Navbar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ClientDashboard } from './components/client/ClientDashboard';
import { LoginModal } from './components/LoginModal';
import { ReceiptModal } from './components/ReceiptModal';
import { BillPrintModal } from './components/BillPrintModal';
import { EmailPreviewModal } from './components/EmailPreviewModal';
import { CheckCircle2, Bell, RefreshCw } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getStoredUser());
  const [customers, setCustomers] = useState<Customer[]>(() => reindexSubscribersData());
  const [bills, setBills] = useState<Bill[]>(() => getStoredBills());
  const [receipts, setReceipts] = useState<Receipt[]>(() => getStoredReceipts());
  const [emailLogs, setEmailLogs] = useState<EmailReminderLog[]>(() => getStoredEmailLogs());
  const [autoSettings, setAutoSettings] = useState<AutoReminderSettings>(() => getStoredAutoSettings());
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>(() => getStoredAdminAccounts());
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(() => getStoredCompanyProfile());
  const [loginLogs, setLoginLogs] = useState<LoginAuditLog[]>(() => getStoredLoginLogs());
  const [netPlans, setNetPlans] = useState<NetPlan[]>(() => getStoredNetPlans());
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => getStoredSupportTickets());

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>('customers');

  // Modals
  const [activeReceiptForModal, setActiveReceiptForModal] = useState<Receipt | null>(null);
  const [activeBillForPrint, setActiveBillForPrint] = useState<{ bill: Bill; customer: Customer } | null>(null);
  const [activeEmailLogForModal, setActiveEmailLogForModal] = useState<EmailReminderLog | null>(null);

  // Global Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSyncingDatabase, setIsSyncingDatabase] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleSyncDatabase = async () => {
    setIsSyncingDatabase(true);
    try {
      const result = await syncDatabaseWithPublished();
      if (result.success) {
        showToast('System database records synchronized to published database successfully!');
      } else {
        showToast(result.message || 'Database synchronization completed.');
      }
    } catch (err: any) {
      showToast('Synchronization error: ' + (err?.message || 'Failed'));
    } finally {
      setIsSyncingDatabase(false);
    }
  };

  // Synchronize with published server database on startup and sanitize subscribers
  useEffect(() => {
    fetchPublishedDatabase().then((db) => {
      if (db) {
        if (db.customers) setCustomers(db.customers);
        if (db.bills) setBills(db.bills);
        if (db.receipts) setReceipts(db.receipts);
        if (db.netPlans) setNetPlans(db.netPlans);
        if (db.adminAccounts) setAdminAccounts(db.adminAccounts);
        if (db.companyProfile) setCompanyProfile(db.companyProfile);
        if ((db as any).supportTickets) setSupportTickets((db as any).supportTickets);
      } else {
        const reindexed = reindexSubscribersData();
        setCustomers(reindexed);
      }
    });
  }, []);

  // Sync to local storage
  useEffect(() => {
    saveCustomers(customers);
  }, [customers]);

  useEffect(() => {
    saveBills(bills);
  }, [bills]);

  useEffect(() => {
    saveReceipts(receipts);
  }, [receipts]);

  useEffect(() => {
    saveEmailLogs(emailLogs);
  }, [emailLogs]);

  useEffect(() => {
    saveAutoSettings(autoSettings);
  }, [autoSettings]);

  useEffect(() => {
    saveStoredUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    saveAdminAccounts(adminAccounts);
  }, [adminAccounts]);

  useEffect(() => {
    saveCompanyProfile(companyProfile);
  }, [companyProfile]);

  useEffect(() => {
    saveLoginLogs(loginLogs);
  }, [loginLogs]);

  useEffect(() => {
    saveNetPlans(netPlans);
  }, [netPlans]);

  useEffect(() => {
    saveSupportTickets(supportTickets);
  }, [supportTickets]);

  // Dedicated URL Route support (/clients and /admin)
  const getInitialPath = () => {
    if (typeof window === 'undefined') return '/';
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path.startsWith('/clients') || hash.includes('clients')) return '/clients';
    if (path.startsWith('/admin') || hash.includes('admin')) return '/admin';
    return '/';
  };

  const [routePath, setRoutePath] = useState<string>(getInitialPath);

  useEffect(() => {
    const handleLocationChange = () => {
      setRoutePath(getInitialPath());
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (newPath: string) => {
    setRoutePath(newPath);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', newPath);
    }
  };

  // Adjust active tab when switching user role
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      setActiveTab('customers');
    } else if (currentUser?.role === 'client') {
      setActiveTab('overview');
    }
  }, [currentUser?.role]);

  // Automatic Trigger check on mount / initial load for active clients
  useEffect(() => {
    if (autoSettings.enabled) {
      const result = triggerAutomatedRemindersForActiveClients(
        customers,
        bills,
        emailLogs,
        'automated_schedule'
      );
      if (result.dispatchedCount > 0) {
        setEmailLogs((prev) => [...result.newLogs, ...prev]);
      }
    }
  }, []);

  // Handlers for Customer Management
  const handleAddCustomer = (newCustomer: Customer) => {
    setCustomers((prev) => [newCustomer, ...prev]);

    // "If same status is set to active, the system should trigger these notifications automatically."
    if (newCustomer.status === 'active' && autoSettings.enabled) {
      const generatedReminderLogs = triggerReminderForActivatedCustomer(newCustomer, bills, emailLogs);
      if (generatedReminderLogs.length > 0) {
        setEmailLogs((prev) => [...generatedReminderLogs, ...prev]);
        showToast(
          `Customer added as ACTIVE. Automated billing reminder dispatched to ${newCustomer.email}!`
        );
      } else {
        showToast(`Customer ${newCustomer.firstname} ${newCustomer.lastname} registered successfully as ACTIVE.`);
      }
    } else {
      showToast(`Customer ${newCustomer.firstname} ${newCustomer.lastname} added successfully.`);
    }
  };

  const handleUpdateCustomer = (updatedCustomer: Customer, oldStatus?: CustomerStatus) => {
    let updatedOnce = false;
    setCustomers((prev) =>
      prev.map((c) => {
        // Strictly update only the first matching customer record
        if (!updatedOnce && c.id === updatedCustomer.id) {
          updatedOnce = true;
          return { ...updatedCustomer };
        }
        return c;
      })
    );

    // Keep associated bills synchronized with the subscriber's updated name and email
    setBills((prev) =>
      prev.map((b) =>
        b.customerId === updatedCustomer.id
          ? {
              ...b,
              customerName: `${updatedCustomer.firstname} ${updatedCustomer.lastname}`,
              customerEmail: updatedCustomer.email,
            }
          : b
      )
    );

    // Check if status was newly set to 'active'
    if (updatedCustomer.status === 'active' && autoSettings.enabled && autoSettings.notifyOnActiveChange) {
      const activatedLogs = triggerReminderForActivatedCustomer(updatedCustomer, bills, emailLogs);
      if (activatedLogs.length > 0) {
        setEmailLogs((prev) => [...activatedLogs, ...prev]);
        showToast(
          `Customer status set to ACTIVE! System automatically triggered ${activatedLogs.length} billing reminder(s) to ${updatedCustomer.email}.`
        );
      } else {
        showToast(`Customer details updated. Status is ACTIVE.`);
      }
    } else {
      showToast(`Customer details for ${updatedCustomer.firstname} ${updatedCustomer.lastname} updated.`);
    }
  };

  const handleDeleteCustomer = (customerId: string) => {
    let deletedOnce = false;
    setCustomers((prev) =>
      prev.filter((c) => {
        if (!deletedOnce && c.id === customerId) {
          deletedOnce = true;
          return false;
        }
        return true;
      })
    );
    showToast('Customer record removed.');
  };

  const handleDeleteAllCustomers = () => {
    deleteAllCustomersData();
    setCustomers([]);
    setBills([]);
    setReceipts([]);
    setEmailLogs([]);
    showToast('All clients and associated subscriber records deleted from the database.');
  };

  // Trigger manual reminder for a single customer
  const handleTriggerCustomerReminder = (customer: Customer) => {
    const logs = triggerReminderForActivatedCustomer(customer, bills, emailLogs);
    if (logs.length > 0) {
      setEmailLogs((prev) => [...logs, ...prev]);
      showToast(`Automated reminder email sent to ${customer.email}!`);
    } else {
      showToast(`${customer.firstname} has no unpaid bills at this time.`);
    }
  };

  // Handlers for Monthly Billing
  const handleAddBill = (billData: {
    customerId: string;
    period: string;
    amount_pay: number;
    due_date: string;
    notes?: string;
    items?: BillItem[];
  }) => {
    const customer = customers.find((c) => c.id === billData.customerId);
    if (!customer) return;

    const newBill: Bill = {
      id: `BILL-${Date.now()}`,
      billNo: `INV-${Date.now().toString().slice(-6)}`,
      customerId: customer.id,
      customerName: `${customer.firstname} ${customer.lastname}`,
      customerEmail: customer.email,
      period: billData.period,
      amount_pay: billData.amount_pay,
      due_date: billData.due_date,
      billingDate: new Date().toISOString().slice(0, 10),
      status: 'unpaid',
      createdAt: new Date().toISOString(),
      notes: billData.notes,
      items: billData.items,
    };

    setBills((prev) => [newBill, ...prev]);

    // "If same status is set to active, the system should trigger these notifications automatically."
    if (customer.status === 'active' && autoSettings.enabled && autoSettings.notifyOnNewBill) {
      const reminder = triggerReminderForNewBill(customer, newBill);
      if (reminder) {
        setEmailLogs((prev) => [reminder, ...prev]);
        showToast(
          `Monthly bill issued for ${customer.firstname}. Automated email reminder sent to ${customer.email}!`
        );
        return;
      }
    }

    showToast(`Monthly bill created for ${customer.firstname} ${customer.lastname}.`);
  };

  const handleUpdateBill = (updatedBill: Bill) => {
    setBills((prev) => prev.map((b) => (b.id === updatedBill.id ? updatedBill : b)));
    showToast(`Invoice ${updatedBill.billNo} updated successfully with new statement breakdown.`);
  };

  const handleDeleteBill = (billId: string) => {
    const billToDelete = bills.find((b) => b.id === billId);
    setBills((prev) => prev.filter((b) => b.id !== billId));
    showToast(`Invoice ${billToDelete ? billToDelete.billNo : ''} deleted successfully.`);
  };

  const handleBatchGenerateBills = (period: string, dueDate: string) => {
    const activeClients = customers.filter((c) => c.status === 'active');
    const newBills: Bill[] = [];
    const newReminders: EmailReminderLog[] = [];
    const now = new Date().toISOString();

    for (const client of activeClients) {
      const bill: Bill = {
        id: `BILL-BATCH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        billNo: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
        customerId: client.id,
        customerName: `${client.firstname} ${client.lastname}`,
        customerEmail: client.email,
        period: period,
        amount_pay: client.monthlyFee,
        due_date: dueDate,
        billingDate: now.slice(0, 10),
        status: 'unpaid',
        createdAt: now,
      };
      newBills.push(bill);

      // Trigger automatic email reminder
      if (autoSettings.enabled) {
        const reminder = triggerReminderForNewBill(client, bill);
        if (reminder) {
          newReminders.push(reminder);
        }
      }
    }

    setBills((prev) => [...newBills, ...prev]);
    if (newReminders.length > 0) {
      setEmailLogs((prev) => [...newReminders, ...prev]);
    }

    showToast(
      `Batch generated ${newBills.length} monthly statements! Automated email reminders dispatched to active clients.`
    );
  };

  // Handlers for Payment & Receipt Printing
  const handleRecordPayment = (paymentData: {
    billId: string;
    customerId: string;
    paymentMethod: PaymentMethod;
    referenceNo: string;
    issuedBy: string;
    date: string;
    dateIssued?: string;
    paymentDate?: string;
  }) => {
    const bill = bills.find((b) => b.id === paymentData.billId);
    const customer = customers.find((c) => c.id === paymentData.customerId);
    if (!bill || !customer) return;

    const receiptNo = `OR-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const effectiveDateIssued = paymentData.dateIssued || paymentData.date || new Date().toISOString().slice(0, 10);
    const effectivePaymentDate = paymentData.paymentDate || paymentData.date || new Date().toISOString().slice(0, 10);

    const newReceipt: Receipt = {
      receiptNo,
      date: effectivePaymentDate,
      dateIssued: effectiveDateIssued,
      paymentDate: effectivePaymentDate,
      billId: bill.id,
      billPeriod: bill.period,
      customerId: customer.id,
      client: `${customer.firstname} ${customer.lastname}`,
      clientAddress: customer.address,
      clientContact: customer.contactNumber,
      clientAccountNo: customer.accountNo,
      toPayTheSumOf: numberToWordsInPeso(bill.amount_pay),
      asPaymentForPeriod: `${customer.net_plan} - Billing Period: ${bill.period}`,
      amountInPeso: bill.amount_pay,
      paymentMethod: paymentData.paymentMethod,
      referenceNo: paymentData.referenceNo,
      issuedBy: paymentData.issuedBy,
      tinNo: companyProfile.tin,
      notes: bill.notes || '',
    };

    // Update bill
    setBills((prev) =>
      prev.map((b) =>
        b.id === bill.id
          ? {
              ...b,
              status: 'paid',
              paidAt: `${effectivePaymentDate}T12:00:00Z`,
              receiptId: receiptNo,
            }
          : b
      )
    );

    // Save receipt
    setReceipts((prev) => [newReceipt, ...prev]);

    // Open receipt modal for preview & printing immediately
    setActiveReceiptForModal(newReceipt);
    showToast(`Payment collected! Official Receipt ${receiptNo} issued.`);
  };

  const handleDeleteReceipt = (receiptNo: string) => {
    const target = receipts.find((r) => r.receiptNo === receiptNo);
    setReceipts((prev) => prev.filter((r) => r.receiptNo !== receiptNo));
    if (target?.billId) {
      setBills((prev) =>
        prev.map((b) =>
          b.id === target.billId
            ? { ...b, receiptId: undefined, status: 'unpaid' }
            : b
        )
      );
    }
    showToast(`Official Receipt ${receiptNo} record deleted.`);
  };

  // Admin Account & Profile Handlers
  const handleAddAdminAccount = (account: AdminAccount) => {
    setAdminAccounts((prev) => [account, ...prev]);
    showToast(`Staff account for ${account.firstname} ${account.lastname} (${account.position}) registered.`);
  };

  const handleUpdateAdminAccount = (account: AdminAccount) => {
    setAdminAccounts((prev) => prev.map((a) => (a.id === account.id ? account : a)));
    showToast(`Admin account ${account.email} updated.`);
  };

  const handleDeleteAdminAccount = (id: string) => {
    setAdminAccounts((prev) => prev.filter((a) => a.id !== id));
    showToast('Admin staff account removed.');
  };

  const handleUpdateCompanyProfile = (newProfile: CompanyProfile) => {
    setCompanyProfile(newProfile);
    showToast('Company profile & billing header updated.');
  };

  const handleClearLoginLogs = () => {
    setLoginLogs([]);
    showToast('Login audit logs cleared.');
  };

  // Net Plan Handlers
  const handleAddNetPlan = (newPlan: NetPlan) => {
    setNetPlans((prev) => [newPlan, ...prev]);
    showToast(`Net plan "${newPlan.name}" added at ${formatPeso(newPlan.monthlyRate)}/month.`);
  };

  const handleUpdateNetPlan = (updatedPlan: NetPlan) => {
    setNetPlans((prev) => prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)));
    showToast(`Net plan "${updatedPlan.name}" modified successfully.`);
  };

  const handleDeleteNetPlan = (planId: string) => {
    setNetPlans((prev) => prev.filter((p) => p.id !== planId));
    showToast('Net plan removed from catalog.');
  };

  // Trigger batch reminders manually from Reminder Center
  const handleTriggerBatchReminders = () => {
    const result = triggerAutomatedRemindersForActiveClients(
      customers,
      bills,
      emailLogs,
      'manual_admin'
    );
    if (result.dispatchedCount > 0) {
      setEmailLogs((prev) => [...result.newLogs, ...prev]);
      showToast(
        `Dispatched ${result.dispatchedCount} automated billing reminders to active subscriber mailboxes!`
      );
    } else {
      showToast('All active subscriber accounts are up to date. No new reminders needed.');
    }
  };

  // Support ticket actions
  const handleAddSupportTicket = (
    ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>
  ) => {
    const newTicket = createSupportTicket(ticketData);
    setSupportTickets((prev) => [newTicket, ...prev.filter((t) => t.id !== newTicket.id)]);
    showToast(`Repair report #${newTicket.id} submitted. Lineman/support notified.`);
  };

  const handleUpdateSupportTicket = (updatedTicket: SupportTicket) => {
    setSupportTickets((prev) =>
      prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
    );
    showToast(`Ticket #${updatedTicket.id} status updated to ${updatedTicket.status.toUpperCase()}.`);
  };

  const handleDeleteSupportTicket = (ticketId: string) => {
    setSupportTickets((prev) => prev.filter((t) => t.id !== ticketId));
    showToast('Support ticket removed.');
  };

  // Active client customer object (if logged in as client)
  const loggedInCustomer =
    currentUser?.role === 'client'
      ? customers.find((c) => c.id === currentUser.customerId) ||
        getStoredCustomers().find((c) => c.id === currentUser.customerId) ||
        customers[0]
      : null;

  // Unread/Notification count for client
  const clientNotificationCount = loggedInCustomer
    ? emailLogs.filter((l) => l.customerId === loggedInCustomer.id).length
    : 0;

  const handleLogout = () => {
    setCurrentUser(null);
    saveStoredUser(null);
  };

  if (!currentUser) {
    return (
      <LoginModal
        onLogin={(user) => {
          setCurrentUser(user);
          if (user.role === 'client') {
            navigateTo('/clients');
          } else {
            navigateTo('/admin');
          }
        }}
        customers={customers}
        routePath={routePath}
        onNavigate={navigateTo}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchUser={(user) => {
          setCurrentUser(user);
          if (user.role === 'client') {
            navigateTo('/clients');
          } else {
            navigateTo('/admin');
          }
        }}
        allCustomers={customers}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        unreadCount={clientNotificationCount}
        routePath={routePath}
        onNavigate={navigateTo}
      />

      {/* Global Notification Toast */}
      {toastMessage && (
        <div className="no-print fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-3 text-xs animate-in slide-in-from-bottom duration-200">
          <Bell className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="flex-1 leading-relaxed">{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentUser.role === 'admin' ? (
          <AdminDashboard
            customers={customers}
            bills={bills}
            receipts={receipts}
            emailLogs={emailLogs}
            settings={autoSettings}
            adminAccounts={adminAccounts}
            companyProfile={companyProfile}
            loginLogs={loginLogs}
            netPlans={netPlans}
            supportTickets={supportTickets}
            currentUser={currentUser}
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab)}
            onAddCustomer={handleAddCustomer}
            onUpdateCustomer={handleUpdateCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            onDeleteAllCustomers={handleDeleteAllCustomers}
            onTriggerCustomerReminder={handleTriggerCustomerReminder}
            onAddBill={handleAddBill}
            onUpdateBill={handleUpdateBill}
            onBatchGenerateBills={handleBatchGenerateBills}
            onRecordPayment={handleRecordPayment}
            onPrintReceipt={(r) => setActiveReceiptForModal(r)}
            onPrintBill={(b) => {
              const cust = customers.find((c) => c.id === b.customerId);
              if (cust) {
                setActiveBillForPrint({ bill: b, customer: cust });
              }
            }}
            onDeleteBill={handleDeleteBill}
            onDeleteReceipt={handleDeleteReceipt}
            onPreviewEmail={(log) => setActiveEmailLogForModal(log)}
            onUpdateSettings={(s) => {
              setAutoSettings(s);
              showToast('Automation settings updated.');
            }}
            onTriggerBatchReminders={handleTriggerBatchReminders}
            onAddAdminAccount={handleAddAdminAccount}
            onUpdateAdminAccount={handleUpdateAdminAccount}
            onDeleteAdminAccount={handleDeleteAdminAccount}
            onUpdateCompanyProfile={handleUpdateCompanyProfile}
            onClearLoginLogs={handleClearLoginLogs}
            onAddNetPlan={handleAddNetPlan}
            onUpdateNetPlan={handleUpdateNetPlan}
            onDeleteNetPlan={handleDeleteNetPlan}
            onUpdateTicket={handleUpdateSupportTicket}
            onDeleteTicket={handleDeleteSupportTicket}
            onRefreshAllData={(data) => {
              if (data?.customers) setCustomers(data.customers);
              if (data?.bills) setBills(data.bills);
              if (data?.receipts) setReceipts(data.receipts);
            }}
            showToast={showToast}
          />
        ) : loggedInCustomer ? (
          <ClientDashboard
            customer={loggedInCustomer}
            bills={bills}
            receipts={receipts}
            emailLogs={emailLogs}
            supportTickets={supportTickets}
            onPayBill={handleRecordPayment}
            onPrintReceipt={(r) => setActiveReceiptForModal(r)}
            onPrintBill={(b) => setActiveBillForPrint({ bill: b, customer: loggedInCustomer })}
            onPreviewEmail={(log) => setActiveEmailLogForModal(log)}
            onAddSupportTicket={handleAddSupportTicket}
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab)}
          />
        ) : (
          <div className="text-center py-12 text-slate-500">
            Client profile not found. Please re-login.
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Net-Home Broadband Networks</span>
            <span aria-hidden="true">·</span>
            <span>Online Billing &amp; Subscriber Portal</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Automated Billing Dispatcher: Active</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={handleSyncDatabase}
              disabled={isSyncingDatabase}
              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              title="Sync system database records to the published database"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncingDatabase ? 'animate-spin' : ''}`} />
              <span>{isSyncingDatabase ? 'Syncing...' : 'Sync Database'}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Official Receipt Printable Modal */}
      <ReceiptModal
        receipt={activeReceiptForModal}
        bill={
          activeReceiptForModal
            ? bills.find(
                (b) =>
                  b.id === activeReceiptForModal.billId ||
                  (b.receiptId && b.receiptId === activeReceiptForModal.receiptNo)
              ) || null
            : null
        }
        companyProfile={companyProfile}
        onClose={() => setActiveReceiptForModal(null)}
      />

      {/* Monthly Billing Statement (SOA) Printable Modal */}
      <BillPrintModal
        bill={activeBillForPrint?.bill || null}
        customer={activeBillForPrint?.customer || null}
        companyProfile={companyProfile}
        onClose={() => setActiveBillForPrint(null)}
      />

      {/* Automated Email Preview Modal */}
      <EmailPreviewModal
        log={activeEmailLogForModal}
        onClose={() => setActiveEmailLogForModal(null)}
      />
    </div>
  );
}
