import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, TeamName, TEAM_NAMES } from '../types';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Trash2, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  AtSign, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  ArrowRightLeft,
  Calendar,
  Briefcase,
  UserCheck,
  Building,
  Sparkles
} from 'lucide-react';
import { AddUserModal } from './Modals/AddUserModal';

export const UserManagementView: React.FC = () => {
  const { 
    users, 
    currentUser, 
    updateUserRole, 
    deleteUser, 
    resetToCleanState, 
    switchUser,
    leaveBalances 
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'manager' | 'employee'>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  
  // Feedback banners
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Delete modal confirmation state
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string; email: string } | null>(null);

  // Reset confirmation state
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 3500);
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;

    if (currentUser.role !== 'manager') {
      showFeedback('error', 'Only Managers can alter organizational roles.');
      return;
    }

    const result = updateUserRole(userId, newRole);
    if (!result.success) {
      showFeedback('error', result.error || 'Failed to update user role.');
    } else {
      showFeedback('success', `Changed role for ${target.name} to ${newRole === 'manager' ? 'Manager (Admin)' : 'Employee'}.`);
    }
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) return;
    const result = deleteUser(userToDelete.id);
    if (!result.success) {
      showFeedback('error', result.error || 'Failed to remove user.');
    } else {
      showFeedback('success', `Removed ${userToDelete.name} from the organization.`);
    }
    setUserToDelete(null);
  };

  const handleResetData = () => {
    resetToCleanState();
    setShowResetConfirm(false);
    showFeedback('success', 'Reset complete: all dummy users removed and clean manager state initialized.');
  };

  // Filtered users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.teamsHandle && user.teamsHandle.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesTeam = teamFilter === 'all' || user.teamName === teamFilter;

    return matchesSearch && matchesRole && matchesTeam;
  });

  const totalUsers = users.length;
  const managerCount = users.filter(u => u.role === 'manager').length;
  const employeeCount = users.filter(u => u.role === 'employee').length;
  const uniqueTeamsCount = new Set(users.map(u => u.teamName)).size;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">User & Role Management</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage staff directory, promote roles between Employee and Manager, and onboard or remove users.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              id="reset-clean-users-btn"
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer"
              title="Clean slate: Remove all dummy test users"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Clean State</span>
            </button>

            <button
              id="open-add-user-modal-btn"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New User</span>
            </button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {feedback && (
          <div className={`mt-4 p-3.5 rounded-xl border text-xs flex items-center gap-2.5 transition animate-in fade-in ${
            feedback.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Users</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalUsers}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Active in directory</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>Managers</span>
          </div>
          <div className="text-2xl font-black text-indigo-600 mt-1">{managerCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Full admin & approval permissions</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>Employees</span>
          </div>
          <div className="text-2xl font-black text-slate-800 mt-1">{employeeCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Roster duty & personal requests</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Building className="w-3 h-3" />
            <span>Departments</span>
          </div>
          <div className="text-2xl font-black text-slate-800 mt-1">{uniqueTeamsCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Configured functional teams</div>
        </div>
      </div>

      {/* Role Permissions Information Banner */}
      <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-indigo-950">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-100/80 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
            <Shield className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <div className="font-bold">Role Access Overview:</div>
            <p className="text-[11px] text-indigo-900/80 leading-relaxed">
              <strong>Manager:</strong> Can create & edit 3-shift duty rosters, swap shifts, review/approve leave & overtime, and manage users.
              <span className="mx-2">•</span>
              <strong>Employee:</strong> Views team on-call roster, tracks personal leave balances, and submits time-off requests.
            </p>
          </div>
        </div>
        <div className="text-[11px] bg-white px-3 py-1.5 rounded-lg border border-indigo-200 font-semibold text-indigo-800 shrink-0 shadow-2xs">
          Currently logged in: <span className="underline">{currentUser.name}</span> ({currentUser.role.toUpperCase()})
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="user-search-input"
            type="text"
            placeholder="Search by name, email, role, or team..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto ml-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">Role:</span>
            <select
              id="user-role-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Roles ({users.length})</option>
              <option value="manager">Managers ({managerCount})</option>
              <option value="employee">Employees ({employeeCount})</option>
            </select>
          </div>

          {/* Team Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">Team:</span>
            <select
              id="user-team-filter"
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Teams</option>
              {TEAM_NAMES.map(tn => (
                <option key={tn} value={tn}>{tn}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table / Directory */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">User Details</th>
                <th className="py-3.5 px-4">Team & Position</th>
                <th className="py-3.5 px-4">Access Role</th>
                <th className="py-3.5 px-4">Leave Entitlements</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <div className="max-w-sm mx-auto space-y-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <Users className="w-5 h-5" />
                      </div>
                      <div className="text-sm font-bold text-slate-800">No users match your filter</div>
                      <p className="text-xs text-slate-400">
                        Try resetting your search query or team filter, or add a new team member.
                      </p>
                      <button
                        onClick={() => { setSearchQuery(''); setRoleFilter('all'); setTeamFilter('all'); }}
                        className="mt-2 text-xs text-indigo-600 font-semibold hover:underline"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isCurrent = user.id === currentUser.id;
                  const balance = leaveBalances[user.id];

                  return (
                    <tr 
                      key={user.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isCurrent ? 'bg-indigo-50/20' : ''
                      }`}
                    >
                      {/* User Avatar + Identity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                            />
                            {user.role === 'manager' && (
                              <div 
                                className="absolute -bottom-1 -right-1 bg-indigo-600 text-white rounded-full p-0.5 border border-white"
                                title="Manager Access"
                              >
                                <Shield className="w-2.5 h-2.5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5 truncate">
                              <span className="truncate">{user.name}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-indigo-100 text-indigo-700 rounded-md">
                                  Current User
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{user.email}</span>
                            </div>
                            {user.teamsHandle && (
                              <div className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                                <AtSign className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                <span>{user.teamsHandle}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Team & Position */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="font-semibold text-slate-800">{user.jobTitle}</div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {user.teamName}
                          </span>
                        </div>
                      </td>

                      {/* Role Dropdown Selector */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-1.5">
                            <select
                              id={`role-select-${user.id}`}
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                              disabled={currentUser.role !== 'manager'}
                              className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border transition cursor-pointer ${
                                user.role === 'manager'
                                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                              } disabled:opacity-60 disabled:cursor-not-allowed`}
                            >
                              <option value="employee">Employee</option>
                              <option value="manager">Manager (Admin)</option>
                            </select>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {user.role === 'manager' ? 'Can manage roster & approvals' : 'Can submit personal leaves'}
                          </div>
                        </div>
                      </td>

                      {/* Entitlements */}
                      <td className="py-3.5 px-4">
                        {balance ? (
                          <div className="flex items-center gap-2 text-[11px]">
                            <div className="px-2 py-1 bg-slate-50 rounded-md border border-slate-200" title="PTO Balance">
                              <span className="font-bold text-slate-900">{balance.pto.total - balance.pto.used}</span>
                              <span className="text-slate-400 ml-1">PTO</span>
                            </div>
                            <div className="px-2 py-1 bg-slate-50 rounded-md border border-slate-200" title="Sick Leave">
                              <span className="font-bold text-slate-900">{balance.sick.total - balance.sick.used}</span>
                              <span className="text-slate-400 ml-1">Sick</span>
                            </div>
                            <div className="px-2 py-1 bg-slate-50 rounded-md border border-slate-200" title="Comp-off earned from weekend on-call">
                              <span className="font-bold text-slate-900">{balance.compOff.total - balance.compOff.used}</span>
                              <span className="text-slate-400 ml-1">Comp</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No balance record</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Switch User Session Preview */}
                          {!isCurrent && (
                            <button
                              id={`switch-user-${user.id}`}
                              onClick={() => {
                                switchUser(user.id);
                                showFeedback('success', `Active session switched to ${user.name} (${user.role.toUpperCase()}).`);
                              }}
                              className="px-2 py-1.5 text-[11px] font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                              title={`Switch view to ${user.name}`}
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span className="hidden md:inline">Test As</span>
                            </button>
                          )}

                          {/* Delete User Button */}
                          <button
                            id={`delete-user-${user.id}`}
                            onClick={() => setUserToDelete({ id: user.id, name: user.name, email: user.email })}
                            disabled={users.length <= 1}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title={users.length <= 1 ? "Cannot delete sole user" : `Remove ${user.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div id="delete-user-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div id="delete-user-modal" className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-100 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Remove Team Member?</h3>
                <p className="text-xs text-slate-400">This action permanently removes the user from the roster system.</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
              <div className="font-bold text-slate-800">{userToDelete.name}</div>
              <div className="text-slate-500">{userToDelete.email}</div>
              <div className="text-[11px] text-amber-700 mt-2 font-medium">
                Note: Any active schedule slots assigned to this user will be marked as unassigned or reallocated.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-user-btn"
                onClick={confirmDeleteUser}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition cursor-pointer"
              >
                Yes, Remove User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Clean State Confirmation Modal */}
      {showResetConfirm && (
        <div id="reset-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div id="reset-modal" className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-100 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reset to Clean Slate?</h3>
                <p className="text-xs text-slate-400">Remove all dummy test users and start fresh with Suman (Manager).</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This will remove any legacy demo users (e.g. Alex, Elena, Marcus, etc.) and reset your roster to the clean default manager account <strong>Suman</strong> (suman.ailearn@gmail.com). You can then onboard your real team members.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-clean-reset-btn"
                onClick={handleResetData}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition cursor-pointer"
              >
                Reset & Remove Dummy Users
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};
