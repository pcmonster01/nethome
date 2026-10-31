import React, { useState } from 'react';
import { SupportTicket, TicketStatus, TicketCategory, AdminAccount } from '../../types';
import {
  LifeBuoy,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Wrench,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Download,
  Trash2,
  Edit2,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  X,
  Send,
} from 'lucide-react';
import { exportToJson } from '../../utils/exportJson';

interface SupportTicketsManagementProps {
  supportTickets: SupportTicket[];
  adminAccounts?: AdminAccount[];
  onUpdateTicket: (updatedTicket: SupportTicket) => void;
  onDeleteTicket?: (ticketId: string) => void;
  showToast?: (msg: string) => void;
}

export const SupportTicketsManagement: React.FC<SupportTicketsManagementProps> = ({
  supportTickets,
  adminAccounts = [],
  onUpdateTicket,
  onDeleteTicket,
  showToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TicketStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | TicketCategory>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'urgent' | 'high' | 'normal' | 'low'>('all');

  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [editingTicket, setEditingTicket] = useState<SupportTicket | null>(null);
  const [editStatus, setEditStatus] = useState<TicketStatus>('pending');
  const [editAssignedTo, setEditAssignedTo] = useState('');
  const [editAdminNotes, setEditAdminNotes] = useState('');
  const [ticketToDelete, setTicketToDelete] = useState<SupportTicket | null>(null);

  // Available staff for assignment
  const staffOptions = adminAccounts.map((a) => `${a.firstname} ${a.lastname} (${a.position})`);

  // Filtered tickets
  const filteredTickets = supportTickets.filter((ticket) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      ticket.id.toLowerCase().includes(q) ||
      ticket.customerName.toLowerCase().includes(q) ||
      ticket.accountNo.toLowerCase().includes(q) ||
      ticket.contactNumber.toLowerCase().includes(q) ||
      ticket.subject.toLowerCase().includes(q) ||
      ticket.message.toLowerCase().includes(q) ||
      (ticket.address && ticket.address.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  // Counts
  const totalCount = supportTickets.length;
  const pendingCount = supportTickets.filter((t) => t.status === 'pending').length;
  const inProgressCount = supportTickets.filter((t) => t.status === 'in_progress').length;
  const resolvedCount = supportTickets.filter((t) => t.status === 'resolved').length;
  const urgentCount = supportTickets.filter((t) => t.priority === 'urgent' && t.status !== 'resolved').length;

  const openEditModal = (ticket: SupportTicket) => {
    setEditingTicket(ticket);
    setEditStatus(ticket.status);
    setEditAssignedTo(ticket.assignedTo || '');
    setEditAdminNotes(ticket.adminNotes || '');
  };

  const handleSaveTicketUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket) return;

    const updated: SupportTicket = {
      ...editingTicket,
      status: editStatus,
      assignedTo: editAssignedTo.trim() || undefined,
      adminNotes: editAdminNotes.trim() || undefined,
      resolvedAt:
        editStatus === 'resolved' && !editingTicket.resolvedAt
          ? new Date().toISOString()
          : editStatus !== 'resolved'
          ? undefined
          : editingTicket.resolvedAt,
    };

    onUpdateTicket(updated);
    setEditingTicket(null);
    if (selectedTicket && selectedTicket.id === updated.id) {
      setSelectedTicket(updated);
    }
    if (showToast) {
      showToast(`Support ticket #${updated.id} status updated to ${updated.status.toUpperCase()}`);
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Pending Inspection</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Wrench className="w-3 h-3 text-blue-600 animate-pulse" />
            <span>In Progress / Dispatched</span>
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Resolved</span>
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>URGENT</span>
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-orange-100 text-orange-800 border border-orange-200">
            High Priority
          </span>
        );
      case 'normal':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
            Normal
          </span>
        );
      case 'low':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-50 text-slate-500">
            Low
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Indicator Alert for New Repair Requests */}
      {pendingCount > 0 && (
        <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="font-bold text-xs text-rose-950 flex items-center gap-2">
                <span className="uppercase tracking-wider">Alert: {pendingCount} New Repair Request(s) Received</span>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                </span>
              </div>
              <p className="text-[11px] text-rose-700 mt-0.5">
                New customer repair messages require inspection and lineman dispatch.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
          >
            Filter Pending Requests ({pendingCount})
          </button>
        </div>
      )}

      {/* Top Banner and Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Customer Repair Requests &amp; Outage Messages
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-rose-50 text-rose-700 rounded-full border border-rose-200">
              {pendingCount} Pending Action
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            All customer messages and repair requests are logged here. Inspect issues, assign service technicians/linemen, and update resolution progress.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => exportToJson(`repair_requests_${new Date().toISOString().slice(0, 10)}.json`, supportTickets)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-xl transition-colors shadow-xs cursor-pointer"
            title={`Export ${supportTickets.length} repair requests to JSON`}
          >
            <Download className="w-3.5 h-3.5 text-rose-600" />
            <span>Export JSON ({supportTickets.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium flex items-center justify-between">
            <span>Total Reports</span>
            <MessageSquare className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2">
            {totalCount}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <div className="text-xs text-amber-700 font-semibold flex items-center justify-between">
            <span>Pending Inspection</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-800 mt-2">
            {pendingCount}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-2xs">
          <div className="text-xs text-blue-700 font-semibold flex items-center justify-between">
            <span>In Progress / Tech</span>
            <Wrench className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-800 mt-2">
            {inProgressCount}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <div className="text-xs text-emerald-700 font-semibold flex items-center justify-between">
            <span>Resolved Tickets</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-800 mt-2">
            {resolvedCount}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-2xs col-span-2 lg:col-span-1">
          <div className="text-xs text-rose-700 font-semibold flex items-center justify-between">
            <span>Urgent Attention</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-800 mt-2">
            {urgentCount}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ticket ID, customer name, account #, phone, address, or issue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold text-xs">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            >
              <option value="all">All Statuses ({totalCount})</option>
              <option value="pending">Pending ({pendingCount})</option>
              <option value="in_progress">In Progress ({inProgressCount})</option>
              <option value="resolved">Resolved ({resolvedCount})</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold text-xs">Issue:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            >
              <option value="all">All Issues</option>
              <option value="No Internet">No Internet</option>
              <option value="Other Issue">Other Issue</option>
              <option value="Billing Issue">Billing Issue</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold text-xs">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List / Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Ticket &amp; Date</th>
                <th className="py-3 px-4 font-semibold">Subscriber Details</th>
                <th className="py-3 px-4 font-semibold">Repair Category &amp; Subject</th>
                <th className="py-3 px-4 font-semibold">Priority</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Assigned Staff</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No customer repair reports found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => {
                  return (
                    <tr
                      key={ticket.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900">
                          {ticket.id}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {ticket.createdAt
                              ? new Date(ticket.createdAt).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Recent'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 text-sm">
                          {ticket.customerName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Acc: {ticket.accountNo}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{ticket.contactNumber}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-slate-800 truncate" title={ticket.subject}>
                          {ticket.subject}
                        </div>
                        <div className="text-[11px] text-indigo-700 font-medium">
                          {ticket.category}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5 line-clamp-1" title={ticket.message}>
                          {ticket.message}
                        </p>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {getPriorityBadge(ticket.priority)}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {getStatusBadge(ticket.status)}
                      </td>

                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {ticket.assignedTo ? (
                          <div className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                            <Wrench className="w-3 h-3 text-slate-600" />
                            <span>{ticket.assignedTo}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                        )}
                      </td>

                      <td
                        className="py-3 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(ticket)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Update ticket status & assign technician"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedTicket(ticket)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="View repair report details"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>

                          {onDeleteTicket && (
                            <button
                              type="button"
                              onClick={() => setTicketToDelete(ticket)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete ticket"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 border border-slate-200 text-xs animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {selectedTicket.id}
                    </span>
                    {getStatusBadge(selectedTicket.status)}
                    {getPriorityBadge(selectedTicket.priority)}
                  </div>
                  <h3 className="font-bold text-base text-slate-900 mt-1">
                    {selectedTicket.subject}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              {/* Subscriber Information Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Subscriber Details
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Full Name:</span>
                    <strong className="block text-slate-900 text-sm">{selectedTicket.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Account Number:</span>
                    <strong className="block font-mono text-slate-900">{selectedTicket.accountNo}</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Contact: <strong>{selectedTicket.contactNumber}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email: <strong>{selectedTicket.email}</strong></span>
                  </div>
                  {selectedTicket.address && (
                    <div className="sm:col-span-2 flex items-start gap-1.5 pt-1 border-t border-slate-200/60">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>Address: <strong>{selectedTicket.address}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              {/* Repair Category and Message */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Customer Reported Issue &amp; Symptoms
                  </span>
                  <span className="text-indigo-700 font-semibold bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200 text-[11px]">
                    Category: {selectedTicket.category}
                  </span>
                </div>
                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 text-slate-800 leading-relaxed text-xs whitespace-pre-wrap">
                  {selectedTicket.message}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Submitted on: {new Date(selectedTicket.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Technician / Lineman & Admin Notes */}
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-2">
                <div className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                  Technical Resolution &amp; Dispatch Status
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Assigned Technician / Lineman:</span>
                    <strong className="text-slate-900 font-medium">
                      {selectedTicket.assignedTo || 'Not yet assigned'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Resolution Timestamp:</span>
                    <strong className="text-slate-900 font-medium">
                      {selectedTicket.resolvedAt
                        ? new Date(selectedTicket.resolvedAt).toLocaleString()
                        : 'Unresolved'}
                    </strong>
                  </div>
                </div>
                {selectedTicket.adminNotes && (
                  <div className="pt-2 border-t border-blue-200/60 text-xs">
                    <span className="text-slate-500 block font-semibold">Admin / Dispatcher Notes:</span>
                    <p className="text-slate-800 mt-0.5 italic">{selectedTicket.adminNotes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const t = selectedTicket;
                  setSelectedTicket(null);
                  openEditModal(t);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Update Status / Assign Staff</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Ticket / Update Status Modal */}
      {editingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleSaveTicketUpdate}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 text-xs animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Update Support Ticket #{editingTicket.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingTicket(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Ticket Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as TicketStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="pending">Pending Inspection</option>
                  <option value="in_progress">In Progress / Lineman Dispatched</option>
                  <option value="resolved">Resolved &amp; Service Restored</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Assign Lineman / Technical Staff
                </label>
                <select
                  value={editAssignedTo}
                  onChange={(e) => setEditAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Select Technical Staff --</option>
                  {staffOptions.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                  <option value="Mark Bautista (Lineman)">Mark Bautista (Lineman)</option>
                  <option value="Carlos Gomez (Supervisor)">Carlos Gomez (Supervisor)</option>
                  <option value="Liza Dizon (Agent)">Liza Dizon (Agent)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Dispatcher / Resolution Notes
                </label>
                <textarea
                  rows={3}
                  value={editAdminNotes}
                  onChange={(e) => setEditAdminNotes(e.target.value)}
                  placeholder="Enter notes on repairs conducted, fiber splicing details, or feedback for customer..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-5">
              <button
                type="button"
                onClick={() => setEditingTicket(null)}
                className="px-3.5 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {ticketToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-200 text-xs animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Delete Support Ticket</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              Are you sure you want to delete ticket <strong>#{ticketToDelete.id}</strong> submitted by {ticketToDelete.customerName}?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setTicketToDelete(null)}
                className="px-3 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteTicket) {
                    onDeleteTicket(ticketToDelete.id);
                  }
                  setTicketToDelete(null);
                  if (showToast) showToast('Support ticket removed.');
                }}
                className="px-3.5 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Delete Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
