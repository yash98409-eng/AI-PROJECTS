import React, { createContext, useContext, useState, useEffect } from 'react';
import { School, UserProfile, UserRole, Student, PlanTier } from '../types';
import { SchoolService, getStoredSupabaseConfig } from '../supabase/supabaseClient';

export type ActivePage =
  | 'dashboard'
  | 'ai_entry'
  | 'ai_assistant'
  | 'students'
  | 'teachers'
  | 'classes'
  | 'marks'
  | 'attendance'
  | 'fees'
  | 'insights'
  | 'notices'
  | 'reports'
  | 'settings'
  | 'profile'
  | 'billing'
  | 'schools_hub';

interface AppContextType {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  currentUser: UserProfile;
  setUserRole: (role: UserRole) => void;
  updateCurrentUserProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isSchoolSwitcherOpen: boolean;
  setIsSchoolSwitcherOpen: (open: boolean) => void;
  school: School | null;
  schools: School[];
  switchSchool: (schoolId: string) => Promise<void>;
  registerSchool: (data: Partial<School>) => Promise<School>;
  updatePlan: (plan: PlanTier, cycle?: 'monthly' | 'yearly') => Promise<void>;
  login: (usernameOrEmail: string, role?: UserRole) => Promise<void>;
  signup: (data: { fullName: string; email: string; role: UserRole; schoolId?: string; newSchoolName?: string }) => Promise<void>;
  logout: () => void;
  refreshData: () => void;
  dataVersion: number;
  isSupabaseConnected: boolean;
  selectedStudentId: string | null;
  viewStudentProfile: (studentId: string) => void;
  closeStudentProfile: () => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  languagePreference: 'en' | 'hi' | 'hinglish';
  setLanguagePreference: (lang: 'en' | 'hi' | 'hinglish') => void;
  initialAiQuery: string | null;
  setInitialAiQuery: (query: string | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'usr-admin-01',
    school_id: 'sch-oakridge-001',
    username: 'sarah_jenkins',
    full_name: 'Dr. Sarah Jenkins',
    email: 'admin@oakridgeacademy.edu',
    role: 'super_admin',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    avatar_type: 'preset',
    bio: 'Director of Academics & Senior Institutional Administrator',
    department: 'Executive Administration',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSchoolSwitcherOpen, setIsSchoolSwitcherOpen] = useState(false);
  const [school, setSchool] = useState<School | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [dataVersion, setDataVersion] = useState(0);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [globalSearch, setGlobalSearch] = useState('');
  const [languagePreference, setLanguagePreference] = useState<'en' | 'hi' | 'hinglish'>('en');
  const [initialAiQuery, setInitialAiQuery] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const refreshData = () => {
    setDataVersion((v) => v + 1);
  };

  useEffect(() => {
    const config = getStoredSupabaseConfig();
    setIsSupabaseConnected(config.isConfigured);

    SchoolService.getSchools().then((list) => {
      setSchools(list);
    });

    SchoolService.getSchool().then(setSchool);
    SchoolService.getCurrentUser(currentUser.role).then(setCurrentUser);
  }, [dataVersion]);

  const switchSchool = async (schoolId: string) => {
    const updatedSchool = await SchoolService.switchSchool(schoolId);
    setSchool(updatedSchool);
    // Update user school if relevant
    setCurrentUser((prev) => ({ ...prev, school_id: schoolId }));
    refreshData();
  };

  const registerSchool = async (data: Partial<School>): Promise<School> => {
    const newSchool = await SchoolService.addSchool(data, currentUser);
    await switchSchool(newSchool.id);
    return newSchool;
  };

  const updatePlan = async (plan: PlanTier, cycle: 'monthly' | 'yearly' = 'monthly') => {
    if (!school) return;
    const updated = await SchoolService.updateSchoolPlan(school.id, plan, cycle);
    setSchool(updated);
    refreshData();
  };

  const login = async (usernameOrEmail: string, role?: UserRole) => {
    const user = await SchoolService.login(usernameOrEmail, role);
    setCurrentUser(user);
    if (user.school_id) {
      await switchSchool(user.school_id);
    }
    refreshData();
  };

  const signup = async (data: {
    fullName: string;
    email: string;
    role: UserRole;
    schoolId?: string;
    newSchoolName?: string;
  }) => {
    const user = await SchoolService.signup(data);
    setCurrentUser(user);
    if (user.school_id) {
      await switchSchool(user.school_id);
    }
    refreshData();
  };

  const logout = () => {
    // Reset to a guest or default user and show auth modal
    setIsAuthModalOpen(true);
  };

  const setUserRole = (role: UserRole) => {
    SchoolService.getCurrentUser(role).then((user) => {
      setCurrentUser(user);
    });
  };

  const updateCurrentUserProfile = async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    const updated = await SchoolService.updateUserProfile(currentUser.id, updates);
    setCurrentUser(updated);
    refreshData();
    return updated;
  };

  const viewStudentProfile = (studentId: string) => {
    setSelectedStudentId(studentId);
    setActivePage('students');
  };

  const closeStudentProfile = () => {
    setSelectedStudentId(null);
  };

  return (
    <AppContext.Provider
      value={{
        activePage,
        setActivePage,
        currentUser,
        setUserRole,
        updateCurrentUserProfile,
        isProfileModalOpen,
        setIsProfileModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isSchoolSwitcherOpen,
        setIsSchoolSwitcherOpen,
        school,
        schools,
        switchSchool,
        registerSchool,
        updatePlan,
        login,
        signup,
        logout,
        refreshData,
        dataVersion,
        isSupabaseConnected,
        selectedStudentId,
        viewStudentProfile,
        closeStudentProfile,
        globalSearch,
        setGlobalSearch,
        languagePreference,
        setLanguagePreference,
        initialAiQuery,
        setInitialAiQuery,
        sidebarOpen,
        setSidebarOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
