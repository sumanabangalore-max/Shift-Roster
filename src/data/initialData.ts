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
    id: 'usr_sarah',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@acmeteam.internal',
    role: 'manager',
    jobTitle: 'Engineering Manager',
    teamName: 'Management',
    department: 'Management',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 234-5678',
    teamsHandle: '@sarah.jenkins'
  },
  {
    id: 'usr_alex',
    name: 'Alex Chen',
    email: 'alex.chen@acmeteam.internal',
    role: 'employee',
    jobTitle: 'Cloud Infrastructure Engineer',
    teamName: 'Cloud Infra',
    department: 'Cloud Infra',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 345-6789',
    teamsHandle: '@alex.chen'
  },
  {
    id: 'usr_elena',
    name: 'Elena Rostova',
    email: 'elena.rostova@acmeteam.internal',
    role: 'employee',
    jobTitle: 'DevSecOps Specialist',
    teamName: 'DSO',
    department: 'DSO',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 456-7890',
    teamsHandle: '@elena.rostova'
  },
  {
    id: 'usr_marcus',
    name: 'Marcus Vance',
    email: 'marcus.vance@acmeteam.internal',
    role: 'employee',
    jobTitle: 'Network Reliability Engineer',
    teamName: 'Network',
    department: 'Network',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 567-8901',
    teamsHandle: '@marcus.vance'
  },
  {
    id: 'usr_aisha',
    name: 'Aisha Patel',
    email: 'aisha.patel@acmeteam.internal',
    role: 'employee',
    jobTitle: 'Security Operations Analyst',
    teamName: 'SecOps',
    department: 'SecOps',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 678-9012',
    teamsHandle: '@aisha.patel'
  },
  {
    id: 'usr_liam',
    name: 'Liam Gallagher',
    email: 'liam.gallagher@acmeteam.internal',
    role: 'employee',
    jobTitle: 'Package & Release Admin',
    teamName: 'Package Admin',
    department: 'Package Admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 789-0123',
    teamsHandle: '@liam.gallagher'
  }
];

export const INITIAL_LEAVE_BALANCES: Record<string, LeaveBalance> = {
  usr_sarah: {
    userId: 'usr_sarah',
    pto: { total: 24, used: 0, pending: 0 },
    sick: { total: 10, used: 0, pending: 0 },
    personal: { total: 5, used: 0, pending: 0 },
    compOff: { total: 0, used: 0, pending: 0 },
    floatingHoliday: { total: 2, used: 0, pending: 0 }
  },
  usr_alex: {
    userId: 'usr_alex',
    pto: { total: 20, used: 0, pending: 0 },
    sick: { total: 10, used: 0, pending: 0 },
    personal: { total: 5, used: 0, pending: 0 },
    compOff: { total: 0, used: 0, pending: 0 },
    floatingHoliday: { total: 2, used: 0, pending: 0 }
  },
  usr_elena: {
    userId: 'usr_elena',
    pto: { total: 20, used: 0, pending: 0 },
    sick: { total: 10, used: 0, pending: 0 },
    personal: { total: 5, used: 0, pending: 0 },
    compOff: { total: 0, used: 0, pending: 0 },
    floatingHoliday: { total: 2, used: 0, pending: 0 }
  },
  usr_marcus: {
    userId: 'usr_marcus',
    pto: { total: 20, used: 0, pending: 0 },
    sick: { total: 10, used: 0, pending: 0 },
    personal: { total: 5, used: 0, pending: 0 },
    compOff: { total: 0, used: 0, pending: 0 },
    floatingHoliday: { total: 2, used: 0, pending: 0 }
  },
  usr_aisha: {
    userId: 'usr_aisha',
    pto: { total: 20, used: 0, pending: 0 },
    sick: { total: 10, used: 0, pending: 0 },
    personal: { total: 5, used: 0, pending: 0 },
    compOff: { total: 0, used: 0, pending: 0 },
    floatingHoliday: { total: 2, used: 0, pending: 0 }
  },
  usr_liam: {
    userId: 'usr_liam',
    pto: { total: 20, used: 0, pending: 0 },
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

// Helper to generate monthly roster for a given month and year
export function generateMonthlyRoster(
  year: number = 2026, 
  monthIndex: number = 8, // 8 = September (0-indexed)
  staffList: User[] = INITIAL_USERS
): DailyRosterSlot[] {
  const slots: DailyRosterSlot[] = [];
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Rotation pool of staff (exclude managers if preferred, or include whole team)
  const pool = staffList.length > 0 ? staffList : INITIAL_USERS;

  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = d < 10 ? `0${d}` : `${d}`;
    const monthStr = (monthIndex + 1) < 10 ? `0${monthIndex + 1}` : `${monthIndex + 1}`;
    const date = `${year}-${monthStr}-${dayStr}`;
    const dateObj = new Date(year, monthIndex, d);
    const dayOfWeek = dayNames[dateObj.getDay()];
    const isWeekend = dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday';

    // Fair rotation indices across pool
    const primaryIdx = (d * 2) % pool.length;
    const secondaryIdx = (d * 2 + 1) % pool.length;
    const generalIdx = (d * 2 + 2) % pool.length;

    const primary = pool[primaryIdx];
    const secondary = pool[secondaryIdx];
    const general = pool[generalIdx];

    slots.push({
      date,
      dayOfWeek,
      primaryUserId: primary.id,
      primaryUserName: primary.name,
      primaryUserAvatar: primary.avatar,
      secondaryUserId: secondary.id,
      secondaryUserName: secondary.name,
      secondaryUserAvatar: secondary.avatar,
      generalShiftUserId: isWeekend ? undefined : general.id,
      generalShiftUserName: isWeekend ? undefined : general.name,
      generalShiftUserAvatar: isWeekend ? undefined : general.avatar,
      shiftType: isWeekend ? 'primary_oncall' : 'general_shift',
      notes: isWeekend 
        ? 'Weekend coverage: Primary (10:00 AM – 7:30 PM), Secondary (8:00 AM – 5:30 PM)' 
        : 'Primary (10:00 AM – 7:30 PM) • Secondary (8:00 AM – 5:30 PM) • General (9:00 AM – 6:30 PM)'
    });
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
