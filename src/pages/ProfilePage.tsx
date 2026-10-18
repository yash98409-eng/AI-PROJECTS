import React, { useState, useEffect } from 'react';
import {
  User,
  AtSign,
  Mail,
  Phone,
  Building,
  Save,
  ShieldCheck,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  Camera,
  Activity,
  History,
  Lock,
  RotateCcw,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { AvatarPicker } from '../components/profile/AvatarPicker';
import { RoleBadge } from '../components/common/Badges';
import { localStore } from '../supabase/supabaseClient';
import { AuditLog } from '../types';

export const ProfilePage: React.FC = () => {
  const { currentUser, updateCurrentUserProfile, school, setUserRole, dataVersion } = useApp();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'activity'>('profile');
  const [username, setUsername] = useState(currentUser.username || '');
  const [fullName, setFullName] = useState(currentUser.full_name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [department, setDepartment] = useState(currentUser.department || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar_url || '');
  const [avatarType, setAvatarType] = useState<'preset' | 'upload' | 'initials'>(
    currentUser.avatar_type || 'preset'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [userLogs, setUserLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    setUsername(currentUser.username || formatInitialUsername(currentUser.full_name));
    setFullName(currentUser.full_name || '');
    setEmail(currentUser.email || '');
    setPhone(currentUser.phone || '');
    setDepartment(currentUser.department || '');
    setBio(currentUser.bio || '');
    setAvatarUrl(currentUser.avatar_url || '');
    setAvatarType(currentUser.avatar_type || 'preset');
    setUsernameError(null);

    // Fetch user-specific audit logs
    const allLogs = localStore.getAuditLogs();
    const filtered = allLogs.filter((l) => l.user_id === currentUser.id || l.user_name === currentUser.full_name);
    setUserLogs(filtered.slice(0, 15));
  }, [currentUser, dataVersion]);

  function formatInitialUsername(name: string) {
    if (!name) return 'user_' + Math.floor(Math.random() * 1000);
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 20);
  }

  const validateUsername = (val: string): boolean => {
    const trimmed = val.trim().toLowerCase();
    if (!trimmed) {
      setUsernameError('Username is required.');
      return false;
    }
    if (trimmed.length < 3) {
      setUsernameError('Username must be at least 3 characters long.');
      return false;
    }
    if (trimmed.length > 20) {
      setUsernameError('Username cannot exceed 20 characters.');
      return false;
    }
    const validRegex = /^[a-z0-9_]+$/;
    if (!validRegex.test(trimmed)) {
      setUsernameError('Username can only contain lowercase letters, numbers, and underscores.');
      return false;
    }
    setUsernameError(null);
    return true;
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/\s+/g, '_');
    setUsername(val);
    validateUsername(val);
  };

  const handleGenerateUsername = () => {
    const suggested = formatInitialUsername(fullName);
    setUsername(suggested);
    validateUsername(suggested);
    showToast(`Suggested username: @${suggested}`, 'info');
  };

  const handleSelectAvatar = (url: string, type: 'preset' | 'upload' | 'initials') => {
    setAvatarUrl(url);
    setAvatarType(type);
    showToast('Avatar updated in preview! Click Save to confirm.', 'info');
  };

  const handleResetAvatar = () => {
    const fallback = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face`;
    setAvatarUrl(fallback);
    setAvatarType('preset');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateUsername(username)) {
      showToast('Please correct username format before saving.', 'error');
      return;
    }

    if (!fullName.trim()) {
      showToast('Full display name is required.', 'error');
      return;
    }

    if (!email.trim()) {
      showToast('Email address is required.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await updateCurrentUserProfile({
        username: username.trim().toLowerCase(),
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        department: department.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl,
        avatar_type: avatarType,
      });

      showToast('Profile and avatar updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const rolePrivileges = {
    super_admin: [
      'Full institutional administrative control across all branches',
      'Manage school settings, academic sessions, and grading systems',
      'Execute AI data imports and verify structured extractions',
      'Modify student records, fee statements, and marks',
      'Direct PostgreSQL database and RLS policy configurations',
    ],
    school_admin: [
      'Operational leadership over classes, teachers, and student rosters',
      'Issue school notices, parent communications, and achievements',
      'Authorize fee concessions and review financial reconciliations',
      'Review attendance health and academic intervention alerts',
    ],
    teacher: [
      'Record student marks and exam scores for assigned subjects',
      'Mark daily attendance and log classroom notices',
      'Query SchoolAI Assistant for subject performance metrics',
      'View student academic profiles and progress summaries',
    ],
    staff: [
      'Record fee payments and generate official receipt vouchers',
      'Maintain office attendance registers and student contact information',
      'Manage physical school infrastructure and general records',
    ],
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-xl text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900/60 opacity-90 pointer-events-none" />
        <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-3 border-indigo-400/80 shadow-2xl bg-slate-800 flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-white uppercase">{fullName.slice(0, 2)}</span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1.5 rounded-full shadow-lg border-2 border-slate-900">
                <Camera className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{fullName}</h2>
                <RoleBadge role={currentUser.role} />
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1.5 text-xs text-indigo-300">
                <span className="flex items-center space-x-1 font-semibold bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-lg border border-indigo-500/30">
                  <AtSign className="w-3.5 h-3.5" />
                  <span>{username || 'username'}</span>
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-300">{email}</span>
                {phone && (
                  <>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-300">{phone}</span>
                  </>
                )}
              </div>

              <p className="text-xs text-slate-400 mt-2 max-w-xl">
                {bio || department || 'Institutional Academic Leader & Faculty Member'} • {school?.name || 'Oakridge International'}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-2">
            <span className="text-[11px] text-slate-400 font-medium">Session Active</span>
            <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Online • {currentUser.role.replace('_', ' ').toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        {[
          { id: 'profile', label: 'Profile & Avatar Settings', icon: User },
          { id: 'security', label: 'Role Privileges & Permissions', icon: ShieldCheck },
          { id: 'activity', label: 'Recent Account Activity', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Profile & Avatar Management */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Card: Avatar Customization */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Personal Avatar Representation</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose an avatar from our curated academic library, upload a high-resolution photo, or use initials.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetAvatar}
                className="text-xs text-slate-500 hover:text-indigo-600 font-medium px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Reset Default
              </button>
            </div>

            <AvatarPicker
              currentAvatarUrl={avatarUrl}
              fullName={fullName}
              username={username}
              onSelectAvatar={handleSelectAvatar}
            />
          </div>

          {/* Card: Identity & Details */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Account Identity & Information</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your unique @username handle and contact credentials.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Username Input with @ prefix */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-800 flex items-center space-x-1">
                    <span>Unique Username Handle</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateUsername}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center space-x-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-generate from Name</span>
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                    @
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="sarah_jenkins"
                    maxLength={20}
                    className={`w-full pl-8 pr-16 py-2.5 text-xs sm:text-sm rounded-xl border bg-white focus:outline-hidden transition-all ${
                      usernameError
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                        : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[10px] text-slate-400 font-mono">
                    {username.length}/20
                  </div>
                </div>
                {usernameError ? (
                  <p className="text-xs text-rose-600 mt-1.5">{usernameError}</p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Your username uniquely identifies you across attendance logs, grade edits, and SchoolAI queries.
                  </p>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Full Display Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dr. Sarah Jenkins"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Institutional Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@oakridgeacademy.edu"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Phone / Mobile Contact
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 00001"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Department / Faculty Division
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Executive Administration"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Designation & Academic Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Director of Academics & Senior Institutional Administrator..."
                  rows={3}
                  className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center space-x-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-all shadow-xs"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save All Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: Role Privileges & Permissions */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Current Role Access Control</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Role-based security policies (RLS) enforce strict data partitioning.
                </p>
              </div>
              <RoleBadge role={currentUser.role} />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-indigo-700">
                Authorized Capabilities:
              </h4>
              <ul className="space-y-2">
                {(rolePrivileges[currentUser.role] || []).map((perm, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{perm}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 mb-2">Switch Active Persona (Demo Testing)</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { role: 'super_admin', label: 'Super Admin' },
                  { role: 'school_admin', label: 'School Admin' },
                  { role: 'teacher', label: 'Teacher' },
                  { role: 'staff', label: 'Staff / Accounts' },
                ].map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      setUserRole(r.role as any);
                      showToast(`Switched active role to ${r.label}`, 'info');
                    }}
                    className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                      currentUser.role === r.role
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Recent Account Activity */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">User Audit & Activity Log</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified record of changes, imports, and updates attributed to @{username || currentUser.username}.
            </p>
          </div>

          {userLogs.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <History className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">No recent actions logged for this session.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Updates and AI entries will appear here automatically.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {userLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      {log.action.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {log.action.replace(/_/g, ' ')}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Entity: <span className="font-semibold text-slate-700">{log.entity_type}</span>
                        {log.entity_id ? ` (${log.entity_id})` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
