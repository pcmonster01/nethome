import {
  Customer,
  CustomerStatus,
  Bill,
  Receipt,
  EmailReminderLog,
  AuthUser,
  InternetPlanOption,
  NetPlan,
  AdminAccount,
  LoginAuditLog,
  CompanyProfile,
  SupportTicket,
} from '../types';
import { numberToWordsInPeso } from './numberToWords';

export const INITIAL_NET_PLANS: NetPlan[] = [
  {
    id: 'PLAN-001',
    name: 'Fiber Starter 35 Mbps',
    monthlyRate: 999,
    speed: '35 Mbps',
    description: 'Reliable fiber connection for basic browsing and video streaming.',
  },
  {
    id: 'PLAN-002',
    name: 'Fiber Boost 50 Mbps',
    monthlyRate: 1299,
    speed: '50 Mbps',
    description: 'Perfect for work-from-home and multiple smart devices.',
  },
  {
    id: 'PLAN-003',
    name: 'Fiber Pro 100 Mbps',
    monthlyRate: 1500,
    speed: '100 Mbps',
    description: 'Ultra-fast low-latency fiber for 4K streaming and online gaming.',
  },
  {
    id: 'PLAN-004',
    name: 'Fiber Ultra 200 Mbps',
    monthlyRate: 2099,
    speed: '200 Mbps',
    description: 'Heavy family usage with unlimited simultaneous devices.',
  },
  {
    id: 'PLAN-005',
    name: 'Fiber Enterprise 400 Mbps',
    monthlyRate: 2899,
    speed: '400 Mbps',
    description: 'High-speed business grade bandwidth with priority routing.',
  },
];

export const INTERNET_PLANS: InternetPlanOption[] = INITIAL_NET_PLANS.map((p) => ({
  id: p.id,
  name: p.name,
  price: p.monthlyRate,
  speed: p.speed || '',
  description: p.description || '',
}));


const INITIAL_CUSTOMERS: Customer[] = [];
const INITIAL_BILLS: Bill[] = [];
const INITIAL_RECEIPTS: Receipt[] = [];
const INITIAL_EMAIL_LOGS: EmailReminderLog[] = [];

export const INITIAL_ADMIN_ACCOUNTS: AdminAccount[] = [
  {
    id: 'ADMIN-001',
    email: 'manager@nethome.ph',
    password: 'manager123',
    firstname: 'Roberto',
    lastname: 'Mendoza',
    dateRegistered: '2025-01-15',
    position: 'Manager',
  },
  {
    id: 'ADMIN-002',
    email: 'cashier@nethome.ph',
    password: 'cashier123',
    firstname: 'Ana',
    lastname: 'Ramirez',
    dateRegistered: '2025-02-01',
    position: 'cashier',
  },
  {
    id: 'ADMIN-003',
    email: 'supervisor@nethome.ph',
    password: 'super123',
    firstname: 'Carlos',
    lastname: 'Gomez',
    dateRegistered: '2025-02-15',
    position: 'supervisor',
  },
  {
    id: 'ADMIN-004',
    email: 'agent@nethome.ph',
    password: 'agent123',
    firstname: 'Liza',
    lastname: 'Dizon',
    dateRegistered: '2025-03-01',
    position: 'agent',
  },
  {
    id: 'ADMIN-005',
    email: 'lineman@nethome.ph',
    password: 'line123',
    firstname: 'Mark',
    lastname: 'Bautista',
    dateRegistered: '2025-03-10',
    position: 'lineman',
  },
];

export const INITIAL_COMPANY_PROFILE: CompanyProfile = {
  companyName: 'Net-Home Broadband Networks Corp.',
  tagline: 'High-Speed Fiber Broadband Networks',
  address: 'Unit 804, Cybergate Center, Pioneer St., Mandaluyong City, Metro Manila',
  tin: '009-482-192-000-VAT',
  hotline: '(02) 8888-HOME / +63 917 842 9912',
  email: 'billing@nethome.ph',
};

