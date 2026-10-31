import React, { useState } from 'react';
import { AdminAccount, AdminPosition } from '../../types';
import {
  UserPlus,
  Shield,
  Key,
  Calendar,
  Search,
  Trash2,
  Edit2,
  X,
  CheckCircle,
  Eye,
  EyeOff,
  Sparkles,
  Users,
  Info,
  Download,
} from 'lucide-react';
import { exportToJson } from '../../utils/exportJson';

interface AdminAccountsManagementProps {
  adminAccounts: AdminAccount[];
  onAddAdminAccount: (account: AdminAccount) => void;
  onUpdateAdminAccount: (account: AdminAccount) => void;
  onDeleteAdminAccount: (id: string) => void;
  currentUserId?: string;
}

const POSITIONS: { value: AdminPosition; label: string; description: string }[] = [
  { value: 'Manager', label: 'Manager', description: 'Full access including company profile editing' },
  { value: 'supervisor', label: 'Supervisor', description: 'Supervisory oversight & billing management' },
  { value: 'cashier', label: 'Cashier', description: 'Payment processing & official receipt signatory' },
  { value: 'agent', label: 'Agent', description: 'Customer support and subscriber registry' },
  { value: 'lineman', label: 'Lineman', description: 'Field operations & fiber installations' },
];

export const AdminAccountsManagement: React.FC<AdminAccountsManagementProps> = ({
  adminAccounts,
  onAddAdminAccount,
  onUpdateAdminAccount,
  onDeleteAdminAccount,
  currentUserId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AdminAccount | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<AdminAccount | null>(null);
  const [deleteWarning, setDeleteWarning] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [dateRegistered, setDateRegistered] = useState(new Date().toISOString().slice(0, 10));
  const [position, setPosition] = useState<AdminPosition>('cashier');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const handleOpenAdd = () => {
    setEditingAccount(null);
    setEmail('');
    setPassword('admin' + Math.floor(100 + Math.random() * 900));
    setFirstname('');
    setLastname('');
    setDateRegistered(new Date().toISOString().slice(0, 10));
    setPosition('cashier');
    setShowPassword(false);
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEdit = (acc: AdminAccount) => {
    setEditingAccount(acc);
    setEmail(acc.email);
    setPassword(acc.password);
    setFirstname(acc.firstname);
    setLastname(acc.lastname);
    setDateRegistered(acc.dateRegistered);
    setPosition(acc.position);
    setShowPassword(false);
    setFormError('');
    setShowModal(true);
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#';
    let generated = '';
    for (let i = 0; i < 9; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password.trim() || !firstname.trim() || !lastname.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }

    // Check duplicate email
    const exists = adminAccounts.find(
      (a) => a.email.toLowerCase() === trimmedEmail && a.id !== editingAccount?.id
    );
    if (exists) {
      setFormError(`An admin account with email "${trimmedEmail}" already exists.`);
      return;
    }

    if (editingAccount) {
      onUpdateAdminAccount({
        ...editingAccount,
        email: trimmedEmail,
        password: password.trim(),
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        dateRegistered,
        position,
      });
    } else {
      const newAccount: AdminAccount = {
        id: `ADMIN-${Date.now().toString(36).toUpperCase()}`,
        email: trimmedEmail,
        password: password.trim(),
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        dateRegistered,
        position,
      };
      onAddAdminAccount(newAccount);
    }

    setShowModal(false);
  };

  const filteredAccounts = adminAccounts.filter((acc) => {
    const matchesSearch =
      acc.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.position.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPosition = positionFilter === 'all' || acc.position.toLowerCase() === positionFilter.toLowerCase();
    return matchesSearch && matchesPosition;
  });

  const getPositionBadge = (pos: AdminPosition) => {
    switch (pos) {
      case 'Manager':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'supervisor':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'cashier':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'agent':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'lineman':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Administrator Staff Accounts
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage admin users, assigned positions, and authentication credentials.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => exportToJson(`admin_accounts_${new Date().toISOString().slice(0, 10)}.json`, adminAccounts)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg transition-colors shadow-xs cursor-pointer"
            title={`Export ${adminAccounts.length} staff accounts to JSON`}
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Export JSON ({adminAccounts.length})</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Admin Account</span>
          </button>
        </div>
      </div>

      {/* Cashier Signatory Information Callout */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-3 text-xs text-blue-900">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-blue-950 block">Payment Verification &amp; Official Receipt Signatory:</span>
          <p className="text-blue-800 leading-relaxed text-[11px]">
            Staff registered with the <strong>Cashier</strong> position will automatically appear as the official payment verification authority on all client Official Receipts.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-slate-500 font-semibold text-xs whitespace-nowrap">
            Position:
          </label>
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">All Positions ({adminAccounts.length})</option>
            <option value="Manager">Manager</option>
            <option value="supervisor">Supervisor</option>
            <option value="cashier">Cashier</option>
            <option value="agent">Agent</option>
            <option value="lineman">Lineman</option>
          </select>
        </div>
      </div>

      {/* Admin Accounts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Staff Member</th>
                <th className="py-3 px-4 font-semibold">Admin Email (User Name)</th>
                <th className="py-3 px-4 font-semibold">Assigned Position</th>
                <th className="py-3 px-4 font-semibold">Date Registered</th>
                <th className="py-3 px-4 font-semibold">Portal Password</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No admin accounts match your search filter.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                          {acc.firstname[0]}
                          {acc.lastname[0]}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">
                            {acc.firstname} {acc.lastname}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">{acc.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        {acc.email}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getPositionBadge(
                          acc.position
                        )}`}
                      >
                        {acc.position === 'cashier' ? 'Cashier (Signatory)' : acc.position}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600">
                      {acc.dateRegistered}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        ••••••••
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(acc)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Admin Account"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (adminAccounts.length <= 1) {
                              setDeleteWarning('Cannot delete the sole administrator account. At least one administrator account must be retained.');
                              return;
                            }
                            setAccountToDelete(acc);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Admin Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full my-8 overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  {editingAccount ? 'Edit Admin Staff Account' : 'Register New Admin Account'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
                  {formError}
                </div>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                    placeholder="e.g. Roberto"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    placeholder="e.g. Mendoza"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                  />
                </div>
              </div>

              {/* Admin Email as user name */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Admin Email (Used as User Name for Login) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. roberto.mendoza@nethome.ph"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 font-mono"
                />
              </div>

              {/* Password with generator */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    Auto-generate
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter secure password"
                    className="w-full pl-3 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Position and Date Registered */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Position <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value as AdminPosition)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                  >
                    {POSITIONS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {POSITIONS.find((p) => p.value === position)?.description}
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Date Registered <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={dateRegistered}
                    onChange={(e) => setDateRegistered(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{editingAccount ? 'Save Changes' : 'Create Admin Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {accountToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-200 text-xs animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Delete Administrator Account</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              Are you sure you want to delete the account for <strong className="text-slate-900">{accountToDelete.firstname} {accountToDelete.lastname}</strong> ({accountToDelete.email})? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAccountToDelete(null)}
                className="px-3 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteAdminAccount(accountToDelete.id);
                  setAccountToDelete(null);
                }}
                className="px-3.5 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal (Sole Account Protection) */}
      {deleteWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-200 text-xs animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Cannot Delete Account</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              {deleteWarning}
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setDeleteWarning(null)}
                className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
