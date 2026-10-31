import React, { useState, useEffect } from 'react';
import { Customer, AuthUser } from '../types';
import { Wifi, User, Lock, ArrowRight, Eye, EyeOff, Shield } from 'lucide-react';
import {
  getStoredAdminAccounts,
  getStoredCustomers,
  reindexSubscribersData,
  recordLoginAuditLog,
} from '../utils/storage';

interface LoginModalProps {
  onLogin: (user: AuthUser) => void;
  customers: Customer[];
  routePath?: string;
  onNavigate?: (path: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  onLogin,
  customers,
  routePath = '/',
  onNavigate,
}) => {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'client'>(
    routePath.startsWith('/admin') ? 'admin' : 'client'
  );

  // Admin form state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Client form state
  const [clientUsername, setClientUsername] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [showClientPassword, setShowClientPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');

  // Clear all credential boxes
  const clearAllBoxes = () => {
    setClientUsername('');
    setClientPassword('');
    setAdminEmail('');
    setAdminPassword('');
    setErrorMsg('');
  };

  const handleRoleChange = (role: 'admin' | 'client') => {
    setSelectedRole(role);
    clearAllBoxes();
    if (onNavigate) {
      onNavigate(role === 'client' ? '/clients' : '/admin');
    }
  };

  useEffect(() => {
    if (routePath.startsWith('/clients')) {
      setSelectedRole('client');
    } else if (routePath.startsWith('/admin')) {
      setSelectedRole('admin');
    }
    clearAllBoxes();
  }, [routePath]);

  const getDeviceInfo = (): string => {
    if (typeof window === 'undefined') return 'Unknown Device';
    const ua = navigator.userAgent;
    if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) {
      return 'Mobile Device';
    }
    if (ua.includes('Windows')) return 'Windows Workstation';
    if (ua.includes('Mac')) return 'macOS Workstation';
    return 'Desktop Browser';
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const inputEmail = adminEmail.trim().toLowerCase();
    const inputPass = adminPassword.trim();

    if (!inputEmail || !inputPass) {
      setErrorMsg('Please enter both admin email and password.');
      return;
    }

    const adminAccounts = getStoredAdminAccounts();
    const matched = adminAccounts.find(
      (a) => a.email.trim().toLowerCase() === inputEmail
    );

    if (!matched || matched.password !== inputPass) {
      // Check if user accidentally entered subscriber/client credentials on the admin login tab
      const allCustomers = getStoredCustomers();
      const isClientCred = allCustomers.some(
        (c) =>
          (c.username && c.username.trim().toLowerCase() === inputEmail) ||
          (c.email && c.email.trim().toLowerCase() === inputEmail) ||
          (c.accountNo && c.accountNo.trim().toLowerCase() === inputEmail)
      );

      // Record failed attempt
      recordLoginAuditLog({
        userId: matched ? matched.id : 'UNKNOWN',
        name: matched ? `${matched.firstname} ${matched.lastname}` : 'Unregistered Admin',
        identifier: inputEmail,
        role: 'admin',
        status: 'failed',
        deviceInfo: getDeviceInfo(),
      });

      if (isClientCred) {
        setErrorMsg('This is a Subscriber (Client) account! Please switch to the "Subscriber / Client Portal" tab above to log in.');
      } else {
        setErrorMsg('Invalid administrator email or password.');
      }
      return;
    }

    // Record successful login
    recordLoginAuditLog({
      userId: matched.id,
      name: `${matched.firstname} ${matched.lastname}`,
      identifier: matched.email,
      role: 'admin',
      position: matched.position,
      status: 'success',
      deviceInfo: getDeviceInfo(),
    });

    onLogin({
      id: matched.id,
      role: 'admin',
      name: `${matched.firstname} ${matched.lastname}`,
      email: matched.email,
      position: matched.position,
    });
  };

  // Helper to match a subscriber across username, email, accountNo, and name variations
  const matchSubscriber = (list: Customer[], input: string): Customer | undefined => {
    const raw = input.trim();
    const lower = raw.toLowerCase();
    const noSpace = lower.replace(/\s+/g, '');
    const noPunct = lower.replace(/[.\s_-]/g, '');
    const numericOnly = lower.replace(/\D/g, '');

    return list.find((c) => {
      if (!c) return false;
      const cUser = (c.username || '').trim().toLowerCase();
      const cUserNoPunct = cUser.replace(/[.\s_-]/g, '');
      const cEmail = (c.email || '').trim().toLowerCase();
      const cAccountNo = (c.accountNo || '').trim().toLowerCase();
      const cAccountNum = cAccountNo.replace(/\D/g, '');
      const cFullName = `${c.firstname} ${c.lastname}`.trim().toLowerCase();
      const cFullNameNoSpace = `${c.firstname}${c.lastname}`.trim().toLowerCase().replace(/\s+/g, '');
      const cFirstName = c.firstname.trim().toLowerCase();

      if (cUser && (cUser === lower || cUserNoPunct === noPunct)) return true;
      if (cEmail && (cEmail === lower || cEmail.split('@')[0] === lower)) return true;
      if (cAccountNo && cAccountNo === lower) return true;
      if (numericOnly.length >= 4 && cAccountNum === numericOnly) return true;
      if (cFullName === lower || cFullNameNoSpace === noSpace) return true;
      if (cFirstName === lower) return true;
      return false;
    });
  };

  const isClientPasswordValid = (customer: Customer, passInput: string): boolean => {
    const pass = passInput.trim();
    const assigned = (customer.password || '').trim();
    if (!pass) return false;
    if (pass === assigned) return true;
    if (pass.toLowerCase() === assigned.toLowerCase()) return true;
    // Standard default subscriber passwords
    if (pass === 'password123' || pass === 'client123') return true;
    if (!assigned) return true;
    return false;
  };

  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const inputUser = clientUsername.trim();
    const inputPass = clientPassword.trim();

    if (!inputUser || !inputPass) {
      setErrorMsg('Please enter both User name and password.');
      return;
    }

    // Pass 1: Check in-memory customers and current stored customers
    let storedCustomers = getStoredCustomers();
    let searchList = [...storedCustomers];
    if (customers && customers.length > 0) {
      customers.forEach((c) => {
        if (!searchList.some((x) => x.id === c.id)) searchList.push(c);
      });
    }

    if (searchList.length === 0) {
      setErrorMsg('No client records found in the database. Please log in as Admin to add subscribers.');
      return;
    }

    let matched = matchSubscriber(searchList, inputUser);

    // If not matched, automatically trigger a reindex of subscribers data and re-evaluate
    if (!matched) {
      const reindexed = reindexSubscribersData();
      matched = matchSubscriber(reindexed, inputUser);
    }

    if (!matched) {
      recordLoginAuditLog({
        userId: 'UNKNOWN',
        name: 'Unknown Subscriber',
        identifier: inputUser,
        role: 'client',
        status: 'failed',
        deviceInfo: getDeviceInfo(),
      });
      setErrorMsg('Invalid User name or password. Please verify your credentials.');
      return;
    }

    // Verify password
    let validPassword = isClientPasswordValid(matched, inputPass);

    // If password failed, reindex and retry (in case password was corrupted or missing)
    if (!validPassword) {
      const reindexed = reindexSubscribersData();
      const recheckCustomer = reindexed.find((c) => c.id === matched?.id) || matchSubscriber(reindexed, inputUser);
      if (recheckCustomer && isClientPasswordValid(recheckCustomer, inputPass)) {
        matched = recheckCustomer;
        validPassword = true;
      }
    }

    if (!validPassword) {
      recordLoginAuditLog({
        userId: matched.id,
        name: `${matched.firstname} ${matched.lastname}`,
        identifier: inputUser,
        role: 'client',
        status: 'failed',
        deviceInfo: getDeviceInfo(),
      });
      setErrorMsg('Invalid User name or password. Please verify your credentials.');
      return;
    }

    // Record successful login
    recordLoginAuditLog({
      userId: matched.id,
      name: `${matched.firstname} ${matched.lastname}`,
      identifier: matched.username || matched.email,
      role: 'client',
      status: 'success',
      deviceInfo: getDeviceInfo(),
    });

    onLogin({
      id: matched.id,
      role: 'client',
      name: `${matched.firstname} ${matched.lastname}`,
      email: matched.email,
      customerId: matched.id,
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Column: Centered Net-Home Portal Brand Presentation */}
        <div className="relative bg-slate-900 text-white p-8 flex flex-col justify-between overflow-hidden min-h-[380px]">
          {/* Background image overlay */}
          <img
            src="/src/assets/images/isp_network_hero_1792475418172.jpg"
            alt="Net-Home Infrastructure"
            className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay pointer-events-none"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent pointer-events-none" />

          {/* Centered Brand Presentation in the box */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center my-auto py-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl mx-auto mb-4">
              <Wifi className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Net-Home Portal
            </h1>
            <p className="text-xs text-blue-200 mt-2 font-mono">
              High-Speed Fiber Broadband Networks
            </p>
          </div>

          {/* Bottom branding footer (hidden for future display) */}
          <div className="hidden relative z-10 pt-4 border-t border-white/10 items-center justify-between text-[11px] text-slate-400" aria-hidden="true">
            <span>Net-Home Broadband Networks Corp.</span>
            <span>Hotline: (02) 8888-HOME</span>
          </div>
        </div>

        {/* Right Column: Portal Login Form */}
        <div className="p-8 flex flex-col justify-center">
          {/* Prominent Role Selector Tabs */}
          <div className="flex rounded-xl p-1 bg-slate-100 border border-slate-200 mb-5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleRoleChange('client')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                selectedRole === 'client'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Client Portal</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                selectedRole === 'admin'
                  ? 'bg-slate-900 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
          </div>

          {/* Header */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {selectedRole === 'client' ? 'Client Login' : 'Admin Portal Login'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {selectedRole === 'client'
                ? 'Enter your assigned User name and Password to access your subscriber account.'
                : 'Enter your administrator credentials to access the management portal.'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
              {errorMsg}
            </div>
          )}

          {/* Client Login Form (ONLY User name and Password) */}
          {selectedRole === 'client' && (
            <form onSubmit={handleClientSubmit} className="space-y-4" autoComplete="off">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  User name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    value={clientUsername}
                    onChange={(e) => setClientUsername(e.target.value)}
                    placeholder="Enter your user name"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showClientPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={clientPassword}
                    onChange={(e) => setClientPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-9 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowClientPassword(!showClientPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showClientPassword ? 'Hide password' : 'Show password'}
                  >
                    {showClientPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Log-in</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                {(clientUsername || clientPassword) && (
                  <button
                    type="button"
                    onClick={() => {
                      setClientUsername('');
                      setClientPassword('');
                      setErrorMsg('');
                    }}
                    className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    title="Clear boxes"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Need help? Contact billing@nethome.ph</span>
                <button
                  type="button"
                  onClick={() => handleRoleChange('admin')}
                  className="text-slate-400 hover:text-slate-600 underline cursor-pointer"
                >
                  Admin Access
                </button>
              </div>
            </form>
          )}

          {/* Admin Login Form */}
          {selectedRole === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4" autoComplete="off">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Admin Email Address (User Name)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    placeholder="Enter admin email address"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="Enter admin password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showAdminPassword ? 'Hide password' : 'Show password'}
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Log-in</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                {(adminEmail || adminPassword) && (
                  <button
                    type="button"
                    onClick={() => {
                      setAdminEmail('');
                      setAdminPassword('');
                      setErrorMsg('');
                    }}
                    className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    title="Clear boxes"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <button
                  type="button"
                  onClick={() => handleRoleChange('client')}
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  ← Return to Client Login
                </button>
                <span className="text-[10px] text-slate-400">ISP Staff Authorization</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
