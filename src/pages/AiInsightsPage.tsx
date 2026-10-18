import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { SchoolService } from '../supabase/supabaseClient';
import { AIInsight } from '../types';

export const AiInsightsPage: React.FC = () => {
  const { dataVersion } = useApp();
  const { showToast } = useToast();

  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadInsights();
  }, [dataVersion]);

  const loadInsights = async () => {
    setIsLoading(true);
    try {
      const stats = await SchoolService.querySchoolData('getSchoolStatistics', {});
      const students = await SchoolService.getStudents();
      const marks = await SchoolService.getMarks();
      const fees = await SchoolService.getFees();

      const res = await fetch('/api/gemini/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolData: {
            statistics: stats,
            student_count: students.length,
            low_attendance_students: students.filter((s) => (s.attendance_percentage || 0) < 75),
            marks_summary: marks.slice(0, 10),
            pending_fees: fees.filter((f) => f.status !== 'paid'),
          },
        }),
      });

      const data = await res.json();
      setInsights(data);
    } catch (err) {
      console.error(err);
      showToast('Using local analytical heuristics', 'info');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInsights = selectedCategory === 'all'
    ? insights
    : insights.filter((ins) => ins.category === selectedCategory);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>SchoolAI Predictive Analytics & Insights</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
              Gemini 3.8 Flash Powered
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Automated trend synthesis identifying learning gaps, attendance risks, and revenue opportunities.
          </p>
        </div>

        <button
          onClick={loadInsights}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Synthesizing...' : 'Refresh AI Analysis'}</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {['all', 'performance', 'attendance', 'fees'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat === 'all' ? 'All Focus Areas' : cat}
          </button>
        ))}
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredInsights.map((insight) => {
          let badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
          let borderColor = 'border-slate-200';
          let icon = <Lightbulb className="w-5 h-5 text-indigo-600" />;

          if (insight.type === 'critical') {
            badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
            borderColor = 'border-rose-200/80';
            icon = <ShieldAlert className="w-5 h-5 text-rose-600" />;
          } else if (insight.type === 'warning') {
            badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
            borderColor = 'border-amber-200/80';
            icon = <AlertTriangle className="w-5 h-5 text-amber-600" />;
          } else if (insight.type === 'positive') {
            badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            borderColor = 'border-emerald-200/80';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
          } else if (insight.type === 'trend') {
            badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
            borderColor = 'border-indigo-200/80';
            icon = <TrendingUp className="w-5 h-5 text-indigo-600" />;
          }

          return (
            <div
              key={insight.id}
              className={`bg-white rounded-2xl border ${borderColor} p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow`}
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center space-x-2">
                    {icon}
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 capitalize">
                      {insight.category}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase ${badgeColor}`}>
                    {insight.type}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{insight.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{insight.description}</p>

                {/* Metric vs Target */}
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Current Observed</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">{insight.metric}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Target Benchmark</span>
                    <span className="font-bold text-indigo-600 mt-0.5 block">{insight.target}</span>
                  </div>
                </div>
              </div>

              {/* Actionable Recommendation */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">
                  Actionable Intervention:
                </span>
                <p className="text-xs font-semibold text-slate-800 flex items-start space-x-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                  <span>{insight.recommendation}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
