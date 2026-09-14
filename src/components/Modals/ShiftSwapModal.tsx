import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeftRight, Calendar, CheckCircle2, X } from 'lucide-react';
import { SHIFT_TIMINGS } from '../../types';

interface ShiftSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
}

export const ShiftSwapModal: React.FC<ShiftSwapModalProps> = ({ isOpen, onClose, defaultDate }) => {
  const { roster, swapRosterShifts } = useApp();

  const [date1, setDate1] = useState(defaultDate || '2026-08-21');
  const [date2, setDate2] = useState('2026-08-28');
  const [swapMode, setSwapMode] = useState<'primary' | 'secondary' | 'general' | 'all'>('all');

  if (!isOpen) return null;

  const slot1 = roster.find(s => s.date === date1);
  const slot2 = roster.find(s => s.date === date2);

  const handleSwap = (e: React.FormEvent) => {
    e.preventDefault();
    if (date1 === date2) {
      alert('Please choose two different shift dates to swap.');
      return;
    }
    swapRosterShifts(date1, date2, swapMode);
    onClose();
  };

  return (
    <div id="shift-swap-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        id="shift-swap-modal"
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-white border-b border-slate-100 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Swap Roster Shifts</h2>
              <p className="text-xs text-slate-400">Exchange duty assignments between two calendar dates</p>
            </div>
          </div>
          <button 
            id="close-swap-modal-btn"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSwap} className="p-6 space-y-4">
          {/* Swap mode */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Role / Duty To Swap
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'primary', label: 'Primary', sub: '10am-7:30pm' },
                { id: 'secondary', label: 'Secondary', sub: '8am-5:30pm' },
                { id: 'general', label: 'General', sub: '9am-6:30pm' },
                { id: 'all', label: 'All Duties', sub: 'Full swap' },
              ].map(m => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setSwapMode(m.id as any)}
                  className={`p-2 text-center rounded-xl border transition ${
                    swapMode === m.id
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-950 ring-1 ring-indigo-600/30 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold'
                  }`}
                >
                  <div className="text-xs font-semibold">{m.label}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">{m.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Date 1 Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Source Date 1</label>
              <select
                value={date1}
                onChange={(e) => setDate1(e.target.value)}
                className="text-xs font-medium border border-slate-200 rounded-lg px-2.5 py-1 bg-white text-slate-800"
              >
                {roster.map(s => (
                  <option key={s.date} value={s.date}>
                    {s.date} ({s.dayOfWeek})
                  </option>
                ))}
              </select>
            </div>
            {slot1 && (
              <div className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Primary (10:00-19:30):</span>
                  <strong className="text-indigo-600 font-semibold">{slot1.primaryUserName}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Secondary (08:00-17:30):</span>
                  <strong className="text-emerald-600 font-semibold">{slot1.secondaryUserName}</strong>
                </div>
                {slot1.generalShiftUserName && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">General (09:00-18:30):</span>
                    <strong className="text-sky-600 font-semibold">{slot1.generalShiftUserName}</strong>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-center -my-2 relative z-10">
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Date 2 Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Target Date 2</label>
              <select
                value={date2}
                onChange={(e) => setDate2(e.target.value)}
                className="text-xs font-medium border border-slate-200 rounded-lg px-2.5 py-1 bg-white text-slate-800"
              >
                {roster.map(s => (
                  <option key={s.date} value={s.date}>
                    {s.date} ({s.dayOfWeek})
                  </option>
                ))}
              </select>
            </div>
            {slot2 && (
              <div className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Primary (10:00-19:30):</span>
                  <strong className="text-indigo-600 font-semibold">{slot2.primaryUserName}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Secondary (08:00-17:30):</span>
                  <strong className="text-emerald-600 font-semibold">{slot2.secondaryUserName}</strong>
                </div>
                {slot2.generalShiftUserName && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">General (09:00-18:30):</span>
                    <strong className="text-sky-600 font-semibold">{slot2.generalShiftUserName}</strong>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              id="cancel-swap-btn"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="confirm-swap-btn"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirm Shift Swap</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
