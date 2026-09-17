import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DailyRosterSlot, SHIFT_TIMINGS } from '../types';
import { 
  Calendar as CalendarIcon, 
  Shield, 
  ArrowLeftRight, 
  AlertTriangle, 
  UserCheck, 
  Edit3, 
  CheckCircle2, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Info,
  Clock,
  Lock,
  Plus,
  Layers,
  Sparkles
} from 'lucide-react';
import { RosterEditModal } from './Modals/RosterEditModal';
import { ShiftSwapModal } from './Modals/ShiftSwapModal';
import { CreateRosterModal } from './Modals/CreateRosterModal';

export const RosterView: React.FC = () => {
  const { roster, users, leaveRequests, currentUser } = useApp();
  
  // Available teams
  const availableTeams = useMemo(() => {
    const fromRoster = Array.from(new Set(roster.map(s => s.teamName).filter(Boolean)));
    const fromUsers = Array.from(new Set(users.map(u => u.teamName).filter(Boolean)));
    const merged = Array.from(new Set(['Cloud Infra', 'SecOps', 'DSO', 'Network', 'Package Admin', ...fromRoster, ...fromUsers])).filter(t => t !== 'Management');
    return merged;
  }, [roster, users]);

  // Default to user's team if valid, otherwise first available
  const [selectedTeam, setSelectedTeam] = useState<string>(() => {
    if (currentUser.teamName && currentUser.teamName !== 'Management' && availableTeams.includes(currentUser.teamName)) {
      return currentUser.teamName;
    }
    return availableTeams[0] || 'Cloud Infra';
  });

  const [selectedSlotForEdit, setSelectedSlotForEdit] = useState<DailyRosterSlot | null>(null);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [isCreateRosterOpen, setIsCreateRosterOpen] = useState(false);
  const [swapTargetDate, setSwapTargetDate] = useState<string | undefined>(undefined);
  const [filterMyShiftsOnly, setFilterMyShiftsOnly] = useState(false);

  const isManager = currentUser.role === 'manager';

  // Team-specific manager or team lead info
  const teamManager = users.find(u => u.role === 'manager' && (u.teamName === selectedTeam || u.teamName === 'Management'));

  // Filter roster by selected team
  const currentTeamRoster = useMemo(() => {
    if (selectedTeam === 'all') return roster;
    return roster.filter(s => s.teamName === selectedTeam);
  }, [roster, selectedTeam]);

  // Days of week strictly Monday to Sunday
  const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Check if a user is on leave on a given date
  const isUserOnLeave = (userId?: string, date?: string) => {
    if (!userId || !date) return undefined;
    return leaveRequests.find(r => 
      r.userId === userId && 
      r.status !== 'rejected' && 
      r.status !== 'cancelled' &&
      date >= r.startDate && 
      date <= r.endDate
    );
  };

  // Group slots by Monday-Sunday weeks dynamically
  const getWeeklyMatrix = () => {
    if (currentTeamRoster.length === 0) return [];

    // Deduplicate by date for calendar display (if 'all', takes first slot of day or groups)
    const dateMap = new Map<string, DailyRosterSlot>();
    for (const slot of currentTeamRoster) {
      if (!dateMap.has(slot.date)) {
        dateMap.set(slot.date, slot);
      }
    }

    const sorted = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    if (sorted.length === 0) return [];

    const firstDate = new Date(sorted[0].date + 'T00:00:00');
    // Monday is index 0, Sunday is index 6
    const startDayIndex = (firstDate.getDay() + 6) % 7;

    const weeks: (DailyRosterSlot | null)[][] = [];
    let currentWeek: (DailyRosterSlot | null)[] = [];

    // Pad beginning of first week
    for (let i = 0; i < startDayIndex; i++) {
      currentWeek.push(null);
    }

    // Add all sorted slots
    for (const slot of sorted) {
      currentWeek.push(slot);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Pad last week if incomplete
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const weeklyMatrix = getWeeklyMatrix();

  const activePeriodTitle = currentTeamRoster.length > 0
    ? new Date(currentTeamRoster[0].date + 'T00:00:00').toLocaleDateString('default', { month: 'long', year: 'numeric' })
    : 'Team Roster';

  // Count total clashes in roster (across primary & secondary shifts)
  const conflictCount = currentTeamRoster.filter(slot => {
    const pLeave = isUserOnLeave(slot.primaryUserId, slot.date);
    const sLeave = isUserOnLeave(slot.secondaryUserId, slot.date);
    return Boolean(pLeave || sLeave);
  }).length;

  // Filter users relevant to the workload display
  const relevantUsers = useMemo(() => {
    if (selectedTeam === 'all') return users;
    const teamMembers = users.filter(u => u.teamName === selectedTeam);
    const otherMembers = users.filter(u => u.teamName !== selectedTeam && (
      currentTeamRoster.some(s => s.primaryUserId === u.id || s.secondaryUserId === u.id)
    ));
    return [...teamMembers, ...otherMembers];
  }, [users, selectedTeam, currentTeamRoster]);

  // Shifts count per engineer across 2 duty types: Primary and Secondary
  const shiftsPerUser = relevantUsers.map(u => {
    const primaryCount = currentTeamRoster.filter(s => s.primaryUserId === u.id).length;
    const secondaryCount = currentTeamRoster.filter(s => s.secondaryUserId === u.id).length;
    return {
      user: u,
      primaryCount,
      secondaryCount,
      total: primaryCount + secondaryCount
    };
  });

  const handleExportCSV = () => {
    const headers = ['Date', 'Day', 'Team', 'Primary (10:00-19:30)', 'Secondary (08:00-17:30)', 'Notes'];
    const rows = currentTeamRoster.map(s => [
      s.date,
      s.dayOfWeek,
      s.teamName,
      s.primaryUserName,
      s.secondaryUserName,
      `"${s.notes || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `teamoff_${selectedTeam.toLowerCase().replace(/\s+/g, '_')}_roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="roster-view" className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner & Team Switcher */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Shift & On-Call Roster</h1>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold uppercase tracking-wider border border-indigo-100">
                Team-Based Grouping
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
                2-Shift Schedule (Primary & Secondary)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Standard on-call coverage: <strong>Primary On-Call (10:00 AM – 7:30 PM)</strong> and <strong>Secondary On-Call (8:00 AM – 5:30 PM)</strong>.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {isManager && (
              <button
                id="create-roster-btn"
                onClick={() => setIsCreateRosterOpen(true)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create Roster</span>
              </button>
            )}

            {isManager ? (
              <button
                id="swap-shift-btn"
                onClick={() => {
                  setSwapTargetDate(currentTeamRoster[0]?.date || '2026-08-21');
                  setIsSwapModalOpen(true);
                }}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-600" />
                <span>Swap Shifts</span>
              </button>
            ) : (
              <span className="text-[11px] text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                <Lock className="w-3 h-3" />
                <span>Roster edits restricted to Manager</span>
              </span>
            )}

            <button
              id="export-roster-csv-btn"
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Team Selector Navigation Pills */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Select Team:</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {availableTeams.map(t => {
              const count = roster.filter(s => s.teamName === t).length;
              const isSelected = selectedTeam === t;
              return (
                <button
                  key={t}
                  id={`team-pill-${t.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setSelectedTeam(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <span>{t}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-indigo-700/80 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {count > 0 ? `${count}d` : '0d'}
                  </span>
                </button>
              );
            })}
            <button
              id="team-pill-all"
              onClick={() => setSelectedTeam('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                selectedTeam === 'all'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <span>All Teams</span>
            </button>
          </div>
        </div>
      </div>

      {/* Shift Timing Legend & Definition Badges (Primary & Secondary Only) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-indigo-100 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
              P
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Primary On-Call</div>
              <div className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" />
                <span>10:00 AM – 7:30 PM</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200">
              Tier-1 Incident Lead
            </span>
            <div className="text-[10px] text-slate-400 mt-1">High priority alarms & triage</div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">
              S
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Secondary On-Call</div>
              <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" />
                <span>8:00 AM – 5:30 PM</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200">
              Tier-2 Backup Support
            </span>
            <div className="text-[10px] text-slate-400 mt-1">Standby & pipeline escalation</div>
          </div>
        </div>
      </div>

      {/* Roster Coverage Health Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Team</div>
          <div className="text-xl font-bold text-slate-900 mt-1 truncate">
            {selectedTeam === 'all' ? 'All Teams' : selectedTeam}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {teamManager ? `Lead: ${teamManager.name}` : 'Multi-manager coverage'}
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shift Slots</div>
          <div className="text-xl font-bold text-indigo-600 mt-1">2 Assigned Roles</div>
          <div className="text-xs text-slate-500 mt-0.5">Primary & Secondary On-Call</div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Leave Conflicts</div>
          <div className={`text-xl font-bold mt-1 ${conflictCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {conflictCount} day(s) flagged
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {conflictCount > 0 ? 'Coverage clashes detected' : 'Zero leave conflicts'}
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Team Pool</div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {relevantUsers.length} Members
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{currentTeamRoster.length} schedule slots</div>
        </div>
      </div>

      {/* Monday to Sunday Calendar Board */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        
        {/* Calendar Header with Mon - Sun Columns */}
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">
                {selectedTeam === 'all' ? 'All Teams' : `${selectedTeam} Team`} Shift Matrix (Monday → Sunday)
              </h2>
            </div>

            {/* My Shifts toggle button */}
            <button
              onClick={() => setFilterMyShiftsOnly(!filterMyShiftsOnly)}
              className={`text-xs px-2.5 py-1 rounded-lg font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                filterMyShiftsOnly 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' 
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{filterMyShiftsOnly ? 'Showing: My Shifts Only' : 'Filter: My Shifts'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold flex-wrap">
            <span className="flex items-center gap-1.5 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              <span className="w-2 h-2 rounded bg-indigo-600"></span>
              <span>Primary (10:00–19:30)</span>
            </span>
            <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              <span className="w-2 h-2 rounded bg-emerald-600"></span>
              <span>Secondary (08:00–17:30)</span>
            </span>
          </div>
        </div>

        {/* Empty Roster Prompt */}
        {currentTeamRoster.length === 0 ? (
          <div className="p-12 text-center max-w-md mx-auto space-y-3">
            <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Roster Generated for {selectedTeam}</h3>
            <p className="text-xs text-slate-500">
              There is currently no active roster published for this team group.
            </p>
            {isManager && (
              <button
                onClick={() => setIsCreateRosterOpen(true)}
                className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Create Roster for {selectedTeam}</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* 7-column grid for Monday through Sunday */}
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/80 text-xs font-bold text-center">
              {DAYS_OF_WEEK.map((day, idx) => (
                <div 
                  key={day} 
                  className={`py-3 border-r last:border-r-0 border-slate-100 uppercase tracking-widest text-[10px] ${
                    idx >= 5 ? 'text-indigo-600 font-extrabold' : 'text-slate-500'
                  }`}
                >
                  {day.slice(0, 3)}
                </div>
              ))}
            </div>

            {/* Weeks rows */}
            <div className="divide-y divide-slate-100">
              {weeklyMatrix.map((week, wIdx) => (
                <div key={`week-${wIdx}`} className="grid grid-cols-7 divide-x divide-slate-100 min-h-[140px]">
                  {week.map((slot, dIdx) => {
                    if (!slot) {
                      return (
                        <div key={`empty-${wIdx}-${dIdx}`} className="bg-slate-50/30 p-2.5 text-slate-300">
                          <span className="text-[10px]">—</span>
                        </div>
                      );
                    }

                    const isUserOnThisDate = slot.primaryUserId === currentUser.id || slot.secondaryUserId === currentUser.id;
                    
                    // If filter is on and user is not in this slot, dim it
                    if (filterMyShiftsOnly && !isUserOnThisDate) {
                      return (
                        <div key={slot.date} className="p-2 bg-slate-50/40 opacity-30 text-xs flex flex-col justify-between">
                          <span className="text-[10px] text-slate-400 font-bold">{slot.date.split('-')[2]}</span>
                          <span className="text-[9px] text-slate-400 italic">Off duty</span>
                        </div>
                      );
                    }

                    const primaryLeave = isUserOnLeave(slot.primaryUserId, slot.date);
                    const secondaryLeave = isUserOnLeave(slot.secondaryUserId, slot.date);
                    const hasConflict = Boolean(primaryLeave || secondaryLeave);
                    const isWeekend = dIdx >= 5;

                    return (
                      <div 
                        key={`${slot.date}-${slot.teamName}`} 
                        className={`p-2 flex flex-col justify-between hover:bg-slate-50/90 transition relative group ${
                          isUserOnThisDate ? 'ring-1 ring-indigo-400 bg-indigo-50/10' : ''
                        } ${
                          hasConflict ? 'bg-amber-50/30' : (isWeekend ? 'bg-slate-50/50' : 'bg-white')
                        }`}
                      >
                        {/* Top Date & Edit Button */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                              slot.date === '2026-08-18' ? 'bg-indigo-600 text-white' : (isUserOnThisDate ? 'bg-indigo-100 text-indigo-800' : 'text-slate-700 bg-slate-100')
                            }`}>
                              {slot.date.split('-')[2]}
                            </span>
                            {isUserOnThisDate && (
                              <span className="text-[8px] font-extrabold text-indigo-700 bg-indigo-100 px-1 py-0.2 rounded">
                                YOU
                              </span>
                            )}
                            {slot.isHoliday && (
                              <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1 rounded truncate max-w-[55px]" title={slot.holidayName}>
                                Hol
                              </span>
                            )}
                          </div>

                          {isManager ? (
                            <button
                              onClick={() => setSelectedSlotForEdit(slot)}
                              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition opacity-60 group-hover:opacity-100 cursor-pointer"
                              title="Edit shift assignments"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          ) : null}
                        </div>

                        {/* Conflict Badge */}
                        {hasConflict && (
                          <div className="my-1 px-1.5 py-0.5 bg-rose-50 border border-rose-200 rounded text-[9px] font-bold text-rose-700 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span className="truncate">Leave Conflict</span>
                          </div>
                        )}

                        {/* 2 Shifts Assigned per day: Primary & Secondary */}
                        <div className="space-y-1 my-1">
                          
                          {/* Primary Duty Slot: 10:00 AM - 7:30 PM */}
                          <div className={`p-1.5 border-l-3 rounded-r text-[10px] leading-tight ${
                            primaryLeave 
                              ? 'bg-rose-50 border-rose-500 text-rose-800' 
                              : (slot.primaryUserId === currentUser.id ? 'bg-indigo-100 border-indigo-700 text-indigo-950 font-bold' : 'bg-indigo-50/80 border-indigo-600 text-indigo-900')
                          }`}>
                            <div className="flex items-center justify-between font-bold text-[9px]">
                              <span>P (10–19:30):</span>
                              {primaryLeave && <span className="text-[8px] text-rose-600">Leave</span>}
                            </div>
                            <div className="font-semibold truncate flex items-center gap-1 mt-0.5">
                              {slot.primaryUserAvatar && (
                                <img src={slot.primaryUserAvatar} alt="" className="w-3.5 h-3.5 rounded-full object-cover shrink-0 ring-1 ring-slate-200" />
                              )}
                              <span className="truncate">{slot.primaryUserName.split(' ')[0]} {slot.primaryUserId === currentUser.id ? '(You)' : ''}</span>
                            </div>
                          </div>

                          {/* Secondary Backup Slot: 8:00 AM - 5:30 PM */}
                          <div className={`p-1.5 border-l-3 rounded-r text-[10px] leading-tight ${
                            secondaryLeave 
                              ? 'bg-rose-50 border-rose-500 text-rose-800' 
                              : (slot.secondaryUserId === currentUser.id ? 'bg-emerald-100 border-emerald-700 text-emerald-950 font-bold' : 'bg-emerald-50/80 border-emerald-600 text-emerald-900')
                          }`}>
                            <div className="flex items-center justify-between font-bold text-[9px]">
                              <span>S (08–17:30):</span>
                              {secondaryLeave && <span className="text-[8px] text-rose-600">Leave</span>}
                            </div>
                            <div className="font-semibold truncate flex items-center gap-1 mt-0.5">
                              {slot.secondaryUserAvatar && (
                                <img src={slot.secondaryUserAvatar} alt="" className="w-3.5 h-3.5 rounded-full object-cover shrink-0 ring-1 ring-slate-200" />
                              )}
                              <span className="truncate">{slot.secondaryUserName.split(' ')[0]} {slot.secondaryUserId === currentUser.id ? '(You)' : ''}</span>
                            </div>
                          </div>

                        </div>

                        {/* Shift Footer Indicator */}
                        <div className="text-[8px] text-slate-400 font-medium truncate pt-0.5 flex items-center justify-between">
                          <span>{isWeekend ? 'Weekend On-Call' : 'Standard 2-Tier'}</span>
                          {selectedTeam === 'all' && (
                            <span className="text-[8px] text-slate-500 font-bold">{slot.teamName}</span>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Footer Status Bar */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap justify-between items-center text-[11px] text-slate-600 font-medium gap-2">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-indigo-600 rounded-xs"></span>
                  <span><strong>Primary On-Call:</strong> 10:00 AM – 7:30 PM</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-emerald-600 rounded-xs"></span>
                  <span><strong>Secondary On-Call:</strong> 8:00 AM – 5:30 PM</span>
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-500">Team: <strong>{selectedTeam}</strong></span>
              </div>
              <span className="text-slate-400">Handovers synchronized with Microsoft Teams Webhook</span>
            </div>
          </>
        )}
      </div>

      {/* Duty Distribution by Engineer Table (Primary & Secondary Only) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            {selectedTeam === 'all' ? 'All Engineers' : `${selectedTeam} Team`} Shift Workload Index
          </h3>
          <span className="text-xs text-slate-400">Primary & Secondary rotation count</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {shiftsPerUser.map(item => (
            <div key={item.user.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
              <div className="flex items-center gap-2">
                <img src={item.user.avatar} alt={item.user.name} className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200" />
                <div className="truncate">
                  <div className="font-bold text-slate-800 truncate">{item.user.name.split(' ')[0]}</div>
                  <div className="text-[9px] uppercase font-semibold text-slate-400">{item.user.teamName}</div>
                </div>
              </div>
              <div className="pt-1 text-[10px] text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span className="text-indigo-700 font-medium">Primary:</span>
                  <strong className="text-indigo-700">{item.primaryCount}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-700 font-medium">Secondary:</span>
                  <strong className="text-emerald-700">{item.secondaryCount}</strong>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200 text-[11px]">
                  <span>Total:</span>
                  <span>{item.total} shifts</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <RosterEditModal
        slot={selectedSlotForEdit}
        isOpen={Boolean(selectedSlotForEdit)}
        onClose={() => setSelectedSlotForEdit(null)}
      />

      <ShiftSwapModal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        defaultDate={swapTargetDate}
        defaultTeam={selectedTeam}
      />

      <CreateRosterModal
        isOpen={isCreateRosterOpen}
        onClose={() => setIsCreateRosterOpen(false)}
        defaultTeam={selectedTeam}
      />

    </div>
  );
};
