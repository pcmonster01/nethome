export type UserRole = 'admin' | 'client';

export type CustomerStatus = 'active' | 'inactive';

export type BillStatus = 'unpaid' | 'paid' | 'overdue';

export type PaymentMethod =
  | "Collector's Pick-up"
  | 'GCash 09562262394 CR*****O D.'
  | 'GCash'
  | 'Cash'
  | 'Maya'
  | 'Bank Transfer'
  | 'Online Credit/Debit';

export interface Customer {
  id: string; // e.g., CUST-001
  accountNo: string; // e.g., AF-90214
  firstname: string;
  lastname: string;
  email: string;
  contactNumber: string;
  address: string;
  net_plan: string; // e.g., "Fiber Boost 50 Mbps"
  planSpeed: string; // e.g., "50 Mbps"
  monthlyFee: number; // e.g., 1299
  date_installed: string; // YYYY-MM-DD
  due_date: string; // e.g. "15th of the month" or "15"
  status: CustomerStatus; // 'active' or 'inactive'
  username?: string;
  password?: string;
  notes?: string;
}

export interface BillItem {
  id: string;
  serviceDescription: string;
  planSpeed: string;
  billingPeriod: string;
  amount: number;
}

export interface Bill {
  id: string; // e.g., BILL-2026-10-001
  billNo: string; // e.g., INV-89210
  customerId: string;
  customerName: string;
  customerEmail: string;
  period: string; // e.g. "October 2026" or "Oct 01 - Oct 31, 2026"
  amount_pay: number; // In Philippine Pesos (PHP)
  due_date: string; // YYYY-MM-DD
  billingDate: string; // YYYY-MM-DD
  status: BillStatus;
  createdAt: string;
  paidAt?: string;
  receiptId?: string;
  notes?: string;
  items?: BillItem[];
}

export interface Receipt {
  receiptNo: string; // e.g. OR-2026-10042
  date: string; // YYYY-MM-DD
  dateIssued?: string; // YYYY-MM-DD
  paymentDate?: string; // YYYY-MM-DD (Date Paid)
  billId: string;
  billPeriod: string;
  customerId: string;
  client: string; // Full name of client
  clientAddress: string;
  clientContact: string;
  clientAccountNo: string;
  toPayTheSumOf: string; // Amount in words (e.g., "ONE THOUSAND FIVE HUNDRED PESOS ONLY")
  asPaymentForPeriod: string; // e.g., "Internet Subscription for Period: Oct 01 - Oct 31, 2026"
  amountInPeso: number; // e.g., 1500.00
  paymentMethod: PaymentMethod;
  referenceNo: string;
  issuedBy: string; // Cashier / Admin Officer
  tinNo: string;
  notes?: string;
}

export type AdminPosition = 'Manager' | 'supervisor' | 'cashier' | 'agent' | 'lineman';

export interface AdminAccount {
  id: string;
  email: string; // admin email as user name
  password: string;
  firstname: string;
  lastname: string;
  dateRegistered: string; // YYYY-MM-DD
  position: AdminPosition;
}

export interface LoginAuditLog {
  id: string;
  userId: string;
  name: string;
  identifier: string; // email or username
  role: UserRole;
  position?: string;
  timestamp: string; // ISO string
  status: 'success' | 'failed';
  ipAddress?: string;
  deviceInfo?: string;
}

export interface CompanyProfile {
  companyName: string;
  tagline: string;
  address: string;
  tin: string;
  hotline: string;
  email: string;
}

export interface EmailReminderLog {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  billId: string;
  period: string;
  amount: number;
  dueDate: string;
  subject: string;
  messageBody: string;
  sentAt: string;
  triggerType: 'automated_active_status' | 'automated_schedule' | 'manual_admin' | 'new_bill_dispatch';
  deliveryStatus: 'delivered' | 'opened';
}

export interface AuthUser {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  customerId?: string; // If role is client
  position?: AdminPosition; // If role is admin
}

export interface NetPlan {
  id: string;
  name: string; // Plan name
  monthlyRate: number; // Monthly rate (PHP)
  speed?: string;
  description?: string;
  createdAt?: string;
}

export interface InternetPlanOption {
  id?: string;
  name: string;
  speed: string;
  price: number;
  description: string;
}

export type TicketStatus = 'pending' | 'in_progress' | 'resolved';

export type TicketCategory =
  | 'No Internet'
  | 'Other Issue'
  | 'Billing Issue'
  | 'No Internet Connection'
  | 'Slow Browsing / High Latency'
  | 'Red Light / LOS Blinking (Fiber Cut)'
  | 'Modem / Router Power or Hardware'
  | 'Billing / Payment Query'
  | 'Relocation Request'
  | 'General Repair / Other'
  | string;

export interface SupportTicket {
  id: string; // e.g., TKT-20261029-001
  customerId: string;
  accountNo: string;
  customerName: string;
  contactNumber: string;
  email: string;
  address?: string;
  category: TicketCategory;
  subject: string;
  message: string;
  status: TicketStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: string; // ISO string
  resolvedAt?: string;
  adminNotes?: string;
  assignedTo?: string; // Lineman / Tech staff
}

