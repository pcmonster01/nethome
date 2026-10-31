import { Customer, Bill } from '../types';

/**
 * Escapes values for CSV format (quotes fields containing commas, quotes, or newlines)
 */
function escapeCsvValue(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const stringVal = String(val);
  if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n') || stringVal.includes('\r')) {
    return `"${stringVal.replace(/"/g, '""')}"`;
  }
  return `"${stringVal}"`;
}

/**
 * Trigger client-side file download of CSV content
 */
function downloadCsvFile(csvContent: string, filename: string) {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports list of customers to CSV
 */
export function exportCustomersToCsv(customers: Customer[], filename?: string) {
  const headers = [
    'Account Number',
    'Last Name',
    'First Name',
    'Email Address',
    'Contact Number',
    'Installation Address',
    'Internet Plan',
    'Plan Speed',
    'Monthly Fee (PHP)',
    'Date Installed',
    'Monthly Due Date',
    'Account Status',
    'Customer Notes',
  ];

  const rows = customers.map((c) => [
    escapeCsvValue(c.accountNo),
    escapeCsvValue(c.lastname),
    escapeCsvValue(c.firstname),
    escapeCsvValue(c.email),
    escapeCsvValue(c.contactNumber),
    escapeCsvValue(c.address),
    escapeCsvValue(c.net_plan),
    escapeCsvValue(c.planSpeed),
    c.monthlyFee,
    escapeCsvValue(c.date_installed),
    escapeCsvValue(c.due_date),
    escapeCsvValue(c.status),
    escapeCsvValue(c.notes || ''),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  const finalFilename = filename || `nethome_subscribers_${dateStr}.csv`;
  downloadCsvFile(csvContent, finalFilename);
}

/**
 * Exports list of billing statements to CSV
 */
export function exportBillsToCsv(bills: Bill[], filename?: string) {
  const headers = [
    'Invoice No',
    'Customer ID',
    'Customer Name',
    'Customer Email',
    'Billing Period',
    'Amount to Pay (PHP)',
    'Payment Due Date',
    'Billing Date',
    'Status',
    'Paid Timestamp',
    'Official Receipt No',
    'Remarks / Notes',
  ];

  const rows = bills.map((b) => [
    escapeCsvValue(b.billNo),
    escapeCsvValue(b.customerId),
    escapeCsvValue(b.customerName),
    escapeCsvValue(b.customerEmail),
    escapeCsvValue(b.period),
    b.amount_pay,
    escapeCsvValue(b.due_date),
    escapeCsvValue(b.billingDate),
    escapeCsvValue(b.status),
    escapeCsvValue(b.paidAt || ''),
    escapeCsvValue(b.receiptId || ''),
    escapeCsvValue(b.notes || ''),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  const finalFilename = filename || `nethome_billing_statements_${dateStr}.csv`;
  downloadCsvFile(csvContent, finalFilename);
}
