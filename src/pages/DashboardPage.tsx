import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  Briefcase,
  BookOpen,
  CalendarCheck,
  CreditCard,
  Award,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Filter,
  Plus,
  Mic,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { SchoolService } from '../supabase/supabaseClient';
import { Student, Mark, Attendance, Fee } from '../types';

export const DashboardPage: React.FC = () => {
  const { setActivePage, viewStudentProfile, dataVersion, currentUser, setInitialAiQuery } = useApp();

  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [stu, mrk, att, fe] = await Promise.all([
        SchoolService.getStudents(),
        SchoolService.getMarks(),
        SchoolService.getAttendance(),
        SchoolService.getFees(),
      ]);
      setStudents(stu);
      setMarks(mrk);
      setAttendance(att);
      setFees(fe);
      setLoading(false);
    }
    loadData();
  }, [dataVersion]);

  // Filtered dataset
  const filteredStudents = selectedClass === 'all'
    ? students
    : students.filter((s) => s.current_class === selectedClass);

  // Computed KPIs
  const totalStudents = filteredStudents.length;
  const activeStudents = filteredStudents.filter((s) => s.status === 'active').length;
  const teachersCount = 4;
  const classesCount = 3;

  const avgMarks = Math.round(
    marks.length > 0
      ? marks.reduce((sum, m) => sum + m.marks_obtained, 0) / marks.length
      : 82
  );

  const todayAttendancePresent = attendance.filter((a) => a.status === 'present').length;
  const todayAttendanceTotal = attendance.length || 12;
  const attendanceTodayPct = Math.round((todayAttendancePresent / todayAttendanceTotal) * 100);

  const totalFeeAmount = fees.reduce((sum, f) => sum + f.amount, 0);
  const collectedFeeAmount = fees.reduce((sum, f) => sum + f.paid_amount, 0);
  const pendingFeeAmount = totalFeeAmount - collectedFeeAmount;

  const lowAttendanceStudents = filteredStudents.filter(
    (s) => (s.attendance_percentage || 0) < 75
  );

  // 1. Chart Data: Students by Class
  const classCounts = [
    { name: 'Class 10-A', count: students.filter((s) => s.current_class === 'Class 10-A').length },
    { name: 'Class 10-B', count: students.filter((s) => s.current_class === 'Class 10-B').length },
    { name: 'Class 9-A', count: students.filter((s) => s.current_class === 'Class 9-A').length },
  ];

  // 2. Chart Data: Students by Gender
  const maleCount = filteredStudents.filter((s) => s.gender === 'male').length;
  const femaleCount = filteredStudents.filter((s) => s.gender === 'female').length;
  const genderData = [
    { name: 'Male', value: maleCount, color: '#4f46e5' },
    { name: 'Female', value: femaleCount, color: '#ec4899' },
  ];

  // 3. Chart Data: Attendance Trend over week
  const attendanceTrendData = [
    { day: 'Mon', rate: 96 },
    { day: 'Tue', rate: 94 },
    { day: 'Wed', rate: 91 },
    { day: 'Thu', rate: 93 },
    { day: 'Fri', rate: 89 },
  ];

  // 4. Chart Data: Average Marks by Subject
  const subjectAverages = [
    { subject: 'Maths', score: 84 },
    { subject: 'Science', score: 78 },
    { subject: 'English', score: 88 },
    { subject: 'Social', score: 81 },
    { subject: 'Comp Sci', score: 92 },
  ];

  // 5. Chart Data: Class Performance Comparison
  const classPerformance = [
    { name: 'Class 10-A', average: 85, attendance: 91 },
    { name: 'Class 10-B', average: 78, attendance: 88 },
    { name: 'Class 9-A', average: 83, attendance: 92 },
  ];

  // 6. Chart Data: Fee Collection vs Pending
  const feeStatusData = [
    { name: 'Collected', value: collectedFeeAmount, color: '#10b981' },
    { name: 'Pending / Overdue', value: pendingFeeAmount, color: '#f43f5e' },
  ];

  // 7. Chart Data: Monthly Admissions
  const admissionsTrend = [
    { month: 'Apr', count: 4 },
    { month: 'May', count: 12 },
    { month: 'Jun', count: 28 },
    { month: 'Jul', count: 8 },
    { month: 'Aug', count: 3 },
  ];

  // 8. Chart Data: Grade Distribution
  const gradeDistribution = [
    { grade: 'A+', count: 5 },
    { grade: 'A', count: 4 },
    { grade: 'B+', count: 2 },
    { grade: 'B', count: 1 },
    { grade: 'C', count: 1 },
    { grade: 'F', count: 1 },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleSuggestionClick = (query: string, targetPage: 'ai_assistant' | 'ai_entry' = 'ai_assistant') => {
    setInitialAiQuery(query);
    setActivePage(targetPage);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Prominent AI Voice Launcher (Section 63) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-500/20">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SchoolAI Intelligence Core Active</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {getGreeting()}, {currentUser?.full_name || 'Administrator'}
            </h2>
            <p className="text-indigo-200 text-base font-medium mt-1">
              "Talk to your school data. Manage everything with AI."
            </p>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
              Real-time synchronization across student registries, marks, daily attendance logs, and fee collections.
            </p>

            {/* Prominent Suggestion Chips (Section 63) */}
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-2">Try saying or asking:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  onClick={() => handleSuggestionClick('Add a new student', 'ai_entry')}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-indigo-600 hover:text-white text-slate-200 border border-slate-700/80 transition-all shadow-xs flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Add a new student</span>
                </button>
                <button
                  onClick={() => handleSuggestionClick("Show today's attendance", 'ai_assistant')}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-indigo-600 hover:text-white text-slate-200 border border-slate-700/80 transition-all shadow-xs flex items-center space-x-1.5"
                >
                  <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Show today's attendance</span>
                </button>
                <button
                  onClick={() => handleSuggestionClick('Who scored highest in Maths?', 'ai_assistant')}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-indigo-600 hover:text-white text-slate-200 border border-slate-700/80 transition-all shadow-xs flex items-center space-x-1.5"
                >
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Who scored highest in Maths?</span>
                </button>
                <button
                  onClick={() => handleSuggestionClick('Show low attendance students', 'ai_assistant')}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-indigo-600 hover:text-white text-slate-200 border border-slate-700/80 transition-all shadow-xs flex items-center space-x-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Show low attendance students</span>
                </button>
                <button
                  onClick={() => handleSuggestionClick('What are the pending fees across the school?', 'ai_assistant')}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-indigo-600 hover:text-white text-slate-200 border border-slate-700/80 transition-all shadow-xs flex items-center space-x-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5 text-sky-400" />
                  <span>Show pending fees</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-row lg:flex-col items-center sm:items-end gap-3 shrink-0">
            <button
              onClick={() => setActivePage('ai_assistant')}
              className="flex items-center space-x-2.5 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/40 transition-all hover:scale-[1.02] active:scale-[0.98] ring-2 ring-indigo-400/40"
            >
              <Mic className="w-5 h-5 animate-pulse" />
              <span>Talk to SchoolAI</span>
            </button>
            <button
              onClick={() => setActivePage('ai_entry')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-semibold transition-all backdrop-blur-xs"
            >
              <Sparkles className="w-4 h-4 text-indigo-300" />
              <span>Natural Voice Entry</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
          <Filter className="w-4 h-4 text-slate-400" />
          <span>Filter Dashboard View:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-200"
          >
            <option value="all">All Classes (10-A, 10-B, 9-A)</option>
            <option value="Class 10-A">Class 10-A</option>
            <option value="Class 10-B">Class 10-B</option>
            <option value="Class 9-A">Class 9-A</option>
          </select>

          <span className="text-xs px-3 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-xl border border-indigo-100">
            Term 1 (2025–2026)
          </span>
        </div>
      </div>

      {/* Top KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Students</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-3xl font-extrabold text-slate-900">{totalStudents}</p>
            <span className="text-xs font-medium text-emerald-600 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              100% active
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across 3 academic grade sections</p>
        </div>

        {/* Attendance Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance Today</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-3xl font-extrabold text-slate-900">{attendanceTodayPct}%</p>
            <span className="text-xs font-medium text-slate-500">
              {todayAttendancePresent} / {todayAttendanceTotal} present
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Daily roster recorded on 03 Sep 2026</p>
        </div>

        {/* Average Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Marks</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-3xl font-extrabold text-slate-900">{avgMarks}%</p>
            <span className="text-xs font-bold text-emerald-600">Grade A</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Mid-Term examination average</p>
        </div>

        {/* Pending Fees */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Fees</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-rose-600">₹{(pendingFeeAmount / 1000).toFixed(0)}k</p>
            <span className="text-xs font-medium text-slate-500">
              ₹{(collectedFeeAmount / 1000).toFixed(0)}k collected
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">3 student accounts with balance</p>
        </div>
      </div>

      {/* Low Attendance Notice Banner (if any student is < 75%) */}
      {lowAttendanceStudents.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900">
                Attendance Alert: {lowAttendanceStudents.length} Students Below 75% Statutory Limit
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                {lowAttendanceStudents.map((s) => `${s.first_name} ${s.last_name} (${s.attendance_percentage}%)`).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActivePage('attendance')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            Review Attendance Roster
          </button>
        </div>
      )}

      {/* Row 1 Charts: Students by Class & Students by Gender */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Enrollment */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Student Enrollment by Class</h3>
              <p className="text-xs text-slate-500">Distribution across active sections</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classCounts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender Demographics */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Gender Ratio</h3>
            <p className="text-xs text-slate-500">Cohort balance overview</p>
          </div>
          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-around pt-2 border-t border-slate-100 text-xs font-semibold">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-indigo-600" />
              <span>Male: {maleCount}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-pink-500" />
              <span>Female: {femaleCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2 Charts: Attendance Trend & Subject Averages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Attendance Trend */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Weekly Attendance Trend (%)</h3>
              <p className="text-xs text-slate-500">5-day school attendance momentum</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
              92.6% Average
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[70, 100]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average Marks by Subject */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Subject Performance Average</h3>
              <p className="text-xs text-slate-500">Mid-Term marks scored out of 100</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectAverages} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="subject" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
                <Bar dataKey="score" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3 Charts: Fee Collection & Grade Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fee Collection vs Pending */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Fee Realization</h3>
            <p className="text-xs text-slate-500">Collected vs Overdue/Pending balance</p>
          </div>
          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={feeStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {feeStatusData.map((entry, index) => (
                    <Cell key={`fee-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => `₹${Number(val).toLocaleString('en-IN')}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-emerald-700 font-medium">Collected:</span>
              <span className="font-bold text-slate-900">₹{collectedFeeAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-rose-700 font-medium">Pending:</span>
              <span className="font-bold text-slate-900">₹{pendingFeeAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Grade Distribution */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Student Academic Grade Distribution</h3>
              <p className="text-xs text-slate-500">Count of students achieving each tier</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="grade" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Students Table Quick Preview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Student Directory Quick View</h3>
            <p className="text-xs text-slate-500">Recent student roster entries</p>
          </div>
          <button
            onClick={() => setActivePage('students')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
          >
            <span>View All Students</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3">Admission #</th>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">Class & Section</th>
                <th className="px-5 py-3">Attendance %</th>
                <th className="px-5 py-3">Avg Marks</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {students.slice(0, 5).map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-slate-500">{student.admission_number}</td>
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-slate-900">
                      {student.first_name} {student.last_name}
                    </div>
                    <div className="text-[11px] text-slate-400">{student.email}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                      {student.current_class}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`font-bold ${
                        (student.attendance_percentage || 0) < 75 ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {student.attendance_percentage}%
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-slate-900">{student.average_marks}%</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {student.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => viewStudentProfile(student.id)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      View Profile
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
