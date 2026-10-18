import React, { useState, useEffect } from 'react';
import {
  Bell,
  Award,
  Calendar,
  Users,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SchoolService } from '../supabase/supabaseClient';
import { Notice, StudentAchievement } from '../types';

export const NoticesAchievementsPage: React.FC = () => {
  const { dataVersion } = useApp();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [achievements, setAchievements] = useState<StudentAchievement[]>([]);
  const [activeTab, setActiveTab] = useState<'notices' | 'achievements'>('notices');

  useEffect(() => {
    Promise.all([
      SchoolService.getNotices(),
      SchoolService.getAchievements(),
    ]).then(([nt, ach]) => {
      setNotices(nt);
      setAchievements(ach);
    });
  }, [dataVersion]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Bulletins, Notices & Student Honors</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Official academy circulars, announcements, and state/national awards.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('notices')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'notices'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>School Circulars & Notices ({notices.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'achievements'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Student Honor Roll & Awards ({achievements.length})</span>
        </button>
      </div>

      {/* Notices Tab */}
      {activeTab === 'notices' && (
        <div className="space-y-4">
          {notices.map((n) => (
            <div
              key={n.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      Audience: {n.target_audience}
                    </span>
                    <span className="text-[11px] text-slate-400">Published {n.published_at}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">{n.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{n.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-start space-x-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                <Award className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    {ach.category}
                  </span>
                  <span className="text-[10px] text-slate-400">{ach.award_date}</span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 mt-1">{ach.title}</h3>
                <p className="text-xs text-indigo-600 font-bold mt-0.5">{ach.student_name}</p>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{ach.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
