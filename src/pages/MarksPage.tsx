import React, { useState, useEffect } from 'react';
import {
  Award,
  BookOpen,
  Filter,
  Save,
  CheckCircle,
  Download,
  Search,
  AlertCircle,
  BarChart2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { SchoolService } from '../supabase/supabaseClient';
import { Student, Mark, Subject, Exam } from '../types';
import { GradeBadge } from '../components/common/Badges';

export const MarksPage: React.FC = () => {
  const { currentUser, dataVersion, refreshData } = useApp();
  const { showToast } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);

  const [selectedClass, setSelectedClass] = useState('Class 10-A');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [selectedExam, setSelectedExam] = useState('Mid Term 2025');

  // Editable marks map: studentId -> { marks_obtained: number, remarks: string }
  const [marksEntry, setMarksEntry] = useState<Record<string, { score: number; remarks: string }>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const [stu, mrk, sub, ex] = await Promise.all([
        SchoolService.getStudents(),
        SchoolService.getMarks(),
        SchoolService.getSubjects(),
        SchoolService.getExams(),
      ]);
      setStudents(stu);
      setMarks(mrk);
      setSubjects(sub);
      setExams(ex);
    }
    load();
  }, [dataVersion]);

  const classStudents = students.filter((s) => s.current_class === selectedClass);

  // Initialize marks entry table
  useEffect(() => {
    const initialMap: Record<string, { score: number; remarks: string }> = {};
    classStudents.forEach((s) => {
      const existing = marks.find(
        (m) =>
          m.student_id === s.id &&
          m.subject_name === selectedSubject &&
          (m.exam_name === selectedExam || !selectedExam)
      );
      initialMap[s.id] = {
        score: existing ? existing.marks_obtained : 75,
        remarks: existing ? existing.remarks || '' : '',
      };
    });
    setMarksEntry(initialMap);
  }, [selectedClass, selectedSubject, selectedExam, students, marks]);

  const calculateGrade = (score: number): string => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 40) return 'C';
    return 'F';
  };

  const handleScoreChange = (studentId: string, value: number) => {
    const clamped = Math.max(0, Math.min(100, isNaN(value) ? 0 : value));
    setMarksEntry((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        score: clamped,
      },
    }));
  };

  const handleRemarksChange = (studentId: string, value: string) => {
    setMarksEntry((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks: value,
      },
    }));
  };

  const handleSaveMarks = async () => {
    setIsSaving(true);
    try {
      for (const s of classStudents) {
        const entry = marksEntry[s.id];
        if (entry !== undefined) {
          await SchoolService.saveMark(
            {
              student_id: s.id,
              student_name: `${s.first_name} ${s.last_name}`,
              subject_name: selectedSubject,
              exam_name: selectedExam,
              marks_obtained: entry.score,
              max_marks: 100,
              grade: calculateGrade(entry.score),
              remarks: entry.remarks,
            },
            currentUser
          );
        }
      }

      showToast(`Marks for ${selectedSubject} (${selectedClass}) saved successfully!`, 'success');
      refreshData();
    } catch (err: any) {
      showToast('Error saving marks: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Metrics
  const scores = classStudents.map((s) => marksEntry[s.id]?.score || 0);
  const classAvg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;
  const passCount = scores.filter((s) => s >= 40).length;
  const passRate = scores.length > 0 ? Math.round((passCount / scores.length) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Academic Marks & Examinations</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
              Grading Portal
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gradebook entry, automatic calculation of letter grades, and audit trail logging.
          </p>
        </div>

        <button
          onClick={handleSaveMarks}
          disabled={isSaving}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Marks...' : 'Save All Marks'}</span>
        </button>
      </div>

      {/* Selector Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3">
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
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.name}>
                {sub.name} ({sub.code})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Exam:</span>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.name}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Class Average</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{classAvg} / 100</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Highest Score</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{highestScore} / 100</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Lowest Score</span>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">{lowestScore} / 100</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Pass Rate</span>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1">{passRate}%</p>
        </div>
      </div>

      {/* Marks Entry Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Roll</th>
                <th className="px-5 py-3.5">Admission #</th>
                <th className="px-5 py-3.5">Student Name</th>
                <th className="px-5 py-3.5">Marks Obtained (Max 100)</th>
                <th className="px-5 py-3.5">Calculated Grade</th>
                <th className="px-5 py-3.5">Teacher Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {classStudents.map((student) => {
                const currentScore = marksEntry[student.id]?.score ?? 75;
                const currentRemarks = marksEntry[student.id]?.remarks ?? '';
                const grade = calculateGrade(currentScore);

                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">#{student.roll_number || '—'}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-500">{student.admission_number}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">
                        {student.first_name} {student.last_name}
                      </p>
                      <p className="text-[10px] text-slate-400">Class {student.current_class}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={currentScore}
                          onChange={(e) => handleScoreChange(student.id, parseInt(e.target.value))}
                          className="w-20 p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-center text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                        />
                        <span className="text-slate-400 font-bold">/ 100</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <GradeBadge grade={grade} />
                    </td>
                    <td className="px-5 py-3.5">
                      <input
                        type="text"
                        placeholder="Add remarks..."
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
