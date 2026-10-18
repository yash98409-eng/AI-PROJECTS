/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ToastProvider } from './context/ToastContext';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

import { DashboardPage } from './pages/DashboardPage';
import { AiDataEntryPage } from './pages/AiDataEntryPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { StudentsPage } from './pages/StudentsPage';
import { TeachersPage } from './pages/TeachersPage';
import { ClassesSubjectsPage } from './pages/ClassesSubjectsPage';
import { MarksPage } from './pages/MarksPage';
import { AttendancePage } from './pages/AttendancePage';
import { FeesPage } from './pages/FeesPage';
import { AiInsightsPage } from './pages/AiInsightsPage';
import { NoticesAchievementsPage } from './pages/NoticesAchievementsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { BillingPage } from './pages/BillingPage';
import { SchoolsHubPage } from './pages/SchoolsHubPage';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { AuthModal } from './components/modals/AuthModal';
import { SchoolSwitcherModal } from './components/modals/SchoolSwitcherModal';

const MainContent: React.FC = () => {
  const {
    activePage,
    isProfileModalOpen,
    setIsProfileModalOpen,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isSchoolSwitcherOpen,
    setIsSchoolSwitcherOpen,
  } = useApp();

  const renderCurrentPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'ai_entry':
        return <AiDataEntryPage />;
      case 'ai_assistant':
        return <AiAssistantPage />;
      case 'schools_hub':
        return <SchoolsHubPage />;
      case 'billing':
        return <BillingPage />;
      case 'students':
        return <StudentsPage />;
      case 'teachers':
        return <TeachersPage />;
      case 'classes':
        return <ClassesSubjectsPage />;
      case 'marks':
        return <MarksPage />;
      case 'attendance':
        return <AttendancePage />;
      case 'fees':
        return <FeesPage />;
      case 'insights':
        return <AiInsightsPage />;
      case 'notices':
        return <NoticesAchievementsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/60 font-sans text-slate-800 flex">
      {/* Responsive Left Navigation */}
      <Sidebar />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {renderCurrentPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Phase 1 Auth / Persona Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Phase 3 Multi-School SaaS Switcher Modal */}
      <SchoolSwitcherModal
        isOpen={isSchoolSwitcherOpen}
        onClose={() => setIsSchoolSwitcherOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </ToastProvider>
  );
}
