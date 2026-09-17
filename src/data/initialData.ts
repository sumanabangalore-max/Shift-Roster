import { 
  User, 
  LeaveBalance, 
  LeaveRequest, 
  OvertimeRequest, 
  DailyRosterSlot, 
  NotificationLog, 
  WebhookSettings, 
  EmailReminderSettings 
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_manager_1',
    name: 'Suman',
    email: 'suman.ailearn@gmail.com',
    role: 'manager',
    jobTitle: 'Engineering Manager',
    teamName: 'Management',
    department: 'Management',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 010-0001',
    teamsHandle: '@suman'
  }
];

export const INITIAL_LEAVE_BALANCES: Record<string, LeaveBalance> = {
  usr_manager_1: {
    userId: 'usr_manager_1',
    pto: { total: 24, used: 0, pending: 0 },
    sick: { total: 10, used: 0, pending: 0 },
    personal: { total: 5, used: 0, pending: 0 },
    compOff: { total: 0, used: 0, pending: 0 },
    floatingHoliday: { total: 2, used: 0, pending: 0 }
  }
};

// No dummy requests or logs - clean initial state
export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [];
export const INITIAL_OVERTIME_REQUESTS: OvertimeRequest[] = [];
export const INITIAL_NOTIFICATIONS: NotificationLog[] = [];

// Helper to generate monthly roster for a given month, year, and team
export function generateMonthlyRoster(
  year: number = 2026, 
  monthIndex: number = 8, // 8 = September (0-indexed)
  staffList: User[] = INITIAL_USERS,
  targetTeam?: string
): DailyRosterSlot[] {
  const slots: DailyRosterSlot[] = [];
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Teams to generate
  const teamsToGenerate = targetTeam 
    ? [targetTeam] 
    : ['Cloud Infra', 'SecOps', 'DSO', 'Network', 'Package Admin'];

  for (const tName of teamsToGenerate) {
    // Filter staff belonging to this team (or allow all non-management staff if no members in this team)
    const teamStaff = staffList.filter(u => u.teamName === tName);
    const pool = teamStaff.length > 0 ? teamStaff : [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = d < 10 ? `0${d}` : `${d}`;
      const monthStr = (monthIndex + 1) < 10 ? `0${monthIndex + 1}` : `${monthIndex + 1}`;
      const date = `${year}-${monthStr}-${dayStr}`;
      const dateObj = new Date(year, monthIndex, d);
      const dayOfWeek = dayNames[dateObj.getDay()];
      const isWeekend = dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday';

      if (pool.length === 0) {
        slots.push({
          date,
          dayOfWeek,
          teamName: tName,
          primaryUserId: '',
          primaryUserName: 'Unassigned',
          primaryUserAvatar: undefined,
          secondaryUserId: '',
          secondaryUserName: 'Unassigned',
          secondaryUserAvatar: undefined,
          shiftType: isWeekend ? 'primary_oncall' : 'secondary_oncall',
          notes: `${tName} duty coverage. Click edit or add members in User Management.`
        });
        continue;
      }

      if (pool.length === 1) {
        const soleMember = pool[0];
        slots.push({
          date,
          dayOfWeek,
          teamName: tName,
          primaryUserId: soleMember.id,
          primaryUserName: soleMember.name,
          primaryUserAvatar: soleMember.avatar,
          secondaryUserId: '',
          secondaryUserName: 'Unassigned',
          secondaryUserAvatar: undefined,
          shiftType: 'primary_oncall',
          notes: `${tName} solo coverage.`
        });
        continue;
      }

      // Fair rotation indices across pool for primary and secondary
      const primaryIdx = (d * 2) % pool.length;
      let secondaryIdx = (d * 2 + 1) % pool.length;
      if (secondaryIdx === primaryIdx && pool.length > 1) {
        secondaryIdx = (secondaryIdx + 1) % pool.length;
      }

      const primary = pool[primaryIdx];
      const secondary = pool[secondaryIdx];

      slots.push({
        date,
        dayOfWeek,
        teamName: tName,
        primaryUserId: primary?.id || '',
        primaryUserName: primary?.name || 'Unassigned',
        primaryUserAvatar: primary?.avatar,
        secondaryUserId: secondary?.id || '',
        secondaryUserName: secondary?.name || 'Unassigned',
        secondaryUserAvatar: secondary?.avatar,
        shiftType: isWeekend ? 'primary_oncall' : 'secondary_oncall',
        notes: `Primary: 10:00 AM – 7:30 PM • Secondary: 8:00 AM – 5:30 PM (${tName})`
      });
    }
  }

  return slots;
}

export const INITIAL_WEBHOOK_SETTINGS: WebhookSettings = {
  teamsWebhookUrl: 'https://acmecorp.webhook.office.com/webhookb2/01b8a92/IncomingWebhook/48194a0f',
  isEnabled: true,
  notifyOnNewLeave: true,
  notifyOnApproval: true,
  notifyOnOvertime: true,
  notifyOnRosterConflict: true
};

export const INITIAL_EMAIL_SETTINGS: EmailReminderSettings = {
  isEnabled: true,
  reminderFrequency: 'daily',
  reminderTime: '09:00',
  pendingGraceHours: 24,
  includeWeeklyRosterDigest: true,
  digestDay: 'Monday'
};
