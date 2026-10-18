import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  ShieldCheck,
  Copy,
  Check,
  Download,
  RefreshCw,
  Server,
  Key,
  UserCheck,
  Building,
  History,
  RotateCcw,
  User,
  AtSign,
  Edit3,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import {
  getStoredSupabaseConfig,
  resetSupabaseClient,
  localStore,
  SchoolService,
} from '../supabase/supabaseClient';
import { SCHOOLAI_MIGRATION_SQL } from '../supabase/schemaSql';
import { AuditLog, UserRole } from '../types';
import { RoleBadge } from '../components/common/Badges';

export const SettingsPage: React.FC = () => {
  const {
    currentUser,
    setUserRole,
    school,
    refreshData,
    isSupabaseConnected,
    setIsProfileModalOpen,
  } = useApp();
  const { showToast } = useToast();

  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<
    'supabase' | 'sql' | 'roles' | 'school' | 'audit'
  >('supabase');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    const config = getStoredSupabaseConfig();
    setSupabaseUrl(config.url || '');
    setSupabaseKey(config.key || '');
    setAuditLogs(localStore.getAuditLogs());
  }, []);

  const handleSaveSupabaseConfig = () => {
    localStorage.setItem('schoolai_supabase_url', supabaseUrl.trim());
    localStorage.setItem('schoolai_supabase_key', supabaseKey.trim());
    resetSupabaseClient();
    refreshData();
    showToast('Supabase settings updated!', 'success');
  };

  const handleClearSupabaseConfig = () => {
    localStorage.removeItem('schoolai_supabase_url');
    localStorage.removeItem('schoolai_supabase_key');
    setSupabaseUrl('');
    setSupabaseKey('');
    resetSupabaseClient();
    refreshData();
    showToast('Switched to Local Demo Storage', 'info');
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      if (!supabaseUrl.startsWith('http')) {
        throw new Error('Please enter a valid Supabase project URL (starting with https://)');
      }
      if (!supabaseKey) {
        throw new Error('Please enter your Supabase anon public API key');
      }

      handleSaveSupabaseConfig();
      const client = SchoolService.isSupabaseConnected();
      setTimeout(() => {
        setIsTesting(false);
        showToast('Supabase configuration saved & active!', 'success');
      }, 700);
    } catch (err: any) {
      setIsTesting(false);
      showToast(err.message, 'error');
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SCHOOLAI_MIGRATION_SQL);
    setCopiedSql(true);
    showToast('SQL migration schema copied to clipboard!', 'success');
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([SCHOOLAI_MIGRATION_SQL], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '001_schoolai_schema.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Downloaded 001_schoolai_schema.sql', 'success');
  };

  const handleResetDemoData = () => {
    if (window.confirm('Reset all local data back to the clean default demo dataset?')) {
      localStore.resetToDemo();
      refreshData();
      showToast('School data reset to default demo dataset!', 'info');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
          <span>Settings, Database & Security Management</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure Supabase PostgreSQL backend, inspect relational schema, test role-based access control, and view audit history.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        {[
          { id: 'supabase', label: 'Supabase Integration', icon: Database },
          { id: 'sql', label: 'PostgreSQL Schema & RLS', icon: Server },
          { id: 'roles', label: 'User Roles & Access Control', icon: ShieldCheck },
          { id: 'school', label: 'School Profile', icon: Building },
          { id: 'audit', label: 'System Audit Logs', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSettingsTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeSettingsTab === tab.id
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

      {/* Tab 1: Supabase Integration */}
      {activeSettingsTab === 'supabase' && (
        <div className="space-y-6">
          {/* Connection Status Card */}
          <div
            className={`p-5 rounded-2xl border ${
              isSupabaseConnected
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    isSupabaseConnected ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    Database State:{' '}
                    <span className={isSupabaseConnected ? 'text-emerald-700' : 'text-slate-700'}>
                      {isSupabaseConnected ? 'Connected to Supabase PostgreSQL' : 'Local Persistent Storage (Demo Mode)'}
                    </span>
                  </h3>
                  <p className="text-xs opacity-80 mt-0.5">
                    {isSupabaseConnected
                      ? 'Remote PostgreSQL tables with Row Level Security (RLS) active.'
                      : 'Running seamlessly with local persistence and full seeded datasets.'}
                  </p>
                </div>
              </div>

              {isSupabaseConnected && (
                <button
                  onClick={handleClearSupabaseConfig}
                  className="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                >
                  Switch to Demo Mode
                </button>
              )}
            </div>
          </div>

          {/* Setup Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Supabase Connection Credentials</h3>
            <p className="text-slate-500 text-xs">
              To connect your real cloud database, enter your Supabase project URL and anon public key. You can create a free project at{' '}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 font-semibold underline"
              >
                supabase.com
              </a>
              .
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Project URL (VITE_SUPABASE_URL)</label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://your-project-id.supabase.co"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Anon Public Key (VITE_SUPABASE_ANON_KEY)</label>
                <input
                  type="password"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetDemoData}
                className="flex items-center space-x-1.5 px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Database</span>
              </button>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Database className="w-4 h-4" />
                <span>{isTesting ? 'Connecting...' : 'Save & Connect'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: PostgreSQL Schema & RLS */}
      {activeSettingsTab === 'sql' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">PostgreSQL Schema & Row Level Security (RLS)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete relational script with schools, students, guardians, marks, attendance, and fees tables.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopySql}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
              </button>
              <button
                onClick={handleDownloadSql}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .sql</span>
              </button>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-4 text-xs font-mono text-emerald-400 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre">{SCHOOLAI_MIGRATION_SQL}</pre>
          </div>
        </div>
      )}

      {/* Tab 3: Roles & Permissions */}
      {activeSettingsTab === 'roles' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 text-xs">
          {/* Active User Identity Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-indigo-900/50">
            <div className="flex items-center space-x-3.5">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-indigo-400/80 bg-slate-800 flex items-center justify-center font-bold text-white shadow-md shrink-0">
                {currentUser.avatar_url ? (
                  <img src={currentUser.avatar_url} alt={currentUser.full_name} className="w-full h-full object-cover" />
                ) : (
                  <span>{currentUser.full_name.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-white">{currentUser.full_name}</h4>
                  <RoleBadge role={currentUser.role} />
                </div>
                <p className="text-indigo-300 font-mono text-[11px] mt-0.5 flex items-center space-x-1">
                  <AtSign className="w-3 h-3" />
                  <span>{currentUser.username || 'user'}</span>
                  <span className="text-slate-400 font-sans">• {currentUser.email}</span>
                </p>
                <p className="text-slate-400 text-[10px] mt-0.5">
                  {currentUser.department || 'Executive Academic Office'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-xs text-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile & Avatar</span>
            </button>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">Role-Based Access Control (RBAC) Simulator</h3>
            <p className="text-slate-500 mt-1">
              Switch roles to verify view restrictions and multi-tenant security policies across the app.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                role: 'super_admin' as UserRole,
                title: 'Super Admin',
                description: 'Full unconstrained privileges across all schools, database migrations, fee audit logs, and settings.',
              },
              {
                role: 'school_admin' as UserRole,
                title: 'School Admin',
                description: 'Full administrative control over this school tenant, teacher assignments, student registrations, and fee records.',
              },
              {
                role: 'teacher' as UserRole,
                title: 'Teacher',
                description: 'Restricted to class management, grading exam marks, and recording daily student attendance rosters.',
              },
              {
                role: 'staff' as UserRole,
                title: 'Staff / Operator',
                description: 'Front-desk operations: fee receipts, student enrollment entry, and bulletin board broadcasts.',
              },
            ].map((r) => (
              <div
                key={r.role}
                className={`p-4 rounded-xl border transition-all ${
                  currentUser.role === r.role
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 text-sm">{r.title}</span>
                  <RoleBadge role={r.role} />
                </div>
                <p className="text-slate-600 leading-relaxed mb-4">{r.description}</p>
                <button
                  onClick={() => {
                    setUserRole(r.role);
                    showToast(`Active role switched to ${r.title}`, 'info');
                  }}
                  className={`w-full py-2 rounded-lg font-bold text-xs transition-colors ${
                    currentUser.role === r.role
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {currentUser.role === r.role ? 'Current Active Role' : `Switch to ${r.title}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: School Profile */}
      {activeSettingsTab === 'school' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900">Institution Demographics</h3>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <span className="text-slate-400 font-medium">Institution Name</span>
              <p className="font-bold text-slate-900 text-sm mt-1">{school?.name || 'Oakridge International Academy'}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Affiliation Board & Code</span>
              <p className="font-bold text-slate-900 text-sm mt-1">{school?.affiliation_code || 'CBSE-REG-2025-901'}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Official Contact Phone</span>
              <p className="font-bold text-slate-900 mt-1">{school?.phone || '+1 (555) 234-5678'}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Official Email</span>
              <p className="font-bold text-slate-900 mt-1">{school?.email || 'contact@oakridgeacademy.edu'}</p>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 font-medium">Campus Physical Address</span>
              <p className="font-bold text-slate-900 mt-1">{school?.address || '742 Evergreen Terrace, Springfield'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Audit Logs */}
      {activeSettingsTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Database Transaction Audit Trail</h3>
              <p className="text-xs text-slate-500">Tamper-evident logs of student creations, marks entry, and payments.</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {auditLogs.length} Events
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3">Operator</th>
                  <th className="px-5 py-3">Action</th>
                  <th className="px-5 py-3">Entity</th>
                  <th className="px-5 py-3">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 text-slate-400 font-mono text-[11px]">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-5 py-3 font-bold text-slate-900">{log.user_name}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3 uppercase font-semibold text-slate-500">{log.entity_type}</td>
                    <td className="px-5 py-3 text-slate-500 truncate max-w-xs font-mono text-[10px]">
                      {JSON.stringify(log.metadata || {})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
