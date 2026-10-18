-- ============================================================================
-- SchoolAI Manager - Complete PostgreSQL Schema & Row Level Security (RLS)
-- Can be copied and run directly in Supabase SQL Editor
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SCHOOLS
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. USER PROFILES (links to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'school_admin', 'teacher', 'staff')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ACADEMIC YEARS
CREATE TABLE IF NOT EXISTS public.academic_years (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CLASSES
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  grade INTEGER NOT NULL,
  section TEXT NOT NULL,
  class_teacher_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. SUBJECTS
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  max_marks NUMERIC DEFAULT 100 CHECK (max_marks > 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. STUDENTS
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  admission_number TEXT NOT NULL,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  blood_group TEXT,
  nationality TEXT DEFAULT 'Indian',
  religion TEXT,
  category TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  admission_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'transferred', 'graduated')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_school_admission UNIQUE (school_id, admission_number)
);

-- 7. PARENTS / GUARDIANS
CREATE TABLE IF NOT EXISTS public.guardians (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL CHECK (relationship IN ('father', 'mother', 'guardian')),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  occupation TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. STUDENT ACADEMIC RECORD
CREATE TABLE IF NOT EXISTS public.student_academic_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  roll_number TEXT,
  section TEXT,
  admission_status TEXT DEFAULT 'regular',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. EXAMS
CREATE TABLE IF NOT EXISTS public.exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  exam_type TEXT NOT NULL CHECK (exam_type IN ('unit_test', 'mid_term', 'final', 'annual', 'quarterly')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. MARKS
CREATE TABLE IF NOT EXISTS public.marks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  marks_obtained NUMERIC NOT NULL CHECK (marks_obtained >= 0),
  max_marks NUMERIC NOT NULL DEFAULT 100 CHECK (max_marks > 0),
  grade TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT check_marks_limit CHECK (marks_obtained <= max_marks),
  CONSTRAINT unique_student_subject_exam UNIQUE (school_id, student_id, subject_id, exam_id)
);

-- 11. ATTENDANCE
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'leave')),
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_student_date UNIQUE (school_id, student_id, attendance_date)
);

-- 12. TEACHERS
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  employee_number TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  qualification TEXT,
  specialization TEXT,
  joining_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'resigned')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_school_teacher_emp UNIQUE (school_id, employee_number)
);

-- 13. CLASS SUBJECT ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.class_subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_class_subject UNIQUE (school_id, class_id, subject_id)
);

-- 14. FEES
CREATE TABLE IF NOT EXISTS public.fees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
  fee_type TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  due_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'partial', 'overdue')),
  paid_amount NUMERIC DEFAULT 0 CHECK (paid_amount >= 0),
  payment_date DATE,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 15. NOTICES
CREATE TABLE IF NOT EXISTS public.notices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_role TEXT DEFAULT 'all' CHECK (target_role IN ('all', 'teachers', 'students', 'parents', 'staff')),
  published_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 16. STUDENT ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS public.student_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  achievement_date DATE DEFAULT CURRENT_DATE,
  category TEXT NOT NULL CHECK (category IN ('academics', 'sports', 'arts', 'leadership', 'olympiad')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 17. AI INTERACTIONS
CREATE TABLE IF NOT EXISTS public.ai_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  conversation_id UUID,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  intent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 18. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_school ON public.profiles(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_school ON public.classes(school_id);
CREATE INDEX IF NOT EXISTS idx_students_school ON public.students(school_id);
CREATE INDEX IF NOT EXISTS idx_guardians_student ON public.guardians(student_id);
CREATE INDEX IF NOT EXISTS idx_academic_rec_student ON public.student_academic_records(student_id);
CREATE INDEX IF NOT EXISTS idx_marks_student ON public.marks(student_id);
CREATE INDEX IF NOT EXISTS idx_marks_subject ON public.marks(subject_id);
CREATE INDEX IF NOT EXISTS idx_marks_exam ON public.marks(exam_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_fees_student ON public.fees(student_id);
CREATE INDEX IF NOT EXISTS idx_teachers_school ON public.teachers(school_id);
CREATE INDEX IF NOT EXISTS idx_class_subjects_class ON public.class_subjects(class_id);
CREATE INDEX IF NOT EXISTS idx_audit_school_created ON public.audit_logs(school_id, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Multi-tenant isolation: Users can only read/write data in their school_id
-- ============================================================================

-- Helper function to get current user's school_id securely
CREATE OR REPLACE FUNCTION auth.current_school_id()
RETURNS UUID AS $$
  SELECT school_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_academic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Schools: viewable only by users who belong to the school
CREATE POLICY "Users can view their school"
  ON public.schools FOR SELECT
  USING (id = auth.current_school_id());

-- Profiles: users can view profiles in their school, update own profile
CREATE POLICY "View profiles in same school"
  ON public.profiles FOR SELECT
  USING (school_id = auth.current_school_id());

CREATE POLICY "Update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- Students: accessible only within the user's school
CREATE POLICY "School students access"
  ON public.students FOR ALL
  USING (school_id = auth.current_school_id())
  WITH CHECK (school_id = auth.current_school_id());

-- Guardians
CREATE POLICY "School guardians access"
  ON public.guardians FOR ALL
  USING (school_id = auth.current_school_id())
  WITH CHECK (school_id = auth.current_school_id());

-- Marks
CREATE POLICY "School marks access"
  ON public.marks FOR ALL
  USING (school_id = auth.current_school_id())
  WITH CHECK (school_id = auth.current_school_id());

-- Attendance
CREATE POLICY "School attendance access"
  ON public.attendance FOR ALL
  USING (school_id = auth.current_school_id())
  WITH CHECK (school_id = auth.current_school_id());

-- Fees
CREATE POLICY "School fees access"
  ON public.fees FOR ALL
  USING (school_id = auth.current_school_id())
  WITH CHECK (school_id = auth.current_school_id());

-- Classes, Subjects, Exams
CREATE POLICY "School classes access"
  ON public.classes FOR ALL
  USING (school_id = auth.current_school_id())
  WITH CHECK (school_id = auth.current_school_id());

CREATE POLICY "School subjects access"
  ON public.subjects FOR ALL
  USING (school_id = auth.current_school_id())
  WITH CHECK (school_id = auth.current_school_id());

CREATE POLICY "School exams access"
  ON public.exams FOR ALL
  USING (school_id = auth.current_school_id())
  WITH CHECK (school_id = auth.current_school_id());

-- Teachers
CREATE POLICY "School teachers access"
  ON public.teachers FOR ALL
  USING (school_id = auth.current_school_id())
  WITH CHECK (school_id = auth.current_school_id());

-- Notices
CREATE POLICY "School notices access"
  ON public.notices FOR ALL
  USING (school_id = auth.current_school_id())
  WITH CHECK (school_id = auth.current_school_id());

-- Achievements
CREATE POLICY "School achievements access"
  ON public.student_achievements FOR ALL
  USING (school_id = auth.current_school_id())
  WITH CHECK (school_id = auth.current_school_id());

-- AI Interactions & Audit Logs
CREATE POLICY "School ai interactions"
  ON public.ai_interactions FOR ALL
  USING (school_id = auth.current_school_id())
  WITH CHECK (school_id = auth.current_school_id());

CREATE POLICY "School audit logs"
  ON public.audit_logs FOR ALL
  USING (school_id = auth.current_school_id())
  WITH CHECK (school_id = auth.current_school_id());
