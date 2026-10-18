import React, { useState } from 'react';
import {
  Building,
  School as SchoolIcon,
  Layers,
  Database,
  Lock,
  Plus,
  ArrowRight,
  Sparkles,
  MapPin,
  Users,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

export const SchoolsHubPage: React.FC = () => {
  const { school, schools, switchSchool, setIsSchoolSwitcherOpen } = useApp();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');

  const filteredSchools = schools.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.code && s.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.city && s.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.curriculum && s.curriculum.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalStudentsAcrossSchools = schools.reduce((sum, s) => sum + (s.student_count || 100), 0);
  const totalMRR = schools.reduce((sum, s) => {
    const prices: Record<string, number> = { starter: 999, standard: 2999, professional: 5999, enterprise: 14999 };
    return sum + (prices[s.plan || 'standard'] || 2999);
  }, 0);

  const handleSwitchContext = async (targetSchoolId: string, schoolName: string) => {
    await switchSchool(targetSchoolId);
    showToast(`Active school context switched to ${schoolName}. Database sandbox active.`, 'success');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
              <Layers className="w-3.5 h-3.5" />
              Phase 3: Commercial Multi-School SaaS
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Multi-School SaaS Hub & Tenant Manager
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Centralized platform hosting multiple distinct schools under one cloud deployment.
              Har school ka student data, marks, attendance, aur fees completely separate aur secured hai.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsSchoolSwitcherOpen(true)}
            className="self-start md:self-auto py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-900/30 flex items-center gap-2 transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            Register / Switch School
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Total Schools</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">{schools.length} Campuses</p>
          <p className="text-[11px] text-emerald-400 mt-1 font-medium">School A through E + Custom</p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Total Active Students</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">{totalStudentsAcrossSchools.toLocaleString()}+</p>
          <p className="text-[11px] text-slate-400 mt-1">Across all school tenants</p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Monthly Recurring Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">₹{totalMRR.toLocaleString()}/mo</p>
          <p className="text-[11px] text-emerald-400 mt-1 font-medium">Active subscriptions</p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Tenant Isolation</span>
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">100% Isolated</p>
          <p className="text-[11px] text-purple-300 mt-1">Row-Level Security (RLS)</p>
        </div>
      </div>

      {/* Visual Multi-School Architecture Diagram (Requested in Prompt) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Multi-School Architecture Flow
            </h2>
          </div>
          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Har school ka data completely separate
          </span>
        </div>

        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/90 font-mono text-xs text-slate-300 overflow-x-auto">
          <pre className="text-indigo-300">
{`School A (Oakridge Academy)        ──┐
School B (St. Xavier's High)      ──┤
School C (Delhi Public Academy)   ──┼──> SchoolAI Manager Core [Strict RLS Multi-Tenant Engine]
School D (Greenfield World)       ──┤
School E (Cambridge International)──┘`}
          </pre>
          <p className="mt-3 text-[11px] text-slate-400 font-sans border-t border-slate-800 pt-2">
            • Each school operates within its dedicated tenant context. A user or teacher from School A cannot access records from School B, C, D, or E.
          </p>
        </div>
      </div>

      {/* Schools Directory & Context Switcher Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white">Active Institution Tenants</h3>
            <p className="text-xs text-slate-400">Click &quot;Switch Context&quot; to inspect any school&apos;s isolated records</p>
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by school, city, or board..."
            className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full sm:w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">School Code & Name</th>
                <th className="px-6 py-3.5">Location & Board</th>
                <th className="px-6 py-3.5">Student Enrollment</th>
                <th className="px-6 py-3.5">Subscription Tier</th>
                <th className="px-6 py-3.5">Tenant Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSchools.map((s) => {
                const isCurrent = s.id === school?.id;
                const planColors: Record<string, string> = {
                  starter: 'bg-slate-800 text-slate-300 border-slate-700',
                  standard: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/50',
                  professional: 'bg-purple-950/80 text-purple-300 border-purple-700/50',
                  enterprise: 'bg-amber-950/80 text-amber-300 border-amber-700/50',
                };

                return (
                  <tr
                    key={s.id}
                    className={`transition ${
                      isCurrent ? 'bg-indigo-950/20' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300 text-xs shrink-0">
                          {s.code || s.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{s.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded font-bold">
                                Current
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">{s.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-white flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {s.city || 'City'}, {s.state || 'State'}
                        </span>
                        <span className="text-[11px] text-slate-400">{s.curriculum || 'CBSE'}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-semibold text-white">{s.student_count || 50}</span>
                      <span className="text-slate-400"> Students</span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded-full capitalize font-medium text-[11px] border ${
                          planColors[s.plan || 'standard']
                        }`}
                      >
                        {s.plan || 'standard'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-800/40 text-[10px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Live & Isolated
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      {isCurrent ? (
                        <span className="text-xs font-semibold text-indigo-400 flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                          Active Context
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSwitchContext(s.id, s.name)}
                          className="py-1 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition inline-flex items-center gap-1 shadow-xs"
                        >
                          Switch Context
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
