import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  Clock, 
  Bell, 
  Users, 
  Plus, 
  Moon, 
  CheckCircle, 
  ShieldCheck, 
  MessageSquare, 
  Mail, 
  Sparkles,
  ChevronDown,
  UserPlus,
  Shield
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'timeoff' | 'roster' | 'overtime' | 'notifications';
  setActiveTab: (tab: 'dashboard' | 'timeoff' | 'roster' | 'overtime' | 'notifications') => void;
  onRequestTimeOff: () => void;
  onRequestOvertime: () => void;
  onOpenEmailPreview: () => void;
  onOpenTeamsCard: () => void;
  onOpenAddUser?: () => void;
  onOpenManageRoles?: () => void;
  onOpenCreateRoster?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onRequestTimeOff,
  onRequestOvertime,
  onOpenEmailPreview,
  onOpenTeamsCard,
  onOpenAddUser,
  onOpenManageRoles,
  onOpenCreateRoster
}) => {
  const { currentUser, users, switchUser, leaveRequests, overtimeRequests, notifications } = useApp();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const pendingLeaveCount = leaveRequests.filter(r => r.status === 'pending').length;
  const pendingOTCount = overtimeRequests.filter(o => o.status === 'pending').length;
  const totalPending = pendingLeaveCount + pendingOTCount;

  return (
    <header id="main-navbar" className="bg-white sticky top-0 z-40 border-b border-slate-200 shadow-xs">
      {/* Top Brand & Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand + Main Nav Links */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-base shadow-xs">
                T
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">TimeSync</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 hidden sm:inline-block">
                  Roster & Leave
                </span>
              </div>
            </div>

            {/* Desktop Clean Minimalist Nav */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
              <button
                id="nav-tab-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`py-1 transition relative ${
                  activeTab === 'dashboard'
                    ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Dashboard
              </button>

              <button
                id="nav-tab-roster"
                onClick={() => setActiveTab('roster')}
                className={`py-1 transition relative flex items-center gap-1.5 ${
                  activeTab === 'roster'
                    ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>Roster</span>
              </button>

              <button
                id="nav-tab-timeoff"
                onClick={() => setActiveTab('timeoff')}
                className={`py-1 transition relative flex items-center gap-1.5 ${
                  activeTab === 'timeoff'
                    ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>Leave Requests</span>
                {currentUser.role === 'manager' && pendingLeaveCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                    {pendingLeaveCount}
                  </span>
                )}
              </button>

              <button
                id="nav-tab-overtime"
                onClick={() => setActiveTab('overtime')}
                className={`py-1 transition relative flex items-center gap-1.5 ${
                  activeTab === 'overtime'
                    ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>Overtime</span>
                {currentUser.role === 'manager' && pendingOTCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {pendingOTCount}
                  </span>
                )}
              </button>

              <button
                id="nav-tab-notifications"
                onClick={() => setActiveTab('notifications')}
                className={`py-1 transition relative flex items-center gap-1.5 ${
                  activeTab === 'notifications'
                    ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>Settings & Webhooks</span>
              </button>
            </nav>
          </div>

          {/* Right Tools & User Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Teams Connected Badge */}
            <div 
              onClick={onOpenTeamsCard}
              title="Microsoft Teams Webhook Active"
              className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-100 cursor-pointer hover:bg-green-100/70 transition"
            >
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="hidden sm:inline">Teams Connected</span>
            </div>

            {/* Quick Action Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              {currentUser.role === 'manager' && onOpenAddUser && (
                <button
                  id="navbar-add-employee-btn"
                  onClick={onOpenAddUser}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Add Employee</span>
                </button>
              )}

              <button
                id="quick-request-leave-btn"
                onClick={onRequestTimeOff}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Request Leave</span>
              </button>

              <button
                id="quick-log-overtime-btn"
                onClick={onRequestOvertime}
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Log Overtime</span>
              </button>
            </div>

            {/* User Profile Switcher */}
            <div className="relative">
              <button
                id="user-switcher-dropdown-toggle"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-indigo-100 transition group"
                title={`Active user: ${currentUser.name} (${currentUser.role})`}
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-9 h-9 bg-slate-200 rounded-full border-2 border-white shadow-xs object-cover"
                />
                <div className="text-left hidden xl:block">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <span>{currentUser.name}</span>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full ${
                      currentUser.role === 'manager' 
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {currentUser.role === 'manager' ? 'Manager (Approver)' : 'Employee'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-600">{currentUser.teamName || 'Team'}</span> • {currentUser.jobTitle}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition hidden xl:block" />
              </button>

              {/* Dropdown Menu */}
              {isUserDropdownOpen && (
                <div 
                  id="user-switcher-dropdown-menu"
                  className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-4 py-2.5 border-b border-slate-100 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">Switch Role / Persona</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Test as Manager or Employee</p>
                    </div>
                  </div>

                  {currentUser.role === 'manager' && (
                    <div className="p-2 border-b border-slate-100 space-y-1.5">
                      {onOpenAddUser && (
                        <button
                          id="dropdown-add-employee-btn"
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            onOpenAddUser();
                          }}
                          className="w-full py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>+ Add New Employee</span>
                        </button>
                      )}
                      {onOpenManageRoles && (
                        <button
                          id="dropdown-manage-roles-btn"
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            onOpenManageRoles();
                          }}
                          className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                        >
                          <Shield className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Manage Employee Roles</span>
                        </button>
                      )}
                    </div>
                  )}
                  
                  <div className="max-h-64 overflow-y-auto py-1 divide-y divide-slate-50">
                    {users.map(u => (
                      <button
                        key={u.id}
                        id={`switch-to-user-${u.id}`}
                        onClick={() => {
                          switchUser(u.id);
                          setIsUserDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2.5 flex items-center space-x-3 text-left hover:bg-slate-50 transition ${
                          u.id === currentUser.id ? 'bg-indigo-50/60 border-l-2 border-indigo-600' : ''
                        }`}
                      >
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-900 flex items-center justify-between">
                            <span className="truncate">{u.name}</span>
                            <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                              u.role === 'manager' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {u.role}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            <span className="font-semibold text-slate-600">{u.teamName}</span> • {u.jobTitle}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Mobile Nav Links Bar */}
      <div className="lg:hidden border-t border-slate-100 px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none bg-slate-50/80">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
            activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('roster')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
            activeTab === 'roster' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          Roster
        </button>
        <button
          onClick={() => setActiveTab('timeoff')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
            activeTab === 'timeoff' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          Leave Requests {currentUser.role === 'manager' && pendingLeaveCount > 0 && `(${pendingLeaveCount})`}
        </button>
        <button
          onClick={() => setActiveTab('overtime')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
            activeTab === 'overtime' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          Overtime {currentUser.role === 'manager' && pendingOTCount > 0 && `(${pendingOTCount})`}
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
            activeTab === 'notifications' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          Settings
        </button>
      </div>
    </header>
  );
};

