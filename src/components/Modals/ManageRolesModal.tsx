import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, X, Check, Users, AlertCircle, Sparkles } from 'lucide-react';
import { UserRole } from '../../types';

interface ManageRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManageRolesModal: React.FC<ManageRolesModalProps> = ({ isOpen, onClose }) => {
  const { users, currentUser, updateUserRole } = useApp();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setErrorMsg(null);
    const result = updateUserRole(userId, newRole);
    if (!result.success) {
      setErrorMsg(result.error || 'Failed to update role.');
      return;
    }
    const target = users.find(u => u.id === userId);
    setSuccessMsg(`Updated role for ${target?.name} to ${newRole.toUpperCase()}`);
    setTimeout(() => {
      setSuccessMsg(null);
    }, 2500);
  };

  return (
    <div id="manage-roles-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        id="manage-roles-modal"
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-white border-b border-slate-100 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Team Roles & Permissions</h2>
              <p className="text-xs text-slate-400">Promote or adjust employee roles to manage rosters and team schedules</p>
            </div>
          </div>
          <button 
            id="close-manage-roles-btn"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
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

          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 leading-relaxed">
            <strong>Role Permissions:</strong>
            <ul className="list-disc ml-4 mt-1 space-y-0.5 text-[11px] text-indigo-800">
              <li><strong>Manager:</strong> Can create rosters, edit duty slots, swap shifts, review/approve leave & overtime, and manage team roles.</li>
              <li><strong>Employee:</strong> Sees general team shift roster, sees own leave balances & personal leave requests only.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>All Team Members ({users.length})</span>
            </label>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white max-h-72 overflow-y-auto">
              {users.map(u => (
                <div key={u.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="truncate">{u.name}</span>
                        {u.id === currentUser.id && (
                          <span className="text-[10px] text-indigo-600 font-semibold">(You)</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {u.jobTitle} • <span className="font-semibold text-slate-600">{u.teamName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      id={`role-select-${u.id}`}
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      disabled={u.id === currentUser.id} // Don't demote self while logged in
                      className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border transition cursor-pointer ${
                        u.role === 'manager'
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      } ${u.id === currentUser.id ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
