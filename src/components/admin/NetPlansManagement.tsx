import React, { useState } from 'react';
import { NetPlan, Customer } from '../../types';
import { formatPeso } from '../../utils/numberToWords';
import {
  Wifi,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  AlertCircle,
  Users,
  DollarSign,
  TrendingUp,
  X,
  Layers,
  HelpCircle,
  Download,
} from 'lucide-react';
import { exportToJson } from '../../utils/exportJson';

interface NetPlansManagementProps {
  netPlans: NetPlan[];
  customers: Customer[];
  onAddPlan: (plan: NetPlan) => void;
  onUpdatePlan: (plan: NetPlan) => void;
  onDeletePlan: (planId: string) => void;
}

export const NetPlansManagement: React.FC<NetPlansManagementProps> = ({
  netPlans,
  customers,
  onAddPlan,
  onUpdatePlan,
  onDeletePlan,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<NetPlan | null>(null);

  // Form State
  const [planName, setPlanName] = useState('');
  const [monthlyRate, setMonthlyRate] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Deletion Modal State
  const [planToDelete, setPlanToDelete] = useState<NetPlan | null>(null);

  // Filter plans by search term
  const filteredPlans = netPlans.filter((p) => {
    const q = searchTerm.toLowerCase();
    const rateMatch = p.monthlyRate.toString().includes(q);
    return p.name.toLowerCase().includes(q) || rateMatch;
  });

  // Calculate subscribers per plan
  const getSubscriberCount = (planNameToCheck: string) => {
    return customers.filter(
      (c) => c.net_plan.trim().toLowerCase() === planNameToCheck.trim().toLowerCase()
    ).length;
  };

  const openAddModal = () => {
    setEditingPlan(null);
    setPlanName('');
    setMonthlyRate('');
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (plan: NetPlan) => {
    setEditingPlan(plan);
    setPlanName(plan.name);
    setMonthlyRate(plan.monthlyRate.toString());
    setFormError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPlan(null);
    setPlanName('');
    setMonthlyRate('');
    setFormError(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = planName.trim();
    const parsedRate = parseFloat(monthlyRate);

    if (!trimmedName) {
      setFormError('Plan name is required.');
      return;
    }

    if (isNaN(parsedRate) || parsedRate < 0) {
      setFormError('Please enter a valid positive Monthly rate in Philippine Pesos (PHP).');
      return;
    }

    // Check duplicate plan name
    const isDuplicate = netPlans.some(
      (p) =>
        p.name.trim().toLowerCase() === trimmedName.toLowerCase() &&
        p.id !== (editingPlan ? editingPlan.id : '')
    );

    if (isDuplicate) {
      setFormError('A Net plan with this exact name already exists. Please choose a distinctive name.');
      return;
    }

    // Extract optional speed from name (e.g., "50 Mbps") if present
    const speedMatch = trimmedName.match(/\d+\s*(?:Mbps|Gbps|kbps)/i);
    const speed = speedMatch ? speedMatch[0] : (editingPlan?.speed || 'High-Speed Fiber');

    if (editingPlan) {
      // Modify plan
      const updated: NetPlan = {
        ...editingPlan,
        name: trimmedName,
        monthlyRate: parsedRate,
        speed: speed,
      };
      onUpdatePlan(updated);
    } else {
      // Add new plan
      const newPlan: NetPlan = {
        id: `PLAN-${Date.now().toString().slice(-5)}`,
        name: trimmedName,
        monthlyRate: parsedRate,
        speed: speed,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      onAddPlan(newPlan);
    }

    closeModal();
  };

  const confirmDeletePlan = () => {
    if (planToDelete) {
      onDeletePlan(planToDelete.id);
      setPlanToDelete(null);
    }
  };

  // Stats
  const totalPlansCount = netPlans.length;
  const rates = netPlans.map((p) => p.monthlyRate);
  const minRate = rates.length > 0 ? Math.min(...rates) : 0;
  const maxRate = rates.length > 0 ? Math.max(...rates) : 0;
  const totalSubscribersOnPlans = customers.length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Wifi className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Net Plans Management
            </h2>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-200">
              {totalPlansCount} Active Plans
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Configure broadband internet plan offerings and monthly subscription rates.
            Subscribers can be assigned to these plans during registration, and billing statements will calculate charges based on the monthly rate.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => exportToJson(`net_plans_${new Date().toISOString().slice(0, 10)}.json`, netPlans)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-xl transition-colors shadow-xs cursor-pointer shrink-0"
            title={`Export ${netPlans.length} broadband net plans to JSON`}
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export JSON ({netPlans.length})</span>
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Net Plan</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Offerings</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2">
            {totalPlansCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Available bandwidth tiers</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Active Subscribers</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2">
            {totalSubscribersOnPlans}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">Across all network plans</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Starting Plan Rate</span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2">
            {formatPeso(minRate)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Entry tier monthly fee</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Premium Tier Rate</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2">
            {formatPeso(maxRate)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Maximum bandwidth tier</div>
        </div>
      </div>

      {/* Plans List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search plan name or rate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="text-xs text-slate-500 self-end sm:self-center">
            Showing <span className="font-semibold text-slate-800">{filteredPlans.length}</span> of{' '}
            <span className="font-semibold text-slate-800">{netPlans.length}</span> plans
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200 text-[10.5px]">
              <tr>
                <th className="py-3 px-4">Plan Name</th>
                <th className="py-3 px-4">Monthly Rate</th>
                <th className="py-3 px-4">Speed / Spec</th>
                <th className="py-3 px-4">Subscribers Assigned</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Wifi className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-slate-600">No Net plans match your criteria.</p>
                    <p className="text-xs mt-1">Click "+ Add Net Plan" to create a new broadband offering.</p>
                  </td>
                </tr>
              ) : (
                filteredPlans.map((plan) => {
                  const subCount = getSubscriberCount(plan.name);
                  return (
                    <tr key={plan.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                            <Wifi className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block text-xs">{plan.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {plan.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-sm text-blue-900 tabular-nums">
                          {formatPeso(plan.monthlyRate)}
                        </div>
                        <span className="text-[10px] text-slate-500">per month / subscriber</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {plan.speed || 'Broadband'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              subCount > 0
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-50 text-slate-500 border border-slate-200'
                            }`}
                          >
                            <Users className="w-3 h-3" />
                            <span>{subCount} {subCount === 1 ? 'client' : 'clients'}</span>
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(plan)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
                            title="Modify Plan details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Modify</span>
                          </button>
                          <button
                            onClick={() => setPlanToDelete(plan)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                            title="Delete Net Plan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Modify Net Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Wifi className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {editingPlan ? 'Modify Net Plan' : 'Add New Net Plan'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {editingPlan
                      ? 'Update the plan name and monthly subscription rate.'
                      : 'Create a new internet subscription tier for subscribers.'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Field 1: Plan name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Plan name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g., Fiber Boost 75 Mbps or Premium Gaming 200M"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    autoFocus
                  />
                </div>
                <p className="text-[10.5px] text-slate-400 mt-1">
                  Full promotional or network tier name displayed on client invoices and receipts.
                </p>
              </div>

              {/* Field 2: Monthly rate */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Monthly rate (PHP ₱) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-mono text-xs font-bold">
                    ₱
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="e.g., 1499.00"
                    value={monthlyRate}
                    onChange={(e) => setMonthlyRate(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono font-bold text-slate-900"
                  />
                </div>
                <p className="text-[10.5px] text-slate-400 mt-1">
                  Standard recurring monthly fee charged to subscribers on this plan.
                </p>
              </div>

              {/* Help Callout */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-[11px] flex items-start gap-2">
                <HelpCircle className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
                <span>
                  Modifying this plan will update its rate for future bills and customer selection. Existing issued bills remain unchanged to preserve financial audit trail.
                </span>
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{editingPlan ? 'Save Changes' : 'Create Net Plan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation In-App Modal */}
      {planToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 border border-slate-200 animate-in fade-in duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Delete Net Plan?</h4>
                <p className="text-xs text-slate-500">This action will remove the plan offering.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Plan:</span>
                <span className="font-bold text-slate-900">{planToDelete.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Monthly Rate:</span>
                <span className="font-mono font-bold text-blue-900">{formatPeso(planToDelete.monthlyRate)}</span>
              </div>
              {getSubscriberCount(planToDelete.name) > 0 && (
                <div className="pt-2 border-t border-slate-200 text-amber-700 font-semibold text-[11px]">
                  Warning: {getSubscriberCount(planToDelete.name)} active subscriber(s) currently use this plan.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPlanToDelete(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeletePlan}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Delete Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
