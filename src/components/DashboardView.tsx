import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertTriangle, 
  ShieldCheck, 
  Users, 
  Plus, 
  Calendar, 
  Shield, 
  UserPlus, 
  ArrowRight, 
  FileText, 
  AlertCircle,
  Sparkles,
  Palmtree,
  Moon
} from 'lucide-react';

interface DashboardViewProps {
  onRequestTimeOff: () => void;
  onRequestOvertime: () => void;
  onNavigateTab: (tab: 'timeoff' | 'roster' | 'overtime' | 'notifications') => void;
  onOpenCreateRoster?: () => void;
  onOpenAddUser?: () => void;
  onOpenManageRoles?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onRequestTimeOff,
  onRequestOvertime,
  onNavigateTab,
  onOpenCreateRoster,
  onOpenAddUser,
  onOpenManageRoles
}) => {
  const { 
    currentUser, 
    leaveBalances, 
    leaveRequests, 
    overtimeRequests, 
    roster, 
    users,
    approveLeaveRequest, 
    rejectLeaveRequest,
    approveOvertimeRequest,
    rejectOvertimeRequest
  } = useApp();

  const isManager = currentUser.role === 'manager';

  // Current date handling
  const today = new Date();
  const year = today.getFullYear();
  const monthStr = String(today.getMonth() + 1).padStart(2, '0');
  const dayStr = String(today.getDate()).padStart(2, '0');
  const todayStr = `${year}-${monthStr}-${dayStr}`;

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(today);

  // Today's shift slot in the active roster
  const todaySlot = roster.find(s => s.date === todayStr);

  // Helper to find user info for a slot
  const getUser = (userId?: string) => users.find(u => u.id === userId);

  // Who is on leave today (approved or pending)
  const onLeaveToday = leaveRequests.filter(req => 
    req.status !== 'rejected' && 
    req.status !== 'cancelled' && 
    todayStr >= req.startDate && 
    todayStr <= req.endDate
  );

  // Manager-specific action items
  const pendingLeaveRequests = leaveRequests.filter(r => r.status === 'pending');
  const pendingOvertimeRequests = overtimeRequests.filter(o => o.status === 'pending');

  // Roster coverage conflicts (anyone on shift who has an active leave)
  const rosterConflictsToday = todaySlot ? [
    { type: 'Primary On-Call', userId: todaySlot.primaryUserId, name: todaySlot.primaryUserName },
    { type: 'Secondary On-Call', userId: todaySlot.secondaryUserId, name: todaySlot.secondaryUserName },
    { type: 'General Shift', userId: todaySlot.generalShiftUserId, name: todaySlot.generalShiftUserName }
  ].filter(duty => duty.userId && onLeaveToday.some(l => l.userId === duty.userId)) : [];

  // Employee-specific upcoming shifts
  const myUpcomingShifts = roster
    .filter(s => 
      s.date >= todayStr && 
      (s.primaryUserId === currentUser.id || s.secondaryUserId === currentUser.id || s.generalShiftUserId === currentUser.id)
    )
    .slice(0, 4);

  const nextShift = myUpcomingShifts[0];

  const getShiftRoleName = (slot: typeof nextShift) => {
    if (!slot) return '';
    if (slot.primaryUserId === currentUser.id) return 'Primary On-Call (10:00 AM – 7:30 PM)';
    if (slot.secondaryUserId === currentUser.id) return 'Secondary On-Call (8:00 AM – 5:30 PM)';
    if (slot.generalShiftUserId === currentUser.id) return 'General Shift (9:00 AM – 6:30 PM)';
    return 'Assigned Shift';
  };

  const getShiftBadge = (slot: typeof nextShift) => {
    if (!slot) return null;
    if (slot.primaryUserId === currentUser.id) {
      return <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">Primary Lead</span>;
    }
    if (slot.secondaryUserId === currentUser.id) {
      return <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">Secondary Backup</span>;
    }
    return <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-100">General Ops</span>;
  };

  // Current employee's personal leave balance (strictly isolated)
  const myBalance = leaveBalances[currentUser.id] || {
    userId: currentUser.id,
    pto: { total: 20, used: 0, pending: 0 },
    sick: { total: 10, used: 0, pending: 0 },
    personal: { total: 5, used: 0, pending: 0 },
    compOff: { total: 0, used: 0, pending: 0 },
    floatingHoliday: { total: 2, used: 0, pending: 0 }
  };

  const myLeaveRequests = leaveRequests.filter(r => r.userId === currentUser.id);

  return (
    <div id="dashboard-view" className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Welcome Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-500">{todayFormatted}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
              {currentUser.teamName || 'Engineering'}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
              isManager ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-slate-100 text-slate-700'
            }`}>
              Role: {currentUser.role}
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
            Welcome, {currentUser.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isManager 
              ? 'Shift operations dashboard with pending approvals queue and team availability.'
              : 'Your shift schedule status, team on-duty coverage, and personal leave quota.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {isManager && onOpenCreateRoster && (
            <button
              id="dash-create-roster-btn"
              onClick={onOpenCreateRoster}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>+ Create Roster</span>
            </button>
          )}

          {isManager && onOpenAddUser && (
            <button
              id="dash-add-employee-btn"
              onClick={onOpenAddUser}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
              <span>+ Add Employee</span>
            </button>
          )}

          {isManager && onOpenManageRoles && (
            <button
              id="dash-manage-roles-btn"
              onClick={onOpenManageRoles}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              <span>Manage Roles</span>
            </button>
          )}

          <button
            id="dash-request-leave-btn"
            onClick={onRequestTimeOff}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-100 transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Request Leave</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EMPLOYEE VIEW: "When is your shift going to start" Card */}
      {/* ========================================================================= */}
      {!isManager && (
        <section className="bg-gradient-to-r from-indigo-50/70 via-white to-indigo-50/40 rounded-2xl p-6 border border-indigo-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-indigo-950 uppercase tracking-wider">
                  When Is Your Shift Going to Start?
                </h2>
                <p className="text-xs text-indigo-600/80">Your upcoming scheduled duty slot from the team roster</p>
              </div>
            </div>
            {nextShift && getShiftBadge(nextShift)}
          </div>

          {nextShift ? (
            <div className="bg-white rounded-xl p-5 border border-indigo-100 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                    {nextShift.date === todayStr ? '🟢 Today’s Active Duty' : '📅 Next Assigned Date'}
                  </span>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">
                    {nextShift.date === todayStr ? 'Today' : nextShift.date} ({nextShift.dayOfWeek})
                  </div>
                  <div className="text-xs font-semibold text-indigo-600 mt-0.5">
                    {getShiftRoleName(nextShift)}
                  </div>
                </div>

                <div className="text-right sm:text-right">
                  <span className="text-xs font-semibold text-slate-500 block">Shift Timing:</span>
                  <span className="text-xs font-bold text-slate-800">
                    {nextShift.primaryUserId === currentUser.id && '10:00 AM – 7:30 PM'}
                    {nextShift.secondaryUserId === currentUser.id && '8:00 AM – 5:30 PM'}
                    {nextShift.generalShiftUserId === currentUser.id && '9:00 AM – 6:30 PM'}
                  </span>
                </div>
              </div>

              {/* Upcoming shift schedule preview list */}
              {myUpcomingShifts.length > 1 && (
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Subsequent Shifts Assigned to You:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {myUpcomingShifts.slice(1, 4).map(slot => (
                      <div key={slot.date} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                        <div className="font-bold text-slate-800">{slot.date} ({slot.dayOfWeek.slice(0, 3)})</div>
                        <div className="text-[11px] text-indigo-600 font-medium truncate mt-0.5">
                          {getShiftRoleName(slot)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-5 border border-slate-100 text-center text-xs text-slate-500">
              You do not have any upcoming shifts scheduled in the active roster. Check back once the manager updates the schedule.
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: Who is on the shift for Today */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span>Who Is On Shift Today</span>
              <span className="text-[11px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 normal-case">
                {todayFormatted}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Active primary, secondary, and general shift roster assignments for the entire team
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('roster')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>Full Team Roster</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todaySlot ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Primary Shift */}
            {(() => {
              const u = getUser(todaySlot.primaryUserId);
              const isMe = todaySlot.primaryUserId === currentUser.id;
              const hasLeaveConflict = onLeaveToday.some(l => l.userId === todaySlot.primaryUserId);

              return (
                <div className={`p-4 rounded-xl border transition ${
                  isMe ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-50/70 border-slate-200/80'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                      Primary On-Call
                    </span>
                    <span className="text-[11px] font-bold text-indigo-600">10:00 AM – 7:30 PM</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <img 
                      src={todaySlot.primaryUserAvatar || u?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                      alt={todaySlot.primaryUserName} 
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="truncate">{todaySlot.primaryUserName}</span>
                        {isMe && <span className="text-[10px] text-indigo-600 font-extrabold">(You)</span>}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {u?.teamName ? `Team: ${u.teamName}` : 'Operations'}
                      </div>
                    </div>
                  </div>

                  {hasLeaveConflict && (
                    <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>On approved leave today! Coverage handover required.</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Secondary Shift */}
            {(() => {
              const u = getUser(todaySlot.secondaryUserId);
              const isMe = todaySlot.secondaryUserId === currentUser.id;
              const hasLeaveConflict = onLeaveToday.some(l => l.userId === todaySlot.secondaryUserId);

              return (
                <div className={`p-4 rounded-xl border transition ${
                  isMe ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50/70 border-slate-200/80'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                      Secondary On-Call
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600">8:00 AM – 5:30 PM</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <img 
                      src={todaySlot.secondaryUserAvatar || u?.avatar || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'} 
                      alt={todaySlot.secondaryUserName} 
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="truncate">{todaySlot.secondaryUserName}</span>
                        {isMe && <span className="text-[10px] text-emerald-600 font-extrabold">(You)</span>}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {u?.teamName ? `Team: ${u.teamName}` : 'Operations'}
                      </div>
                    </div>
                  </div>

                  {hasLeaveConflict && (
                    <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>On leave today! Standby replacement needed.</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* General Shift */}
            {(() => {
              const u = getUser(todaySlot.generalShiftUserId);
              const isMe = todaySlot.generalShiftUserId === currentUser.id;
              const hasLeaveConflict = todaySlot.generalShiftUserId && onLeaveToday.some(l => l.userId === todaySlot.generalShiftUserId);

              return (
                <div className={`p-4 rounded-xl border transition ${
                  isMe ? 'bg-sky-50/50 border-sky-200' : 'bg-slate-50/70 border-slate-200/80'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-sky-100 text-sky-700">
                      General Shift
                    </span>
                    <span className="text-[11px] font-bold text-sky-600">9:00 AM – 6:30 PM</span>
                  </div>

                  {todaySlot.generalShiftUserName ? (
                    <div className="flex items-center gap-3">
                      <img 
                        src={todaySlot.generalShiftUserAvatar || u?.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150'} 
                        alt={todaySlot.generalShiftUserName} 
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span className="truncate">{todaySlot.generalShiftUserName}</span>
                          {isMe && <span className="text-[10px] text-sky-600 font-extrabold">(You)</span>}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {u?.teamName ? `Team: ${u.teamName}` : 'Operations'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic py-2">
                      Weekend Standby (General Shift not scheduled on weekends)
                    </div>
                  )}

                  {hasLeaveConflict && (
                    <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>On leave today.</span>
                    </div>
                  )}
                </div>
              );
            })()}

          </div>
        ) : (
          <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center space-y-3">
            <p className="text-xs text-slate-500">No shift roster scheduled for today ({todayStr}).</p>
            {isManager && onOpenCreateRoster && (
              <button
                onClick={onOpenCreateRoster}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition"
              >
                + Create Roster Now
              </button>
            )}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: Who is on Leave Today */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Palmtree className="w-4 h-4 text-emerald-600" />
              <span>Who Is On Leave Today</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Team members currently on approved time-off or leave
            </p>
          </div>

          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            onLeaveToday.length > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            {onLeaveToday.length} Out of Office
          </span>
        </div>

        {onLeaveToday.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {onLeaveToday.map(req => {
              const u = getUser(req.userId);
              return (
                <div key={req.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center gap-3">
                    <img src={req.userAvatar} alt={req.userName} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">{req.userName}</div>
                      <div className="text-[10px] text-slate-400">{u?.teamName || 'Engineering'}</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-200/50">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700 uppercase text-[10px]">{req.type}</span>
                      <span className="text-indigo-600 text-[11px]">{req.startDate} → {req.endDate}</span>
                    </div>
                    {req.reason && (
                      <div className="text-[11px] text-slate-500 italic truncate">
                        "{req.reason}"
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center gap-3 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>No team members are on leave today. Full team is available!</span>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: Action Required by Manager (ONLY FOR MANAGER) */}
      {/* ========================================================================= */}
      {isManager && (
        <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Action Required by Manager</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pending leave requests, overtime reviews, and team roster actions requiring your attention
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                (pendingLeaveRequests.length + pendingOvertimeRequests.length) > 0
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {pendingLeaveRequests.length + pendingOvertimeRequests.length} Pending Actions
              </span>
            </div>
          </div>

          {/* Pending Leave Requests */}
          {pendingLeaveRequests.length > 0 ? (
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Leave Requests Awaiting Approval ({pendingLeaveRequests.length})</span>
                <button
                  onClick={() => onNavigateTab('timeoff')}
                  className="text-[11px] text-indigo-600 hover:underline font-semibold"
                >
                  View All in Time-Off
                </button>
              </div>

              <div className="space-y-2.5">
                {pendingLeaveRequests.map(req => {
                  const u = getUser(req.userId);
                  return (
                    <div 
                      key={req.id} 
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img src={req.userAvatar} alt={req.userName} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                            <span>{req.userName}</span>
                            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                              {req.type}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Team: <strong>{u?.teamName || 'Engineering'}</strong> • {req.startDate} to {req.endDate} ({req.daysCount} days)
                          </div>
                          {req.reason && (
                            <div className="text-[11px] text-slate-600 italic mt-0.5">
                              "{req.reason}"
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => rejectLeaveRequest(req.id, 'Declined due to coverage constraints.')}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-lg transition border border-slate-200 flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5 text-slate-500" />
                          <span>Deny</span>
                        </button>
                        <button
                          onClick={() => approveLeaveRequest(req.id, 'Approved by Manager.')}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-2xs flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Pending Overtime Requests */}
          {pendingOvertimeRequests.length > 0 ? (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Overtime Logs Awaiting Verification ({pendingOvertimeRequests.length})</span>
                <button
                  onClick={() => onNavigateTab('overtime')}
                  className="text-[11px] text-indigo-600 hover:underline font-semibold"
                >
                  View All in Overtime
                </button>
              </div>

              <div className="space-y-2.5">
                {pendingOvertimeRequests.map(ot => {
                  const u = getUser(ot.userId);
                  return (
                    <div 
                      key={ot.id} 
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img src={ot.userAvatar} alt={ot.userName} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {ot.userName} • {ot.totalHours} hrs ({ot.shiftType})
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Team: {u?.teamName || 'Engineering'} • Date: {ot.date} ({ot.startTime} - {ot.endTime})
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            Task: "{ot.taskDescription}"
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => rejectOvertimeRequest(ot.id, 'Declined.')}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-lg transition border border-slate-200"
                        >
                          Deny
                        </button>
                        <button
                          onClick={() => approveOvertimeRequest(ot.id, 'Approved.')}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-2xs"
                        >
                          Approve ({ot.earnedCompOffDays > 0 ? `+${ot.earnedCompOffDays}d Comp` : 'Logged'})
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Roster Conflict Alerts */}
          {rosterConflictsToday.length > 0 && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-950">Active Roster Clash:</strong> Team member scheduled on duty today is currently on leave.
                <div className="mt-1 flex items-center gap-2">
                  <button
                    onClick={() => onNavigateTab('roster')}
                    className="underline font-bold text-amber-900 hover:text-amber-950"
                  >
                    Open Roster to Swap Shift
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Clean state when no pending actions */}
          {pendingLeaveRequests.length === 0 && pendingOvertimeRequests.length === 0 && rosterConflictsToday.length === 0 && (
            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>All caught up! No pending leave requests or overtime approvals waiting for review.</span>
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: EMPLOYEE PERSONAL DATA ONLY (Leave Quota & Personal Requests) */}
      {/* ========================================================================= */}
      {!isManager && (
        <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                My Leave Balance & Personal Quotas
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Strictly your personal leave entitlements and requests
              </p>
            </div>

            <button
              onClick={onRequestTimeOff}
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <span>Request Leave</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Personal Leave Quota Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Annual PTO</div>
              <div className="text-base font-bold text-indigo-600 mt-1">
                {myBalance.pto.total - myBalance.pto.used - myBalance.pto.pending}d
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{myBalance.pto.used} used of {myBalance.pto.total}d</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Sick Leave</div>
              <div className="text-base font-bold text-amber-600 mt-1">
                {myBalance.sick.total - myBalance.sick.used - myBalance.sick.pending}d
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{myBalance.sick.used} used of {myBalance.sick.total}d</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Personal</div>
              <div className="text-base font-bold text-teal-600 mt-1">
                {myBalance.personal.total - myBalance.personal.used - myBalance.personal.pending}d
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Total: {myBalance.personal.total}d</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Comp-Off Bank</div>
              <div className="text-base font-bold text-purple-600 mt-1">
                {myBalance.compOff.total}d
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">From overtime</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Floating Hol.</div>
              <div className="text-base font-bold text-blue-600 mt-1">
                {myBalance.floatingHoliday.total - myBalance.floatingHoliday.used}d
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Total: {myBalance.floatingHoliday.total}d</div>
            </div>
          </div>

          {/* My Recent Requests */}
          {myLeaveRequests.length > 0 ? (
            <div className="pt-2">
              <div className="text-xs font-bold text-slate-700 mb-2">My Submitted Requests:</div>
              <div className="space-y-2">
                {myLeaveRequests.map(r => (
                  <div key={r.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800 uppercase">{r.type}</span>
                      <span className="text-slate-500 ml-2">{r.startDate} → {r.endDate} ({r.daysCount} days)</span>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                      r.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      r.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic pt-1">
              You haven't submitted any leave requests yet.
            </div>
          )}
        </section>
      )}

    </div>
  );
};
