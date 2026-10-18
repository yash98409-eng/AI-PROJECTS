import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Save,
  AlertTriangle,
  Send,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { SchoolService } from '../supabase/supabaseClient';
import { Student, Attendance } from '../types';

export const AttendancePage: React.FC = () => {
  const { currentUser, dataVersion, refreshData, viewStudentProfile } = useApp();
  const { showToast } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<Attendance[]>([]);
  const [selectedClass, setSelectedClass] = useState('Class 10-A');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Attendance status mapping: studentId -> 'present' | 'absent' | 'late' | 'leave'
  const [attendanceState, setAttendanceState] = useState<
    Record<string, { status: 'present' | 'absent' | 'late' | 'leave'; remarks: string }>
  >({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const [stu, att] = await Promise.all([
        SchoolService.getStudents(),
        SchoolService.getAttendance(),
      ]);
      setStudents(stu);
      setAttendanceLogs(att);
    }
    load();
  }, [dataVersion]);

  const classStudents = students.filter((s) => s.current_class === selectedClass);

  // Initialize or load status for selected class and date
  useEffect(() => {
    const map: Record<string, { status: 'present' | 'absent' | 'late' | 'leave'; remarks: string }> = {};
    classStudents.forEach((s) => {
      const match = attendanceLogs.find(
        (a) => a.student_id === s.id && a.attendance_date === selectedDate
      );
      map[s.id] = {
        status: match ? match.status : 'present',
        remarks: match ? match.remarks || '' : '',
      };
    });
    setAttendanceState(map);
  }, [selectedClass, selectedDate, students, attendanceLogs]);

  const handleStatusToggle = (
    studentId: string,
    status: 'present' | 'absent' | 'late' | 'leave'
  ) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const handleMarkAllPresent = () => {
    const updated = { ...attendanceState };
    classStudents.forEach((s) => {
      updated[s.id] = {
        ...updated[s.id],
        status: 'present',
      };
    });
    setAttendanceState(updated);
    showToast('All students marked present for selected date', 'info');
  };

  const handleSaveAttendance = async () => {
    setIsSaving(true);
    try {
      const payload = classStudents.map((s) => ({
        student_id: s.id,
        student_name: `${s.first_name} ${s.last_name}`,
        class_id: selectedClass === 'Class 10-A' ? 'cls-10a' : 'cls-10b',
        date: selectedDate,
        status: attendanceState[s.id]?.status || 'present',
        remarks: attendanceState[s.id]?.remarks || '',
      }));

      await SchoolService.recordAttendance(payload, currentUser);
      showToast(`Attendance for ${selectedClass} recorded successfully!`, 'success');
      refreshData();
    } catch (err: any) {
      showToast('Failed to record attendance: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Counts
  const presentCount = classStudents.filter((s) => attendanceState[s.id]?.status === 'present').length;
  const absentCount = classStudents.filter((s) => attendanceState[s.id]?.status === 'absent').length;
  const lateCount = classStudents.filter((s) => attendanceState[s.id]?.status === 'late').length;
  const leaveCount = classStudents.filter((s) => attendanceState[s.id]?.status === 'leave').length;

  const lowAttendanceStudents = classStudents.filter(
    (s) => (s.attendance_percentage || 0) < 75
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Daily Attendance Register</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              Session 2025–2026
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time daily roll call, automated rate calculation, and guardian notification alerts.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleMarkAllPresent}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            Mark All Present
          </button>
          <button
            onClick={handleSaveAttendance}
            disabled={isSaving}
            className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Roster...' : 'Save Attendance'}</span>
          </button>
        </div>
      </div>

      {/* Date & Class Selectors */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            >
              <option value="Class 10-A">Class 10-A</option>
              <option value="Class 10-B">Class 10-B</option>
              <option value="Class 9-A">Class 9-A</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            />
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center space-x-3 text-xs font-bold">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            {presentCount} Present
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
            {absentCount} Absent
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
            {lateCount} Late
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
            {leaveCount} Leave
          </span>
        </div>
      </div>

      {/* Low Attendance Watchlist Warning */}
      {lowAttendanceStudents.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-900">
                Attendance Shortfall Warning ({lowAttendanceStudents.length} Students &lt; 75%)
              </p>
              <p className="text-xs text-rose-700 mt-0.5">
                Students below 75% require mandatory notification to parents:
                {' '}{lowAttendanceStudents.map((s) => `${s.first_name} ${s.last_name} (${s.attendance_percentage}%)`).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => showToast('Automated SMS & Email attendance alerts sent to parents!', 'success')}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Notify Guardians</span>
          </button>
        </div>
      )}

      {/* Attendance Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Roll</th>
                <th className="px-5 py-3.5">Student Name</th>
                <th className="px-5 py-3.5">Overall Rate</th>
                <th className="px-5 py-3.5">Attendance Status</th>
                <th className="px-5 py-3.5">Remarks / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {classStudents.map((student) => {
                const currentStatus = attendanceState[student.id]?.status || 'present';
                const currentRemarks = attendanceState[student.id]?.remarks || '';

                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">#{student.roll_number || '—'}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">
                        {student.first_name} {student.last_name}
                      </p>
                      <p className="text-[10px] text-slate-400">{student.admission_number}</p>
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
                    <td className="px-5 py-3.5">
                      {/* 4 Status Toggle Pills */}
                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(student.id, 'present')}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                            currentStatus === 'present'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(student.id, 'absent')}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                            currentStatus === 'absent'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(student.id, 'late')}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                            currentStatus === 'late'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Late
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(student.id, 'leave')}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                            currentStatus === 'leave'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Leave
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <input
                        type="text"
                        placeholder="e.g. Medical certificate submitted..."
                        value={currentRemarks}
                        onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                        className="w-full max-w-xs p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
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
