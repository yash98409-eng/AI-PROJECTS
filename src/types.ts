/**
 * SchoolAI Manager - Core Type Definitions
 * Schema matches the Supabase PostgreSQL relational database
 */

export type UserRole = 'super_admin' | 'school_admin' | 'teacher' | 'staff';

export interface School {
  id: string;
  code?: string; // e.g. "School A", "School B"
  name: string;
  curriculum?: string; // CBSE, ICSE, IB, State, Cambridge
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  plan?: 'starter' | 'standard' | 'professional' | 'enterprise';
  billing_cycle?: 'monthly' | 'yearly';
  plan_renewal_date?: string;
  student_count?: number;
  created_at: string;
  updated_at: string;
}

export type PlanTier = 'starter' | 'standard' | 'professional' | 'enterprise';

export interface PricingPlan {
  id: PlanTier;
  tier?: PlanTier;
  name: string;
  badge?: string;
  description?: string;
  pricePerMonth: number;
  pricePerYear: number;
  price_inr?: number;
  suitableFor: string;
  suitable_for?: string;
  studentLimit: number;
  student_limit?: number;
  aiQueriesLimit: number;
  ai_queries_limit?: number;
  features: string[];
  popular?: boolean;
  is_popular?: boolean;
}

export interface Invoice {
  id: string;
  school_id: string;
  invoice_number: string;
  plan: PlanTier;
  amount: number;
  status: 'paid' | 'pending';
  billing_date: string;
  pdf_url?: string;
}

export interface UserProfile {
  id: string;
  school_id: string;
  username?: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  avatar_type?: 'preset' | 'upload' | 'initials';
  bio?: string;
  department?: string;
  created_at: string;
  updated_at: string;
}

export interface AcademicYear {
  id: string;
  school_id: string;
  name: string; // e.g. "2025-2026"
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
}

export interface ClassRoom {
  id: string;
  school_id: string;
  academic_year_id?: string;
  name: string; // e.g. "10-A"
  grade: number; // e.g. 10
  section: string; // e.g. "A"
  class_teacher_id?: string;
  class_teacher_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  school_id: string;
  name: string;
  code: string;
  max_marks: number;
  created_at: string;
}

export interface Student {
  id: string;
  school_id: string;
  admission_number: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  blood_group?: string;
  nationality?: string;
  religion?: string;
  category?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  admission_date: string;
  status: 'active' | 'inactive' | 'transferred' | 'graduated';
  created_at: string;
  updated_at: string;

  // Joined/Computed fields
  current_class?: string;
  current_section?: string;
  roll_number?: string;
  attendance_percentage?: number;
  average_marks?: number;
}

export interface Guardian {
  id: string;
  school_id: string;
  student_id: string;
  relationship: 'father' | 'mother' | 'guardian';
  full_name: string;
  phone: string;
  email?: string;
  occupation?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentAcademicRecord {
  id: string;
  school_id: string;
  student_id: string;
  academic_year_id: string;
  class_id: string;
  roll_number?: string;
  section?: string;
  admission_status?: string;
  created_at: string;
  updated_at: string;
}

export interface Exam {
  id: string;
  school_id: string;
  academic_year_id?: string;
  name: string; // e.g. "Mid Term 2025"
  exam_type: 'unit_test' | 'mid_term' | 'final' | 'annual' | 'quarterly';
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface Mark {
  id: string;
  school_id: string;
  student_id: string;
  student_name?: string;
  subject_id: string;
  subject_name?: string;
  exam_id: string;
  exam_name?: string;
  marks_obtained: number;
  max_marks: number;
  grade?: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave';

export interface Attendance {
  id: string;
  school_id: string;
  student_id: string;
  student_name?: string;
  class_id: string;
  attendance_date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  remarks?: string;
  created_at: string;
}

export interface Teacher {
  id: string;
  school_id: string;
  profile_id?: string;
  employee_number?: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  qualification?: string;
  specialization?: string;
  joining_date: string;
  status: 'active' | 'on_leave' | 'resigned';
  assigned_classes?: string[];
  assigned_subjects?: string[];
  created_at: string;
  updated_at: string;
}

export interface ClassSubject {
  id: string;
  school_id: string;
  class_id: string;
  subject_id: string;
  teacher_id?: string;
  created_at: string;
}

export type FeeStatus = 'pending' | 'paid' | 'partial' | 'overdue';

export interface Fee {
  id: string;
  school_id: string;
  student_id: string;
  student_name?: string;
  student_class?: string;
  academic_year_id?: string;
  fee_type: string; // "Tuition Fee", "Transport", "Lab Fee", "Annual Charges"
  amount: number;
  due_date: string;
  status: FeeStatus;
  paid_amount: number;
  payment_date?: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface Notice {
  id: string;
  school_id: string;
  title: string;
  content: string;
  target_role: 'all' | 'teachers' | 'students' | 'parents' | 'staff';
  published_at: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentAchievement {
  id: string;
  school_id: string;
  student_id: string;
  student_name?: string;
  title: string;
  description: string;
  achievement_date: string;
  category: 'academics' | 'sports' | 'arts' | 'leadership' | 'olympiad';
  created_at: string;
}

export interface AIInteraction {
  id: string;
  school_id: string;
  user_id: string;
  conversation_id?: string;
  user_message: string;
  ai_response: string;
  intent?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  school_id: string;
  user_id: string;
  user_name?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// AI Structured Extraction Types
export interface AIStructuredEntry {
  intent: 'create_student' | 'update_student' | 'add_marks' | 'add_attendance' | 'add_fee' | 'unknown';
  confidence: number;
  entities: {
    student?: {
      first_name?: string;
      last_name?: string;
      admission_number?: string;
      gender?: 'male' | 'female' | 'other';
      phone?: string;
      email?: string;
      date_of_birth?: string;
    };
    guardians?: Array<{
      relationship: 'father' | 'mother' | 'guardian';
      full_name: string;
      phone?: string;
      occupation?: string;
    }>;
    academic?: {
      class?: string;
      section?: string;
      roll_number?: string;
    };
    marks?: Array<{
      subject: string;
      marks_obtained: number;
      max_marks?: number;
      exam?: string;
    }>;
    attendance?: {
      status?: AttendanceStatus;
      date?: string;
      percentage?: number;
    };
    fee?: {
      fee_type?: string;
      amount?: number;
      status?: FeeStatus;
      due_date?: string;
    };
    teacher?: {
      first_name?: string;
      last_name?: string;
      subject?: string;
      phone?: string;
    };
  };
  missing_fields?: string[];
  clarification_question?: string | null;
  potential_duplicate?: {
    matched_student_id: string;
    matched_student_name: string;
    admission_number?: string;
    class_name?: string;
    reason: string;
  } | null;
}

export interface AIInsightItem {
  id: string;
  type: 'critical' | 'warning' | 'positive' | 'trend';
  title: string;
  description: string;
  metric?: string;
  target?: string;
  recommendation: string;
  category: 'performance' | 'attendance' | 'fees' | 'admissions';
}

export type AIInsight = AIInsightItem;
