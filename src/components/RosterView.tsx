import React, { useState } from 'react';
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
  Plus
} from 'lucide-react';
import { RosterEditModal } from './Modals/RosterEditModal';
import { ShiftSwapModal } from './Modals/ShiftSwapModal';
import { CreateRosterModal } from './Modals/CreateRosterModal';

export const RosterView: React.FC = () => {
  const { roster, users, leaveRequests, currentUser } = useApp();
  
  const [selectedSlotForEdit, setSelectedSlotForEdit] = useState<DailyRosterSlot | null>(null);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [isCreateRosterOpen, setIsCreateRosterOpen] = useState(false);
  const [swapTargetDate, setSwapTargetDate] = useState<string | undefined>(undefined);
  const [filterMyShiftsOnly, setFilterMyShiftsOnly] = useState(false);

  const isManager = currentUser.role === 'manager';

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
    if (roster.length === 0) return [];

    const sorted = [...roster].sort((a, b) => a.date.localeCompare(b.date));
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

  const activePeriodTitle = roster.length > 0
    ? new Date(roster[0].date + 'T00:00:00').toLocaleDateString('default', { month: 'long', year: 'numeric' })
    : 'Team Roster';

  // Count total clashes in roster (across primary, secondary, and general shift)
  const conflictCount = roster.filter(slot => {
    const pLeave = isUserOnLeave(slot.primaryUserId, slot.date);
    const sLeave = isUserOnLeave(slot.secondaryUserId, slot.date);
    const gLeave = isUserOnLeave(slot.generalShiftUserId, slot.date);
    return Boolean(pLeave || sLeave || gLeave);
  }).length;

  // Shifts count per engineer across all 3 duty types
  const shiftsPerUser = users.map(u => {
    const primaryCount = roster.filter(s => s.primaryUserId === u.id).length;
    const secondaryCount = roster.filter(s => s.secondaryUserId === u.id).length;
    const generalCount = roster.filter(s => s.generalShiftUserId === u.id).length;
    return {
      user: u,
      primaryCount,
      secondaryCount,
      generalCount,
      total: primaryCount + secondaryCount + generalCount
    };
  });

  const handleExportCSV = () => {
    const headers = ['Date', 'Day', 'Primary (10:00-19:30)', 'Secondary (08:00-17:30)', 'General (09:00-18:30)', 'Notes'];
    const rows = roster.map(s => [
      s.date,
      s.dayOfWeek,
      s.primaryUserName,
      s.secondaryUserName,
      s.generalShiftUserName || 'N/A',
      `"${s.notes || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'teamoff_august_2026_roster.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="roster-view" className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Shift & On-Call Roster</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold uppercase tracking-wider border border-indigo-100">
              Monday → Sunday Grid
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
              3 Shift Schedule
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Standard duty coverage with defined shift hours: <strong>Primary (10:00 AM – 7:30 PM)</strong>, <strong>Secondary (8:00 AM – 5:30 PM)</strong>, and <strong>General Shift (9:00 AM – 6:30 PM)</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isManager && (
            <button
              id="create-roster-btn"
              onClick={() => setIsCreateRosterOpen(true)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Roster</span>
            </button>
          )}

          {isManager ? (
            <button
              id="swap-shift-btn"
              onClick={() => {
                setSwapTargetDate(roster[0]?.date || '2026-08-21');
                setIsSwapModalOpen(true);
              }}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-2xs"
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
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Shift Timing Legend & Definition Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
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
          <span className="text-[10px] uppercase font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200">
            Tier-1 Lead
          </span>
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
          <span className="text-[10px] uppercase font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200">
            Tier-2 Backup
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-sky-100 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 font-bold text-xs">
              G
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">General Shift</div>
              <div className="text-[11px] text-sky-600 font-semibold flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" />
                <span>9:00 AM – 6:30 PM</span>
              </div>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md border border-sky-200">
            Core Ops
          </span>
        </div>
      </div>

      {/* Roster Coverage Health Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Period</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{activePeriodTitle}</div>
          <div className="text-xs text-slate-500 mt-0.5">{roster.length} Days Mon-Sun Calendar</div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shift Slots</div>
          <div className="text-xl font-bold text-indigo-600 mt-1">3 Assigned Roles</div>
          <div className="text-xs text-slate-500 mt-0.5">Primary, Secondary & General</div>
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
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Staff Pool</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{users.length} Team Members</div>
          <div className="text-xs text-slate-500 mt-0.5">Manager + Employees</div>
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
                {activePeriodTitle} Shift Matrix (Monday → Sunday)
              </h2>
            </div>

            {/* My Shifts toggle button */}
            <button
              onClick={() => setFilterMyShiftsOnly(!filterMyShiftsOnly)}
              className={`text-xs px-2.5 py-1 rounded-lg font-semibold border transition flex items-center gap-1.5 ${
                filterMyShiftsOnly 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' 
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{filterMyShiftsOnly ? 'Showing: My Shifts Only' : 'Filter: My Shifts'}</span>
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold flex-wrap">
            <span className="flex items-center gap-1 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
              <span className="w-2 h-2 rounded bg-indigo-600"></span>
              <span>Primary (10:00-19:30)</span>
            </span>
            <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              <span className="w-2 h-2 rounded bg-emerald-600"></span>
              <span>Secondary (08:00-17:30)</span>
            </span>
            <span className="flex items-center gap-1 text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
              <span className="w-2 h-2 rounded bg-sky-600"></span>
              <span>General (09:00-18:30)</span>
            </span>
          </div>
        </div>

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
            <div key={`week-${wIdx}`} className="grid grid-cols-7 divide-x divide-slate-100 min-h-[160px]">
              {week.map((slot, dIdx) => {
                if (!slot) {
                  return (
                    <div key={`empty-${wIdx}-${dIdx}`} className="bg-slate-50/30 p-2.5 text-slate-300">
                      <span className="text-[10px]">—</span>
                    </div>
                  );
                }

                const isUserOnThisDate = slot.primaryUserId === currentUser.id || slot.secondaryUserId === currentUser.id || slot.generalShiftUserId === currentUser.id;
                
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
                const generalLeave = isUserOnLeave(slot.generalShiftUserId, slot.date);
                const hasConflict = Boolean(primaryLeave || secondaryLeave || generalLeave);
                const isWeekend = dIdx >= 5;

                return (
                  <div 
                    key={slot.date} 
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
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition opacity-60 group-hover:opacity-100"
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

                    {/* 3 Shifts Assigned per day */}
                    <div className="space-y-1 my-1">
                      
                      {/* Primary Duty Slot: 10:00 AM - 7:30 PM */}
                      <div className={`p-1 border-l-3 rounded-r text-[10px] leading-tight ${
                        primaryLeave 
                          ? 'bg-rose-50 border-rose-500 text-rose-800' 
                          : (slot.primaryUserId === currentUser.id ? 'bg-indigo-100 border-indigo-700 text-indigo-950 font-bold' : 'bg-indigo-50/80 border-indigo-600 text-indigo-900')
                      }`}>
                        <div className="flex items-center justify-between font-bold text-[9px]">
                          <span>P (10-19:30):</span>
                          {primaryLeave && <span className="text-[8px] text-rose-600">Leave</span>}
                        </div>
                        <div className="font-semibold truncate flex items-center gap-1 mt-0.5">
                          <img src={slot.primaryUserAvatar} alt="" className="w-3 h-3 rounded-full object-cover shrink-0 ring-1 ring-slate-200" />
                          <span className="truncate">{slot.primaryUserName.split(' ')[0]} {slot.primaryUserId === currentUser.id ? '(You)' : ''}</span>
                        </div>
                      </div>

                      {/* Secondary Backup Slot: 8:00 AM - 5:30 PM */}
                      <div className={`p-1 border-l-3 rounded-r text-[10px] leading-tight ${
                        secondaryLeave 
                          ? 'bg-rose-50 border-rose-500 text-rose-800' 
                          : (slot.secondaryUserId === currentUser.id ? 'bg-emerald-100 border-emerald-700 text-emerald-950 font-bold' : 'bg-emerald-50/80 border-emerald-600 text-emerald-900')
                      }`}>
                        <div className="flex items-center justify-between font-bold text-[9px]">
                          <span>S (08-17:30):</span>
                          {secondaryLeave && <span className="text-[8px] text-rose-600">Leave</span>}
                        </div>
                        <div className="font-semibold truncate flex items-center gap-1 mt-0.5">
                          <img src={slot.secondaryUserAvatar} alt="" className="w-3 h-3 rounded-full object-cover shrink-0 ring-1 ring-slate-200" />
                          <span className="truncate">{slot.secondaryUserName.split(' ')[0]} {slot.secondaryUserId === currentUser.id ? '(You)' : ''}</span>
                        </div>
                      </div>

                      {/* General Shift Slot: 9:00 AM - 6:30 PM */}
                      {slot.generalShiftUserName ? (
                        <div className={`p-1 border-l-3 rounded-r text-[10px] leading-tight ${
                          generalLeave 
                            ? 'bg-rose-50 border-rose-500 text-rose-800' 
                            : (slot.generalShiftUserId === currentUser.id ? 'bg-sky-100 border-sky-700 text-sky-950 font-bold' : 'bg-sky-50/80 border-sky-600 text-sky-900')
                        }`}>
                          <div className="flex items-center justify-between font-bold text-[9px]">
                            <span>G (09-18:30):</span>
                            {generalLeave && <span className="text-[8px] text-rose-600">Leave</span>}
                          </div>
                          <div className="font-semibold truncate flex items-center gap-1 mt-0.5">
                            <img src={slot.generalShiftUserAvatar} alt="" className="w-3 h-3 rounded-full object-cover shrink-0 ring-1 ring-slate-200" />
                            <span className="truncate">{slot.generalShiftUserName.split(' ')[0]} {slot.generalShiftUserId === currentUser.id ? '(You)' : ''}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-0.5 text-[9px] text-slate-400 italic">
                          Weekend Standby
                        </div>
                      )}
                    </div>

                    {/* Shift Footer Indicator */}
                    <div className="text-[8px] text-slate-400 font-medium truncate pt-0.5">
                      {isWeekend ? 'Weekend 24/7' : 'Standard 3-Tier'}
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
              <span><strong>Primary:</strong> 10:00 AM – 7:30 PM</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-600 rounded-xs"></span>
              <span><strong>Secondary:</strong> 8:00 AM – 5:30 PM</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-sky-600 rounded-xs"></span>
              <span><strong>General:</strong> 9:00 AM – 6:30 PM</span>
            </span>
          </div>
          <span className="text-slate-400">Shift Handover synchronized with Teams Webhook</span>
        </div>
      </div>

      {/* Duty Distribution by Engineer Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Monthly Shift Distribution & Workload Index
          </h3>
          <span className="text-xs text-slate-400">Includes Primary, Secondary, and General shifts</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {shiftsPerUser.map(item => (
            <div key={item.user.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
              <div className="flex items-center gap-2">
                <img src={item.user.avatar} alt={item.user.name} className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200" />
                <div className="truncate">
                  <div className="font-bold text-slate-800 truncate">{item.user.name.split(' ')[0]}</div>
                  <div className="text-[9px] uppercase font-semibold text-slate-400">{item.user.role}</div>
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
                <div className="flex justify-between">
                  <span className="text-sky-700 font-medium">General:</span>
                  <strong className="text-sky-700">{item.generalCount}</strong>
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
      />

      <CreateRosterModal
        isOpen={isCreateRosterOpen}
        onClose={() => setIsCreateRosterOpen(false)}
      />

    </div>
  );
};
