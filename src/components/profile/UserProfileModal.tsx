import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  AtSign,
  Mail,
  Phone,
  Briefcase,
  Building,
  Save,
  Check,
  AlertCircle,
  Sparkles,
  Camera,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { AvatarPicker } from './AvatarPicker';
import { RoleBadge } from '../common/Badges';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateCurrentUserProfile, school } = useApp();
  const { showToast } = useToast();

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

  // Sync state whenever currentUser changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setUsername(currentUser.username || formatInitialUsername(currentUser.full_name));
      setFullName(currentUser.full_name || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
      setDepartment(currentUser.department || '');
      setBio(currentUser.bio || '');
      setAvatarUrl(currentUser.avatar_url || '');
      setAvatarType(currentUser.avatar_type || 'preset');
      setUsernameError(null);
    }
  }, [isOpen, currentUser]);

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
    // Only letters, numbers, and underscores allowed
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
    showToast('Avatar updated in preview', 'info');
  };

  const handleResetAvatar = () => {
    const fallback = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face`;
    setAvatarUrl(fallback);
    setAvatarType('preset');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateUsername(username)) {
      showToast('Please fix username errors before saving.', 'error');
      return;
    }

    if (!fullName.trim()) {
      showToast('Full Name cannot be empty.', 'error');
      return;
    }

    if (!email.trim()) {
      showToast('Email cannot be empty.', 'error');
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

      showToast('Profile updated successfully!', 'success');
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-none">Edit User Profile</h3>
              <p className="text-[11px] text-slate-300 mt-1">
                Customize your username and personal avatar representation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Hero Profile Preview Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 border border-indigo-900/40 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-indigo-400/80 shadow-md bg-slate-800 flex items-center justify-center">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-white uppercase">{fullName.slice(0, 2)}</span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1 rounded-full shadow-xs border border-white">
                  <Camera className="w-2.5 h-2.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-white">{fullName || 'Your Name'}</h4>
                  <RoleBadge role={currentUser.role} />
                </div>
                <p className="text-xs font-semibold text-indigo-300 mt-0.5 flex items-center space-x-1">
                  <AtSign className="w-3 h-3 text-indigo-400" />
                  <span>{username || 'username'}</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {department || 'Faculty & Administration'} • {school?.name || 'Oakridge International'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetAvatar}
              className="text-[11px] text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors"
            >
              Reset to Default
            </button>
          </div>

          {/* Section 1: Avatar Selector (Choose or Upload) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span>Avatar Representation</span>
              <span className="text-[11px] text-indigo-600 font-medium">Choose from Library or Upload</span>
            </label>
            <AvatarPicker
              currentAvatarUrl={avatarUrl}
              fullName={fullName}
              username={username}
              onSelectAvatar={handleSelectAvatar}
            />
          </div>

          {/* Section 2: Account Details & Username */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-400">
              Personal & Account Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Username Input with @ prefix */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1">
                    <span>Username Handle</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateUsername}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-generate from Name</span>
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs font-bold">
                    @
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="sarah_jenkins"
                    maxLength={20}
                    className={`w-full pl-8 pr-16 py-2 text-xs sm:text-sm rounded-xl border bg-white focus:outline-hidden transition-all ${
                      usernameError
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                        : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] text-slate-400 font-mono">
                    {username.length}/20
                  </div>
                </div>
                {usernameError ? (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{usernameError}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Lowercase letters, numbers, and underscores only. This will identify you across records.
                  </p>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Display Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Sarah Jenkins"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
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

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Phone Number
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

              {/* Department / Faculty */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department / Office
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Executive Administration"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>

              {/* Bio / Designation */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Professional Bio / Title
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Director of Academics & Senior Institutional Administrator..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-all shadow-xs"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
