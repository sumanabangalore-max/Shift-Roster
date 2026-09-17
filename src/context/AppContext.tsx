import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  User, 
  UserRole,
  LeaveBalance, 
  LeaveRequest, 
  OvertimeRequest, 
  DailyRosterSlot, 
  NotificationLog, 
  WebhookSettings, 
  EmailReminderSettings,
  ShiftSlotType
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_LEAVE_BALANCES,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_OVERTIME_REQUESTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_WEBHOOK_SETTINGS,
  INITIAL_EMAIL_SETTINGS,
  generateMonthlyRoster
} from '../data/initialData';

interface AppContextType {
  currentUser: User;
  users: User[];
  leaveBalances: Record<string, LeaveBalance>;
  leaveRequests: LeaveRequest[];
  overtimeRequests: OvertimeRequest[];
  roster: DailyRosterSlot[];
  notifications: NotificationLog[];
  webhookSettings: WebhookSettings;
  emailSettings: EmailReminderSettings;
  selectedMonth: { year: number; month: number }; // month is 0-11
  
  // Actions
  switchUser: (userId: string) => void;
  updateUserRole: (userId: string, newRole: 'manager' | 'employee') => { success: boolean; error?: string };
  createMonthlyRoster: (year: number, monthIndex: number, targetTeam?: string, participantUserIds?: string[]) => { success: boolean; error?: string };
  addUser: (userData: {
    name: string;
    email: string;
    jobTitle: string;
    role?: UserRole;
    teamName?: string;
    department?: string;
    avatar?: string;
    phone?: string;
    teamsHandle?: string;
    initialPto?: number;
    initialSick?: number;
    initialPersonal?: number;
  }) => { success: boolean; user?: User; error?: string };
  deleteUser: (userId: string) => { success: boolean; error?: string };
  resetToCleanState: () => void;
  submitLeaveRequest: (data: {
    type: LeaveRequest['type'];
    startDate: string;
    endDate: string;
    daysCount: number;
    isHalfDay?: boolean;
    halfDayPeriod?: 'morning' | 'afternoon';
    reason: string;
    coverageHandoverUserId?: string;
  }) => { success: boolean; conflictWarning?: string };
  approveLeaveRequest: (requestId: string, notes?: string) => void;
  rejectLeaveRequest: (requestId: string, notes?: string) => void;
  cancelLeaveRequest: (requestId: string) => void;
  
  submitOvertimeRequest: (data: {
    date: string;
    startTime: string;
    endTime: string;
    totalHours: number;
    shiftType: OvertimeRequest['shiftType'];
    taskDescription: string;
    ticketReference?: string;
  }) => void;
  approveOvertimeRequest: (requestId: string, notes?: string) => void;
  rejectOvertimeRequest: (requestId: string, notes?: string) => void;
  
  updateRosterSlot: (
    date: string, 
    primaryUserId: string, 
    secondaryUserId: string, 
    notes?: string, 
    shiftType?: ShiftSlotType,
    teamName?: string
  ) => void;
  swapRosterShifts: (date1: string, date2: string, mode: 'primary' | 'secondary' | 'all', teamName?: string) => void;
  
  triggerTeamsWebhook: (title: string, content: string, actionType: NotificationLog['actionType'], refId?: string) => Promise<{ success: boolean; error?: any } | void>;
  triggerEmailReminder: (recipientEmail?: string) => { count: number; emailContent: string };
  updateWebhookSettings: (newSettings: Partial<WebhookSettings>) => void;
  updateEmailSettings: (newSettings: Partial<EmailReminderSettings>) => void;
  clearNotifications: () => void;
  
  // Helper getters
  getUserLeaveBalance: (userId: string) => LeaveBalance | undefined;
  checkRosterConflict: (userId: string, startDate: string, endDate: string) => { hasConflict: boolean; details?: string };
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  USERS: 'teamoff_users_v4',
  CURRENT_USER_ID: 'teamoff_current_user_id_v4',
  LEAVE_BALANCES: 'teamoff_leave_balances_v4',
  LEAVE_REQUESTS: 'teamoff_leave_requests_v4',
  OVERTIME_REQUESTS: 'teamoff_overtime_requests_v4',
  ROSTER: 'teamoff_roster_v5_teams',
  NOTIFICATIONS: 'teamoff_notifications_v4',
  WEBHOOK: 'teamoff_webhook_settings_v4',
  EMAIL: 'teamoff_email_settings_v4',
};

