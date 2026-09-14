import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OvertimeRequest } from '../types';
import { 
  Moon, 
  Plus, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Tag, 
  Calendar,
  Filter,
  Search,
  ShieldCheck,
  Award
} from 'lucide-react';

interface OvertimeViewProps {
  onRequestOvertime: () => void;
}

export const OvertimeView: React.FC<OvertimeViewProps> = ({ onRequestOvertime }) => {
  const { 
    currentUser, 
    overtimeRequests, 
    approveOvertimeRequest, 
    rejectOvertimeRequest 
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [managerNotes, setManagerNotes] = useState<Record<string, string>>({});

  const isManager = currentUser.role === 'manager';

  // Role filtering: Employee sees only their own logs; Manager sees all
  const baseOT = isManager 
    ? overtimeRequests 
    : overtimeRequests.filter(ot => ot.userId === currentUser.id);

  const filteredOT = baseOT.filter(ot => {
    if (statusFilter !== 'all' && ot.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = ot.userName.toLowerCase().includes(q);
      const matchDesc = ot.taskDescription.toLowerCase().includes(q);
      const matchTicket = ot.ticketReference?.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchTicket) return false;
    }
    return true;
  });

  const pendingOT = baseOT.filter(o => o.status === 'pending');

  // Stats for the viewed scope
  const totalApprovedHours = baseOT
    .filter(o => o.status === 'approved')
    .reduce((sum, o) => sum + o.totalHours, 0);

  const compOffEarnedDays = baseOT
    .filter(o => o.status === 'approved')
    .reduce((sum, o) => {
      const days = o.totalHours > 5 ? 1.0 : (o.earnedCompOffDays || (o.totalHours >= 2.5 ? 0.5 : o.totalHours / 8));
      return sum + days;
    }, 0);

  return (
    <div id="overtime-management-view" className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">After-Working Hours & Comp-Off Log</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 font-bold uppercase tracking-wider border border-indigo-100 flex items-center gap-1">
              <Moon className="w-3 h-3 text-indigo-600" />
              <span>Comp-Off System</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isManager 
              ? 'Review and authorize after-working hours logs. Working > 5 hours automatically grants 1 Full Day Off (1.0d comp-off).'
              : 'Log your evening on-call, incident triage & weekend support hours. Shifts > 5 hours earn 1 Full Day Off credit.'}
          </p>
        </div>

        <button
          id="log-afteroffice-shift-btn"
          onClick={onRequestOvertime}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Log After-Working Hours</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {isManager ? 'Team Approved Hours' : 'My Approved Hours'}
            </span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalApprovedHours} hrs</div>
          <div className="text-xs text-slate-400">Total authorized after-office duty</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {isManager ? 'Total Comp-Off Generated' : 'Comp-Off Earned'}
            </span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-600">{Math.round(compOffEarnedDays * 10) / 10} days</div>
          <div className="text-xs text-slate-400">&gt; 5 hrs shifts = 1.0 Day Off each</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pending Review</span>
            <Moon className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{pendingOT.length} logs</div>
          <div className="text-xs text-slate-400">
            {isManager ? 'Awaiting your approval' : 'Awaiting manager approval'}
          </div>
        </div>
      </div>

      {/* Pending Overtime Approvals (Managers see review buttons; Employees see status) */}
      {pendingOT.length > 0 && (
        <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Pending After-Working Hours ({pendingOT.length})</span>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isManager ? 'Review hours and approve comp-off balance credits' : 'Your submitted logs waiting for manager signoff'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingOT.map(ot => {
              const compCredit = ot.totalHours > 5 ? '1.0 Day Off (>5h rule)' : `${ot.earnedCompOffDays || 0.5} Day Off`;
              return (
                <div key={ot.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition space-y-2.5 text-xs">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <img src={ot.userAvatar} alt={ot.userName} className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200" />
                      <div>
                        <div className="font-bold text-slate-900">{ot.userName}</div>
                        <div className="text-[10px] text-slate-400">
                          {ot.date} • {ot.startTime} to {ot.endTime} ({ot.totalHours} hrs)
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 font-bold uppercase rounded text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {compCredit}
                    </span>
                  </div>

                  <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-100">
                    "{ot.taskDescription}"
                    {ot.ticketReference && (
                      <span className="block text-[10px] text-indigo-600 font-bold mt-1">
                        Ref Tag: {ot.ticketReference}
                      </span>
                    )}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                    <span>Worked: <strong className="text-slate-900">{ot.totalHours} hrs</strong></span>
                    <span>Benefit: <strong className="text-indigo-600">Comp-Off Bank</strong></span>
                  </div>

                  {isManager ? (
                    <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Approval note (optional)..."
                        value={managerNotes[ot.id] || ''}
                        onChange={(e) => setManagerNotes({ ...managerNotes, [ot.id]: e.target.value })}
                        className="flex-1 text-xs border border-slate-200 rounded-lg px-2.5 py-1 bg-white"
                      />
                      <button
                        onClick={() => rejectOvertimeRequest(ot.id, managerNotes[ot.id])}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 rounded-lg border border-slate-200"
                      >
                        Deny
                      </button>
                      <button
                        onClick={() => approveOvertimeRequest(ot.id, managerNotes[ot.id] || 'Authorized.')}
                        className="px-3.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-amber-700 font-medium">
                      <span>Status: Awaiting Manager Approval</span>
                      <span className="text-[10px] text-slate-400">Comp-off will be credited upon approval</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={isManager ? "Search by engineer, task description, or ticket ID..." : "Search your task description or ticket ID..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-xl pl-9 pr-3 py-2 bg-slate-50 focus:bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white text-slate-700"
          >
            <option value="all">All Logs</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* History Log Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            {isManager ? 'Team After-Working Hours Records' : 'My After-Working Hours Records'} ({filteredOT.length})
          </h3>
          <span className="text-xs text-slate-400">&gt;5 Hours = 1 Full Day Comp-Off</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredOT.length > 0 ? (
            filteredOT.map(ot => {
              const compCredit = ot.totalHours > 5 ? '1.0 Day Off' : `${ot.earnedCompOffDays || (ot.totalHours >= 2.5 ? 0.5 : Math.round((ot.totalHours/8)*10)/10)} Day Off`;
              return (
                <div key={ot.id} className="p-4 hover:bg-slate-50/80 transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start gap-3 min-w-[280px]">
                    <img src={ot.userAvatar} alt={ot.userName} className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{ot.userName}</span>
                        <span className="px-2 py-0.2 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-900 border border-indigo-200">
                          {ot.shiftType.replace('_', ' ')}
                        </span>
                        {ot.totalHours > 5 && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                            &gt;5h (1 Day Off)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {ot.date} • {ot.startTime} to {ot.endTime} (<strong>{ot.totalHours} hrs worked</strong>)
                      </div>
                      <p className="text-slate-600 text-xs mt-1 max-w-lg">
                        "{ot.taskDescription}"
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      <span>Earns: <strong className="text-indigo-700">{compCredit}</strong></span>
                    </div>
                    {ot.ticketReference && (
                      <div className="text-[11px] text-indigo-600 font-mono">
                        Ref: {ot.ticketReference}
                      </div>
                    )}
                    {ot.reviewedByName && (
                      <div className="text-[10px] text-slate-400">
                        Authorized by {ot.reviewedByName}
                      </div>
                    )}
                  </div>

                  <div className="self-end md:self-center shrink-0">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg ${
                      ot.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      ot.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {ot.status}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No after-working hours records found for this filter.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

