import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LeaveType } from '../../types';
import { Calendar, AlertTriangle, CheckCircle2, Clock, UserCheck, X } from 'lucide-react';

interface RequestTimeOffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RequestTimeOffModal: React.FC<RequestTimeOffModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, users, getUserLeaveBalance, submitLeaveRequest, checkRosterConflict } = useApp();

  const [leaveType, setLeaveType] = useState<LeaveType>('pto');
  const [startDate, setStartDate] = useState('2026-08-24');
  const [endDate, setEndDate] = useState('2026-08-25');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDayPeriod, setHalfDayPeriod] = useState<'morning' | 'afternoon'>('morning');
  const [handoverUserId, setHandoverUserId] = useState(
    users.find(u => u.id !== currentUser.id)?.id || ''
  );
  const [reason, setReason] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const userBalance = getUserLeaveBalance(currentUser.id);
  const otherUsers = users.filter(u => u.id !== currentUser.id);

  // Calculate day count
  const calcDays = () => {
    if (isHalfDay) return 0.5;
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const daysCount = calcDays();

  // Balance status check
  const getAvailableBalance = (type: LeaveType) => {
    if (!userBalance) return 0;
    switch (type) {
      case 'pto': return userBalance.pto.total - userBalance.pto.used - userBalance.pto.pending;
      case 'sick': return userBalance.sick.total - userBalance.sick.used - userBalance.sick.pending;
      case 'personal': return userBalance.personal.total - userBalance.personal.used - userBalance.personal.pending;
      case 'comp_off': return userBalance.compOff.total - userBalance.compOff.used - userBalance.compOff.pending;
      case 'floating_holiday': return userBalance.floatingHoliday.total - userBalance.floatingHoliday.used - userBalance.floatingHoliday.pending;
      default: return 99;
    }
  };

  const availableBal = getAvailableBalance(leaveType);
  const isBalanceSufficient = availableBal >= daysCount || leaveType === 'wfh';

  // Check roster conflict live
  const conflict = checkRosterConflict(currentUser.id, startDate, isHalfDay ? startDate : endDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (daysCount <= 0) {
      setFeedbackMsg({ type: 'error', message: 'Please select a valid date range.' });
      return;
    }

    if (!reason.trim()) {
      setFeedbackMsg({ type: 'error', message: 'Please provide a brief reason for your leave.' });
      return;
    }

    const result = submitLeaveRequest({
      type: leaveType,
      startDate,
      endDate: isHalfDay ? startDate : endDate,
      daysCount,
      isHalfDay,
      halfDayPeriod,
      reason,
      coverageHandoverUserId: handoverUserId || undefined
    });

    if (result.success) {
      onClose();
    }
  };

  return (
    <div id="request-timeoff-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        id="request-timeoff-modal"
        className="bg-white rounded-2xl shadow-xl max-w-xl w-full border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-white border-b border-slate-100 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Request Time Off</h2>
              <p className="text-xs text-slate-400">Request leave with instant balance check & roster sync</p>
            </div>
          </div>
          <button 
            id="close-timeoff-modal-btn"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* User Info & Available Balance Pill */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="flex items-center gap-3">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200" 
              />
              <div>
                <div className="text-xs font-semibold text-slate-900">{currentUser.name}</div>
                <div className="text-[11px] text-slate-400">{currentUser.jobTitle}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-medium">Available {leaveType.toUpperCase()}:</span>
              <span className={`text-xs font-bold ${availableBal > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {availableBal} day(s)
              </span>
            </div>
          </div>

          {/* Leave Type Selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Leave Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'pto', label: 'Paid Time Off (PTO)', desc: 'Vacation' },
                { id: 'sick', label: 'Sick Leave', desc: 'Health / Medical' },
                { id: 'personal', label: 'Personal / Casual', desc: 'Private errands' },
                { id: 'comp_off', label: 'Comp-Off Bank', desc: 'Earned from OT' },
                { id: 'wfh', label: 'Remote / WFH', desc: 'Offsite day' },
                { id: 'floating_holiday', label: 'Floating Holiday', desc: 'Cultural/Optional' }
              ].map(t => (
                <button
                  type="button"
                  key={t.id}
                  id={`leave-type-${t.id}`}
                  onClick={() => setLeaveType(t.id as LeaveType)}
                  className={`p-2.5 text-left rounded-xl border transition flex flex-col justify-between ${
                    leaveType === t.id
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600/30 text-indigo-950'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-semibold">{t.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Half Day Option */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-xs font-semibold text-slate-800">Half-Day Leave</span>
                <p className="text-[11px] text-slate-400">Only taking 4 hours of off-time</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="half-day-toggle"
                checked={isHalfDay}
                onChange={(e) => setIsHalfDay(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              {isHalfDay && (
                <select
                  value={halfDayPeriod}
                  onChange={(e) => setHalfDayPeriod(e.target.value as any)}
                  className="text-xs border border-slate-200 rounded-lg px-2.5 py-1 bg-white text-slate-700 font-medium"
                >
                  <option value="morning">Morning (09:00 - 13:00)</option>
                  <option value="afternoon">Afternoon (14:00 - 18:00)</option>
                </select>
              )}
            </div>
          </div>

          {/* Dates Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {isHalfDay ? 'Leave Date' : 'Start Date'}
              </label>
              <input
                type="date"
                id="leave-start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min="2026-08-01"
                max="2026-08-31"
                required
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            {!isHalfDay && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">End Date</label>
                <input
                  type="date"
                  id="leave-end-date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  max="2026-08-31"
                  required
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Total Days & Balance Warning */}
          <div className="flex items-center justify-between text-xs px-3.5 py-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-700 font-medium">
            <span>Requested Duration:</span>
            <span className="font-bold text-indigo-600 text-sm">
              {daysCount} {daysCount === 1 ? 'day' : 'days'}
            </span>
          </div>

          {!isBalanceSufficient && (
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Low balance notice:</span> You are requesting {daysCount} day(s) but currently have {availableBal} day(s) available in this category. You may still submit for manager exception approval.
              </div>
            </div>
          )}

          {/* Roster Conflict Alert Banner */}
          {conflict.hasConflict && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-rose-950">Shift Roster Conflict Detected</div>
                <div className="text-rose-800 mt-0.5">{conflict.details}</div>
                <div className="text-rose-700 text-[11px] mt-1">
                  Please designate a backup coverage colleague below to ensure Monday-Sunday roster SLA.
                </div>
              </div>
            </div>
          )}

          {/* Coverage Handover Colleague */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center justify-between">
              <span>Designated Backup / Handover Colleague</span>
              <span className="text-[10px] text-slate-400 font-normal">Optional</span>
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <select
                id="handover-colleague-select"
                value={handoverUserId}
                onChange={(e) => setHandoverUserId(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg pl-9 pr-3 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- No specific handover assigned --</option>
                {otherUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.teamName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reason / Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Reason / Notes for Manager
            </label>
            <textarea
              id="leave-reason-input"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Taking family rest days, medical checkup, attending conference..."
              className="w-full text-xs border border-slate-200 rounded-lg p-3 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
              required
            />
          </div>

          {feedbackMsg && (
            <div className={`p-3 rounded-xl text-xs font-medium ${
              feedbackMsg.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            }`}>
              {feedbackMsg.message}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              id="cancel-request-btn"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-leave-request-btn"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Submit Request</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
