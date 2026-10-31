import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Initial baseline system templates
const INITIAL_ADMIN_ACCOUNTS = [
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

const INITIAL_NET_PLANS = [
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

const INITIAL_COMPANY_PROFILE = {
  companyName: 'Net-Home Broadband Networks Corp.',
  tagline: 'High-Speed Fiber Broadband Networks',
  address: 'Unit 804, Cybergate Center, Pioneer St., Mandaluyong City, Metro Manila',
  tin: '009-482-192-000-VAT',
  hotline: '(02) 8888-HOME / +63 917 842 9912',
  email: 'billing@nethome.ph',
};

const DEFAULT_SETTINGS = {
  enabled: true,
  frequency: 'daily',
  notifyOnActiveChange: true,
  notifyOnNewBill: true,
  daysBeforeDue: 5,
};

function getEmptyDatabase() {
  return {
    customers: [],
    bills: [],
    receipts: [],
    emailLogs: [],
    loginLogs: [],
    supportTickets: [],
    adminAccounts: INITIAL_ADMIN_ACCOUNTS,
    netPlans: INITIAL_NET_PLANS,
    companyProfile: INITIAL_COMPANY_PROFILE,
    autoReminderSettings: DEFAULT_SETTINGS,
    lastSyncedAt: new Date().toISOString(),
  };
}

// Ensure database directory and file exist
function readDatabase(): any {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial = getEmptyDatabase();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return {
      customers: Array.isArray(parsed.customers) ? parsed.customers : [],
      bills: Array.isArray(parsed.bills) ? parsed.bills : [],
      receipts: Array.isArray(parsed.receipts) ? parsed.receipts : [],
      emailLogs: Array.isArray(parsed.emailLogs) ? parsed.emailLogs : [],
      loginLogs: Array.isArray(parsed.loginLogs) ? parsed.loginLogs : [],
      supportTickets: Array.isArray(parsed.supportTickets) ? parsed.supportTickets : [],
      adminAccounts: Array.isArray(parsed.adminAccounts) && parsed.adminAccounts.length > 0 ? parsed.adminAccounts : INITIAL_ADMIN_ACCOUNTS,
      netPlans: Array.isArray(parsed.netPlans) && parsed.netPlans.length > 0 ? parsed.netPlans : INITIAL_NET_PLANS,
      companyProfile: parsed.companyProfile || INITIAL_COMPANY_PROFILE,
      autoReminderSettings: parsed.autoReminderSettings || DEFAULT_SETTINGS,
      lastSyncedAt: parsed.lastSyncedAt || new Date().toISOString(),
    };
  } catch (err) {
    console.error('Error reading database file:', err);
    return getEmptyDatabase();
  }
}

function writeDatabase(db: any): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    db.lastSyncedAt = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

// Express Middleware
app.use(express.json({ limit: '20mb' }));

// Enable CORS and open public headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// API Routes for Database Records & System-to-Published Synchronization
app.get('/api/db', (_req, res) => {
  const db = readDatabase();
  res.json({ success: true, db });
});

// Full synchronization endpoint
app.post('/api/sync', (req, res) => {
  const incoming = req.body || {};
  const current = readDatabase();

  const merged = {
    customers: Array.isArray(incoming.customers) ? incoming.customers : current.customers,
    bills: Array.isArray(incoming.bills) ? incoming.bills : current.bills,
    receipts: Array.isArray(incoming.receipts) ? incoming.receipts : current.receipts,
    emailLogs: Array.isArray(incoming.emailLogs) ? incoming.emailLogs : current.emailLogs,
    loginLogs: Array.isArray(incoming.loginLogs) ? incoming.loginLogs : current.loginLogs,
    supportTickets: Array.isArray(incoming.supportTickets) ? incoming.supportTickets : current.supportTickets,
    adminAccounts: Array.isArray(incoming.adminAccounts) && incoming.adminAccounts.length > 0 ? incoming.adminAccounts : current.adminAccounts,
    netPlans: Array.isArray(incoming.netPlans) && incoming.netPlans.length > 0 ? incoming.netPlans : current.netPlans,
    companyProfile: incoming.companyProfile || current.companyProfile,
    autoReminderSettings: incoming.autoReminderSettings || current.autoReminderSettings,
    lastSyncedAt: new Date().toISOString(),
  };

  writeDatabase(merged);
  res.json({
    success: true,
    message: 'System database records successfully synchronized to the published database.',
    syncedAt: merged.lastSyncedAt,
    counts: {
      customers: merged.customers.length,
      bills: merged.bills.length,
      receipts: merged.receipts.length,
      adminAccounts: merged.adminAccounts.length,
      netPlans: merged.netPlans.length,
      supportTickets: merged.supportTickets.length,
      loginLogs: merged.loginLogs.length,
    },
    db: merged,
  });
});

// Customers API
app.get('/api/customers', (_req, res) => {
  const db = readDatabase();
  res.json({ success: true, customers: db.customers });
});

app.post('/api/customers', (req, res) => {
  const db = readDatabase();
  const customer = req.body;
  if (!customer || !customer.id) {
    return res.status(400).json({ error: 'Customer data must include id' });
  }
  const existingIdx = db.customers.findIndex((c: any) => c.id === customer.id);
  if (existingIdx >= 0) {
    db.customers[existingIdx] = customer;
  } else {
    db.customers.push(customer);
  }
  writeDatabase(db);
  res.json({ success: true, customers: db.customers });
});

app.post('/api/customers/bulk', (req, res) => {
  const db = readDatabase();
  const customers = req.body.customers;
  if (Array.isArray(customers)) {
    db.customers = customers;
    writeDatabase(db);
  }
  res.json({ success: true, customers: db.customers });
});

app.post('/api/customers/delete-all', (_req, res) => {
  const db = readDatabase();
  db.customers = [];
  db.bills = [];
  db.receipts = [];
  db.emailLogs = [];
  writeDatabase(db);
  res.json({ success: true, message: 'All client database records purged.' });
});

// Bills API
app.get('/api/bills', (_req, res) => {
  const db = readDatabase();
  res.json({ success: true, bills: db.bills });
});

app.post('/api/bills/bulk', (req, res) => {
  const db = readDatabase();
  if (Array.isArray(req.body.bills)) {
    db.bills = req.body.bills;
    writeDatabase(db);
  }
  res.json({ success: true, bills: db.bills });
});

// Receipts API
app.get('/api/receipts', (_req, res) => {
  const db = readDatabase();
  res.json({ success: true, receipts: db.receipts });
});

app.post('/api/receipts/bulk', (req, res) => {
  const db = readDatabase();
  if (Array.isArray(req.body.receipts)) {
    db.receipts = req.body.receipts;
    writeDatabase(db);
  }
  res.json({ success: true, receipts: db.receipts });
});

// Company Profile API
app.get('/api/company-profile', (_req, res) => {
  const db = readDatabase();
  res.json({ success: true, companyProfile: db.companyProfile });
});

app.post('/api/company-profile', (req, res) => {
  const db = readDatabase();
  if (req.body) {
    db.companyProfile = { ...db.companyProfile, ...req.body };
    writeDatabase(db);
  }
  res.json({ success: true, companyProfile: db.companyProfile });
});

// Net Plans API
app.get('/api/net-plans', (_req, res) => {
  const db = readDatabase();
  res.json({ success: true, netPlans: db.netPlans });
});

app.post('/api/net-plans/bulk', (req, res) => {
  const db = readDatabase();
  if (Array.isArray(req.body.netPlans)) {
    db.netPlans = req.body.netPlans;
    writeDatabase(db);
  }
  res.json({ success: true, netPlans: db.netPlans });
});

// Admin Accounts API
app.get('/api/admin-accounts', (_req, res) => {
  const db = readDatabase();
  res.json({ success: true, adminAccounts: db.adminAccounts });
});

app.post('/api/admin-accounts/bulk', (req, res) => {
  const db = readDatabase();
  if (Array.isArray(req.body.adminAccounts)) {
    db.adminAccounts = req.body.adminAccounts;
    writeDatabase(db);
  }
  res.json({ success: true, adminAccounts: db.adminAccounts });
});

// Support Tickets API
app.get('/api/support-tickets', (_req, res) => {
  const db = readDatabase();
  res.json({ success: true, supportTickets: db.supportTickets || [] });
});

app.post('/api/support-tickets', (req, res) => {
  const db = readDatabase();
  const ticket = req.body;
  if (!ticket || !ticket.id) {
    return res.status(400).json({ error: 'Ticket data must include id' });
  }
  if (!Array.isArray(db.supportTickets)) {
    db.supportTickets = [];
  }
  const existingIdx = db.supportTickets.findIndex((t: any) => t.id === ticket.id);
  if (existingIdx >= 0) {
    db.supportTickets[existingIdx] = ticket;
  } else {
    db.supportTickets.unshift(ticket);
  }
  writeDatabase(db);
  res.json({ success: true, supportTickets: db.supportTickets });
});

app.post('/api/support-tickets/bulk', (req, res) => {
  const db = readDatabase();
  if (Array.isArray(req.body.supportTickets)) {
    db.supportTickets = req.body.supportTickets;
    writeDatabase(db);
  }
  res.json({ success: true, supportTickets: db.supportTickets });
});

// Login Logs API
app.get('/api/login-logs', (_req, res) => {
  const db = readDatabase();
  res.json({ success: true, loginLogs: db.loginLogs || [] });
});

app.post('/api/login-logs/bulk', (req, res) => {
  const db = readDatabase();
  if (Array.isArray(req.body.loginLogs)) {
    db.loginLogs = req.body.loginLogs;
    writeDatabase(db);
  }
  res.json({ success: true, loginLogs: db.loginLogs });
});

app.post('/api/login-logs/clear', (_req, res) => {
  const db = readDatabase();
  db.loginLogs = [];
  writeDatabase(db);
  res.json({ success: true, message: 'All login logs cleared.' });
});

// Health check / sync status
app.get('/api/status', (_req, res) => {
  const db = readDatabase();
  res.json({
    status: 'online',
    lastSyncedAt: db.lastSyncedAt,
    counts: {
      customers: db.customers.length,
      bills: db.bills.length,
      receipts: db.receipts.length,
      adminAccounts: db.adminAccounts.length,
      netPlans: db.netPlans.length,
    },
  });
});

async function start() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Express + Vite] Server running on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
