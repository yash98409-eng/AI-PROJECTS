import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  MessageSquareText,
  GraduationCap,
  Users,
  BookOpen,
  CalendarCheck,
  Award,
  CreditCard,
  Lightbulb,
  Bell,
  FileText,
  Settings,
  X,
  Database,
  ShieldCheck,
  User,
  AtSign,
  Edit3,
  Building,
  Layers,
} from 'lucide-react';
import { useApp, ActivePage } from '../../context/AppContext';
import { RoleBadge } from '../common/Badges';

interface NavItem {
  id: ActivePage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  highlight?: boolean;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'ai_entry', label: 'Talk to SchoolAI', icon: Sparkles, badge: 'Voice/AI', highlight: true },
  { id: 'ai_assistant', label: 'AI Assistant', icon: MessageSquareText, badge: 'Smart' },
  { id: 'schools_hub', label: 'Multi-School Hub', icon: Layers, badge: 'Phase 3' },
  { id: 'billing', label: 'Pricing & Plans', icon: CreditCard, badge: '₹999+' },
  { id: 'students', label: 'Students', icon: GraduationCap },
  { id: 'teachers', label: 'Teachers', icon: Users },
  { id: 'classes', label: 'Classes & Subjects', icon: BookOpen },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { id: 'marks', label: 'Marks & Exams', icon: Award },
  { id: 'fees', label: 'Fee Management', icon: CreditCard },
  { id: 'insights', label: 'AI Insights', icon: Lightbulb, badge: 'New' },
  { id: 'notices', label: 'Notices & Awards', icon: Bell },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'settings', label: 'Settings & Supabase', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const {
    activePage,
    setActivePage,
    currentUser,
    setUserRole,
    setIsProfileModalOpen,
    school,
    isSupabaseConnected,
    sidebarOpen,
    setSidebarOpen,
  } = useApp();

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="px-5 py-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-900/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center space-x-1.5">
                <span className="text-base font-extrabold text-white tracking-tight">SchoolAI</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-[140px]">
                {school?.name || 'Oakridge International'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Supabase Status Pill */}
        <div className="px-4 pt-3 pb-1">
          <button
            onClick={() => {
              setActivePage('settings');
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
              isSupabaseConnected
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-950/60'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isSupabaseConnected ? 'Supabase Connected' : 'Demo Mode (Local)'}</span>
            </div>
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                    : item.highlight
                    ? 'text-indigo-300 hover:bg-indigo-950/40 hover:text-indigo-200'
                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-white'
                        : item.highlight
                        ? 'text-indigo-400'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.highlight
                        ? 'bg-indigo-500/30 text-indigo-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Role Switcher & Profile footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/90">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Active Role
            </span>
            <RoleBadge role={currentUser.role} />
          </div>

          <div className="grid grid-cols-2 gap-1 mb-3">
            <button
              onClick={() => setUserRole('super_admin')}
              className={`px-2 py-1 text-[11px] font-medium rounded-lg transition-colors text-center ${
                currentUser.role === 'super_admin'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Super Admin
            </button>
            <button
              onClick={() => setUserRole('school_admin')}
              className={`px-2 py-1 text-[11px] font-medium rounded-lg transition-colors text-center ${
                currentUser.role === 'school_admin'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              School Admin
            </button>
            <button
              onClick={() => setUserRole('teacher')}
              className={`px-2 py-1 text-[11px] font-medium rounded-lg transition-colors text-center ${
                currentUser.role === 'teacher'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Teacher
            </button>
            <button
              onClick={() => setUserRole('staff')}
              className={`px-2 py-1 text-[11px] font-medium rounded-lg transition-colors text-center ${
                currentUser.role === 'staff'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Staff
            </button>
          </div>

          {/* User Profile Card */}
          <div
            onClick={() => setIsProfileModalOpen(true)}
            className="group flex items-center justify-between p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 cursor-pointer transition-all"
            title="Click to edit profile and avatar"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white uppercase overflow-hidden border border-indigo-400/60 shadow-xs shrink-0">
                {currentUser.avatar_url ? (
                  <img src={currentUser.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  currentUser.full_name.slice(0, 2)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                  {currentUser.full_name}
                </p>
                <p className="text-[10px] font-mono text-indigo-400 truncate flex items-center space-x-0.5">
                  <AtSign className="w-2.5 h-2.5" />
                  <span>{currentUser.username || 'user'}</span>
                </p>
              </div>
            </div>

            <div className="p-1 rounded-lg text-slate-400 group-hover:text-indigo-400 group-hover:bg-slate-700/60 transition-colors">
              <Edit3 className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
