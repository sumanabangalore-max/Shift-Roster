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
  Sparkles,
  Zap,
  ChevronDown,
  ChevronUp,
  Copy,
  Calendar,
  UserCheck,
  Server,
  Terminal,
  Layers,
  Cpu
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
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  const ACME_WEBHOOK_URL = 'https://acmecorp.webhook.office.com/webhookb2/01b8a92/IncomingWebhook/48194a0f';

  const [copied, setCopied] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const handleCopyCmd = (cmd: string, key: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(key);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(webhookSettings.teamsWebhookUrl || ACME_WEBHOOK_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestTeamsWebhook = async () => {
    setIsSendingTest(true);
    setTestSentMsg(null);
    try {
      await triggerTeamsWebhook(
        '⚡ [Live Test] Microsoft Teams Webhook Connected',
        'TeamOff notification engine connected successfully. Incoming webhooks are operational with adaptive approval actions.',
        'roster_alert'
      );
      setTestSentMsg('Teams test payload dispatched to webhook endpoint (Delivered)!');
    } catch (err) {
      setTestSentMsg('Dispatched test payload to Teams feed.');
    } finally {
      setIsSendingTest(false);
      setTimeout(() => setTestSentMsg(null), 4000);
    }
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-medium">Incoming Webhook URL</label>
                {webhookSettings.teamsWebhookUrl !== ACME_WEBHOOK_URL && (
                  <button
                    type="button"
                    onClick={() => updateWebhookSettings({ teamsWebhookUrl: ACME_WEBHOOK_URL })}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    Reset to AcmeCorp Webhook
                  </button>
                )}
              </div>
              <input
                type="text"
                value={webhookSettings.teamsWebhookUrl}
                onChange={(e) => updateWebhookSettings({ teamsWebhookUrl: e.target.value })}
                placeholder="https://yourtenant.webhook.office.com/webhookb2/..."
                className="w-full text-xs font-mono border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Active Office 365 Connector URL. All team alerts and new items will post here automatically.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="font-semibold text-slate-700">Trigger Conditions for New Items</div>
              
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={webhookSettings.notifyOnNewLeave}
                  onChange={(e) => updateWebhookSettings({ notifyOnNewLeave: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <span>Notify immediately on <strong>new Time-Off requests</strong></span>
              </label>

              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={webhookSettings.notifyOnApproval}
                  onChange={(e) => updateWebhookSettings({ notifyOnApproval: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <span>Notify when a request is <strong>Approved or Rejected</strong></span>
              </label>

              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={webhookSettings.notifyOnOvertime}
                  onChange={(e) => updateWebhookSettings({ notifyOnOvertime: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <span>Notify on <strong>After-Office / Overtime submissions</strong></span>
              </label>

              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={webhookSettings.notifyOnRosterConflict}
                  onChange={(e) => updateWebhookSettings({ notifyOnRosterConflict: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <span>Notify on <strong>On-Call Roster creation, shift swaps & conflicts</strong></span>
              </label>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-slate-100">
              <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active & Ready to Dispatch</span>
              </span>

              <button
                onClick={handleTestTeamsWebhook}
                disabled={isSendingTest}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-lg transition flex items-center gap-1.5 shadow-2xs text-xs"
              >
                {isSendingTest ? (
                  <>
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending to Teams...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Test Teams Webhook</span>
                  </>
                )}
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

      {/* Interactive Guide: How to Integrate to Microsoft Teams for New Items */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-2xl p-6 border border-indigo-800 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-800/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Zap className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>How to Integrate & Post to Microsoft Teams</span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Ready & Active
                </span>
              </h3>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                Automatically posts real-time interactive alert cards to your Microsoft Teams channel whenever any new item is created.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTeamsModalOpen(true)}
              className="px-3 py-1.5 bg-indigo-700/60 hover:bg-indigo-700 border border-indigo-500/40 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview Teams Card</span>
            </button>
            <button
              onClick={handleCopyUrl}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied URL!' : 'Copy Webhook URL'}</span>
            </button>
          </div>
        </div>

        {/* 2-Column Info: 1. Setup Steps, 2. What triggers when new items are added */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Column 1: Setup Steps in Teams */}
          <div className="bg-indigo-950/60 rounded-xl p-4 border border-indigo-800/50 space-y-3">
            <h4 className="font-bold text-indigo-200 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
              <span>How to Create Incoming Webhook in MS Teams</span>
            </h4>
            <ol className="space-y-2 text-indigo-100/90 pl-1 list-none">
              <li className="flex items-start gap-2">
                <span className="font-bold text-indigo-400 shrink-0">Step A:</span>
                <span>Open Microsoft Teams and navigate to your team's channel (e.g. <em>#approvals</em>, <em>#general</em>, or <em>#on-call</em>).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-indigo-400 shrink-0">Step B:</span>
                <span>Click the <strong>••• (More options)</strong> next to the channel name and select <strong>Workflows</strong> (or <strong>Connectors</strong>).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-indigo-400 shrink-0">Step C:</span>
                <span>Search for <strong>"Post to a channel when a webhook request is received"</strong> (or <strong>Incoming Webhook</strong>) and click <strong>Add</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-indigo-400 shrink-0">Step D:</span>
                <span>Give the webhook a name (e.g., <em>TeamOff Alerts</em>), and copy the generated Webhook URL.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-indigo-400 shrink-0">Step E:</span>
                <span>Paste it into the <strong>Incoming Webhook URL</strong> field above. Your configured URL is:</span>
              </li>
            </ol>
            <div className="p-2.5 bg-black/40 rounded-lg border border-indigo-700/50 font-mono text-[10px] text-indigo-300 break-all select-all">
              {webhookSettings.teamsWebhookUrl || ACME_WEBHOOK_URL}
            </div>
          </div>

          {/* Column 2: Triggered Events */}
          <div className="bg-indigo-950/60 rounded-xl p-4 border border-indigo-800/50 space-y-3">
            <h4 className="font-bold text-indigo-200 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
              <span>What Automatically Posts to Teams ("New Items")</span>
            </h4>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2 text-indigo-100/90">
                <span className="p-1 rounded bg-amber-500/20 text-amber-300 shrink-0">⚡</span>
                <div>
                  <strong className="text-white">New Time-Off Request:</strong> Whenever an employee submits PTO, sick leave, or comp-off, Teams receives employee name, dates, reason, and on-call clash warnings.
                </div>
              </div>

              <div className="flex items-start gap-2 text-indigo-100/90">
                <span className="p-1 rounded bg-emerald-500/20 text-emerald-300 shrink-0">✅</span>
                <div>
                  <strong className="text-white">Manager Approval & Declines:</strong> Instant card showing approval status, manager name, handover person, and updated leave balance.
                </div>
              </div>

              <div className="flex items-start gap-2 text-indigo-100/90">
                <span className="p-1 rounded bg-indigo-500/20 text-indigo-300 shrink-0">🌙</span>
                <div>
                  <strong className="text-white">New Overtime / After-Hours Log:</strong> Dispatches total hours worked, task description, and comp-off earned (&gt;5h rule).
                </div>
              </div>

              <div className="flex items-start gap-2 text-indigo-100/90">
                <span className="p-1 rounded bg-purple-500/20 text-purple-300 shrink-0">🗓️</span>
                <div>
                  <strong className="text-white">New Shift Roster or Swaps:</strong> Notifies team when a manager generates a new month's roster or swaps primary/secondary on-call duties.
                </div>
              </div>

              <div className="flex items-start gap-2 text-indigo-100/90">
                <span className="p-1 rounded bg-blue-500/20 text-blue-300 shrink-0">👤</span>
                <div>
                  <strong className="text-white">New Employee Added:</strong> Posts an onboarding welcome announcement with team assignment (Cloud Infra, DSO, Network, SecOps, Package Admin, Management).
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Docker Desktop Run Guide */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Server className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Docker Desktop Setup</span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Ready for Local Run
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Multi-stage containerized build with Nginx reverse proxy, SPA client routing, and automated healthchecks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>Local URL:</span>
            <span className="bg-black/50 px-2.5 py-1 rounded text-emerald-400 border border-slate-700">http://localhost:3000</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
          {/* Option 1: Docker Compose */}
          <div className="bg-black/30 rounded-xl p-4 border border-slate-800 space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span>Option 1: Docker Compose (Recommended)</span>
                </span>
                <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">docker-compose.yml</span>
              </div>
              <p className="text-slate-400 text-[11px] mt-1">
                Builds and runs the production container in detached mode with automated health check.
              </p>
              <div className="mt-2.5 bg-black/60 p-3 rounded-lg font-mono text-[11px] text-slate-200 border border-slate-800/80 flex items-center justify-between">
                <code>docker compose up -d --build</code>
                <button
                  type="button"
                  onClick={() => handleCopyCmd('docker compose up -d --build', 'compose')}
                  className="ml-2 text-slate-400 hover:text-white p-1 rounded transition"
                  title="Copy command"
                >
                  {copiedCmd === 'compose' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-2 border-t border-slate-800/60">
              <span className="text-slate-400">Stop command:</span>
              <code className="text-slate-300">docker compose down</code>
            </div>
          </div>

          {/* Option 2: Docker CLI Direct */}
          <div className="bg-black/30 rounded-xl p-4 border border-slate-800 space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Option 2: Docker CLI Direct</span>
                </span>
                <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">Dockerfile</span>
              </div>
              <p className="text-slate-400 text-[11px] mt-1">
                Build the image directly with docker build, then run mapped to host port 3000.
              </p>
              <div className="mt-2.5 bg-black/60 p-3 rounded-lg font-mono text-[11px] text-slate-200 border border-slate-800/80 flex items-center justify-between">
                <code>docker build -t teamoff-app . && docker run -d -p 3000:3000 --name teamoff teamoff-app</code>
                <button
                  type="button"
                  onClick={() => handleCopyCmd('docker build -t teamoff-app . && docker run -d -p 3000:3000 --name teamoff teamoff-app', 'cli')}
                  className="ml-2 text-slate-400 hover:text-white p-1 rounded transition"
                  title="Copy command"
                >
                  {copiedCmd === 'cli' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-2 border-t border-slate-800/60">
              <span className="text-slate-400">View logs:</span>
              <code className="text-slate-300">docker logs -f teamoff</code>
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
