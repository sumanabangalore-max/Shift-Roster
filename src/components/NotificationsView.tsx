import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bell, 
  MessageSquare, 
  Mail, 
  Send, 
  CheckCircle2, 
  Clock, 
  Settings, 
  ShieldCheck, 
  AlertCircle, 
  Trash2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { EmailPreviewModal } from './Modals/EmailPreviewModal';
import { TeamsCardModal } from './Modals/TeamsCardModal';

export const NotificationsView: React.FC = () => {
  const { 
    notifications, 
    webhookSettings, 
    emailSettings, 
    updateWebhookSettings, 
    updateEmailSettings, 
    clearNotifications,
    triggerTeamsWebhook,
    triggerEmailReminder
  } = useApp();

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isTeamsModalOpen, setIsTeamsModalOpen] = useState(false);
  const [testSentMsg, setTestSentMsg] = useState<string | null>(null);

  const handleTestTeamsWebhook = () => {
    triggerTeamsWebhook(
      '⚡ [Test] Microsoft Teams Webhook Triggered',
      'TeamOff notification engine connected successfully. Incoming webhooks are operational with adaptive approval actions.',
      'roster_alert'
    );
    setTestSentMsg('Teams test payload dispatched to webhook feed!');
    setTimeout(() => setTestSentMsg(null), 3000);
  };

  const handleTriggerEmailReminder = () => {
    const result = triggerEmailReminder();
    setTestSentMsg(`Automated reminder email digest dispatched (${result.count} pending items)!`);
    setTimeout(() => setTestSentMsg(null), 3000);
  };

  return (
    <div id="notifications-view" className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Teams & Automated Email Reminders</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold uppercase tracking-wider border border-emerald-100">
              Live Connectors
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure MS Teams Adaptive Card webhooks and automated email digest schedules for pending approvals and roster alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="view-teams-card-btn"
            onClick={() => setIsTeamsModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-2xs"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Teams Card</span>
          </button>

          <button
            id="view-email-preview-btn"
            onClick={() => setIsEmailModalOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Digest</span>
          </button>
        </div>
      </div>

      {testSentMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{testSentMsg}</span>
        </div>
      )}

      {/* Settings Split: MS Teams Webhook & Automated Email Scheduler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* MS Teams Webhook Configuration */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Microsoft Teams Webhook</h3>
                <p className="text-xs text-slate-400">Post interactive cards to #approvals channel</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={webhookSettings.isEnabled}
                onChange={(e) => updateWebhookSettings({ isEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Incoming Webhook URL</label>
              <input
                type="text"
                value={webhookSettings.teamsWebhookUrl}
                onChange={(e) => updateWebhookSettings({ teamsWebhookUrl: e.target.value })}
                className="w-full text-xs font-mono border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-800"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="font-semibold text-slate-700">Trigger Conditions</div>
              
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={webhookSettings.notifyOnNewLeave}
                  onChange={(e) => updateWebhookSettings({ notifyOnNewLeave: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <span>Notify immediately on new Time-Off requests</span>
              </label>

              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={webhookSettings.notifyOnApproval}
                  onChange={(e) => updateWebhookSettings({ notifyOnApproval: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <span>Notify when a leave request is Approved or Rejected</span>
              </label>

              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={webhookSettings.notifyOnOvertime}
                  onChange={(e) => updateWebhookSettings({ notifyOnOvertime: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <span>Notify on After-Office / Overtime submissions</span>
              </label>

              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={webhookSettings.notifyOnRosterConflict}
                  onChange={(e) => updateWebhookSettings({ notifyOnRosterConflict: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <span>Notify on On-Call Roster coverage clashes & shift swaps</span>
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleTestTeamsWebhook}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition flex items-center gap-1.5 shadow-2xs"
              >
                <Send className="w-3 h-3" />
                <span>Send Test Teams Webhook</span>
              </button>
            </div>
          </div>
        </div>

        {/* Automated Email Reminder Scheduler */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Automated Email Reminders</h3>
                <p className="text-xs text-slate-400">Scheduled reminders for pending approvals & digests</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailSettings.isEnabled}
                onChange={(e) => updateEmailSettings({ isEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Reminder Schedule</label>
                <select
                  value={emailSettings.reminderFrequency}
                  onChange={(e) => updateEmailSettings({ reminderFrequency: e.target.value as any })}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 font-medium"
                >
                  <option value="daily">Daily Morning Digest (09:00 AM)</option>
                  <option value="twice_daily">Twice Daily (09:00 & 16:00)</option>
                  <option value="hourly">Hourly for urgent pending items</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Pending Grace Period</label>
                <select
                  value={emailSettings.pendingGraceHours}
                  onChange={(e) => updateEmailSettings({ pendingGraceHours: Number(e.target.value) })}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 font-medium"
                >
                  <option value={12}>Alert after 12 hours pending</option>
                  <option value={24}>Alert after 24 hours pending</option>
                  <option value={48}>Alert after 48 hours pending</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="font-semibold text-slate-700">Weekly Summary Digests</div>
              
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailSettings.includeWeeklyRosterDigest}
                  onChange={(e) => updateEmailSettings({ includeWeeklyRosterDigest: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <span>Send Weekly Roster Handover Digest every Monday at 08:00 AM</span>
              </label>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-slate-500 text-[11px]">
              Last scheduled automated run: <strong>{emailSettings.lastRunAt ? new Date(emailSettings.lastRunAt).toLocaleString() : 'Today 09:00 AM'}</strong>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                onClick={handleTriggerEmailReminder}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition flex items-center gap-1.5 shadow-2xs"
              >
                <Mail className="w-3 h-3" />
                <span>Run Reminder Job Now</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Dispatched Notification Stream */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Dispatched Notification Stream ({notifications.length})
            </h3>
          </div>
          <button
            onClick={clearNotifications}
            className="text-xs text-slate-400 hover:text-rose-600 font-medium flex items-center gap-1 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map(notif => (
              <div key={notif.id} className="p-4 hover:bg-slate-50/80 transition flex items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    notif.channel === 'teams' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {notif.channel === 'teams' ? <MessageSquare className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{notif.title}</span>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                        notif.channel === 'teams' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {notif.channel}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs mt-0.5 max-w-xl">
                      {notif.content}
                    </p>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Recipient: <span className="font-mono text-slate-600">{notif.recipient}</span> • {new Date(notif.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
                  {notif.status}
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No notification logs recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <EmailPreviewModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
      />

      <TeamsCardModal
        isOpen={isTeamsModalOpen}
        onClose={() => setIsTeamsModalOpen(false)}
      />

    </div>
  );
};
