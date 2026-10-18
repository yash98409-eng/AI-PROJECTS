import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Search,
  Sparkles,
  Database,
  Calendar,
  Bell,
  Check,
  ChevronRight,
  GraduationCap,
  Users,
  BookOpen,
  User,
  Settings,
  ChevronDown,
  AtSign,
  Building,
  Layers,
  CreditCard,
  LogIn,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SchoolService } from '../../supabase/supabaseClient';
import { Student } from '../../types';
import { RoleBadge } from '../common/Badges';

export const Header: React.FC = () => {
  const {
    sidebarOpen,
    setSidebarOpen,
    school,
    schools,
    isSupabaseConnected,
    setActivePage,
    viewStudentProfile,
    currentUser,
    setIsProfileModalOpen,
    setIsAuthModalOpen,
    setIsSchoolSwitcherOpen,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      SchoolService.getStudents().then((students) => {
        const q = searchQuery.toLowerCase();
        const matches = students.filter(
          (s) =>
            s.first_name.toLowerCase().includes(q) ||
            s.last_name.toLowerCase().includes(q) ||
            s.admission_number.toLowerCase().includes(q) ||
            s.current_class?.toLowerCase().includes(q)
        );
        setSearchResults(matches.slice(0, 5));
        setSearchOpen(true);
      });
    } else {
      setSearchResults([]);
      setSearchOpen(false);
    }
  }, [searchQuery]);

  // Click outside to close search dropdown & profile menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-2.5 transition-all">
      <div className="flex items-center justify-between gap-3">
        {/* Mobile menu toggle & School Switcher */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* School Switcher Trigger Button */}
          <button
            type="button"
            onClick={() => setIsSchoolSwitcherOpen(true)}
            className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl border border-slate-200/90 hover:border-indigo-300 bg-slate-50/70 hover:bg-indigo-50/50 transition-all text-left group"
            title="Click to switch institution (School A, B, C, D, E)"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-2xs shrink-0">
              {school?.code || 'SCH'}
            </div>

            <div className="max-w-[150px] sm:max-w-[210px]">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600">
                  {school?.name || 'Oakridge International'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 shrink-0" />
              </div>
              <p className="text-[10px] text-slate-500 truncate">
                {school?.city || 'Campus'} • {school?.curriculum || 'CBSE'}
              </p>
            </div>
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md mx-2 hidden md:block" ref={searchRef}>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students, admission no, or class..."
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:bg-white text-slate-800 transition-all"
            />
          </div>

          {/* Search dropdown results */}
          {searchOpen && searchResults.length > 0 && (
            <div className="absolute mt-1.5 w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
                <span>Matching Students</span>
                <span>{searchResults.length} found</span>
              </div>
              {searchResults.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    viewStudentProfile(s.id);
                    setSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-indigo-50 flex items-center justify-between transition-colors text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-800">
                      {s.first_name} {s.last_name}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-2">({s.admission_number})</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                    {s.current_class}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Actions: Plan, Notifications, Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Plan / Pricing Pill */}
          <button
            type="button"
            onClick={() => setActivePage('billing')}
            className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 text-indigo-700 text-[11px] font-bold transition shadow-2xs"
            title="View Phase 4 Pricing & Subscription Model"
          >
            <CreditCard className="w-3 h-3 text-indigo-600" />
            <span className="capitalize">{school?.plan || 'Standard'} Plan</span>
            <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.2 rounded-full uppercase font-extrabold">
              Upgrade
            </span>
          </button>

          {/* Database indicator */}
          <div
            className={`hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              isSupabaseConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            <Database className="w-3 h-3 text-emerald-500" />
            <span>Multi-Tenant RLS</span>
          </div>

          {/* Quick Sign In / Switch Persona Button */}
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="inline-flex items-center space-x-1 px-2 sm:px-2.5 py-1 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
            title="Phase 1: Switch Persona or Login"
          >
            <LogIn className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden md:inline">Sign In / Switch</span>
          </button>

          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white"></span>
            </button>

            {/* Notification Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-xs animate-in fade-in">
                <div className="px-4 py-2 font-bold text-slate-900 border-b border-slate-100 flex items-center justify-between">
                  <span>System Alerts & Logs</span>
                  <span className="text-[10px] text-indigo-600 font-semibold cursor-pointer">
                    Mark Read
                  </span>
                </div>
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  <div className="p-3 hover:bg-slate-50 transition-colors">
                    <p className="font-semibold text-slate-800">Attendance Alert Triggered</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Rohan Verma fell below 75% attendance threshold.
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">10 mins ago</span>
                  </div>
                  <div className="p-3 hover:bg-slate-50 transition-colors">
                    <p className="font-semibold text-slate-800">Mid-Term Marks Recorded</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Class 10-A Mathematics marks recorded by Faculty.
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">2 hours ago</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Button */}
          <div ref={profileRef} className="relative pl-1">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center space-x-2 p-1 sm:pl-2 sm:pr-2.5 py-1 rounded-2xl hover:bg-slate-100 border border-slate-200/80 transition-all group"
              title="Manage user profile & avatar"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-100 border border-indigo-200 overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold text-indigo-700 shadow-2xs">
                {currentUser.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{currentUser.full_name.slice(0, 2).toUpperCase()}</span>
                )}
              </div>

              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors truncate max-w-[90px]">
                  {currentUser.full_name.split(' ')[0]}
                </p>
                <p className="text-[10px] font-mono text-indigo-600 font-semibold leading-tight truncate max-w-[90px]">
                  @{currentUser.username || 'user'}
                </p>
              </div>

              <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-700 transition-colors hidden sm:block" />
            </button>

            {/* Profile Dropdown Menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                {/* User Summary Header */}
                <div className="px-4 py-3 border-b border-slate-100 flex items-center space-x-3 bg-slate-50/50">
                  <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-indigo-200 bg-white shadow-xs shrink-0 flex items-center justify-center font-bold text-indigo-700">
                    {currentUser.avatar_url ? (
                      <img
                        src={currentUser.avatar_url}
                        alt={currentUser.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{currentUser.full_name.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {currentUser.full_name}
                    </h4>
                    <p className="text-[11px] font-semibold text-indigo-600 flex items-center space-x-0.5 truncate">
                      <AtSign className="w-2.5 h-2.5" />
                      <span>{currentUser.username || 'username'}</span>
                    </p>
                    <div className="mt-1">
                      <RoleBadge role={currentUser.role} />
                    </div>
                  </div>
                </div>

                {/* Menu Actions */}
                <div className="p-1.5 space-y-1">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl hover:bg-indigo-50 hover:text-indigo-700 flex items-center space-x-2.5 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <User className="w-4 h-4 text-indigo-600" />
                    <span>Edit Profile & Avatar</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      setIsSchoolSwitcherOpen(true);
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl hover:bg-indigo-50 hover:text-indigo-700 flex items-center space-x-2.5 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span>Multi-School Switcher</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      setActivePage('schools_hub');
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 flex items-center space-x-2.5 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <Building className="w-4 h-4 text-slate-500" />
                    <span>Phase 3: Multi-School SaaS Hub</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      setActivePage('billing');
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 flex items-center space-x-2.5 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <CreditCard className="w-4 h-4 text-slate-500" />
                    <span>Phase 4: Pricing & Invoices</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 flex items-center space-x-2.5 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <LogIn className="w-4 h-4 text-slate-500" />
                    <span>Switch Role / Sign In</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
