import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LeaveType, RequestStatus } from '../types';
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  UserCheck, 
  ShieldAlert, 
  MessageSquare,
  Sparkles,
  FileText
} from 'lucide-react';

interface TimeOffViewProps {
  onRequestTimeOff: () => void;
  onOpenTeamsCard: (leaveId?: string) => void;
}

export const TimeOffView: React.FC<TimeOffViewProps> = ({ onRequestTimeOff, onOpenTeamsCard }) => {
  const { 
    currentUser, 
    leaveRequests, 
    leaveBalances, 
    users, 
    approveLeaveRequest, 
    rejectLeaveRequest, 
    cancelLeaveRequest 
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [managerFeedbackNote, setManagerFeedbackNote] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'requests' | 'balances_matrix'>('requests');

  const isManager = currentUser.role === 'manager';

  // Role filtering: Employee sees only their own requests; Manager sees all
  const baseRequests = isManager 
    ? leaveRequests 
    : leaveRequests.filter(req => req.userId === currentUser.id);

  // Filter requests
  const filteredRequests = baseRequests.filter(req => {
    if (statusFilter !== 'all' && req.status !== statusFilter) return false;
    if (typeFilter !== 'all' && req.type !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = req.userName.toLowerCase().includes(q);
      const matchReason = req.reason.toLowerCase().includes(q);
      if (!matchName && !matchReason) return false;
    }
    return true;
  });

  const pendingRequests = isManager ? leaveRequests.filter(r => r.status === 'pending') : [];

  const handleApprove = (id: string) => {
    const note = managerFeedbackNote[id] || 'Approved. Coverage noted.';
    approveLeaveRequest(id, note);
  };

  const handleReject = (id: string) => {
    const note = managerFeedbackNote[id] || 'Declined due to team coverage constraints.';
    rejectLeaveRequest(id, note);
  };

  return (
    <div id="timeoff-management-view" className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Time-Off & Leave Management</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold uppercase tracking-wider border border-indigo-100">
              Approval Workflows
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Submit leave requests, review team time-off, and track team leave balance allocations in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Sub-view toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'requests' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {isManager ? 'Requests & Approvals' : 'My Leave Requests'}
            </button>
            <button
              onClick={() => setActiveTab('balances_matrix')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'balances_matrix' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {isManager ? 'Team Balances Matrix' : 'My Leave Quotas'}
            </button>
          </div>

          <button
            id="open-request-timeoff-modal-btn"
            onClick={onRequestTimeOff}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Request Leave</span>
          </button>
        </div>
      </div>

      {activeTab === 'requests' ? (
        <>
          {/* Manager Approvals Queue (Highlighted when user is manager & pending items exist) */}
          {isManager && pendingRequests.length > 0 && (
            <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                    Pending Approvals Queue ({pendingRequests.length})
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    You are logged in as Manager. Approve or deny below with optional handover feedback.
                  </p>
                </div>

                <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span>Teams notification active</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {pendingRequests.map(req => (
                  <div key={req.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={req.userAvatar} 
                          alt={req.userName} 
                          className="w-9 h-9 rounded-full object-cover" 
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">{req.userName}</div>
                          <div className="text-[10px] text-slate-400">{req.userRole}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-100 text-indigo-700">
                          {req.type}
                        </span>
                        <button
                          onClick={() => onOpenTeamsCard(req.id)}
                          title="Preview in MS Teams Card"
                          className="p-1 text-[#5B5FC7] hover:bg-[#5B5FC7]/10 rounded transition"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Dates & Reason */}
                    <div className="bg-white p-3 rounded-lg border border-slate-100 text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <span>Duration: {req.daysCount} day(s) {req.isHalfDay ? `(Half-day: ${req.halfDayPeriod})` : ''}</span>
                        <span className="text-indigo-600">{req.startDate} → {req.endDate}</span>
                      </div>
                      <div className="text-slate-600 text-[11px]">
                        <strong>Reason:</strong> "{req.reason}"
                      </div>
                      {req.coverageHandoverUserName && (
                        <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Handover Backup: <strong>{req.coverageHandoverUserName}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Conflict Alert Banner */}
                    {req.hasRosterConflict && (
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-amber-950">Shift Roster Clashes:</strong> {req.conflictDetails}
                        </div>
                      </div>
                    )}

                    {/* Manager Notes & Actions */}
                    <div className="space-y-2 pt-1 border-t border-slate-200/60">
                      <input
                        type="text"
                        placeholder="Add optional manager note or handover instruction..."
                        value={managerFeedbackNote[req.id] || ''}
                        onChange={(e) => setManagerFeedbackNote({ ...managerFeedbackNote, [req.id]: e.target.value })}
                        className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:bg-white text-slate-800"
                      />

                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleReject(req.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 rounded-lg transition border border-slate-200 flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Deny</span>
                        </button>
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-2xs flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Filters & Search Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by team member name or leave reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl pl-9 pr-3 py-2 bg-slate-50 focus:bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-medium border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white text-slate-700"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-xs font-medium border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white text-slate-700"
              >
                <option value="all">All Categories</option>
                <option value="pto">Paid Time Off (PTO)</option>
                <option value="sick">Sick Leave</option>
                <option value="personal">Personal / Casual</option>
                <option value="comp_off">Comp-Off Bank</option>
                <option value="wfh">Remote / WFH</option>
                <option value="floating_holiday">Floating Holiday</option>
              </select>
            </div>
          </div>

          {/* Requests History List */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                Leave Records & Audit Log ({filteredRequests.length})
              </h3>
              <span className="text-xs text-slate-400">Chronological history</span>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredRequests.length > 0 ? (
                filteredRequests.map(req => (
                  <div key={req.id} className="p-4 hover:bg-slate-50/80 transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    
                    {/* User & Request Detail */}
                    <div className="flex items-start gap-3.5 min-w-[280px]">
                      <img 
                        src={req.userAvatar} 
                        alt={req.userName} 
                        className="w-9 h-9 rounded-full object-cover shrink-0" 
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{req.userName}</span>
                          <span className="px-2 py-0.2 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                            {req.type}
                          </span>
                          {req.isHalfDay && (
                            <span className="text-[10px] text-amber-700 font-semibold">Half-day</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{req.userRole}</div>
                        <p className="text-slate-600 text-xs mt-1 italic max-w-md">
                          "{req.reason}"
                        </p>
                      </div>
                    </div>

                    {/* Dates & Handover */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{req.startDate} {req.startDate !== req.endDate ? `to ${req.endDate}` : ''}</span>
                        <span className="text-slate-400 font-normal">({req.daysCount} day{req.daysCount > 1 ? 's' : ''})</span>
                      </div>
                      {req.coverageHandoverUserName && (
                        <div className="text-[11px] text-slate-500">
                          Handover: <strong className="text-slate-700">{req.coverageHandoverUserName}</strong>
                        </div>
                      )}
                      {req.managerNotes && (
                        <div className="text-[11px] text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                          <strong className="text-slate-700">Manager:</strong> {req.managerNotes}
                        </div>
                      )}
                    </div>

                    {/* Status Badge & Actions */}
                    <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded ${
                        req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        req.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        req.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {req.status}
                      </span>

                      {/* Cancel action for requester */}
                      {req.userId === currentUser.id && req.status === 'pending' && (
                        <button
                          onClick={() => cancelLeaveRequest(req.id)}
                          className="text-xs text-rose-600 hover:underline font-semibold"
                        >
                          Cancel
                        </button>
                      )}

                      {/* Preview in Teams */}
                      <button
                        onClick={() => onOpenTeamsCard(req.id)}
                        className="p-1.5 text-slate-400 hover:text-[#5B5FC7] hover:bg-slate-100 rounded transition"
                        title="View MS Teams Adaptive Card"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  No leave requests found matching the current filters.
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Team Balances Matrix */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              {isManager ? 'Team Leave Entitlements & Availability Matrix' : 'My Leave Entitlements & Remaining Quotas'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isManager 
                ? 'Live summary of remaining days, pending requests, and used quotas for every team member'
                : 'Your current year leave balances, used quotas, and pending requests'}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Team Member</th>
                  <th className="px-4 py-3">Team Name</th>
                  <th className="px-4 py-3">PTO Balance</th>
                  <th className="px-4 py-3">Sick Leave</th>
                  <th className="px-4 py-3">Personal</th>
                  <th className="px-4 py-3">Comp-Off Bank</th>
                  <th className="px-4 py-3">Floating Hol.</th>
                  <th className="px-4 py-3 text-right">Available Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(isManager ? users : users.filter(u => u.id === currentUser.id)).map(u => {
                  const bal = leaveBalances[u.id];
                  if (!bal) return null;

                  const ptoAvail = bal.pto.total - bal.pto.used - bal.pto.pending;
                  const sickAvail = bal.sick.total - bal.sick.used - bal.sick.pending;
                  const personalAvail = bal.personal.total - bal.personal.used - bal.personal.pending;
                  const compOffAvail = bal.compOff.total - bal.compOff.used - bal.compOff.pending;
                  const floatAvail = bal.floatingHoliday.total - bal.floatingHoliday.used - bal.floatingHoliday.pending;
                  const totalAvail = ptoAvail + sickAvail + personalAvail + compOffAvail + floatAvail;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200" />
                          <div>
                            <span className="font-bold text-slate-900">{u.name}</span>
                            {u.id === currentUser.id && <span className="text-[10px] text-indigo-600 font-bold ml-1.5">(You)</span>}
                            <div className="text-[10px] text-slate-400">{u.jobTitle}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">{u.teamName}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-indigo-700">{ptoAvail}d <span className="text-slate-400 font-normal">({bal.pto.used} used)</span></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-amber-700">{sickAvail}d <span className="text-slate-400 font-normal">({bal.sick.used} used)</span></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-teal-700">{personalAvail}d</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-purple-700">{compOffAvail}d</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-blue-700">{floatAvail}d</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="px-2.5 py-1 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {totalAvail} days
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
