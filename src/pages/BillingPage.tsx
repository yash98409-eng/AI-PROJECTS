import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Check,
  Zap,
  Sparkles,
  Shield,
  FileText,
  Download,
  Calendar,
  Building,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { PRICING_PLANS } from '../supabase/mockData';
import { SchoolService } from '../supabase/supabaseClient';
import { Invoice, PlanTier } from '../types';

export const BillingPage: React.FC = () => {
  const { school, updatePlan } = useApp();
  const { showToast } = useToast();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<PlanTier | null>(null);

  useEffect(() => {
    SchoolService.getInvoices(school?.id).then(setInvoices);
  }, [school?.id]);

  const currentPlanTier = school?.plan || 'starter';

  const handlePlanSelect = async (planTier: PlanTier) => {
    if (planTier === currentPlanTier) return;
    setIsUpgrading(true);
    try {
      await updatePlan(planTier, billingCycle);
      const updatedInvoices = await SchoolService.getInvoices(school?.id);
      setInvoices(updatedInvoices);
      showToast(`Subscription updated to ${planTier.toUpperCase()} plan! Invoice generated.`, 'success');
      setSelectedPlanForUpgrade(null);
    } catch (err) {
      showToast('Could not update plan. Please try again.', 'error');
    } finally {
      setIsUpgrading(false);
    }
  };

  const calculatePrice = (plan: typeof PRICING_PLANS[0]) => {
    if (plan.id === 'enterprise') return 'Custom';
    const base = plan.pricePerMonth;
    if (billingCycle === 'yearly') {
      const discounted = Math.round(base * 0.8);
      return `₹${discounted.toLocaleString()}`;
    }
    return `₹${base.toLocaleString()}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Phase 4: SaaS Monetization Model (Paisa Kamane Ka Model)
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Subscription & Commercial Plans
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Scalable pricing tiers engineered for individual academies up to multi-branch school conglomerates.
              Har school ka billing aur usage transparent aur automated hai.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 shrink-0 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Current Active Plan</p>
              <p className="text-base font-bold text-white uppercase tracking-wider">
                {currentPlanTier} Tier
              </p>
              <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <Check className="w-3 h-3" />
                Next Renewal: {school?.plan_renewal_date || 'Next month'}
              </p>
            </div>
          </div>
        </div>

        {/* Decorative ambient elements */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Monthly / Yearly Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white">Select Your Institution Plan</h2>
          <p className="text-xs text-slate-400">Upgrade or downgrade anytime with prorated billing</p>
        </div>

        <div className="inline-flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              billingCycle === 'monthly'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('yearly')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              billingCycle === 'yearly'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Yearly (Save 20%)
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 rounded font-bold">
              PROMO
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid (Matches User's Table) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {PRICING_PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlanTier;
          const isPopular = plan.popular;

          return (
            <div
              key={plan.id}
              className={`rounded-2xl border transition-all flex flex-col relative overflow-hidden ${
                isCurrent
                  ? 'border-indigo-500 bg-slate-900/90 shadow-lg shadow-indigo-950/40 ring-2 ring-indigo-500/30'
                  : isPopular
                  ? 'border-indigo-500/60 bg-slate-900/70 shadow-md'
                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
              }`}
            >
              {/* Badges */}
              {isPopular && (
                <div className="bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-widest text-center py-1">
                  Most Popular for Medium Schools
                </div>
              )}
              {isCurrent && !isPopular && (
                <div className="bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-widest text-center py-1">
                  Current Active Plan
                </div>
              )}

              <div className="p-5 sm:p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-white">{plan.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium border border-slate-700">
                    {plan.badge || plan.suitableFor}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-4 min-h-[32px]">{plan.suitableFor}</p>

                {/* Price Display */}
                <div className="mb-6 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-white">
                      {calculatePrice(plan)}
                    </span>
                    {plan.id !== 'enterprise' && (
                      <span className="text-xs text-slate-400 font-medium">/month</span>
                    )}
                  </div>
                  {billingCycle === 'yearly' && plan.id !== 'enterprise' && (
                    <p className="text-[10px] text-emerald-400 mt-1">Billed annually (Includes 20% discount)</p>
                  )}
                </div>

                {/* Limits Snapshot */}
                <div className="space-y-2 mb-6 pb-4 border-b border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Student Capacity:</span>
                    <span className="font-semibold text-white">{plan.studentLimit.toLocaleString()} Students</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">AI Natural Language:</span>
                    <span className="font-semibold text-indigo-400">{plan.aiQueriesLimit.toLocaleString()} Queries/mo</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Isolated Tenants:</span>
                    <span className="font-semibold text-white">
                      {plan.id === 'enterprise' ? 'Unlimited Schools' : '1 School Tenant'}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-2.5 mb-6 text-xs text-slate-300 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                      <span className="leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Action */}
                <button
                  type="button"
                  disabled={isCurrent || isUpgrading}
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-slate-800 text-slate-400 cursor-default'
                      : isPopular
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      Active On This School
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      {plan.id === 'enterprise' ? 'Contact for Enterprise Group' : `Select ${plan.name}`}
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Usage & Limits Monitoring */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-400" />
              Student Capacity Meter
            </h3>
            <span className="text-xs font-semibold text-indigo-400">
              {school?.student_count || 120} / {currentPlanTier === 'starter' ? 100 : currentPlanTier === 'standard' ? 500 : currentPlanTier === 'professional' ? 2000 : 10000} Enrolled
            </span>
          </div>

          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round(((school?.student_count || 120) / (currentPlanTier === 'starter' ? 100 : currentPlanTier === 'standard' ? 500 : 2000)) * 100))}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Enrolling more students automatically prompts an upgrade to ensure continuous AI processing.
          </p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              AI Voice & Natural Language Data Entries
            </h3>
            <span className="text-xs font-semibold text-amber-400">
              184 / {currentPlanTier === 'starter' ? 100 : currentPlanTier === 'standard' ? 500 : 'Unlimited'} Used This Cycle
            </span>
          </div>

          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-amber-500 rounded-full transition-all duration-500 w-1/3" />
          </div>
          <p className="text-[11px] text-slate-400">
            Natural language parsing of student profiles, attendance, and exam marks.
          </p>
        </div>
      </div>

      {/* Invoices & Billing History */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Billing History & GST Invoices</h3>
          </div>
          <span className="text-xs text-slate-400">{invoices.length} Invoices Available</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-3">Invoice #</th>
                <th className="px-6 py-3">Billing Date</th>
                <th className="px-6 py-3">Plan / Description</th>
                <th className="px-6 py-3">Amount (INR)</th>
                <th className="px-6 py-3">Payment Status</th>
                <th className="px-6 py-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-6 py-3.5 font-mono text-white font-medium">{inv.invoice_number}</td>
                  <td className="px-6 py-3.5 text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {inv.billing_date}
                  </td>
                  <td className="px-6 py-3.5 capitalize font-medium text-slate-200">
                    {inv.plan} Subscription Tier
                  </td>
                  <td className="px-6 py-3.5 font-semibold text-white">₹{inv.amount.toLocaleString()}</td>
                  <td className="px-6 py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 flex items-center gap-1 w-fit">
                      <Check className="w-2.5 h-2.5" />
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => showToast(`Receipt ${inv.invoice_number} downloaded as PDF`, 'info')}
                      className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium text-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
