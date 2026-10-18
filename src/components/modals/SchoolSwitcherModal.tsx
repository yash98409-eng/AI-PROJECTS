import React, { useState } from 'react';
import {
  X,
  Building,
  School as SchoolIcon,
  Check,
  Plus,
  ShieldCheck,
  Layers,
  ArrowRight,
  Database,
  Lock,
  Sparkles,
  MapPin,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { PlanTier } from '../../types';

interface SchoolSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchoolSwitcherModal: React.FC<SchoolSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { school, schools, switchSchool, registerSchool, currentUser } = useApp();
  const { showToast } = useToast();

  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [curriculum, setCurriculum] = useState('CBSE');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [plan, setPlan] = useState<PlanTier>('standard');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSelectSchool = async (schoolId: string, schoolName: string) => {
    if (schoolId === school?.id) {
      onClose();
      return;
    }
    await switchSchool(schoolId);
    showToast(`Switched active context to ${schoolName}. Data isolated to this institution.`, 'info');
    onClose();
  };

  const handleRegisterNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please provide a school name', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await registerSchool({
        name: name.trim(),
        curriculum,
        city: city.trim() || 'Mumbai',
        state: state.trim() || 'Maharashtra',
        plan,
      });
      showToast(`Registered "${created.name}" on ${plan.toUpperCase()} plan! Sandbox active.`, 'success');
      setIsRegistering(false);
      onClose();
    } catch (err) {
      showToast('Failed to register school', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Multi-School SaaS Hub</h2>
              <p className="text-xs text-slate-400">
                Phase 3: Multi-tenant School Switcher with Complete Database Separation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-tenant Architecture Banner (Matching User's Prompt) */}
        <div className="mx-6 mt-5 p-4 rounded-xl bg-slate-950 border border-slate-800/90">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              Isolated Multi-Tenant Architecture
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-800/40 flex items-center gap-1 font-medium">
              <Lock className="w-3 h-3" />
              Row-Level Security Active
            </span>
          </div>

          <div className="bg-slate-900/90 rounded-lg p-2.5 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed border border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="text-indigo-300 font-semibold">School A, B, C, D, E</span>
              <span className="text-slate-500">───┼──▶</span>
              <span className="text-white font-bold bg-indigo-600/30 px-1.5 py-0.5 rounded border border-indigo-500/30">
                SchoolAI Manager Core
              </span>
              <span className="text-emerald-400 text-[10px] ml-auto">
                (Har school ka data completely separate rahega)
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {!isRegistering ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Switch Active Institution ({schools.length} Schools Available)
                </h3>
                <button
                  type="button"
                  onClick={() => setIsRegistering(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Register New School
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
                {schools.map((s) => {
                  const isCurrent = s.id === school?.id;
                  const planColors: Record<string, string> = {
                    starter: 'bg-slate-800 text-slate-300 border-slate-700',
                    standard: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/50',
                    professional: 'bg-purple-950/80 text-purple-300 border-purple-700/50',
                    enterprise: 'bg-amber-950/80 text-amber-300 border-amber-700/50',
                  };

                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSelectSchool(s.id, s.name)}
                      className={`flex flex-col p-3.5 rounded-xl border text-left transition-all ${
                        isCurrent
                          ? 'border-indigo-500 bg-indigo-950/30 ring-1 ring-indigo-500/50'
                          : 'border-slate-800 bg-slate-950/40 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300 shrink-0">
                            {s.code || s.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white truncate max-w-[160px]">{s.name}</p>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5 text-slate-500" />
                              {s.city || 'City'}, {s.curriculum || 'CBSE'}
                            </span>
                          </div>
                        </div>

                        {isCurrent && (
                          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 mt-auto border-t border-slate-800/80 text-[10px]">
                        <span
                          className={`px-1.5 py-0.5 rounded capitalize font-medium border ${
                            planColors[s.plan || 'standard']
                          }`}
                        >
                          {s.plan || 'standard'} Plan
                        </span>
                        <span className="text-slate-400 flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-500" />
                          {s.student_count || 50}+ Students
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegisterNew} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <SchoolIcon className="w-4 h-4 text-indigo-400" />
                  Onboard a New School (Phase 3 SaaS)
                </h3>
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">School Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Blossom Hill International Academy"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Curriculum / Board</label>
                  <select
                    value={curriculum}
                    onChange={(e) => setCurriculum(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                    <option value="IB">International Baccalaureate (IB)</option>
                    <option value="Cambridge">Cambridge IGCSE</option>
                    <option value="State Board">State Board</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bengaluru"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Subscription Plan Tier</label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as PlanTier)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="starter">Starter — ₹999/month (Small school)</option>
                  <option value="standard">Standard — ₹2,999/month (Medium school - Recommended)</option>
                  <option value="professional">Professional — ₹5,999/month (Large school)</option>
                  <option value="enterprise">Enterprise — Custom (School groups)</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-800 hover:bg-slate-800 text-xs font-medium text-slate-300 transition"
                >
                  Back to List
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-900/30 transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  {isSubmitting ? 'Registering...' : 'Provision School Tenant'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Current School: <strong className="text-slate-300">{school?.name}</strong>
          </span>
          <span>Tenant ID: {school?.id}</span>
        </div>
      </div>
    </div>
  );
};
