import React from 'react';
import { UserRole } from '../../types';

export const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  const roleConfig: Record<UserRole, { label: string; bg: string; text: string }> = {
    super_admin: { label: 'Super Admin', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', text: 'text-indigo-700' },
    school_admin: { label: 'School Admin', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700' },
    teacher: { label: 'Teacher', bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700' },
    staff: { label: 'Staff', bg: 'bg-slate-100 text-slate-700 border-slate-200', text: 'text-slate-700' },
  };

  const config = roleConfig[role] || roleConfig.staff;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg}`}>
      {config.label}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const lower = status.toLowerCase();
  let bg = 'bg-slate-100 text-slate-700 border-slate-200';

  if (lower === 'active' || lower === 'present' || lower === 'paid') {
    bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (lower === 'absent' || lower === 'overdue' || lower === 'resigned') {
    bg = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (lower === 'late' || lower === 'partial' || lower === 'on_leave') {
    bg = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (lower === 'leave' || lower === 'pending') {
    bg = 'bg-blue-50 text-blue-700 border-blue-200';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${bg}`}>
      {status}
    </span>
  );
};

export const GradeBadge: React.FC<{ grade?: string }> = ({ grade }) => {
  if (!grade) return <span className="text-slate-400 text-xs">—</span>;

  let color = 'bg-slate-100 text-slate-700 border-slate-200';
  if (grade === 'A+' || grade === 'A') color = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
  else if (grade === 'B+' || grade === 'B') color = 'bg-blue-100 text-blue-800 border-blue-300 font-semibold';
  else if (grade === 'C+' || grade === 'C') color = 'bg-amber-100 text-amber-800 border-amber-300';
  else if (grade === 'F' || grade === 'D') color = 'bg-rose-100 text-rose-800 border-rose-300 font-bold';

  return (
    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs border ${color}`}>
      {grade}
    </span>
  );
};