export const INITIAL_LOGIN_LOGS: LoginAuditLog[] = [
  {
    id: 'LOGIN-001',
    userId: 'ADMIN-001',
    name: 'Roberto Mendoza',
    identifier: 'manager@nethome.ph',
    role: 'admin',
    position: 'Manager',
    timestamp: '2026-10-19T08:30:15Z',
    status: 'success',
    deviceInfo: 'Desktop (Chrome / Windows)',
  },
  {
    id: 'LOGIN-002',
    userId: 'CUST-001',
    name: 'Juan Dela Cruz',
    identifier: 'juan.delacruz',
    role: 'client',
    timestamp: '2026-10-19T10:14:22Z',
    status: 'success',
    deviceInfo: 'Mobile (Safari / iOS)',
  },
  {
    id: 'LOGIN-003',
    userId: 'ADMIN-002',
    name: 'Ana Ramirez',
    identifier: 'cashier@nethome.ph',
    role: 'admin',
    position: 'cashier',
    timestamp: '2026-10-19T13:45:00Z',
    status: 'success',
    deviceInfo: 'POS Terminal (Chrome / Linux)',
  },
];

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'TKT-20261028-101',
    customerId: 'CUST-001',
    accountNo: 'AF-90214',
    customerName: 'Juan Dela Cruz',
    contactNumber: '+63 917 123 4567',
    email: 'juan.delacruz@gmail.com',
    address: 'Block 4 Lot 12, San Jose Village, Pasig City',
    category: 'No Internet',
    subject: 'Blinking Red LOS Light on Modem',
    message: 'Modem is showing a blinking red light on LOS since yesterday after thunderstorm. Total connection outage for the whole house.',
    status: 'pending',
    priority: 'urgent',
    createdAt: '2026-10-30T09:30:00Z',
  },
  {
    id: 'TKT-20261029-102',
    customerId: 'CUST-002',
    accountNo: 'AF-90215',
    customerName: 'Maria Santos',
    contactNumber: '+63 918 234 5678',
    email: 'maria.santos@gmail.com',
    address: 'Unit 12B, Emerald Towers, Ortigas Center, Pasig City',
    category: 'Other Issue',
    subject: 'High ping and intermittent drops',
    message: 'Experiencing slow download speed and ping spikes between 7:00 PM and 10:00 PM when doing video conference calls.',
    status: 'in_progress',
    priority: 'urgent',
    createdAt: '2026-10-29T10:15:00Z',
    assignedTo: 'Mark Bautista (lineman)',
    adminNotes: 'Field lineman dispatched to inspect distribution drop wire at NAP box.',
  },
];

const STORAGE_KEYS = {
  CUSTOMERS: 'nethome_customers_v1',
  BILLS: 'nethome_bills_v1',
  RECEIPTS: 'nethome_receipts_v1',
  EMAIL_LOGS: 'nethome_email_logs_v1',
  CURRENT_USER: 'nethome_current_user_v1',
  AUTO_REMINDER_SETTINGS: 'nethome_auto_reminder_settings_v1',
  ADMIN_ACCOUNTS: 'nethome_admin_accounts_v1',
  COMPANY_PROFILE: 'nethome_company_profile_v1',
  LOGIN_LOGS: 'nethome_login_logs_v1',
  NET_PLANS: 'nethome_net_plans_v1',
  SUPPORT_TICKETS: 'nethome_support_tickets_v1',
};

export interface AutoReminderSettings {
  enabled: boolean;
  frequency: 'daily' | 'hourly';
  notifyOnActiveChange: boolean;
  notifyOnNewBill: boolean;
  daysBeforeDue: number;
}

const DEFAULT_SETTINGS: AutoReminderSettings = {
  enabled: true,
  frequency: 'daily',
  notifyOnActiveChange: true,
  notifyOnNewBill: true,
  daysBeforeDue: 5,
};

export function deleteAllCustomersData(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.EMAIL_LOGS, JSON.stringify([]));
    localStorage.removeItem('netlink_customers_v1');
    localStorage.removeItem('netlink_bills_v1');
    localStorage.removeItem('netlink_receipts_v1');
    localStorage.removeItem('netlink_email_logs_v1');
    if (typeof window !== 'undefined') {
      fetch('/api/customers/delete-all', { method: 'POST' }).catch(() => {});
    }
  } catch (err) {
    console.error('Error deleting all customer data:', err);
  }
}

