import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Building,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  School as SchoolIcon,
  KeyRound,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, signup, schools, currentUser, setUserRole } = useApp();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('school_admin');
  const [selectedSchoolId, setSelectedSchoolId] = useState(schools[0]?.id || 'sch-oakridge-001');
  const [newSchoolName, setNewSchoolName] = useState('');
  const [isNewSchool, setIsNewSchool] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const quickPersonas = [
    {
      name: 'Dr. Sarah Jenkins',
      role: 'super_admin' as UserRole,
      title: 'Super Admin',
      school: 'Oakridge Academy',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face',
      email: 'admin@oakridgeacademy.edu',
    },
    {
      name: 'Rajesh Nair',
      role: 'school_admin' as UserRole,
      title: 'Principal / Admin',
      school: "St. Xavier's High School",
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
      email: 'principal@stxaviersmumbai.org',
    },
    {
      name: 'Priya Sharma',
      role: 'teacher' as UserRole,
      title: 'Senior Math Faculty',
      school: 'Delhi Public Academy',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face',
      email: 'priya.sharma@dpsdelhi.edu.in',
    },
    {
      name: 'Amit Verma',
      role: 'staff' as UserRole,
      title: 'Accounts & Fees Officer',
      school: 'Greenfield World School',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
      email: 'accounts@greenfieldpune.edu',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'login') {
        if (!email.trim()) {
          showToast('Please enter an email or username', 'error');
          setIsLoading(false);
          return;
        }
        await login(email.trim(), role);
        showToast(`Welcome back, ${email.split('@')[0]}! Signed in successfully.`, 'success');
        onClose();
      } else {
        if (!fullName.trim() || !email.trim()) {
          showToast('Please provide your full name and email address', 'error');
          setIsLoading(false);
          return;
        }
        await signup({
          fullName: fullName.trim(),
          email: email.trim(),
          role,
          schoolId: isNewSchool ? undefined : selectedSchoolId,
          newSchoolName: isNewSchool ? newSchoolName.trim() : undefined,
        });
        showToast(`Account created! Welcome to SchoolAI Manager, ${fullName.trim()}.`, 'success');
        onClose();
      }
    } catch (err) {
      showToast('Authentication failed. Please check credentials.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPersona = async (persona: typeof quickPersonas[0]) => {
    setIsLoading(true);
    try {
      await login(persona.email, persona.role);
      setUserRole(persona.role);
      showToast(`Switched active profile to ${persona.name} (${persona.title})`, 'success');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <SchoolIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">SchoolAI Manager Auth</h2>
                <p className="text-xs text-slate-400">Phase 1: Secure School Login & SaaS User Access</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center mt-5 p-1 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In to School
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register New School / User
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Persona Fast Login (for testing & demo) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Quick Switch Persona (1-Click Demo)
              </span>
              <span className="text-[11px] text-slate-500">Instant Role Testing</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {quickPersonas.map((p) => {
                const isActive = currentUser.email === p.email;
                return (
                  <button
                    key={p.email}
                    type="button"
                    onClick={() => handleSelectPersona(p)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'border-indigo-500/70 bg-indigo-950/40 text-white shadow-xs'
                        : 'border-slate-800 bg-slate-950/40 hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-700 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate text-white">{p.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{p.title}</p>
                      <p className="text-[9px] text-indigo-400 truncate">{p.school}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="shrink mx-3 text-[11px] font-medium text-slate-500 uppercase">Or Custom Credentials</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Ramesh Gupta"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {mode === 'login' ? 'Email or Username' : 'Institutional Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={mode === 'login' ? 'admin@oakridgeacademy.edu or sarah_jenkins' : 'principal@myschool.org'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Assigned System Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="super_admin">Super Administrator (Full SaaS Platform Access)</option>
                    <option value="school_admin">School Admin / Principal</option>
                    <option value="teacher">Educator / Teacher</option>
                    <option value="staff">Staff / Accounts Officer</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-300">School Affiliation</label>
                    <button
                      type="button"
                      onClick={() => setIsNewSchool(!isNewSchool)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      {isNewSchool ? '← Select Existing School' : '+ Register A New School'}
                    </button>
                  </div>

                  {isNewSchool ? (
                    <div>
                      <input
                        type="text"
                        value={newSchoolName}
                        onChange={(e) => setNewSchoolName(e.target.value)}
                        placeholder="Enter School Name (e.g. Modern Heritage Academy)"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        A separate multi-tenant database sandbox will be provisioned for this school.
                      </p>
                    </div>
                  ) : (
                    <select
                      value={selectedSchoolId}
                      onChange={(e) => setSelectedSchoolId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      {schools.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.code ? `[${s.code}] ` : ''}{s.name} ({s.city})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 font-semibold text-xs text-white shadow-md shadow-indigo-900/30 transition flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                'Processing...'
              ) : mode === 'login' ? (
                <>
                  <KeyRound className="w-4 h-4" />
                  Sign In & Enter Dashboard
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Complete Registration
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Role-Based Access Control (RBAC) Active
          </span>
          <span>SchoolAI Manager v2.4</span>
        </div>
      </div>
    </div>
  );
};
