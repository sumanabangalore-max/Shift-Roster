import React from 'react';
import { useApp } from '../../context/AppContext';
import { MessageSquare, Check, X, Bell, ExternalLink, ShieldAlert } from 'lucide-react';

interface TeamsCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLeaveId?: string;
}

export const TeamsCardModal: React.FC<TeamsCardModalProps> = ({ isOpen, onClose, selectedLeaveId }) => {
  const { leaveRequests, approveLeaveRequest, rejectLeaveRequest } = useApp();

  if (!isOpen) return null;

  const targetRequest = leaveRequests.find(r => r.id === selectedLeaveId) || 
                        leaveRequests.find(r => r.status === 'pending') || 
                        leaveRequests[0];

  return (
    <div id="teams-card-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        id="teams-card-modal"
        className="bg-white rounded-2xl shadow-xl max-w-xl w-full border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header with Teams branding */}
        <div className="bg-white border-b border-slate-100 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Microsoft Teams Adaptive Card</h2>
              <p className="text-xs text-slate-400">Live webhook action card preview</p>
            </div>
          </div>
          <button 
            id="close-teams-card-btn"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 bg-slate-50 space-y-4">
          {/* Teams Channel Header Simulator */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Channel: #eng-approvals-and-roster (Webhook Connector)</span>
          </div>

          {/* Microsoft Teams Adaptive Card UI */}
          {targetRequest ? (
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4 font-sans">
              {/* Bot Info */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    T
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">TeamOff Bot</div>
                    <div className="text-[10px] text-slate-400">Incoming Webhook • Just now</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {targetRequest.type.toUpperCase()} Request
                </span>
              </div>

              {/* Requester Profile */}
              <div className="flex items-start gap-3">
                <img 
                  src={targetRequest.userAvatar} 
                  alt={targetRequest.userName} 
                  className="w-10 h-10 rounded-full object-cover border border-slate-200" 
                />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900">{targetRequest.userName}</h4>
                  <p className="text-[11px] text-slate-400">{targetRequest.userRole}</p>
                  <p className="text-xs text-slate-700 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    "{targetRequest.reason}"
                  </p>
                </div>
              </div>

              {/* Request Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration</div>
                  <div className="font-bold text-slate-800 mt-0.5">{targetRequest.daysCount} day(s)</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">From</div>
                  <div className="font-bold text-slate-800 mt-0.5">{targetRequest.startDate}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">To</div>
                  <div className="font-bold text-slate-800 mt-0.5">{targetRequest.endDate}</div>
                </div>
              </div>

              {/* Roster Conflict Warning */}
              {targetRequest.hasRosterConflict && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-xs text-rose-900 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Roster Conflict:</span> {targetRequest.conflictDetails}
                  </div>
                </div>
              )}

              {/* Action Buttons inside Adaptive Card */}
              {targetRequest.status === 'pending' ? (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      rejectLeaveRequest(targetRequest.id, 'Declined from Teams card');
                      onClose();
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => {
                      approveLeaveRequest(targetRequest.id, 'Approved via Teams Card');
                      onClose();
                    }}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition flex items-center gap-1 shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve (1-Click)</span>
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-100 text-right">
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded ${
                    targetRequest.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    Status: {targetRequest.status}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No requests available for preview.</p>
          )}

          {/* Teams Webhook Details Note */}
          <div className="text-xs text-slate-400 bg-white p-3 rounded-xl border border-slate-100">
            Teams incoming webhooks deliver actionable Adaptive Cards formatted with schema v1.5 with embedded approval endpoints.
          </div>
        </div>
      </div>
    </div>
  );
};