// Reindex and sanitize subscriber data ensuring any existing accounts have valid credentials
export function reindexSubscribersData(): Customer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    let existingCustomers: Customer[] = [];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          existingCustomers = parsed;
        }
      } catch (err) {
        console.warn('Failed to parse existing customers JSON during reindex', err);
      }
    }

    // If database has been purged or is empty, keep it empty
    if (existingCustomers.length === 0) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify([]));
      return [];
    }

    const customerMap = new Map<string, Customer>();
    let maxNumericId = 0;
    existingCustomers.forEach((c) => {
      const match = c?.id?.match(/^CUST-(\d+)$/i);
      if (match) {
        const val = parseInt(match[1], 10);
        if (val > maxNumericId) maxNumericId = val;
      }
    });

    const seenIds = new Set<string>();
    const seenAccountNos = new Set<string>();

    existingCustomers.forEach((c) => {
      if (!c) return;

      let targetId = c.id;
      if (!targetId || seenIds.has(targetId)) {
        maxNumericId += 1;
        targetId = `CUST-${String(maxNumericId).padStart(3, '0')}`;
      }
      seenIds.add(targetId);

      const cleanFirstname = (c.firstname || 'Subscriber').trim();
      const cleanLastname = (c.lastname || 'User').trim();
      const defaultUsername = `${cleanFirstname.toLowerCase().replace(/\s+/g, '')}.${cleanLastname.toLowerCase().replace(/\s+/g, '')}`;

      const cleanUsername = (c.username && c.username.trim())
        ? c.username.trim().toLowerCase()
        : defaultUsername;

      const cleanPassword = (c.password && c.password.trim())
        ? c.password.trim()
        : 'password123';

      let cleanAccountNo = (c.accountNo && c.accountNo.trim())
        ? c.accountNo.trim()
        : `AF-${Math.floor(100000 + Math.random() * 900000)}`;

      if (seenAccountNos.has(cleanAccountNo)) {
        cleanAccountNo = `AF-${Math.floor(100000 + Math.random() * 900000)}`;
      }
      seenAccountNos.add(cleanAccountNo);

      const cleanEmail = (c.email && c.email.trim())
        ? c.email.trim().toLowerCase()
        : `${cleanUsername}@gmail.com`;

      customerMap.set(targetId, {
        ...c,
        id: targetId,
        accountNo: cleanAccountNo,
        firstname: cleanFirstname,
        lastname: cleanLastname,
        username: cleanUsername,
        password: cleanPassword,
        email: cleanEmail,
        contactNumber: c.contactNumber?.trim() || '+63 917 000 0000',
        address: c.address?.trim() || 'Metro Manila',
        net_plan: c.net_plan || 'Fiber Boost 50 Mbps',
        planSpeed: c.planSpeed || '50 Mbps',
        monthlyFee: Number(c.monthlyFee || 1299),
        due_date: c.due_date || '25th of the month',
        status: (c.status === 'inactive' ? 'inactive' : 'active') as CustomerStatus,
        date_installed: c.date_installed || '2025-01-01',
      });
    });

    const reindexedList = Array.from(customerMap.values());
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(reindexedList));
    return reindexedList;
  } catch (err) {
    console.error('Error in reindexSubscribersData:', err);
    return [];
  }
}

// Storage helper functions
export function getStoredCustomers(): Customer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify([]));
      return [];
    }
    return reindexSubscribersData();
  } catch (err) {
    console.error('Error reading customers from storage', err);
    return [];
  }
}

export function saveCustomers(customers: Customer[]): void {
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  if (typeof window !== 'undefined') {
    fetch('/api/customers/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customers }),
    }).catch(() => {});
  }
}

export function getStoredBills(): Bill[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BILLS) || localStorage.getItem('netlink_bills_v1');
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(INITIAL_BILLS));
      return INITIAL_BILLS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading bills from storage', err);
    return INITIAL_BILLS;
  }
}

export function saveBills(bills: Bill[]): void {
  localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
  if (typeof window !== 'undefined') {
    fetch('/api/bills/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bills }),
    }).catch(() => {});
  }
}

export function getStoredReceipts(): Receipt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECEIPTS) || localStorage.getItem('netlink_receipts_v1');
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(INITIAL_RECEIPTS));
      return INITIAL_RECEIPTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading receipts from storage', err);
    return INITIAL_RECEIPTS;
  }
}

export function saveReceipts(receipts: Receipt[]): void {
  localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(receipts));
  if (typeof window !== 'undefined') {
    fetch('/api/receipts/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receipts }),
    }).catch(() => {});
  }
}

