import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DailyRosterSlot, ShiftSlotType, SHIFT_TIMINGS } from '../../types';
import { Shield, Users, Calendar, AlertTriangle, CheckCircle2, X, Clock, Layers } from 'lucide-react';

interface RosterEditModalProps {
  slot: DailyRosterSlot | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RosterEditModal: React.FC<RosterEditModalProps> = ({ slot, isOpen, onClose }) => {
  const { users, updateRosterSlot, leaveRequests } = useApp();

  const [primaryId, setPrimaryId] = useState('');
  const [secondaryId, setSecondaryId] = useState('');
  const [shiftType, setShiftType] = useState<ShiftSlotType>('day_core');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (slot) {
      setPrimaryId(slot.primaryUserId || '');
      setSecondaryId(slot.secondaryUserId || '');
      setShiftType(slot.shiftType);
      setNotes(slot.notes || '');
    }
  }, [slot]);

  if (!isOpen || !slot) return null;

  // Check if assigned users have leaves on slot.date
  const primaryOnLeave = leaveRequests.find(r => 
    r.userId === primaryId && 
    r.status !== 'rejected' && 
    r.status !== 'cancelled' &&
    slot.date >= r.startDate && 
    slot.date <= r.endDate
  );

  const secondaryOnLeave = leaveRequests.find(r => 
    r.userId === secondaryId && 
    r.status !== 'rejected' && 
    r.status !== 'cancelled' &&
    slot.date >= r.startDate && 
    slot.date <= r.endDate
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (primaryId === secondaryId) {
      alert('Primary and Secondary on-call duty cannot be assigned to the same person.');
      return;
    }

    updateRosterSlot(
      slot.date, 
      primaryId, 
      secondaryId, 
      notes, 
      shiftType,
      slot.teamName
    );
    onClose();
  };

  const slotTeam = slot.teamName || 'Cloud Infra';
  const teamUsers = users.filter(u => u.teamName === slotTeam);
  const otherUsers = users.filter(u => u.teamName !== slotTeam);

  return (
    <div id="roster-edit-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        id="roster-edit-modal"
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-white border-b border-slate-100 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Assign Daily Shift Coverage</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {slotTeam}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {slot.dayOfWeek}, {slot.date} {slot.isHoliday ? `(${slot.holidayName})` : ''}
              </p>
            </div>
          </div>
          <button 
            id="close-roster-modal-btn"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Shift Schedule Reference */}
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5 text-xs">
            <div className="font-semibold text-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Standard Shift Timings (Primary & Secondary Only)</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Team: {slotTeam}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
              <div className="bg-white p-2 rounded-lg border border-indigo-100">
                <span className="font-bold text-indigo-700 block">Primary On-Call:</span>
                <span>{SHIFT_TIMINGS.PRIMARY.display} (Lead)</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-emerald-100">
                <span className="font-bold text-emerald-700 block">Secondary On-Call:</span>
                <span>{SHIFT_TIMINGS.SECONDARY.display} (Backup)</span>
              </div>
            </div>
          </div>

          {/* Primary Lead */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>
                <span>Primary On-Call ({SHIFT_TIMINGS.PRIMARY.display})</span>
              </label>
              {primaryOnLeave && (
                <span className="text-[10px] font-semibold text-rose-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>On Leave ({primaryOnLeave.type})</span>
                </span>
              )}
            </div>

            <select
              id="select-primary-user"
              value={primaryId}
              onChange={(e) => setPrimaryId(e.target.value)}
              className={`w-full text-xs font-medium border rounded-lg px-3 py-2 bg-white text-slate-800 ${
                primaryOnLeave ? 'border-rose-300 bg-rose-50/40 ring-1 ring-rose-300' : 'border-slate-200 focus:ring-2 focus:ring-indigo-500'
              }`}
            >
              <optgroup label={`${slotTeam} Engineers`}>
                {teamUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.jobTitle} ({u.role.toUpperCase()})
                  </option>
                ))}
              </optgroup>
              {otherUsers.length > 0 && (
                <optgroup label="Other Department Engineers">
                  {otherUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.teamName}) — {u.jobTitle}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* Secondary Lead */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                <span>Secondary On-Call ({SHIFT_TIMINGS.SECONDARY.display})</span>
              </label>
              {secondaryOnLeave && (
                <span className="text-[10px] font-semibold text-rose-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>On Leave ({secondaryOnLeave.type})</span>
                </span>
              )}
            </div>

            <select
              id="select-secondary-user"
              value={secondaryId}
              onChange={(e) => setSecondaryId(e.target.value)}
              className={`w-full text-xs font-medium border rounded-lg px-3 py-2 bg-white text-slate-800 ${
                secondaryOnLeave ? 'border-rose-300 bg-rose-50/40 ring-1 ring-rose-300' : 'border-slate-200 focus:ring-2 focus:ring-indigo-500'
              }`}
            >
              <optgroup label={`${slotTeam} Engineers`}>
                {teamUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.jobTitle} ({u.role.toUpperCase()})
                  </option>
                ))}
              </optgroup>
              {otherUsers.length > 0 && (
                <optgroup label="Other Department Engineers">
                  {otherUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.teamName}) — {u.jobTitle}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* Notes / Special Instructions */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Handover Instructions / Notes
            </label>
            <textarea
              id="roster-notes-input"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Primary leads alarms response; Secondary monitors service pipelines."
              className="w-full text-xs border border-slate-200 rounded-lg p-3 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
            />
          </div>

          {/* Conflict warnings */}
          {(primaryOnLeave || secondaryOnLeave) && (
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-900 space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Coverage Conflict Warning</span>
              </div>
              <p className="text-[11px]">
                One or more selected colleagues has an approved leave request on {slot.date}. Please verify coverage.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              id="cancel-roster-edit-btn"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-roster-assignment-btn"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Update Assignment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
