import React from 'react';
import { AuthUser, Customer } from '../types';
import { Wifi, LogOut, Shield, User, Globe } from 'lucide-react';

interface NavbarProps {
  currentUser: AuthUser | null;
  onLogout: () => void;
  onSwitchUser?: (newUser: AuthUser) => void;
  allCustomers?: Customer[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadCount?: number;
  routePath?: string;
  onNavigate?: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  activeTab,
  onTabChange,
  unreadCount = 0,
  onNavigate,
}) => {
  const adminNavItems = [
    { id: 'customers', label: 'Subscribers' },
    { id: 'billing', label: 'Monthly Billing' },
    { id: 'receipts', label: 'Official Receipts' },
    { id: 'reminders', label: 'Reminders' },
    { id: 'repair_requests', label: 'Repair Request' },
    { id: 'admin_accounts', label: 'Staff Accounts' },
    { id: 'company_profile', label: 'Company Profile' },
    { id: 'login_logs', label: 'Login Logs' },
    { id: 'database_sync', label: 'Database Sync' },
  ];

  const clientNavItems = [
    { id: 'overview', label: 'My Plan & Balance' },
    { id: 'history', label: 'Billing Invoices' },
    { id: 'receipts', label: 'My Receipts' },
    { id: 'notifications', label: unreadCount > 0 ? `Notifications (${unreadCount})` : 'Notifications' },
  ];

  const navItems = currentUser?.role === 'admin' ? adminNavItems : clientNavItems;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Wifi className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              Net-Home Portal
            </span>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`relative py-1 transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'text-blue-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-[-16px] left-0 right-0 h-0.5 bg-blue-600" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action & Authenticated User Profile (Switch Role Dropdown Disabled) */}
          <div className="flex items-center gap-2.5 shrink-0">
            {currentUser?.role === 'admin' ? (
              <button
                type="button"
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('/clients');
                  } else {
                    window.history.pushState({}, '', '/clients');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                title="Go to Client Portal web address"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>Client Portal (/clients)</span>
              </button>
            ) : (
              <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Client Portal (/clients)</span>
              </div>
            )}

            {/* Authenticated User Profile Badge (Static display - test account role switcher disabled) */}
            <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-700 select-none shadow-2xs">
              {currentUser?.role === 'admin' ? (
                <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              ) : (
                <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              )}
              <span className="font-semibold text-slate-900 truncate max-w-[130px]">
                {currentUser?.name || 'Portal User'}
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200/80 text-slate-700">
                {currentUser?.position || (currentUser?.role === 'admin' ? 'Admin' : 'Client')}
              </span>
            </div>

            {/* Direct Sign Out Button */}
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500 hover:text-rose-600" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex items-center gap-4 overflow-x-auto py-2 border-t border-slate-100 text-xs">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`whitespace-nowrap px-2.5 py-1 rounded-md transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