export function getStoredEmailLogs(): EmailReminderLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EMAIL_LOGS) || localStorage.getItem('netlink_email_logs_v1');
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EMAIL_LOGS, JSON.stringify(INITIAL_EMAIL_LOGS));
      return INITIAL_EMAIL_LOGS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading email logs from storage', err);
    return INITIAL_EMAIL_LOGS;
  }
}

export function saveEmailLogs(logs: EmailReminderLog[]): void {
  localStorage.setItem(STORAGE_KEYS.EMAIL_LOGS, JSON.stringify(logs));
}

export function getStoredAutoSettings(): AutoReminderSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTO_REMINDER_SETTINGS) || localStorage.getItem('netlink_auto_reminder_settings_v1');
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveAutoSettings(settings: AutoReminderSettings): void {
  localStorage.setItem(STORAGE_KEYS.AUTO_REMINDER_SETTINGS, JSON.stringify(settings));
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || localStorage.getItem('netlink_current_user_v1');
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading current user', err);
  }
  return null;
}

export function saveStoredUser(user: AuthUser | null): void {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem('netlink_current_user_v1');
  } else {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }
}

// Admin Accounts storage
export function getStoredAdminAccounts(): AdminAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_ACCOUNTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_ACCOUNTS, JSON.stringify(INITIAL_ADMIN_ACCOUNTS));
      return INITIAL_ADMIN_ACCOUNTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading admin accounts', err);
    return INITIAL_ADMIN_ACCOUNTS;
  }
}

export function saveAdminAccounts(accounts: AdminAccount[]): void {
  localStorage.setItem(STORAGE_KEYS.ADMIN_ACCOUNTS, JSON.stringify(accounts));
  if (typeof window !== 'undefined') {
    fetch('/api/admin-accounts/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminAccounts: accounts }),
    }).catch(() => {});
  }
}

// Company Profile storage
export function getStoredCompanyProfile(): CompanyProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPANY_PROFILE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.COMPANY_PROFILE, JSON.stringify(INITIAL_COMPANY_PROFILE));
      return INITIAL_COMPANY_PROFILE;
    }
    return { ...INITIAL_COMPANY_PROFILE, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Error reading company profile', err);
    return INITIAL_COMPANY_PROFILE;
  }
}

export function saveCompanyProfile(profile: CompanyProfile): void {
  localStorage.setItem(STORAGE_KEYS.COMPANY_PROFILE, JSON.stringify(profile));
  if (typeof window !== 'undefined') {
    fetch('/api/company-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    }).catch(() => {});
  }
}

// Login Audit Logs storage
export function getStoredLoginLogs(): LoginAuditLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGIN_LOGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LOGIN_LOGS, JSON.stringify(INITIAL_LOGIN_LOGS));
      return INITIAL_LOGIN_LOGS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading login logs', err);
    return INITIAL_LOGIN_LOGS;
  }
}

export function saveLoginLogs(logs: LoginAuditLog[]): void {
  localStorage.setItem(STORAGE_KEYS.LOGIN_LOGS, JSON.stringify(logs));
  if (typeof window !== 'undefined') {
    fetch('/api/login-logs/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginLogs: logs }),
    }).catch(() => {});
  }
}

export function clearLoginAuditLogs(): void {
  localStorage.setItem(STORAGE_KEYS.LOGIN_LOGS, JSON.stringify([]));
  if (typeof window !== 'undefined') {
    fetch('/api/login-logs/clear', {
      method: 'POST',
    }).catch(() => {});
  }
}

export function recordLoginAuditLog(entry: Omit<LoginAuditLog, 'id' | 'timestamp'>): LoginAuditLog {
  const newLog: LoginAuditLog = {
    ...entry,
    id: `LOGIN-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    timestamp: new Date().toISOString(),
  };

  const currentLogs = getStoredLoginLogs();
  const updatedLogs = [newLog, ...currentLogs];
  saveLoginLogs(updatedLogs);
  return newLog;
}

// Support Tickets Storage
export function getStoredSupportTickets(): SupportTicket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUPPORT_TICKETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SUPPORT_TICKETS, JSON.stringify(INITIAL_SUPPORT_TICKETS));
      return INITIAL_SUPPORT_TICKETS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading support tickets from storage', err);
    return INITIAL_SUPPORT_TICKETS;
  }
}

export function saveSupportTickets(tickets: SupportTicket[]): void {
  localStorage.setItem(STORAGE_KEYS.SUPPORT_TICKETS, JSON.stringify(tickets));
  if (typeof window !== 'undefined') {
    fetch('/api/support-tickets/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ supportTickets: tickets }),
    }).catch(() => {});
  }
}

export function createSupportTicket(
  ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>
): SupportTicket {
  const newTicket: SupportTicket = {
    ...ticketData,
    id: `TKT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const existing = getStoredSupportTickets();
  const updated = [newTicket, ...existing];
  saveSupportTickets(updated);

  if (typeof window !== 'undefined') {
    fetch('/api/support-tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTicket),
    }).catch(() => {});
  }

  return newTicket;
}

