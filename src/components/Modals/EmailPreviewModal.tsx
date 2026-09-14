import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Mail, Send, CheckCircle2, Clock, Calendar, AlertCircle, X } from 'lucide-react';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, leaveRequests, overtimeRequests, triggerEmailReminder } = useApp();
  const [recipientEmail, setRecipientEmail] = useState('sarah.jenkins@acmeteam.internal');
  const [sentNotice, setSentNotice] = useState(false);

  if (!isOpen) return null;

  const pendingLeave = leaveRequests.filter(r => r.status === 'pending');
  const pendingOT = overtimeRequests.filter(o => o.status === 'pending');

  const handleSend = () => {
    triggerEmailReminder(recipientEmail);
    setSentNotice(true);
    setTimeout(() => {
      setSentNotice(false);
      onClose();
    }, 1500);
  };

  return (
    <div id="email-preview-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        id="email-preview-modal"
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-white border-b border-slate-100 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Automated Email Reminder Simulator</h2>
              <p className="text-xs text-slate-400">Preview HTML email dispatched to managers for pending approvals</p>
            </div>
          </div>
          <button 
            id="close-email-modal-btn"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Email Headers */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center">
              <span className="w-16 font-semibold text-slate-400">From:</span>
              <span className="font-mono text-slate-700 font-medium">teamoff-scheduler@notifications.acmeteam.internal</span>
            </div>
            <div className="flex items-center">
              <span className="w-16 font-semibold text-slate-400">To:</span>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="flex-1 text-xs border border-slate-200 rounded-lg px-2.5 py-1 bg-white text-slate-800 font-mono"
              />
            </div>
            <div className="flex items-center">
              <span className="w-16 font-semibold text-slate-400">Subject:</span>
              <span className="font-medium text-slate-800">
                [Action Required] Daily Approval Digest: {pendingLeave.length + pendingOT.length} items awaiting review
              </span>
            </div>
          </div>

          {/* HTML Email Canvas Simulator */}
          <div className="border border-slate-100 rounded-xl bg-white shadow-xs p-5 font-sans space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                  T
                </div>
                <span className="font-bold text-slate-900 text-sm">TeamOff Notification Service</span>
              </div>
              <span className="text-[11px] text-slate-400">Automated Daily Trigger • 09:00 AM</span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Good morning, Manager!
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                You have <strong>{pendingLeave.length} Time-Off requests</strong> and <strong>{pendingOT.length} After-Office Overtime logs</strong> awaiting your review and approval.
              </p>
            </div>

            {/* Pending Leave Section */}
            {pendingLeave.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Pending Time-Off Requests ({pendingLeave.length})
                </div>
                <div className="space-y-2">
                  {pendingLeave.map(item => (
                    <div key={item.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{item.userName} — {item.type.toUpperCase()} ({item.daysCount} days)</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">{item.startDate} to {item.endDate} • "{item.reason}"</div>
                        {item.hasRosterConflict && (
                          <div className="text-rose-600 font-bold text-[10px] mt-0.5">
                            Roster Conflict: {item.conflictDetails}
                          </div>
                        )}
                      </div>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px] uppercase">
                        Pending
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Overtime Section */}
            {pendingOT.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Pending After-Office Overtime Logs ({pendingOT.length})
                </div>
                <div className="space-y-2">
                  {pendingOT.map(item => (
                    <div key={item.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{item.userName} — {item.totalHours}h ({item.shiftType.replace('_', ' ')})</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          {item.date} ({item.startTime} - {item.endTime}) • {item.hourlyMultiplier}x Rate • "{item.taskDescription}"
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px] uppercase">
                        Pending
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
              This automated email was sent per team scheduling policy. Log in to TeamOff to take 1-click action.
            </div>
          </div>

          {sentNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Email reminder dispatched successfully to {recipientEmail}!</span>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              Runs automatically every morning at 09:00 AM
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="close-email-btn"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition"
              >
                Close
              </button>
              <button
                type="button"
                id="trigger-email-now-btn"
                onClick={handleSend}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Test Email Reminder</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
