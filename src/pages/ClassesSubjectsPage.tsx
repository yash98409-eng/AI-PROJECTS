import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Users,
  Award,
  Calendar,
  Layers,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SchoolService } from '../supabase/supabaseClient';
import { ClassRoom, Subject, Exam } from '../types';

export const ClassesSubjectsPage: React.FC = () => {
  const { dataVersion } = useApp();
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [activeTab, setActiveTab] = useState<'classes' | 'subjects' | 'exams'>('classes');

  useEffect(() => {
    Promise.all([
      SchoolService.getClasses(),
      SchoolService.getSubjects(),
      SchoolService.getExams(),
    ]).then(([cls, sub, ex]) => {
      setClasses(cls);
      setSubjects(sub);
      setExams(ex);
    });
  }, [dataVersion]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Academic Structure & Curriculum</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
              Grade 9 & 10
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Classrooms, curriculum subjects, grading ceilings, and scheduled examinations.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        {[
          { id: 'classes', label: `Classes & Sections (${classes.length})`, icon: Layers },
          { id: 'subjects', label: `Subjects (${subjects.length})`, icon: BookOpen },
          { id: 'exams', label: `Examinations (${exams.length})`, icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
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

      {/* Classes Tab */}
      {activeTab === 'classes' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700">
                  Grade {c.grade_level}
                </span>
                <span className="text-xs font-semibold text-slate-400">Section {c.section}</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">{c.name}</h3>
              <p className="text-xs text-slate-500 mt-1">Class Teacher: Dr. Ramesh Verma</p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Student Capacity:</span>
                <span className="font-bold text-slate-900">{c.capacity} Seats</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subjects Tab */}
      {activeTab === 'subjects' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {s.code}
                </span>
                <span className="text-xs font-semibold text-slate-500">Ceiling: {s.max_marks} Marks</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mt-1">{s.name}</h3>
              <p className="text-xs text-slate-500 mt-1 capitalize">Department: {s.department || 'Academics'}</p>
            </div>
          ))}
        </div>
      )}

      {/* Exams Tab */}
      {activeTab === 'exams' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {exams.map((ex) => (
            <div
              key={ex.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                  {ex.term}
                </span>
                <span className="text-xs font-semibold text-slate-400">{ex.start_date}</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mt-1">{ex.name}</h3>
              <p className="text-xs text-slate-500 mt-1">Concludes: {ex.end_date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
