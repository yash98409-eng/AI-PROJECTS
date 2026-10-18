import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  X,
  Phone,
  Mail,
  Calendar,
  Award,
  BookOpen,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { SchoolService } from '../supabase/supabaseClient';
import { Student, Guardian, Mark, Attendance, Fee, StudentAchievement } from '../types';
import { StatusBadge, GradeBadge } from '../components/common/Badges';
import { Modal, ConfirmDialog } from '../components/common/Modal';

export const StudentsPage: React.FC = () => {
  const {
    currentUser,
    dataVersion,
    refreshData,
    selectedStudentId,
    closeStudentProfile,
    viewStudentProfile,
  } = useApp();
  const { showToast } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Add / Edit Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formTab, setFormTab] = useState<'personal' | 'guardian' | 'academic'>('personal');

  // Form inputs
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [dob, setDob] = useState('2010-01-15');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentClass, setCurrentClass] = useState('Class 10-A');
  const [currentSection, setCurrentSection] = useState('A');
  const [rollNumber, setRollNumber] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianRelation, setGuardianRelation] = useState<'father' | 'mother' | 'guardian'>('father');

  // Delete Confirm state
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Profile View Modal state
  const [profileData, setProfileData] = useState<{
    student?: Student;
    guardians: Guardian[];
    marks: Mark[];
    attendance: Attendance[];
    fees: Fee[];
    achievements: StudentAchievement[];
  } | null>(null);
  const [profileActiveTab, setProfileActiveTab] = useState<
    'personal' | 'guardian' | 'academic' | 'marks' | 'attendance' | 'fees' | 'achievements'
  >('personal');

  useEffect(() => {
    loadStudents();
  }, [dataVersion]);

  const loadStudents = async () => {
    setLoading(true);
    const data = await SchoolService.getStudents();
    setStudents(data);
    setLoading(false);
  };

  // Open profile modal whenever selectedStudentId changes in AppContext
  useEffect(() => {
    if (selectedStudentId) {
      SchoolService.getStudentById(selectedStudentId).then((data) => {
        setProfileData(data);
        setProfileActiveTab('personal');
      });
    } else {
      setProfileData(null);
    }
  }, [selectedStudentId]);

  const handleOpenAddModal = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      setFirstName(student.first_name);
      setLastName(student.last_name);
      setAdmissionNumber(student.admission_number);
      setDob(student.date_of_birth || '2010-01-15');
      setGender(student.gender || 'male');
      setEmail(student.email || '');
      setPhone(student.phone || '');
      setCurrentClass(student.current_class || 'Class 10-A');
      setCurrentSection(student.current_section || 'A');
      setRollNumber(student.roll_number || '');
    } else {
      setEditingStudent(null);
      setFirstName('');
      setLastName('');
      setAdmissionNumber(`ADM-2025-${Math.floor(100 + Math.random() * 900)}`);
      setDob('2010-01-15');
      setGender('male');
      setEmail('');
      setPhone('');
      setCurrentClass('Class 10-A');
      setCurrentSection('A');
      setRollNumber((students.length + 101).toString());
      setGuardianName('');
      setGuardianPhone('');
    }
    setFormTab('personal');
    setIsAddModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await SchoolService.saveStudent(
        {
          id: editingStudent?.id,
          first_name: firstName,
          last_name: lastName,
          admission_number: admissionNumber,
          date_of_birth: dob,
          gender,
          email,
          phone,
          current_class: currentClass,
          current_section: currentSection,
          roll_number: rollNumber,
        },
        guardianName
          ? {
              full_name: guardianName,
              phone: guardianPhone,
              relationship: guardianRelation,
            }
          : undefined,
        currentUser
      );

      showToast(
        editingStudent ? 'Student details updated successfully!' : 'New student registered successfully!',
        'success'
      );
      setIsAddModalOpen(false);
      refreshData();
    } catch (err: any) {
      showToast('Failed to save student: ' + err.message, 'error');
    }
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    try {
      await SchoolService.deleteStudent(studentToDelete.id, currentUser);
      showToast(`Student ${studentToDelete.first_name} ${studentToDelete.last_name} removed.`, 'info');
      setStudentToDelete(null);
      refreshData();
    } catch (err: any) {
      showToast('Error deleting student', 'error');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Admission No', 'First Name', 'Last Name', 'Class', 'Roll', 'Gender', 'Attendance %', 'Average Marks'];
    const rows = filteredStudents.map((s) => [
      s.admission_number,
      s.first_name,
      s.last_name,
      s.current_class,
      s.roll_number,
      s.gender,
      s.attendance_percentage,
      s.average_marks,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SchoolAI_Students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Students directory exported to CSV!', 'success');
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.admission_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.roll_number && s.roll_number.includes(searchQuery));

    const matchesClass = selectedClass === 'all' || s.current_class === selectedClass;
    const matchesGender = selectedGender === 'all' || s.gender === selectedGender;
    const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;

    return matchesSearch && matchesClass && matchesGender && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Student Management Registry</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
              {filteredStudents.length} Students
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete multi-tenant student profiles with academic, guardian, marks, and attendance linkage.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => handleOpenAddModal()}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, admission no, roll..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Classes</option>
            <option value="Class 10-A">Class 10-A</option>
            <option value="Class 10-B">Class 10-B</option>
            <option value="Class 9-A">Class 9-A</option>
          </select>

          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3">Admission #</th>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">Class & Roll</th>
                <th className="px-5 py-3">Gender</th>
                <th className="px-5 py-3">Attendance</th>
                <th className="px-5 py-3">Avg Marks</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                    No students match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-slate-500 font-semibold">{s.admission_number}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase border border-indigo-100">
                          {s.first_name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {s.first_name} {s.last_name}
                          </p>
                          <p className="text-[10px] text-slate-400">{s.email || 'No email registered'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-slate-800">{s.current_class}</span>
                      <span className="text-[11px] text-slate-400 ml-1.5">(Roll #{s.roll_number || '—'})</span>
                    </td>
                    <td className="px-5 py-3.5 capitalize text-slate-600">{s.gender}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`font-bold ${
                            (s.attendance_percentage || 0) < 75 ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          {s.attendance_percentage}%
                        </span>
                        {(s.attendance_percentage || 0) < 75 && (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" title="Attendance below 75%" />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-extrabold text-slate-900">{s.average_marks}%</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => viewStudentProfile(s.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenAddModal(s)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Edit Student"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setStudentToDelete(s)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* STUDENT PROFILE FULL VIEW MODAL (7 TABS) */}
      <Modal
        isOpen={Boolean(selectedStudentId && profileData?.student)}
        onClose={closeStudentProfile}
        title={`${profileData?.student?.first_name} ${profileData?.student?.last_name}`}
        subtitle={`Admission: ${profileData?.student?.admission_number} • ${profileData?.student?.current_class} • Roll #${profileData?.student?.roll_number}`}
        maxWidth="max-w-4xl"
      >
        {profileData?.student && (
          <div className="space-y-6">
            {/* Top Stat Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Attendance</span>
                <p
                  className={`text-lg font-extrabold ${
                    (profileData.student.attendance_percentage || 0) < 75 ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {profileData.student.attendance_percentage}%
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Average Marks</span>
                <p className="text-lg font-extrabold text-slate-900">{profileData.student.average_marks}%</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Academic Status</span>
                <p className="text-sm font-bold text-slate-700 capitalize mt-0.5">{profileData.student.status}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Assigned Section</span>
                <p className="text-sm font-bold text-indigo-600 mt-0.5">{profileData.student.current_class}</p>
              </div>
            </div>

            {/* 7 Tabs Bar */}
            <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
              {[
                { id: 'personal', label: '1. Personal Info' },
                { id: 'guardian', label: '2. Guardian Info' },
                { id: 'academic', label: '3. Academic Info' },
                { id: 'marks', label: '4. Marks & Grades' },
                { id: 'attendance', label: '5. Attendance Logs' },
                { id: 'fees', label: '6. Fee Statements' },
                { id: 'achievements', label: '7. Achievements' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setProfileActiveTab(tab.id as any)}
                  className={`px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                    profileActiveTab === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Personal Info */}
            {profileActiveTab === 'personal' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-slate-400 font-medium">Full Name</span>
                  <p className="font-bold text-slate-900 text-sm">
                    {profileData.student.first_name} {profileData.student.last_name}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-slate-400 font-medium">Admission Number</span>
                  <p className="font-bold text-slate-900 font-mono text-sm">{profileData.student.admission_number}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-slate-400 font-medium">Date of Birth</span>
                  <p className="font-bold text-slate-900">{profileData.student.date_of_birth}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-slate-400 font-medium">Gender</span>
                  <p className="font-bold text-slate-900 capitalize">{profileData.student.gender}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-slate-400 font-medium">Email Address</span>
                  <p className="font-bold text-slate-900">{profileData.student.email || '—'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-slate-400 font-medium">Contact Phone</span>
                  <p className="font-bold text-slate-900">{profileData.student.phone || '—'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1 sm:col-span-2">
                  <span className="text-slate-400 font-medium">Residential Address</span>
                  <p className="font-bold text-slate-900">{profileData.student.address || '42 Greenfield Avenue, Oakridge'}</p>
                </div>
              </div>
            )}

            {/* Tab 2: Guardian Info */}
            {profileActiveTab === 'guardian' && (
              <div className="space-y-3">
                {profileData.guardians.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No guardian records found for this student.</p>
                ) : (
                  profileData.guardians.map((g) => (
                    <div key={g.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{g.full_name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 capitalize">
                          {g.relationship}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                        <div>Phone: <span className="font-semibold text-slate-900">{g.phone || '—'}</span></div>
                        <div>Email: <span className="font-semibold text-slate-900">{g.email || '—'}</span></div>
                        <div>Occupation: <span className="font-semibold text-slate-900">{g.occupation || '—'}</span></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 3: Academic Info */}
            {profileActiveTab === 'academic' && (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 font-medium">Current Enrolled Class</span>
                  <p className="font-bold text-slate-900 text-sm mt-1">{profileData.student.current_class}</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 font-medium">Section & Roll</span>
                  <p className="font-bold text-slate-900 text-sm mt-1">
                    Section {profileData.student.current_section} • Roll #{profileData.student.roll_number}
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 font-medium">Admission Date</span>
                  <p className="font-bold text-slate-900 text-sm mt-1">{profileData.student.admission_date || '2024-04-10'}</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 font-medium">Academic Year</span>
                  <p className="font-bold text-indigo-600 text-sm mt-1">2025–2026 Active</p>
                </div>
              </div>
            )}

            {/* Tab 4: Marks & Grades */}
            {profileActiveTab === 'marks' && (
              <div className="space-y-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                      <tr>
                        <th className="px-3 py-2">Subject</th>
                        <th className="px-3 py-2">Exam</th>
                        <th className="px-3 py-2">Score</th>
                        <th className="px-3 py-2">Grade</th>
                        <th className="px-3 py-2">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {profileData.marks.map((m) => (
                        <tr key={m.id}>
                          <td className="px-3 py-2.5 font-bold text-slate-900">{m.subject_name}</td>
                          <td className="px-3 py-2.5 text-slate-600">{m.exam_name}</td>
                          <td className="px-3 py-2.5 font-bold text-indigo-600">
                            {m.marks_obtained} / {m.max_marks}
                          </td>
                          <td className="px-3 py-2.5">
                            <GradeBadge grade={m.grade} />
                          </td>
                          <td className="px-3 py-2.5 text-slate-500">{m.remarks || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 5: Attendance */}
            {profileActiveTab === 'attendance' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl text-xs font-bold text-indigo-900">
                  <span>Overall Attendance Ratio:</span>
                  <span>{profileData.student.attendance_percentage}%</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {profileData.attendance.map((a) => (
                    <div key={a.id} className="py-2.5 flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{a.attendance_date}</span>
                      <StatusBadge status={a.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 6: Fees */}
            {profileActiveTab === 'fees' && (
              <div className="space-y-3">
                {profileData.fees.map((f) => (
                  <div key={f.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 capitalize">{f.fee_type}</p>
                      <p className="text-slate-400 text-[11px]">Due: {f.due_date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-slate-900">₹{f.amount.toLocaleString('en-IN')}</p>
                      <StatusBadge status={f.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 7: Achievements */}
            {profileActiveTab === 'achievements' && (
              <div className="space-y-2">
                {profileData.achievements.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No achievements recorded yet.</p>
                ) : (
                  profileData.achievements.map((ach) => (
                    <div key={ach.id} className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-950 text-sm">{ach.title}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold capitalize">
                          {ach.category}
                        </span>
                      </div>
                      <p className="text-slate-600">{ach.description}</p>
                      <p className="text-[10px] text-slate-400">{ach.award_date}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ADD / EDIT STUDENT MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingStudent ? 'Edit Student Record' : 'Register New Student'}
        subtitle="Manage personal demographics, guardian information, and academic placement."
      >
        <form onSubmit={handleSaveStudent} className="space-y-4">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 gap-2">
            {(['personal', 'guardian', 'academic'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFormTab(tab)}
                className={`px-3 py-2 text-xs font-bold border-b-2 capitalize transition-colors ${
                  formTab === tab
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                {tab} Information
              </button>
            ))}
          </div>

          {/* Tab 1: Personal */}
          {formTab === 'personal' && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. Rahul"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. Sharma"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Admission Number</label>
                <input
                  type="text"
                  value={admissionNumber}
                  onChange={(e) => setAdmissionNumber(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Contact Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="student@oakridge.edu"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Guardian */}
          {formTab === 'guardian' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Guardian / Parent Full Name</label>
                <input
                  type="text"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. Amit Sharma"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Relationship</label>
                  <select
                    value={guardianRelation}
                    onChange={(e) => setGuardianRelation(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="father">Father</option>
                    <option value="mother">Mother</option>
                    <option value="guardian">Guardian</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Contact Phone Number</label>
                  <input
                    type="text"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder="9876543210"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Academic */}
          {formTab === 'academic' && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Class</label>
                <select
                  value={currentClass}
                  onChange={(e) => setCurrentClass(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Class 10-A">Class 10-A</option>
                  <option value="Class 10-B">Class 10-B</option>
                  <option value="Class 9-A">Class 9-A</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Roll Number</label>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="101"
                />
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
            >
              {editingStudent ? 'Save Changes' : 'Register Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(studentToDelete)}
        onClose={() => setStudentToDelete(null)}
        onConfirm={handleDeleteStudent}
        title="Delete Student Record"
        message={`Are you sure you want to permanently delete the student profile for ${studentToDelete?.first_name} ${studentToDelete?.last_name}? This action cannot be undone.`}
        confirmLabel="Delete Student"
        isDestructive={true}
      />
    </div>
  );
};
