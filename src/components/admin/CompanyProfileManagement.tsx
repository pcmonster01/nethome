import React, { useState } from 'react';
import { CompanyProfile, AuthUser } from '../../types';
import {
  Building2,
  ShieldCheck,
  ShieldAlert,
  Save,
  CheckCircle2,
  FileText,
  Phone,
  Mail,
  MapPin,
  Tag,
  Hash,
  Download,
} from 'lucide-react';
import { exportToJson } from '../../utils/exportJson';

interface CompanyProfileManagementProps {
  companyProfile: CompanyProfile;
  currentUser: AuthUser | null;
  onUpdateCompanyProfile: (newProfile: CompanyProfile) => void;
}

export const CompanyProfileManagement: React.FC<CompanyProfileManagementProps> = ({
  companyProfile,
  currentUser,
  onUpdateCompanyProfile,
}) => {
  const isManager = currentUser?.role === 'admin' && currentUser?.position === 'Manager';

  const [companyName, setCompanyName] = useState(companyProfile.companyName);
  const [tagline, setTagline] = useState(companyProfile.tagline);
  const [address, setAddress] = useState(companyProfile.address);
  const [tin, setTin] = useState(companyProfile.tin);
  const [hotline, setHotline] = useState(companyProfile.hotline);
  const [email, setEmail] = useState(companyProfile.email);

  const [savedToast, setSavedToast] = useState(false);
  const [managerError, setManagerError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isManager) {
      setManagerError('Only a Manager account is authorized to modify company details. Please log in with a Manager administrator account.');
      return;
    }
    setManagerError(null);

    onUpdateCompanyProfile({
      companyName: companyName.trim(),
      tagline: tagline.trim(),
      address: address.trim(),
      tin: tin.trim(),
      hotline: hotline.trim(),
      email: email.trim(),
    });

    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Company Corporate Profile &amp; Billing Identity
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure legal entity name, corporate tagline, address, TIN, and billing contact channels.
          </p>
        </div>

        {/* Header Actions & Manager Status Badge */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => exportToJson(`company_profile_${new Date().toISOString().slice(0, 10)}.json`, companyProfile)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors shadow-xs cursor-pointer"
            title="Export company profile details to JSON"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export JSON</span>
          </button>

          {isManager ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Manager Access: Authorized to Edit</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Restricted: Manager Only (View Only)</span>
            </span>
          )}
        </div>
      </div>

      {/* Role Notice */}
      {!isManager ? (
        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-amber-950 block">Manager Permission Required:</span>
            <p className="text-amber-800 leading-relaxed text-[11px]">
              You are currently logged in with position <strong>{currentUser?.position || 'Staff'}</strong>.
              Only administrators with the <strong>Manager</strong> position can modify the Company Name, Tag-line, Address, TIN, Hotline, and email. The fields below are set to read-only mode.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              You have full administrative privileges as <strong>Manager</strong>. Changes made here will update all printable statements of account (SOA) and official receipts instantly.
            </span>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {savedToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold block text-emerald-950">Company Profile Updated Successfully!</span>
            <span>All billing statements, official receipts, and email notices will now reflect the new details.</span>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {managerError && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-semibold">{managerError}</span>
          </div>
          <button
            type="button"
            onClick={() => setManagerError(null)}
            className="text-rose-500 hover:text-rose-700 text-xs font-bold px-2 py-1 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Field 1: Name of the Company */}
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Name of the Company</span>
                {!isManager && <span className="text-slate-400 font-normal">(Read Only)</span>}
              </label>
              <input
                type="text"
                required
                disabled={!isManager}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Net-Home Broadband Networks Corp."
                className={`w-full px-3.5 py-2.5 rounded-lg border text-xs font-semibold ${
                  isManager
                    ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                    : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                }`}
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Official registered business name displayed at the top of statements and receipts.
              </span>
            </div>

            {/* Field 2: Tag-line */}
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" />
                <span>Tag-line</span>
                {!isManager && <span className="text-slate-400 font-normal">(Read Only)</span>}
              </label>
              <input
                type="text"
                required
                disabled={!isManager}
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. High-Speed Fiber Broadband Networks"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-xs font-mono ${
                  isManager
                    ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                    : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                }`}
              />
            </div>

            {/* Field 3: Address */}
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Address</span>
                {!isManager && <span className="text-slate-400 font-normal">(Read Only)</span>}
              </label>
              <textarea
                rows={2}
                required
                disabled={!isManager}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Corporate office or billing center physical address"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-xs ${
                  isManager
                    ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                    : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                }`}
              />
            </div>

            {/* Field 4: TIN */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                <Hash className="w-4 h-4 text-blue-600" />
                <span>TIN (Taxpayer Identification Number)</span>
                {!isManager && <span className="text-slate-400 font-normal">(Read Only)</span>}
              </label>
              <input
                type="text"
                required
                disabled={!isManager}
                value={tin}
                onChange={(e) => setTin(e.target.value)}
                placeholder="e.g. 009-482-192-000-VAT"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-xs font-mono ${
                  isManager
                    ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                    : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                }`}
              />
            </div>

            {/* Field 5: Hotline */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" />
                <span>Hotline</span>
                {!isManager && <span className="text-slate-400 font-normal">(Read Only)</span>}
              </label>
              <input
                type="text"
                required
                disabled={!isManager}
                value={hotline}
                onChange={(e) => setHotline(e.target.value)}
                placeholder="e.g. (02) 8888-HOME / +63 917 842 9912"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-xs font-mono ${
                  isManager
                    ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                    : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                }`}
              />
            </div>

            {/* Field 6: email */}
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <span>Email Address</span>
                {!isManager && <span className="text-slate-400 font-normal">(Read Only)</span>}
              </label>
              <input
                type="email"
                required
                disabled={!isManager}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. billing@nethome.ph"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-xs font-mono ${
                  isManager
                    ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                    : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                }`}
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              {isManager
                ? 'Save your changes to update print layouts and notification footers.'
                : 'Log in as a Manager account to enable modification.'}
            </span>

            <button
              type="submit"
              disabled={!isManager}
              className={`inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-colors shadow-xs ${
                isManager
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>Save Company Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* Live Preview Card */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-3">
          Live Statement &amp; Receipt Header Preview
        </span>
        <div className="bg-white p-5 rounded-xl border border-slate-300 shadow-2xs space-y-1">
          <div className="text-base font-bold text-slate-900 uppercase">{companyName}</div>
          <div className="text-xs text-blue-700 font-semibold">{tagline}</div>
          <div className="text-xs text-slate-600">{address}</div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1 border-t border-slate-100 mt-2">
            <span>TIN: <strong className="font-mono text-slate-700">{tin}</strong></span>
            <span aria-hidden="true">·</span>
            <span>Hotline: <strong className="text-slate-700">{hotline}</strong></span>
            <span aria-hidden="true">·</span>
            <span>Email: <strong className="text-slate-700">{email}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
