import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { TimeOffView } from './components/TimeOffView';
import { RosterView } from './components/RosterView';
import { OvertimeView } from './components/OvertimeView';
import { NotificationsView } from './components/NotificationsView';
import { RequestTimeOffModal } from './components/Modals/RequestTimeOffModal';
import { RequestOvertimeModal } from './components/Modals/RequestOvertimeModal';
import { EmailPreviewModal } from './components/Modals/EmailPreviewModal';
import { TeamsCardModal } from './components/Modals/TeamsCardModal';
import { AddUserModal } from './components/Modals/AddUserModal';
import { CreateRosterModal } from './components/Modals/CreateRosterModal';
import { ManageRolesModal } from './components/Modals/ManageRolesModal';

function MainApp() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'timeoff' | 'roster' | 'overtime' | 'notifications'>('dashboard');
  const [isTimeOffModalOpen, setIsTimeOffModalOpen] = useState(false);
  const [isOvertimeModalOpen, setIsOvertimeModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isTeamsModalOpen, setIsTeamsModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isCreateRosterModalOpen, setIsCreateRosterModalOpen] = useState(false);
  const [isManageRolesModalOpen, setIsManageRolesModalOpen] = useState(false);
  const [selectedTeamsLeaveId, setSelectedTeamsLeaveId] = useState<string | undefined>(undefined);

  const handleOpenTeamsCard = (leaveId?: string) => {
    setSelectedTeamsLeaveId(leaveId);
    setIsTeamsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRequestTimeOff={() => setIsTimeOffModalOpen(true)}
        onRequestOvertime={() => setIsOvertimeModalOpen(true)}
        onOpenEmailPreview={() => setIsEmailModalOpen(true)}
        onOpenTeamsCard={() => handleOpenTeamsCard()}
        onOpenAddUser={() => setIsAddUserModalOpen(true)}
        onOpenManageRoles={() => setIsManageRolesModalOpen(true)}
        onOpenCreateRoster={() => setIsCreateRosterModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            onRequestTimeOff={() => setIsTimeOffModalOpen(true)}
            onRequestOvertime={() => setIsOvertimeModalOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenCreateRoster={() => setIsCreateRosterModalOpen(true)}
            onOpenAddUser={() => setIsAddUserModalOpen(true)}
            onOpenManageRoles={() => setIsManageRolesModalOpen(true)}
          />
        )}

        {activeTab === 'timeoff' && (
          <TimeOffView
            onRequestTimeOff={() => setIsTimeOffModalOpen(true)}
            onOpenTeamsCard={(id) => handleOpenTeamsCard(id)}
          />
        )}

        {activeTab === 'roster' && (
          <RosterView />
        )}

        {activeTab === 'overtime' && (
          <OvertimeView
            onRequestOvertime={() => setIsOvertimeModalOpen(true)}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationsView />
        )}
      </main>

      {/* Clean Minimalist Footer */}
      <footer className="px-8 py-3.5 bg-white border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 font-medium gap-3">
        <div className="flex flex-wrap items-center gap-6">
          <span>Next automated reminder: Today, 5:00 PM</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            <span>Teams notifications: Active</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsTimeOffModalOpen(true)}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition text-xs"
          >
            + New Shift Request
          </button>
          <button 
            onClick={() => setIsOvertimeModalOpen(true)}
            className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg font-semibold transition text-xs"
          >
            Log Overtime
          </button>
        </div>
      </footer>

      {/* Shared Modals */}
      <RequestTimeOffModal
        isOpen={isTimeOffModalOpen}
        onClose={() => setIsTimeOffModalOpen(false)}
      />

      <RequestOvertimeModal
        isOpen={isOvertimeModalOpen}
        onClose={() => setIsOvertimeModalOpen(false)}
      />

      <EmailPreviewModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
      />

      <TeamsCardModal
        isOpen={isTeamsModalOpen}
        onClose={() => {
          setIsTeamsModalOpen(false);
          setSelectedTeamsLeaveId(undefined);
        }}
        selectedLeaveId={selectedTeamsLeaveId}
      />

      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
      />

      <CreateRosterModal
        isOpen={isCreateRosterModalOpen}
        onClose={() => setIsCreateRosterModalOpen(false)}
      />

      <ManageRolesModal
        isOpen={isManageRolesModalOpen}
        onClose={() => setIsManageRolesModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