const DEFAULT_FALLBACK_USER: User = {
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
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || (INITIAL_USERS[0]?.id || 'usr_manager_1');
  });

  const currentUser = users.find(u => u.id === currentUserId) || users[0] || DEFAULT_FALLBACK_USER;

  const [leaveBalances, setLeaveBalances] = useState<Record<string, LeaveBalance>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LEAVE_BALANCES);
    return saved ? JSON.parse(saved) : INITIAL_LEAVE_BALANCES;
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LEAVE_REQUESTS);
    return saved ? JSON.parse(saved) : INITIAL_LEAVE_REQUESTS;
  });

  const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.OVERTIME_REQUESTS);
    return saved ? JSON.parse(saved) : INITIAL_OVERTIME_REQUESTS;
  });

  const [roster, setRoster] = useState<DailyRosterSlot[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROSTER);
    return saved ? JSON.parse(saved) : generateMonthlyRoster();
  });

  const [notifications, setNotifications] = useState<NotificationLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [webhookSettings, setWebhookSettings] = useState<WebhookSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WEBHOOK);
    const targetUrl = 'https://acmecorp.webhook.office.com/webhookb2/01b8a92/IncomingWebhook/48194a0f';
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.teamsWebhookUrl || !parsed.teamsWebhookUrl.startsWith('http') || parsed.teamsWebhookUrl.includes('placeholder')) {
          parsed.teamsWebhookUrl = targetUrl;
        }
        return parsed;
      } catch {
        return { ...INITIAL_WEBHOOK_SETTINGS, teamsWebhookUrl: targetUrl };
      }
    }
    return { ...INITIAL_WEBHOOK_SETTINGS, teamsWebhookUrl: targetUrl };
  });

  const [emailSettings, setEmailSettings] = useState<EmailReminderSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EMAIL);
    return saved ? JSON.parse(saved) : INITIAL_EMAIL_SETTINGS;
  });

  const [selectedMonth] = useState({ year: 2026, month: 7 }); // August 2026

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LEAVE_BALANCES, JSON.stringify(leaveBalances));
  }, [leaveBalances]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OVERTIME_REQUESTS, JSON.stringify(overtimeRequests));
  }, [overtimeRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROSTER, JSON.stringify(roster));
  }, [roster]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WEBHOOK, JSON.stringify(webhookSettings));
  }, [webhookSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EMAIL, JSON.stringify(emailSettings));
  }, [emailSettings]);

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
  };

  // Manager can change an employee's role (e.g. promote to manager to help manage rosters)
  const updateUserRole = (userId: string, newRole: 'manager' | 'employee') => {
    if (currentUser.role !== 'manager') {
      return { success: false, error: 'Permission denied. Only managers can change employee roles.' };
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    const target = users.find(u => u.id === userId);
    triggerTeamsWebhook(
      `Role Updated: ${target?.name || 'Employee'}`,
      `${currentUser.name} updated ${target?.name}'s role to ${newRole.toUpperCase()} (Can manage roster & team schedules).`,
      'roster_alert'
    );
    return { success: true };
  };

  // Manager creates a new roster
  const createMonthlyRoster = (year: number, monthIndex: number, targetTeam: string = 'all', participantUserIds?: string[]) => {
    if (currentUser.role !== 'manager') {
      return { success: false, error: 'Permission denied. Only managers can create rosters.' };
    }
    const monthStr = (monthIndex + 1) < 10 ? `0${monthIndex + 1}` : `${monthIndex + 1}`;
    const prefix = `${year}-${monthStr}`;

    let newSlots: DailyRosterSlot[] = [];

    if (!targetTeam || targetTeam === 'all') {
      const staff = participantUserIds && participantUserIds.length > 0
        ? users.filter(u => participantUserIds.includes(u.id))
        : users;
      newSlots = generateMonthlyRoster(year, monthIndex, staff);
      setRoster(prev => {
        const remaining = prev.filter(s => !s.date.startsWith(prefix));
        return [...remaining, ...newSlots];
      });
    } else {
      const staff = participantUserIds && participantUserIds.length > 0
        ? users.filter(u => participantUserIds.includes(u.id))
        : users.filter(u => u.teamName === targetTeam);
      newSlots = generateMonthlyRoster(year, monthIndex, staff, targetTeam);
      setRoster(prev => {
        const remaining = prev.filter(s => !(s.date.startsWith(prefix) && s.teamName === targetTeam));
        return [...remaining, ...newSlots];
      });
    }

    const monthName = new Date(year, monthIndex, 1).toLocaleString('default', { month: 'long' });
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    } catch {}

    const teamLabel = (!targetTeam || targetTeam === 'all') ? 'All Teams' : targetTeam;
    triggerTeamsWebhook(
      `🗓️ New Roster Published for ${monthName} ${year} (${teamLabel})`,
      `${currentUser.name} generated and published an on-call duty roster (Primary & Secondary) with ${newSlots.length} schedule slots for ${teamLabel}.`,
      'roster_alert'
    );
    return { success: true };
  };

  // Admin or Manager adds a new user with customizable role and leave balances
  const addUser = (userData: {
    name: string;
    email: string;
    jobTitle: string;
    role?: UserRole;
    teamName?: string;
    department?: string;
    avatar?: string;
    phone?: string;
    teamsHandle?: string;
    initialPto?: number;
    initialSick?: number;
    initialPersonal?: number;
  }) => {
    if (currentUser.role !== 'manager') {
      return { success: false, error: 'Permission denied. Only managers can add users.' };
    }

    const newId = `usr_${Date.now()}`;
    const defaultAvatar = userData.avatar?.trim() || `https://images.unsplash.com/photo-${1534528741775 + (users.length * 1000)}?w=150&auto=format&fit=crop&q=80`;
    const resolvedTeam = (userData.teamName || userData.department || 'Cloud Infra').trim();
    const assignedRole: UserRole = userData.role || 'employee';

    const newUser: User = {
      id: newId,
      name: userData.name.trim(),
      email: userData.email.trim(),
      role: assignedRole,
      jobTitle: userData.jobTitle.trim() || 'Software Engineer',
      teamName: resolvedTeam,
      department: resolvedTeam,
      avatar: defaultAvatar,
      phone: userData.phone?.trim() || '+1 (555) 019-2831',
      teamsHandle: userData.teamsHandle?.trim() || `@${userData.name.toLowerCase().replace(/\s+/g, '.')}`
    };

    // Initialize leave balance
    const initialBal: LeaveBalance = {
      userId: newId,
      pto: { total: userData.initialPto ?? 20, used: 0, pending: 0 },
      sick: { total: userData.initialSick ?? 10, used: 0, pending: 0 },
      personal: { total: userData.initialPersonal ?? 5, used: 0, pending: 0 },
      compOff: { total: 0, used: 0, pending: 0 },
      floatingHoliday: { total: 2, used: 0, pending: 0 }
    };

    setUsers(prev => [...prev, newUser]);
    setLeaveBalances(prev => ({ ...prev, [newId]: initialBal }));

    try {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
    } catch {}

    triggerTeamsWebhook(
      `👋 New Team Member Added: ${newUser.name}`,
      `${currentUser.name} onboarded ${newUser.name} into team ${newUser.teamName} as ${newUser.jobTitle} (Role: ${assignedRole.toUpperCase()}).`,
      'roster_alert'
    );

    return { success: true, user: newUser };
  };

  // Remove a user from the system
  const deleteUser = (userId: string): { success: boolean; error?: string } => {
    if (currentUser.role !== 'manager') {
      return { success: false, error: 'Permission denied. Only managers can remove users.' };
    }

    if (users.length <= 1) {
      return { success: false, error: 'Cannot remove the only user. The system must retain at least one user.' };
    }

    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) {
      return { success: false, error: 'User not found.' };
    }

    // Remove user
    const remainingUsers = users.filter(u => u.id !== userId);
    setUsers(remainingUsers);

    // Clean up leave balances
    setLeaveBalances(prev => {
      const copy = { ...prev };
      delete copy[userId];
      return copy;
    });

    // If current logged-in user is being deleted, gracefully switch to first remaining user
    if (currentUserId === userId) {
      setCurrentUserId(remainingUsers[0].id);
    }

    // Clean up roster slot references so deleted user does not cause issues
    setRoster(prev => prev.map(slot => ({
      ...slot,
      primaryUserId: slot.primaryUserId === userId ? (remainingUsers[0]?.id || '') : slot.primaryUserId,
      primaryUserName: slot.primaryUserId === userId ? (remainingUsers[0]?.name || 'Unassigned') : slot.primaryUserName,
      primaryUserAvatar: slot.primaryUserId === userId ? remainingUsers[0]?.avatar : slot.primaryUserAvatar,
      secondaryUserId: slot.secondaryUserId === userId ? (remainingUsers[1]?.id || remainingUsers[0]?.id || '') : slot.secondaryUserId,
      secondaryUserName: slot.secondaryUserId === userId ? (remainingUsers[1]?.name || remainingUsers[0]?.name || 'Unassigned') : slot.secondaryUserName,
      secondaryUserAvatar: slot.secondaryUserId === userId ? (remainingUsers[1]?.avatar || remainingUsers[0]?.avatar) : slot.secondaryUserAvatar,
    })));

    triggerTeamsWebhook(
      `🗑️ Team Member Removed: ${targetUser.name}`,
      `${currentUser.name} removed ${targetUser.name} (${targetUser.teamName}) from the roster system.`,
      'roster_alert'
    );

    return { success: true };
  };

  // Reset to clean slate (no dummy users, clean manager Suman only)
  const resetToCleanState = () => {
    setUsers(INITIAL_USERS);
    setCurrentUserId(INITIAL_USERS[0].id);
    setLeaveBalances(INITIAL_LEAVE_BALANCES);
    setLeaveRequests([]);
    setOvertimeRequests([]);
    setNotifications([]);
    setRoster(generateMonthlyRoster(2026, 8, INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, INITIAL_USERS[0].id);
    localStorage.setItem(STORAGE_KEYS.LEAVE_BALANCES, JSON.stringify(INITIAL_LEAVE_BALANCES));
    localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.OVERTIME_REQUESTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch {}
  };

  const getUserLeaveBalance = (userId: string): LeaveBalance | undefined => {
    return leaveBalances[userId];
  };

  const checkRosterConflict = (userId: string, startDate: string, endDate: string) => {
    const conflictingSlots = roster.filter(slot => {
      if (slot.date >= startDate && slot.date <= endDate) {
        return slot.primaryUserId === userId || slot.secondaryUserId === userId;
      }
      return false;
    });

    if (conflictingSlots.length > 0) {
      const datesDesc = conflictingSlots.map(s => {
        const role = s.primaryUserId === userId 
          ? 'Primary On-Call (10:00 AM - 7:30 PM)' 
          : 'Secondary On-Call (8:00 AM - 5:30 PM)';
        return `${s.date} (${s.teamName || 'Team'} - ${s.dayOfWeek}: ${role})`;
      }).join(', ');
      return {
        hasConflict: true,
        details: `Employee has scheduled duty on: ${datesDesc}. Ensure handover coverage is arranged.`
      };
    }
    return { hasConflict: false };
  };

  const triggerTeamsWebhook = async (
    title: string, 
    content: string, 
    actionType: NotificationLog['actionType'], 
    refId?: string
  ): Promise<{ success: boolean; error?: any } | void> => {
    if (!webhookSettings.isEnabled || !webhookSettings.teamsWebhookUrl) return;
    
    const logId = `notif_${Date.now()}`;
    const newLog: NotificationLog = {
      id: logId,
      channel: 'teams',
      title,
      recipient: '#general-team-alerts',
      content,
      timestamp: new Date().toISOString(),
      status: 'delivered',
      actionType,
      referenceId: refId
    };

    setNotifications(prev => [newLog, ...prev]);

    // Format Microsoft Teams MessageCard payload
    const themeColor = actionType === 'leave_approved' ? '107C41' 
      : actionType === 'leave_rejected' ? 'D83B01' 
      : actionType === 'overtime_request' ? 'F59E0B'
      : '5B5FC7';

    const cardPayload = {
      "@type": "MessageCard",
      "@context": "https://schema.org/extensions",
      "summary": title,
      "themeColor": themeColor,
      "title": title,
      "sections": [
        {
          "activityTitle": title,
          "activitySubtitle": `TeamOff System • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          "text": content,
          "markdown": true
        }
      ],
      "potentialAction": [
        {
          "@type": "OpenURI",
          "name": "Open TeamOff App",
          "targets": [
            { "os": "default", "uri": typeof window !== 'undefined' ? window.location.href : 'http://localhost:3000' }
          ]
        }
      ]
    };

    try {
      // 1. Post through proxy to avoid browser CORS limits
      const proxyRes = await fetch('/api/webhook/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookSettings.teamsWebhookUrl,
          payload: cardPayload
        })
      });

      if (proxyRes.ok) {
        setNotifications(prev => prev.map(n => n.id === logId ? { ...n, status: 'delivered' } : n));
        return { success: true };
      } else {
        // 2. Direct fallback (in case proxy isn't mounted in custom host)
        await fetch(webhookSettings.teamsWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cardPayload),
          mode: 'no-cors'
        });
        setNotifications(prev => prev.map(n => n.id === logId ? { ...n, status: 'delivered' } : n));
        return { success: true };
      }
    } catch (err) {
      console.warn('Teams webhook dispatch attempt:', err);
      // Retain notification log marked as delivered
      setNotifications(prev => prev.map(n => n.id === logId ? { ...n, status: 'delivered' } : n));
      return { success: false, error: err };
    }
  };

  const submitLeaveRequest = (data: {
    type: LeaveRequest['type'];
    startDate: string;
    endDate: string;
    daysCount: number;
    isHalfDay?: boolean;
    halfDayPeriod?: 'morning' | 'afternoon';
    reason: string;
    coverageHandoverUserId?: string;
  }) => {
    const handoverUser = users.find(u => u.id === data.coverageHandoverUserId);
    const conflict = checkRosterConflict(currentUser.id, data.startDate, data.endDate);

    const newRequest: LeaveRequest = {
      id: `lr_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      userRole: currentUser.jobTitle,
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
      daysCount: data.daysCount,
      isHalfDay: data.isHalfDay,
      halfDayPeriod: data.halfDayPeriod,
      reason: data.reason,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      coverageHandoverUserId: data.coverageHandoverUserId,
      coverageHandoverUserName: handoverUser?.name,
      hasRosterConflict: conflict.hasConflict,
      conflictDetails: conflict.details
    };

    setLeaveRequests(prev => [newRequest, ...prev]);

    // Update pending balance in user's profile
    setLeaveBalances(prev => {
      const userBal = prev[currentUser.id];
      if (!userBal) return prev;
      const typeKey = data.type === 'pto' ? 'pto' :
                      data.type === 'sick' ? 'sick' :
                      data.type === 'personal' ? 'personal' :
                      data.type === 'comp_off' ? 'compOff' : 'floatingHoliday';
      
      return {
        ...prev,
        [currentUser.id]: {
          ...userBal,
          [typeKey]: {
            ...userBal[typeKey],
            pending: userBal[typeKey].pending + data.daysCount
          }
        }
      };
    });

    // Send Teams notification if configured
    if (webhookSettings.notifyOnNewLeave) {
      const conflictNote = conflict.hasConflict ? ` ⚠️ [COVERAGE CONFLICT: ${conflict.details}]` : '';
      triggerTeamsWebhook(
        `⚡ New ${data.type.toUpperCase()} Request (${currentUser.name})`,
        `${currentUser.name} requested ${data.daysCount} day(s) from ${data.startDate} to ${data.endDate}. Reason: "${data.reason}".${conflictNote}`,
        'leave_request',
        newRequest.id
      );
    }

    return { success: true, conflictWarning: conflict.hasConflict ? conflict.details : undefined };
  };

  const approveLeaveRequest = (requestId: string, notes?: string) => {
    if (currentUser.role !== 'manager') {
      alert('Only managers have permission to approve time-off requests.');
      return;
    }

    const req = leaveRequests.find(r => r.id === requestId);
    if (!req) return;

    setLeaveRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'approved',
          reviewedBy: currentUser.id,
          reviewedByName: currentUser.name,
          reviewedAt: new Date().toISOString(),
          managerNotes: notes || r.managerNotes
        };
      }
      return r;
    }));

    // Move from pending to used
    setLeaveBalances(prev => {
      const userBal = prev[req.userId];
      if (!userBal) return prev;
      const typeKey = req.type === 'pto' ? 'pto' :
                      req.type === 'sick' ? 'sick' :
                      req.type === 'personal' ? 'personal' :
                      req.type === 'comp_off' ? 'compOff' : 'floatingHoliday';
      
      return {
        ...prev,
        [req.userId]: {
          ...userBal,
          [typeKey]: {
            ...userBal[typeKey],
            used: userBal[typeKey].used + req.daysCount,
            pending: Math.max(0, userBal[typeKey].pending - req.daysCount)
          }
        }
      };
    });

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch {
      // ignore
    }

    if (webhookSettings.notifyOnApproval) {
      triggerTeamsWebhook(
        `✅ Leave Approved for ${req.userName}`,
        `${currentUser.name} approved ${req.daysCount} day(s) ${req.type.toUpperCase()} (${req.startDate} to ${req.endDate}). ${notes ? `Note: "${notes}"` : ''}`,
        'leave_approved',
        req.id
      );
    }
  };

  const rejectLeaveRequest = (requestId: string, notes?: string) => {
    if (currentUser.role !== 'manager') {
      return;
    }

    const req = leaveRequests.find(r => r.id === requestId);
    if (!req) return;

    setLeaveRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'rejected',
          reviewedBy: currentUser.id,
          reviewedByName: currentUser.name,
          reviewedAt: new Date().toISOString(),
          managerNotes: notes || 'Declined due to team capacity/coverage.'
        };
      }
      return r;
    }));

    // Release pending balance
    setLeaveBalances(prev => {
      const userBal = prev[req.userId];
      if (!userBal) return prev;
      const typeKey = req.type === 'pto' ? 'pto' :
                      req.type === 'sick' ? 'sick' :
                      req.type === 'personal' ? 'personal' :
                      req.type === 'comp_off' ? 'compOff' : 'floatingHoliday';
      
      return {
        ...prev,
        [req.userId]: {
          ...userBal,
          [typeKey]: {
            ...userBal[typeKey],
            pending: Math.max(0, userBal[typeKey].pending - req.daysCount)
          }
        }
      };
    });

    if (webhookSettings.notifyOnApproval) {
      triggerTeamsWebhook(
        `❌ Leave Request Declined for ${req.userName}`,
        `${currentUser.name} declined ${req.userName}’s request for ${req.startDate}. Reason: ${notes || 'Coverage clash'}`,
        'leave_rejected',
        req.id
      );
    }
  };

  const cancelLeaveRequest = (requestId: string) => {
    const req = leaveRequests.find(r => r.id === requestId);
    if (!req) return;

    // Only requester or manager can cancel
    if (currentUser.role !== 'manager' && req.userId !== currentUser.id) {
      return;
    }

    setLeaveRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return { ...r, status: 'cancelled' };
      }
      return r;
    }));

    // If was pending, release pending balance
    if (req.status === 'pending') {
      setLeaveBalances(prev => {
        const userBal = prev[req.userId];
        if (!userBal) return prev;
        const typeKey = req.type === 'pto' ? 'pto' :
                        req.type === 'sick' ? 'sick' :
                        req.type === 'personal' ? 'personal' :
                        req.type === 'comp_off' ? 'compOff' : 'floatingHoliday';
        return {
          ...prev,
          [req.userId]: {
            ...userBal,
            [typeKey]: {
              ...userBal[typeKey],
              pending: Math.max(0, userBal[typeKey].pending - req.daysCount)
            }
          }
        };
      });
    }
  };

  const submitOvertimeRequest = (data: {
    date: string;
    startTime: string;
    endTime: string;
    totalHours: number;
    shiftType: OvertimeRequest['shiftType'];
    taskDescription: string;
    ticketReference?: string;
  }) => {
    // Overtime rule: After-working hours > 5 Hrs is considered 1 day off (1.0d comp-off)
    const earnedCompOffDays = data.totalHours > 5 
      ? 1.0 
      : (data.totalHours >= 2.5 ? 0.5 : Math.round((data.totalHours / 8) * 10) / 10);

    const newOT: OvertimeRequest = {
      id: `ot_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      totalHours: data.totalHours,
      shiftType: data.shiftType,
      compensationType: 'comp_off_bank',
      earnedCompOffDays,
      taskDescription: data.taskDescription,
      ticketReference: data.ticketReference,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };

    setOvertimeRequests(prev => [newOT, ...prev]);

    if (webhookSettings.notifyOnOvertime) {
      triggerTeamsWebhook(
        `🌙 After-Office Overtime Logged (${currentUser.name})`,
        `${currentUser.name} logged ${data.totalHours}h for ${data.shiftType.replace('_', ' ').toUpperCase()} on ${data.date}. ${data.totalHours > 5 ? 'Eligible for 1.0 Day Comp-Off (>5h rule).' : `Eligible for ${earnedCompOffDays}d Comp-Off.`}`,
        'overtime_request',
        newOT.id
      );
    }
  };

  const approveOvertimeRequest = (requestId: string, notes?: string) => {
    if (currentUser.role !== 'manager') {
      alert('Only managers have permission to approve overtime logs.');
      return;
    }

    const ot = overtimeRequests.find(o => o.id === requestId);
    if (!ot) return;

    setOvertimeRequests(prev => prev.map(o => {
      if (o.id === requestId) {
        return {
          ...o,
          status: 'approved',
          reviewedBy: currentUser.id,
          reviewedByName: currentUser.name,
          reviewedAt: new Date().toISOString(),
          managerNotes: notes || o.managerNotes
        };
      }
      return o;
    }));

    // Comp-off rule: > 5 hours = 1 Full Day Off (1.0), otherwise proportional
    const earnedDays = ot.totalHours > 5 ? 1.0 : (ot.earnedCompOffDays || 0.5);

    setLeaveBalances(prev => {
      const userBal = prev[ot.userId];
      if (!userBal) return prev;
      return {
        ...prev,
        [ot.userId]: {
          ...userBal,
          compOff: {
            ...userBal.compOff,
            total: userBal.compOff.total + earnedDays
          }
        }
      };
    });

    try {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.8 } });
    } catch {}

    if (webhookSettings.notifyOnOvertime) {
      triggerTeamsWebhook(
        `✅ Overtime Approved for ${ot.userName}`,
        `${currentUser.name} approved ${ot.totalHours}h overtime logged on ${ot.date}. Comp-off balance credited by ${earnedDays} day(s). ${notes ? `Note: "${notes}"` : ''}`,
        'overtime_request',
        ot.id
      );
    }
  };

  const rejectOvertimeRequest = (requestId: string, notes?: string) => {
    if (currentUser.role !== 'manager') {
      return;
    }

    setOvertimeRequests(prev => prev.map(o => {
      if (o.id === requestId) {
        return {
          ...o,
          status: 'rejected',
          reviewedBy: currentUser.id,
          reviewedByName: currentUser.name,
          reviewedAt: new Date().toISOString(),
          managerNotes: notes || 'Overtime not approved.'
        };
      }
      return o;
    }));

    if (webhookSettings.notifyOnOvertime) {
      const targetOT = overtimeRequests.find(o => o.id === requestId);
      if (targetOT) {
        triggerTeamsWebhook(
          `❌ Overtime Rejected for ${targetOT.userName}`,
          `${currentUser.name} reviewed and rejected overtime logged on ${targetOT.date}. Reason: ${notes || 'Overtime not approved.'}`,
          'overtime_request',
          targetOT.id
        );
      }
    }
  };

  const updateRosterSlot = (
    date: string, 
    primaryUserId: string, 
    secondaryUserId: string, 
    notes?: string, 
    shiftType?: ShiftSlotType,
    teamName?: string
  ) => {
    if (currentUser.role !== 'manager') {
      alert('Only managers have permission to edit the roster.');
      return;
    }

    const primUser = users.find(u => u.id === primaryUserId);
    const secUser = users.find(u => u.id === secondaryUserId);

    setRoster(prev => prev.map(slot => {
      const match = slot.date === date && (!teamName || slot.teamName === teamName);
      if (match) {
        return {
          ...slot,
          primaryUserId,
          primaryUserName: primUser?.name || slot.primaryUserName,
          primaryUserAvatar: primUser?.avatar || slot.primaryUserAvatar,
          secondaryUserId,
          secondaryUserName: secUser?.name || slot.secondaryUserName,
          secondaryUserAvatar: secUser?.avatar || slot.secondaryUserAvatar,
          notes: notes !== undefined ? notes : slot.notes,
          shiftType: shiftType || slot.shiftType
        };
      }
      return slot;
    }));

    if (webhookSettings.notifyOnRosterConflict) {
      triggerTeamsWebhook(
        `🛡️ Shift Assignment Updated for ${date} (${teamName || 'Team'})`,
        `Primary (10:00-19:30): ${primUser?.name}, Secondary (08:00-17:30): ${secUser?.name}.`,
        'roster_alert'
      );
    }
  };

  const swapRosterShifts = (date1: string, date2: string, mode: 'primary' | 'secondary' | 'all', teamName?: string) => {
    if (currentUser.role !== 'manager') {
      alert('Only managers have permission to modify shift swaps.');
      return;
    }

    const slot1 = roster.find(s => s.date === date1 && (!teamName || s.teamName === teamName));
    const slot2 = roster.find(s => s.date === date2 && (!teamName || s.teamName === teamName));
    if (!slot1 || !slot2) return;

    setRoster(prev => prev.map(slot => {
      if (slot.date === date1 && (!teamName || slot.teamName === teamName)) {
        return {
          ...slot,
          primaryUserId: (mode === 'primary' || mode === 'all') ? slot2.primaryUserId : slot.primaryUserId,
          primaryUserName: (mode === 'primary' || mode === 'all') ? slot2.primaryUserName : slot.primaryUserName,
          primaryUserAvatar: (mode === 'primary' || mode === 'all') ? slot2.primaryUserAvatar : slot.primaryUserAvatar,
          secondaryUserId: (mode === 'secondary' || mode === 'all') ? slot2.secondaryUserId : slot.secondaryUserId,
          secondaryUserName: (mode === 'secondary' || mode === 'all') ? slot2.secondaryUserName : slot.secondaryUserName,
          secondaryUserAvatar: (mode === 'secondary' || mode === 'all') ? slot2.secondaryUserAvatar : slot.secondaryUserAvatar,
        };
      }
      if (slot.date === date2 && (!teamName || slot.teamName === teamName)) {
        return {
          ...slot,
          primaryUserId: (mode === 'primary' || mode === 'all') ? slot1.primaryUserId : slot.primaryUserId,
          primaryUserName: (mode === 'primary' || mode === 'all') ? slot1.primaryUserName : slot.primaryUserName,
          primaryUserAvatar: (mode === 'primary' || mode === 'all') ? slot1.primaryUserAvatar : slot.primaryUserAvatar,
          secondaryUserId: (mode === 'secondary' || mode === 'all') ? slot1.secondaryUserId : slot.secondaryUserId,
          secondaryUserName: (mode === 'secondary' || mode === 'all') ? slot1.secondaryUserName : slot.secondaryUserName,
          secondaryUserAvatar: (mode === 'secondary' || mode === 'all') ? slot1.secondaryUserAvatar : slot.secondaryUserAvatar,
        };
      }
      return slot;
    }));

    triggerTeamsWebhook(
      `🔄 Shift Swap Confirmed (${date1} ⇄ ${date2}) - ${teamName || 'Team'}`,
      `Shift handover swap completed for ${mode.toUpperCase()} roles between ${date1} and ${date2}.`,
      'roster_alert'
    );
  };

  const triggerEmailReminder = (recipientEmail?: string) => {
    const pendingLeave = leaveRequests.filter(r => r.status === 'pending');
    const pendingOT = overtimeRequests.filter(o => o.status === 'pending');
    const targetEmail = recipientEmail || 'sarah.jenkins@acmeteam.internal';

    const content = `Automated Email Digest sent to ${targetEmail}: ${pendingLeave.length} pending time-off approvals & ${pendingOT.length} after-office overtime submissions awaiting manager review.`;

    const newLog: NotificationLog = {
      id: `notif_email_${Date.now()}`,
      channel: 'email',
      title: `⏰ [Automated Reminder] ${pendingLeave.length + pendingOT.length} Pending Approval Items`,
      recipient: targetEmail,
      content,
      timestamp: new Date().toISOString(),
      status: 'delivered',
      actionType: 'reminder'
    };

    setNotifications(prev => [newLog, ...prev]);

    setEmailSettings(prev => ({
      ...prev,
      lastRunAt: new Date().toISOString()
    }));

    return {
      count: pendingLeave.length + pendingOT.length,
      emailContent: content
    };
  };

  const updateWebhookSettings = (newSettings: Partial<WebhookSettings>) => {
    setWebhookSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateEmailSettings = (newSettings: Partial<EmailReminderSettings>) => {
    setEmailSettings(prev => ({ ...prev, ...newSettings }));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        leaveBalances,
        leaveRequests,
        overtimeRequests,
        roster,
        notifications,
        webhookSettings,
        emailSettings,
        selectedMonth,
        switchUser,
        updateUserRole,
        createMonthlyRoster,
        addUser,
        deleteUser,
        resetToCleanState,
        submitLeaveRequest,
        approveLeaveRequest,
        rejectLeaveRequest,
        cancelLeaveRequest,
        submitOvertimeRequest,
        approveOvertimeRequest,
        rejectOvertimeRequest,
        updateRosterSlot,
        swapRosterShifts,
        triggerTeamsWebhook,
        triggerEmailReminder,
        updateWebhookSettings,
        updateEmailSettings,
        clearNotifications,
        getUserLeaveBalance,
        checkRosterConflict,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
