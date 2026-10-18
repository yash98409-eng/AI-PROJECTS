import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Users,
  Award,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { SchoolService } from '../supabase/supabaseClient';
import { Student, Mark, Fee } from '../types';

export const ReportsPage: React.FC = () => {
  const { showToast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);

  useEffect(() => {
    Promise.all([
      SchoolService.getStudents(),
      SchoolService.getMarks(),
      SchoolService.getFees(),
    ]).then(([s, m, f]) => {
      setStudents(s);
      setMarks(m);
      setFees(f);
    });
  }, []);

  const downloadCSV = (filename: string, headers: string[], rows: any[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((x) => `"${x}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Generated and exported ${filename}`, 'success');
  };

  const exportAcademicReport = () => {
    const headers = ['Student Name', 'Admission No', 'Subject', 'Exam', 'Marks Obtained', 'Max Marks', 'Grade'];
    const rows = marks.map((m) => [
      m.student_name,
      m.student_id,
      m.subject_name,
      m.exam_name,
      m.marks_obtained,
      m.max_marks,
      m.grade,
    ]);
    downloadCSV('SchoolAI_Academic_Marks_Report.csv', headers, rows);
  };

  const exportAttendanceReport = () => {
    const headers = ['Admission No', 'Name', 'Class', 'Attendance %', 'Status Category'];
    const rows = students.map((s) => [
      s.admission_number,
      `${s.first_name} ${s.last_name}`,
      s.current_class,
      s.attendance_percentage,
      (s.attendance_percentage || 0) < 75 ? 'DEFAULTER (<75%)' : 'REGULAR',
    ]);
    downloadCSV('SchoolAI_Attendance_Summary_Report.csv', headers, rows);
  };

  const exportFeeReport = () => {
    const headers = ['Student Name', 'Fee Type', 'Total Billed', 'Amount Paid', 'Balance Due', 'Status', 'Due Date'];
    const rows = fees.map((f) => [
      f.student_name,
      f.fee_type,
      f.amount,
      f.paid_amount,
      f.amount - f.paid_amount,
      f.status,
      f.due_date,
    ]);
    downloadCSV('SchoolAI_Fee_Collection_Statement.csv', headers, rows);
  };

  const exportDirectory = () => {
    const headers = ['Admission No', 'First Name', 'Last Name', 'Class', 'Gender', 'Status', 'Email'];
    const rows = students.map((s) => [
      s.admission_number,
      s.first_name,
      s.last_name,
      s.current_class,
      s.gender,
      s.status,
      s.email || '',
    ]);
    downloadCSV('SchoolAI_Master_Student_Directory.csv', headers, rows);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
          <span>School Reports & Statutory Documentation</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Export standardized CSV and printable reports for parents, auditors, and board examinations.
        </p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Report 1 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Academic Marks & Gradebook Report</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Consolidated subject scores, calculated letter grades, and percentile metrics for all mid-term and final examinations.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">{marks.length} recorded grade entries</span>
            <button
              onClick={exportAcademicReport}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>

        {/* Report 2 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Attendance Defaulter Summary</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Complete student attendance breakdown highlighting students below the statutory 75% limit for board exam eligibility.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">All registered cohorts</span>
            <button
              onClick={exportAttendanceReport}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>

        {/* Report 3 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Fee Realization & Dues Statement</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Financial reconciliation ledger detailing collected amounts, overdue accounts, and receivable tuition balances.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">{fees.length} billing items</span>
            <button
              onClick={exportFeeReport}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>

        {/* Report 4 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Complete Master Student Directory</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Full student demographics, admission numbers, assigned grade sections, and contact channels.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">{students.length} active records</span>
            <button
              onClick={exportDirectory}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
