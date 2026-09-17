import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, X, Users, Sparkles, Check, Clock, ShieldCheck, AlertCircle, Layers } from 'lucide-react';

interface CreateRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTeam?: string;
}

export const CreateRosterModal: React.FC<CreateRosterModalProps> = ({ isOpen, onClose, defaultTeam }) => {
  const { users, currentUser, createMonthlyRoster } = useApp();

  const availableTeams = useMemo(() => {
    const list = Array.from(new Set(users.map(u => u.teamName).filter(Boolean))) as string[];
    const defaults = ['Cloud Infra', 'SecOps', 'DSO', 'Network', 'Package Admin'];
    const merged = Array.from(new Set([...defaults, ...list])).filter(t => t !== 'Management');
    return merged;
  }, [users]);

  const [year, setYear] = useState<number>(2026);
  const [monthIndex, setMonthIndex] = useState<number>(8); // 8 = September
  const [selectedTeam, setSelectedTeam] = useState<string>(
    defaultTeam && defaultTeam !== 'all' ? defaultTeam : (availableTeams[0] || 'Cloud Infra')
  );
  
  // Track selected user IDs for the rotation pool
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync team change: auto-select users from this team
  useEffect(() => {
    if (selectedTeam) {
      const teamUsers = users.filter(u => u.teamName === selectedTeam);
      if (teamUsers.length > 0) {
        setSelectedUserIds(teamUsers.map(u => u.id));
      } else {
        setSelectedUserIds(users.map(u => u.id));
      }
    }
  }, [selectedTeam, users]);

  useEffect(() => {
    if (defaultTeam && defaultTeam !== 'all') {
      setSelectedTeam(defaultTeam);
    }
  }, [defaultTeam]);

  if (!isOpen) return null;

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const teamUsers = users.filter(u => u.teamName === selectedTeam);
  const otherUsers = users.filter(u => u.teamName !== selectedTeam);

  const handleToggleUser = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectTeamOnly = () => {
    setSelectedUserIds(teamUsers.map(u => u.id));
  };

  const handleSelectAll = () => {
    setSelectedUserIds(users.map(u => u.id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (selectedUserIds.length < 2) {
      setErrorMsg('Please select at least 2 team members to ensure Primary and Secondary shift rotation.');
      return;
    }

    const result = createMonthlyRoster(year, monthIndex, selectedTeam, selectedUserIds);
    if (!result.success) {
      setErrorMsg(result.error || 'Failed to create roster.');
      return;
    }

    setSuccessMsg(`Roster for ${selectedTeam} (${months[monthIndex]} ${year}) generated successfully!`);
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1200);
  };

  return (
    <div id="create-roster-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        id="create-roster-modal" 
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-white border-b border-slate-100 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Create Team Shift Roster</h2>
              <p className="text-xs text-slate-400">Generate on-call rotations for specific functional engineering teams</p>
            </div>
          </div>
          <button 
            id="close-create-roster-btn"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

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

          {/* Team Grouping Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Target Team Grouping</span> <span className="text-rose-500">*</span>
            </label>
            <select
              id="roster-target-team-select"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full text-xs font-semibold border border-indigo-200 bg-indigo-50/40 rounded-lg px-3 py-2 text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {availableTeams.map(t => (
                <option key={t} value={t}>Team: {t}</option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Rosters are managed independently per team by respective team leads.
            </p>
          </div>

          {/* Month & Year Selection */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Month <span className="text-rose-500">*</span>
              </label>
              <select
                id="roster-month-select"
                value={monthIndex}
                onChange={(e) => setMonthIndex(Number(e.target.value))}
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 bg-white"
              >
                {months.map((m, idx) => (
                  <option key={idx} value={idx}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Year <span className="text-rose-500">*</span>
              </label>
              <select
                id="roster-year-select"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 bg-white"
              >
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>
          </div>

          {/* Shift Schedule Structure Summary (Primary & Secondary Only) */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
            <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Configured Roster Shifts (2-Tier Support)</span>
              </div>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                General Shift Removed
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-white p-2.5 rounded-lg border border-indigo-100">
                <span className="font-bold text-indigo-700 block">Primary On-Call</span>
                <span className="text-slate-500 text-[10px]">10:00 AM – 7:30 PM (Lead)</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                <span className="font-bold text-emerald-700 block">Secondary On-Call</span>
                <span className="text-slate-500 text-[10px]">8:00 AM – 5:30 PM (Backup)</span>
              </div>
            </div>
          </div>

          {/* Participant Engineers Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>Rotation Pool ({selectedUserIds.length} members selected)</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectTeamOnly}
                  className="text-[11px] text-indigo-600 font-semibold hover:underline"
                >
                  Select {selectedTeam}
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[11px] text-slate-500 hover:text-slate-800 hover:underline"
                >
                  All Staff
                </button>
              </div>
            </div>

            <div className="max-h-44 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
              {/* First list team members */}
              {teamUsers.map(u => {
                const isSelected = selectedUserIds.includes(u.id);
                return (
                  <div
                    key={u.id}
                    onClick={() => handleToggleUser(u.id)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition text-xs ${
                      isSelected 
                        ? 'bg-white border border-indigo-200 shadow-2xs' 
                        : 'bg-transparent border border-transparent hover:bg-slate-100 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                      <div>
                        <span className="font-bold text-slate-800">{u.name}</span>
                        <span className="text-[10px] text-indigo-600 font-semibold ml-1.5 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                          {u.teamName}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {u.role}
                    </span>
                  </div>
                );
              })}

              {/* Next list any other members */}
              {otherUsers.map(u => {
                const isSelected = selectedUserIds.includes(u.id);
                return (
                  <div
                    key={u.id}
                    onClick={() => handleToggleUser(u.id)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition text-xs ${
                      isSelected 
                        ? 'bg-white border border-indigo-200 shadow-2xs' 
                        : 'bg-transparent border border-transparent hover:bg-slate-100 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                      <div>
                        <span className="font-semibold text-slate-700">{u.name}</span>
                        <span className="text-[10px] text-slate-400 ml-1.5">({u.teamName || 'Other'})</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {u.role}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              id="submit-create-roster-btn"
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Roster ({selectedTeam})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
