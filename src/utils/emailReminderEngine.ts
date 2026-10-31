import { Customer, Bill, EmailReminderLog } from '../types';
import { formatPeso } from './numberToWords';

export interface AutomatedDispatchResult {
  dispatchedCount: number;
  newLogs: EmailReminderLog[];
  recipients: string[];
}

/**
 * Generate full HTML body for an automated ISP billing reminder email
 */
export function generateBillingEmailHtml(customer: Customer, bill: Bill): string {
  const isOverdue = bill.status === 'overdue';
  const bannerColor = isOverdue ? '#dc2626' : '#2563eb';
  const statusLabel = isOverdue ? 'URGENT OVERDUE NOTICE' : 'MONTHLY BILLING STATEMENT';

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; color: #1e293b;">
      <div style="background-color: ${bannerColor}; padding: 24px 32px; color: #ffffff;">
        <div style="font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">NET-HOME BROADBAND NETWORKS</div>
        <div style="font-size: 13px; opacity: 0.9; margin-top: 4px;">Statement of Account &amp; Billing Notification</div>
      </div>
      
      <div style="padding: 32px;">
        <div style="display: inline-block; padding: 4px 10px; background: ${isOverdue ? '#fef2f2' : '#eff6ff'}; color: ${bannerColor}; font-size: 12px; font-weight: 700; border-radius: 4px; margin-bottom: 16px;">
          ${statusLabel}
        </div>

        <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
          Dear <strong>${customer.firstname} ${customer.lastname}</strong>,
        </p>

        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px;">
          This is an automated notification from Net-Home Billing. Your monthly fiber internet service statement for billing period <strong>${bill.period}</strong> is ready. Please review the details below:
        </p>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Account Number:</td>
              <td style="padding: 6px 0; font-weight: 600; text-align: right; font-family: monospace;">${customer.accountNo}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Invoice Reference:</td>
              <td style="padding: 6px 0; font-weight: 600; text-align: right; font-family: monospace;">${bill.billNo}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Subscribed Plan:</td>
              <td style="padding: 6px 0; font-weight: 600; text-align: right;">${customer.net_plan}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Billing Period:</td>
              <td style="padding: 6px 0; text-align: right;">${bill.period}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Payment Due Date:</td>
              <td style="padding: 6px 0; font-weight: 700; color: ${bannerColor}; text-align: right;">${bill.due_date}</td>
            </tr>
            <tr style="border-top: 1px solid #cbd5e1;">
              <td style="padding: 12px 0 0; font-size: 15px; font-weight: 700; color: #0f172a;">Total Amount Due:</td>
              <td style="padding: 12px 0 0; font-size: 18px; font-weight: 700; color: #0f172a; text-align: right; font-family: monospace;">${formatPeso(bill.amount_pay)}</td>
            </tr>
          </table>
        </div>

        <div style="background: #f1f5f9; border-radius: 6px; padding: 16px; margin-bottom: 24px; font-size: 13px; line-height: 1.5;">
          <strong>Accepted Payment Channels:</strong>
          <ul style="margin: 8px 0 0; padding-left: 20px; color: #475569;">
            <li><strong>Collector&apos;s Pick-up:</strong> Authorized field billing collector doorstep collection</li>
            <li><strong>GCash:</strong> 09562262394 (Account Name: <strong>CR*****O D.</strong>) · Account No: <code>${customer.accountNo}</code></li>
          </ul>
        </div>

        <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 0; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          This is an automated system generated message. If payment has already been made, please disregard this notice. For inquiries, contact billing@nethome.ph or hotline (02) 8888-HOME.
        </p>
      </div>
    </div>
  `;
}

/**
 * Trigger automated email billing reminders for all active client accounts
 * Note: If client's status is set to active, the system automatically triggers these notifications.
 */
export function triggerAutomatedRemindersForActiveClients(
  customers: Customer[],
  bills: Bill[],
  existingLogs: EmailReminderLog[],
  triggerType: 'automated_active_status' | 'automated_schedule' | 'manual_admin' = 'automated_active_status'
): AutomatedDispatchResult {
  // Only target ACTIVE client accounts
  const activeCustomers = customers.filter((c) => c.status === 'active');
  const now = new Date().toISOString();
  const newLogs: EmailReminderLog[] = [];
  const recipients: string[] = [];

  for (const customer of activeCustomers) {
    // Find all unpaid or overdue bills for this client
    const unpaidBills = bills.filter(
      (b) => b.customerId === customer.id && (b.status === 'unpaid' || b.status === 'overdue')
    );

    for (const bill of unpaidBills) {
      // Check if a reminder for this bill was already dispatched recently (e.g. today) to avoid spamming
      const todayDateStr = now.slice(0, 10);
      const alreadySentToday = existingLogs.some(
        (log) => log.billId === bill.id && log.sentAt.slice(0, 10) === todayDateStr
      );

      // If manual trigger or not sent today, dispatch!
      if (!alreadySentToday || triggerType === 'manual_admin') {
        const isOverdue = bill.status === 'overdue';
        const subject = isOverdue
          ? `[OVERDUE NOTICE] Net-Home Billing Statement - ${bill.period} (Acct: ${customer.accountNo})`
          : `Net-Home Monthly Billing Statement: ${bill.period} (Due: ${bill.due_date})`;

        const messageBody = `Dear ${customer.firstname} ${customer.lastname}, your monthly bill of ${formatPeso(
          bill.amount_pay
        )} for ${bill.period} is due on ${bill.due_date}. Subscribed Plan: ${customer.net_plan}. Status: ${
          isOverdue ? 'OVERDUE' : 'PENDING'
        }.`;

        const logEntry: EmailReminderLog = {
          id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          customerId: customer.id,
          customerName: `${customer.firstname} ${customer.lastname}`,
          customerEmail: customer.email,
          billId: bill.id,
          period: bill.period,
          amount: bill.amount_pay,
          dueDate: bill.due_date,
          subject,
          messageBody,
          sentAt: now,
          triggerType,
          deliveryStatus: 'delivered',
        };

        newLogs.push(logEntry);
        if (!recipients.includes(customer.email)) {
          recipients.push(customer.email);
        }
      }
    }
  }

  return {
    dispatchedCount: newLogs.length,
    newLogs,
    recipients,
  };
}

/**
 * Specifically checks and triggers reminders when a customer's status is set to 'active'
 */
export function triggerReminderForActivatedCustomer(
  customer: Customer,
  bills: Bill[],
  existingLogs: EmailReminderLog[]
): EmailReminderLog[] {
  if (customer.status !== 'active') return [];

  const unpaidBills = bills.filter(
    (b) => b.customerId === customer.id && (b.status === 'unpaid' || b.status === 'overdue')
  );

  const newLogs: EmailReminderLog[] = [];
  const now = new Date().toISOString();

  for (const bill of unpaidBills) {
    const isOverdue = bill.status === 'overdue';
    const subject = isOverdue
      ? `[URGENT] Account Active Notice & Overdue Bill: ${bill.period} (Acct: ${customer.accountNo})`
      : `Account Activated: Net-Home Statement for ${bill.period} (Due: ${bill.due_date})`;

    const messageBody = `Hello ${customer.firstname} ${customer.lastname}, your account (${customer.accountNo}) is ACTIVE. You have a current bill of ${formatPeso(
      bill.amount_pay
    )} due on ${bill.due_date} for ${bill.period}. Subscribed Plan: ${customer.net_plan}.`;

    newLogs.push({
      id: `LOG-ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      customerId: customer.id,
      customerName: `${customer.firstname} ${customer.lastname}`,
      customerEmail: customer.email,
      billId: bill.id,
      period: bill.period,
      amount: bill.amount_pay,
      dueDate: bill.due_date,
      subject,
      messageBody,
      sentAt: now,
      triggerType: 'automated_active_status',
      deliveryStatus: 'delivered',
    });
  }

  return newLogs;
}

/**
 * Automatically triggers reminder when a new bill is created for an active customer
 */
export function triggerReminderForNewBill(customer: Customer, bill: Bill): EmailReminderLog | null {
  if (customer.status !== 'active') return null;

  const now = new Date().toISOString();
  return {
    id: `LOG-NEW-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    customerId: customer.id,
    customerName: `${customer.firstname} ${customer.lastname}`,
    customerEmail: customer.email,
    billId: bill.id,
    period: bill.period,
    amount: bill.amount_pay,
    dueDate: bill.due_date,
    subject: `New Billing Statement Issued: ${bill.period} - Due ${bill.due_date}`,
    messageBody: `Dear ${customer.firstname} ${customer.lastname}, a new bill has been generated for your ${customer.net_plan}. Amount: ${formatPeso(
      bill.amount_pay
    )}, Due Date: ${bill.due_date}.`,
    sentAt: now,
    triggerType: 'new_bill_dispatch',
    deliveryStatus: 'delivered',
  };
}