// Net Plans Storage
export function getStoredNetPlans(): NetPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NET_PLANS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.NET_PLANS, JSON.stringify(INITIAL_NET_PLANS));
      return INITIAL_NET_PLANS;
    }
    const parsed: any[] = JSON.parse(raw);
    return parsed.map((p, idx) => ({
      id: p.id || `PLAN-${String(idx + 1).padStart(3, '0')}`,
      name: p.name || 'Fiber Broadband Plan',
      monthlyRate: Number(p.monthlyRate ?? p.price ?? 999),
      speed: p.speed || (p.name ? (p.name.match(/\d+\s*Mbps/i)?.[0] || 'High Speed') : 'High Speed'),
      description: p.description || '',
      createdAt: p.createdAt || '2025-01-01',
    }));
  } catch (err) {
    console.error('Error reading net plans from storage', err);
    return INITIAL_NET_PLANS;
  }
}

export function saveNetPlans(plans: NetPlan[]): void {
  localStorage.setItem(STORAGE_KEYS.NET_PLANS, JSON.stringify(plans));
  if (typeof window !== 'undefined') {
    fetch('/api/net-plans/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ netPlans: plans }),
    }).catch(() => {});
  }
}

export interface DatabaseSyncResult {
  success: boolean;
  message: string;
  syncedAt: string;
  counts: {
    customers: number;
    bills: number;
    receipts: number;
    adminAccounts: number;
    netPlans: number;
    supportTickets?: number;
  };
}

// Synchronize all system database records directly to the published database
export async function syncDatabaseWithPublished(): Promise<DatabaseSyncResult> {
  try {
    const payload = {
      customers: getStoredCustomers(),
      bills: getStoredBills(),
      receipts: getStoredReceipts(),
      emailLogs: getStoredEmailLogs(),
      loginLogs: getStoredLoginLogs(),
      supportTickets: getStoredSupportTickets(),
      adminAccounts: getStoredAdminAccounts(),
      netPlans: getStoredNetPlans(),
      companyProfile: getStoredCompanyProfile(),
      autoReminderSettings: getStoredAutoSettings(),
    };

    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      success: true,
      message: data.message || 'System database records successfully synchronized to the published database.',
      syncedAt: data.syncedAt || new Date().toISOString(),
      counts: data.counts || {
        customers: payload.customers.length,
        bills: payload.bills.length,
        receipts: payload.receipts.length,
        adminAccounts: payload.adminAccounts.length,
        netPlans: payload.netPlans.length,
        supportTickets: payload.supportTickets.length,
      },
    };
  } catch (err: any) {
    console.error('Error syncing database records with published database:', err);
    return {
      success: false,
      message: err.message || 'Failed to sync with published database.',
      syncedAt: new Date().toISOString(),
      counts: {
        customers: getStoredCustomers().length,
        bills: getStoredBills().length,
        receipts: getStoredReceipts().length,
        adminAccounts: getStoredAdminAccounts().length,
        netPlans: getStoredNetPlans().length,
      },
    };
  }
}

