import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TEAM_NAMES, TeamName } from '../../types';
import { UserPlus, X, Shield, Mail, Briefcase, Users, Phone, AtSign, Check, AlertCircle } from 'lucide-react';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80'
];

export const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose }) => {
  const { addUser, currentUser } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('Cloud Engineer');
  const [teamName, setTeamName] = useState<TeamName>('Cloud Infra');
  const [avatar, setAvatar] = useState(PRESET_AVATARS[0]);
  const [phone, setPhone] = useState('+1 (555) 019-8822');
  const [teamsHandle, setTeamsHandle] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Please enter the employee full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid work email address.');
      return;
    }

    const result = addUser({
      name: name.trim(),
      email: email.trim(),
      jobTitle: jobTitle.trim(),
      teamName: teamName.trim(),
      department: teamName.trim(),
      avatar: avatar.trim(),
      phone: phone.trim(),
      teamsHandle: teamsHandle.trim() || `@${name.trim().toLowerCase().replace(/\s+/g, '.')}`
    });

    if (!result.success) {
      setErrorMsg(result.error || 'Failed to add employee.');
      return;
    }

    setSuccessMsg(`Employee ${name} added to ${teamName} successfully!`);
    setTimeout(() => {
      setSuccessMsg(null);
      setName('');
      setEmail('');
      setTeamsHandle('');
      onClose();
    }, 1200);
  };

  return (
    <div id="add-user-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        id="add-user-modal"
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-white border-b border-slate-100 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Add New Employee</h2>
              <p className="text-xs text-slate-400">Onboard staff member to team roster & time-off system</p>
            </div>
          </div>
          <button 
            id="close-add-user-btn"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Locked Role Badge (User Requirement: Role is ALWAYS Employee) */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Assigned Role: Employee</div>
                <div className="text-[11px] text-slate-500">Newly added users are always assigned the Employee role.</div>
              </div>
            </div>
            <span className="px-2.5 py-1 text-[11px] font-bold uppercase rounded-md bg-white border border-slate-200 text-slate-700 shadow-2xs">
              Employee (Fixed)
            </span>
          </div>

          {/* Full Name & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="new-user-name-input"
                type="text"
                required
                placeholder="e.g. Jordan Miller"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!teamsHandle && e.target.value) {
                    setTeamsHandle(`@${e.target.value.toLowerCase().replace(/\s+/g, '.')}`);
                  }
                }}
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Work Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  id="new-user-email-input"
                  type="email"
                  required
                  placeholder="jordan@acmecorp.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Job Title & Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Job Title <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  id="new-user-title-input"
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. DevOps Engineer"
                  className="w-full text-xs border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Team Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Users className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <select
                  id="new-user-team-select"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value as TeamName)}
                  className="w-full text-xs border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="Cloud Infra">Cloud Infra</option>
                  <option value="DSO">DSO</option>
                  <option value="Network">Network</option>
                  <option value="SecOps">SecOps</option>
                  <option value="Package Admin">Package Admin</option>
                  <option value="Management">Management</option>
                </select>
              </div>
            </div>
          </div>

          {/* Phone & Teams Handle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  id="new-user-phone-input"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-2831"
                  className="w-full text-xs border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Teams Handle / Mention
              </label>
              <div className="relative">
                <AtSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  id="new-user-teams-input"
                  type="text"
                  value={teamsHandle}
                  onChange={(e) => setTeamsHandle(e.target.value)}
                  placeholder="@jordan.miller"
                  className="w-full text-xs border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Avatar Preset Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Profile Avatar
            </label>
            <div className="flex items-center gap-2.5">
              {PRESET_AVATARS.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatar(url)}
                  className={`relative w-9 h-9 rounded-full overflow-hidden border-2 transition ${avatar === url ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-slate-200 opacity-70 hover:opacity-100'}`}
                >
                  <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                  {avatar === url && (
                    <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Initial Balances Overview */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600">
            <span className="font-bold text-slate-800">Initial Entitlements: </span>
            20d PTO, 10d Sick, 5d Personal, 0d Comp-Off (Earned via &gt;5h after-office shifts), 2d Floating Holiday.
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              id="confirm-add-user-btn"
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Employee</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
