export type UserRole = 'manager' | 'employee';

export type TeamName = 
  | 'Cloud Infra' 
  | 'DSO' 
  | 'Network' 
  | 'SecOps' 
  | 'Package Admin' 
  | 'Management';

export const TEAM_NAMES: TeamName[] = [
  'Cloud Infra',
  'DSO',
  'Network',
  'SecOps',
  'Package Admin',
  'Management'
];

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  jobTitle: string;
  teamName: TeamName | string;
  department?: string; // alias for teamName
  avatar: string;
  phone?: string;
  teamsHandle?: string;
}

export type LeaveType = 
  | 'pto' 
  | 'sick' 
  | 'personal' 
  | 'comp_off' 
  | 'wfh' 
  | 'floating_holiday';

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveBalance {
  userId: string;
  pto: { total: number; used: number; pending: number };
  sick: { total: number; used: number; pending: number };
  personal: { total: number; used: number; pending: number };
  compOff: { total: number; used: number; pending: number };
  floatingHoliday: { total: number; used: number; pending: number };
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRole: string;
  type: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  daysCount: number;
  isHalfDay?: boolean;
  halfDayPeriod?: 'morning' | 'afternoon';
  reason: string;
  status: RequestStatus;
  requestedAt: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  managerNotes?: string;
  coverageHandoverUserId?: string;
  coverageHandoverUserName?: string;
  hasRosterConflict?: boolean;
  conflictDetails?: string;
}

export type OvertimeShiftType = 
  | 'night_oncall' 
  | 'weekend_maintenance' 
  | 'emergency_incident' 
  | 'release_deployment' 
  | 'after_hours_support';

export type OvertimeCompensationType = 'comp_off_bank';

export interface OvertimeRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "19:00"
  endTime: string; // e.g. "23:30"
  totalHours: number;
  shiftType: OvertimeShiftType;
  compensationType: OvertimeCompensationType; // strictly Comp-Off
  earnedCompOffDays: number; // >5 hours = 1.0 day off
  taskDescription: string;
  ticketReference?: string;
  status: RequestStatus;
  requestedAt: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  managerNotes?: string;
}

export type ShiftSlotType = 'primary_oncall' | 'secondary_oncall' | 'general_shift' | 'custom_shift';

export interface ShiftTimingDefinition {
  type: ShiftSlotType;
  name: string;
  startTime: string;
  endTime: string;
  displayHours: string;
  display: string;
  badgeColor: string;
}

const primaryShift: ShiftTimingDefinition = {
  type: 'primary_oncall',
  name: 'Primary On-Call',
  startTime: '10:00',
  endTime: '19:30',
  displayHours: '10:00 AM – 7:30 PM',
  display: '10:00 - 19:30',
  badgeColor: 'indigo'
};

const secondaryShift: ShiftTimingDefinition = {
  type: 'secondary_oncall',
  name: 'Secondary On-Call',
  startTime: '08:00',
  endTime: '17:30',
  displayHours: '8:00 AM – 5:30 PM',
  display: '08:00 - 17:30',
  badgeColor: 'emerald'
};

const generalShift: ShiftTimingDefinition = {
  type: 'general_shift',
  name: 'General Shift',
  startTime: '09:00',
  endTime: '18:30',
  displayHours: '9:00 AM – 6:30 PM',
  display: '09:00 - 18:30',
  badgeColor: 'sky'
};

export const SHIFT_TIMINGS: Record<'primary' | 'secondary' | 'general' | 'PRIMARY' | 'SECONDARY' | 'GENERAL', ShiftTimingDefinition> = {
  primary: primaryShift,
  secondary: secondaryShift,
  general: generalShift,
  PRIMARY: primaryShift,
  SECONDARY: secondaryShift,
  GENERAL: generalShift
};

export interface DailyRosterSlot {
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // 'Monday', 'Tuesday', ..., 'Sunday'
  
  // Primary on-call: 10:00 AM - 7:30 PM
  primaryUserId: string;
  primaryUserName: string;
  primaryUserAvatar: string;
  
  // Secondary on-call: 8:00 AM - 5:30 PM
  secondaryUserId: string;
  secondaryUserName: string;
  secondaryUserAvatar: string;

  // General shift: 9:00 AM - 6:30 PM
  generalShiftUserId?: string;
  generalShiftUserName?: string;
  generalShiftUserAvatar?: string;
  
  shiftType?: ShiftSlotType;
  notes?: string;
  isHoliday?: boolean;
  holidayName?: string;
}

export interface NotificationLog {
  id: string;
  channel: 'teams' | 'email';
  title: string;
  recipient: string;
  content: string;
  timestamp: string;
  status: 'delivered' | 'pending' | 'failed';
  actionType: 'leave_request' | 'leave_approved' | 'leave_rejected' | 'overtime_request' | 'roster_alert' | 'reminder';
  referenceId?: string;
  payload?: any;
}

export interface WebhookSettings {
  teamsWebhookUrl: string;
  isEnabled: boolean;
  notifyOnNewLeave: boolean;
  notifyOnApproval: boolean;
  notifyOnOvertime: boolean;
  notifyOnRosterConflict: boolean;
}

export interface EmailReminderSettings {
  isEnabled: boolean;
  reminderFrequency: 'daily' | 'twice_daily' | 'hourly';
  reminderTime: string; // "09:00"
  pendingGraceHours: number; // e.g. 24 hours
  includeWeeklyRosterDigest: boolean;
  digestDay: 'Monday' | 'Friday';
  lastRunAt?: string;
}
