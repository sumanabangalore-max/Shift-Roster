import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OvertimeShiftType } from '../../types';
import { Moon, Clock, Calendar, X, Sparkles, CheckCircle2, ShieldCheck, Info } from 'lucide-react';

interface RequestOvertimeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RequestOvertimeModal: React.FC<RequestOvertimeModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, submitOvertimeRequest } = useApp();

  const [date, setDate] = useState('2026-08-18');
  const [startTime, setStartTime] = useState('18:30');
  const [endTime, setEndTime] = useState('23:45');
  const [shiftType, setShiftType] = useState<OvertimeShiftType>('night_oncall');
  const [ticketRef, setTicketRef] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate hours
  const calculateHours = (): number => {
    if (!startTime || !endTime) return 0;
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    let startMin = startH * 60 + startM;
    let endMin = endH * 60 + endM;
    
    // Crosses midnight
    if (endMin < startMin) {
      endMin += 24 * 60;
    }
    
    const diffHours = (endMin - startMin) / 60;
    return Math.round(diffHours * 10) / 10;
  };

  const totalHours = calculateHours();
  // Policy rule: > 5 hours = 1.0 Day Off, >= 2.5 hours = 0.5 Day Off, else proportional
  const earnedCompOffDays = totalHours > 5 ? 1.0 : (totalHours >= 2.5 ? 0.5 : Math.round((totalHours / 8) * 10) / 10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalHours <= 0) {
      setErrorMsg('Please ensure end time is after start time.');
      return;
    }
    if (!taskDescription.trim()) {
      setErrorMsg('Please describe the after-office work or incident handled.');
      return;
    }

    submitOvertimeRequest({
      date,
      startTime,
      endTime,
      totalHours,
      shiftType,
      taskDescription,
      ticketReference: ticketRef.trim() || undefined
    });

    onClose();
  };

  return (
    <div id="request-overtime-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        id="request-overtime-modal"
        className="bg-white rounded-2xl shadow-xl max-w-xl w-full border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-white border-b border-slate-100 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Log After-Working Hours</h2>
              <p className="text-xs text-slate-400">Track evening on-call, incident hotfix & earn Comp-Off credit</p>
            </div>
          </div>
          <button 
            id="close-overtime-modal-btn"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* User Profile Bar */}
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="flex items-center gap-3">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200" 
              />
              <div>
                <div className="text-xs font-semibold text-slate-900">{currentUser.name}</div>
                <div className="text-[11px] text-slate-400">{currentUser.jobTitle} • {currentUser.role.toUpperCase()}</div>
              </div>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>Comp-Off System</span>
            </span>
          </div>

          {/* Shift Type Selection */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              After-Office Shift Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'night_oncall', label: 'Night On-Call Shift', desc: 'Standby duty past 19:30' },
                { id: 'emergency_incident', label: 'Emergency Hotfix / SEV', desc: 'Urgent production outage resolution' },
                { id: 'release_deployment', label: 'Release Deployment', desc: 'Scheduled off-peak maintenance' },
                { id: 'weekend_maintenance', label: 'Weekend Duty Work', desc: 'Saturday/Sunday planned shifts' },
              ].map(st => (
                <button
                  type="button"
                  key={st.id}
                  id={`ot-shift-${st.id}`}
                  onClick={() => setShiftType(st.id as OvertimeShiftType)}
                  className={`p-2.5 text-left rounded-xl border transition ${
                    shiftType === st.id
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600/30 text-indigo-950 font-bold'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-900">{st.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{st.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time Range */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Shift Date</label>
              <input
                type="date"
                id="ot-date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min="2026-08-01"
                max="2026-08-31"
                required
                className="w-full text-xs font-medium border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                id="ot-start-time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full text-xs font-medium border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                id="ot-end-time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full text-xs font-medium border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Comp-Off Rule & Calculation Box */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-900">Total Worked Duration:</span>
                <span className="text-xs font-extrabold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                  {totalHours} hrs
                </span>
              </div>
              
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-indigo-600 block">Comp-Off Credit</span>
                <span className="text-sm font-bold text-indigo-950">
                  {earnedCompOffDays >= 1.0 ? '1.0 Day Off (Full Day)' : `${earnedCompOffDays} Day Off`}
                </span>
              </div>
            </div>

            {/* Policy Info */}
            <div className="p-2.5 bg-white rounded-xl border border-indigo-100/80 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Company Comp-Off Policy</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                If after-working hours is <strong>more than 5 Hours</strong>, it is credited as <strong>1 Full Day Off (1.0d)</strong> to your Comp-Off leave balance upon manager approval.
              </p>
              {totalHours > 5 && (
                <div className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 pt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Eligible for 1 Full Day Off (&gt; 5 hrs threshold met)</span>
                </div>
              )}
            </div>
          </div>

          {/* Ticket / Ref */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center justify-between">
              <span>Incident Ticket / Reference Tag (Optional)</span>
              <span className="text-[10px] text-slate-400 font-normal">e.g. INC-4829, REL-2026.8</span>
            </label>
            <input
              type="text"
              id="ot-ticket-ref"
              value={ticketRef}
              onChange={(e) => setTicketRef(e.target.value)}
              placeholder="e.g. INC-5921 or INFRA-DEPLOY"
              className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Task Details */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Work Description & Summary
            </label>
            <textarea
              id="ot-task-desc"
              rows={2}
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Describe the after-working hours tasks performed, hotfixes deployed, or incident triage notes..."
              className="w-full text-xs border border-slate-200 rounded-lg p-3 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
              required
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100">
              {errorMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              id="cancel-ot-btn"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-overtime-request-btn"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Submit After-Hours Log</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