// Fetch published database and hydrate local storage
export async function fetchPublishedDatabase(): Promise<{
  customers?: Customer[];
  bills?: Bill[];
  receipts?: Receipt[];
  netPlans?: NetPlan[];
  adminAccounts?: AdminAccount[];
  companyProfile?: CompanyProfile;
  supportTickets?: SupportTicket[];
} | null> {
  try {
    const res = await fetch('/api/db');
    if (!res.ok) return null;
    const { db } = await res.json();
    if (!db) return null;

    const localCustomers = getStoredCustomers();

    // If server has customers, hydrate local
    if (Array.isArray(db.customers) && db.customers.length > 0) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(db.customers));
    } else if (localCustomers.length > 0 && (!db.customers || db.customers.length === 0)) {
      // If local has records, sync to published server right away!
      await syncDatabaseWithPublished();
      return {
        customers: localCustomers,
        bills: getStoredBills(),
        receipts: getStoredReceipts(),
        netPlans: getStoredNetPlans(),
        adminAccounts: getStoredAdminAccounts(),
        companyProfile: getStoredCompanyProfile(),
      };
    }

    if (Array.isArray(db.bills)) localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(db.bills));
    if (Array.isArray(db.receipts)) localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(db.receipts));
    if (Array.isArray(db.emailLogs)) localStorage.setItem(STORAGE_KEYS.EMAIL_LOGS, JSON.stringify(db.emailLogs));
    if (Array.isArray(db.loginLogs)) localStorage.setItem(STORAGE_KEYS.LOGIN_LOGS, JSON.stringify(db.loginLogs));
    if (Array.isArray(db.supportTickets)) localStorage.setItem(STORAGE_KEYS.SUPPORT_TICKETS, JSON.stringify(db.supportTickets));
    if (Array.isArray(db.adminAccounts) && db.adminAccounts.length > 0) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_ACCOUNTS, JSON.stringify(db.adminAccounts));
    }
    if (Array.isArray(db.netPlans) && db.netPlans.length > 0) {
      localStorage.setItem(STORAGE_KEYS.NET_PLANS, JSON.stringify(db.netPlans));
    }
    if (db.companyProfile) localStorage.setItem(STORAGE_KEYS.COMPANY_PROFILE, JSON.stringify(db.companyProfile));
    if (db.autoReminderSettings) localStorage.setItem(STORAGE_KEYS.AUTO_REMINDER_SETTINGS, JSON.stringify(db.autoReminderSettings));

    return {
      customers: Array.isArray(db.customers) ? db.customers : localCustomers,
      bills: Array.isArray(db.bills) ? db.bills : getStoredBills(),
      receipts: Array.isArray(db.receipts) ? db.receipts : getStoredReceipts(),
      netPlans: Array.isArray(db.netPlans) && db.netPlans.length > 0 ? db.netPlans : getStoredNetPlans(),
      adminAccounts: Array.isArray(db.adminAccounts) && db.adminAccounts.length > 0 ? db.adminAccounts : getStoredAdminAccounts(),
      companyProfile: db.companyProfile || getStoredCompanyProfile(),
      supportTickets: Array.isArray(db.supportTickets) ? db.supportTickets : getStoredSupportTickets(),
    };
  } catch (err) {
    console.warn('Could not fetch published database from server', err);
    return null;
  }
}

// Reset data to defaults
export function resetToDefaults(): void {
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
  localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(INITIAL_BILLS));
  localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(INITIAL_RECEIPTS));
  localStorage.setItem(STORAGE_KEYS.EMAIL_LOGS, JSON.stringify(INITIAL_EMAIL_LOGS));
  localStorage.setItem(STORAGE_KEYS.AUTO_REMINDER_SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  localStorage.setItem(STORAGE_KEYS.ADMIN_ACCOUNTS, JSON.stringify(INITIAL_ADMIN_ACCOUNTS));
  localStorage.setItem(STORAGE_KEYS.COMPANY_PROFILE, JSON.stringify(INITIAL_COMPANY_PROFILE));
  localStorage.setItem(STORAGE_KEYS.LOGIN_LOGS, JSON.stringify(INITIAL_LOGIN_LOGS));
  localStorage.setItem(STORAGE_KEYS.NET_PLANS, JSON.stringify(INITIAL_NET_PLANS));
  if (typeof window !== 'undefined') {
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customers: INITIAL_CUSTOMERS,
        bills: INITIAL_BILLS,
        receipts: INITIAL_RECEIPTS,
        emailLogs: INITIAL_EMAIL_LOGS,
        autoReminderSettings: DEFAULT_SETTINGS,
        adminAccounts: INITIAL_ADMIN_ACCOUNTS,
        companyProfile: INITIAL_COMPANY_PROFILE,
        loginLogs: INITIAL_LOGIN_LOGS,
        netPlans: INITIAL_NET_PLANS,
      }),
    }).catch(() => {});
  }
}
