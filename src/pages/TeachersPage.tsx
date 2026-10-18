import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  BookOpen,
  Award,
  GraduationCap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { SchoolService } from '../supabase/supabaseClient';
import { Teacher } from '../types';
import { StatusBadge } from '../components/common/Badges';
import { Modal } from '../components/common/Modal';

export const TeachersPage: React.FC = () => {
  const { dataVersion, refreshData, currentUser } = useApp();
  const { showToast } = useToast();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [qualification, setQualification] = useState('');

  useEffect(() => {
    SchoolService.getTeachers().then(setTeachers);
  }, [dataVersion]);

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    const newTeacher: Teacher = {
      id: 'tch-' + Date.now().toString().slice(-6),
      school_id: 'sch-oakridge-001',
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      qualification,
      specialization,
      status: 'active',
      joining_date: new Date().toISOString().split('T')[0],
      assigned_classes: ['Class 10-A'],
      assigned_subjects: [specialization || 'General'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [newTeacher, ...teachers];
    setTeachers(updated);
    showToast(`Faculty member ${firstName} ${lastName} added to school registry!`, 'success');
    setIsAddModalOpen(false);
  };

  const filteredTeachers = teachers.filter((t) =>
    `${t.first_name} ${t.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.assigned_subjects?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Faculty & Department Directory</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
              {teachers.length} Teachers
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Faculty assignments, qualifications, assigned classes, and contact records.
          </p>
        </div>

        <button
          onClick={() => {
            setFirstName('');
            setLastName('');
            setSpecialization('');
            setEmail('');
            setPhone('');
            setQualification('');
            setIsAddModalOpen(true);
          }}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Faculty Member</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search faculty by name or subject specialization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
          />
        </div>
      </div>

      {/* Teachers Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeachers.map((teacher) => (
          <div
            key={teacher.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm uppercase border border-indigo-100">
                  {teacher.first_name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {teacher.first_name} {teacher.last_name}
                  </h3>
                  <p className="text-xs text-indigo-600 font-semibold">{teacher.specialization}</p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                <p className="flex items-center space-x-2">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{teacher.qualification || 'M.Sc., B.Ed.'}</span>
                </p>
                <p className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{teacher.email}</span>
                </p>
                <p className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{teacher.phone}</span>
                </p>
              </div>

              {/* Badges */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                {teacher.assigned_classes?.map((c, i) => (
                  <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {c}
                  </span>
                ))}
                {teacher.assigned_subjects?.map((s, i) => (
                  <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <StatusBadge status={teacher.status} />
              <span className="text-[10px] text-slate-400 font-medium">Joined {teacher.joining_date}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Teacher Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Faculty Member"
        subtitle="Register teacher profiles and subject specializations."
      >
        <form onSubmit={handleSaveTeacher} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-600 block mb-1">First Name *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="Dr. Ramesh"
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
                placeholder="Verma"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-600 block mb-1">Subject Specialization *</label>
              <input
                type="text"
                required
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="e.g. Mathematics"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-600 block mb-1">Qualification</label>
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="Ph.D. in Applied Mathematics"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-600 block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="faculty@oakridgeacademy.edu"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-600 block mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="+91 9876543210"
              />
            </div>
          </div>

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
              Register Faculty
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
