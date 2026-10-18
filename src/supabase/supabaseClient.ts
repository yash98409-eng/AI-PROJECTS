import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  DEMO_SCHOOL,
  DEMO_SCHOOLS,
  PRICING_PLANS,
  DEMO_INVOICES,
  DEMO_USERS,
  DEMO_ACADEMIC_YEARS,
  DEMO_CLASSES,
  DEMO_SUBJECTS,
  DEMO_TEACHERS,
  DEMO_EXAMS,
  DEMO_STUDENTS,
  DEMO_GUARDIANS,
  DEMO_MARKS,
  DEMO_ATTENDANCE,
  DEMO_FEES,
  DEMO_NOTICES,
  DEMO_ACHIEVEMENTS,
  DEMO_AUDIT_LOGS,
} from './mockData';
import {
  School,
  UserProfile,
  ClassRoom,
  Subject,
  Student,
  Guardian,
  Exam,
  Mark,
  Attendance,
  Teacher,
  Fee,
  Notice,
  StudentAchievement,
  AuditLog,
  UserRole,
  PricingPlan,
  Invoice,
  PlanTier,
} from '../types';

// Check local storage or environment variables for Supabase config
export function getStoredSupabaseConfig() {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
  const localUrl = localStorage.getItem('schoolai_supabase_url') || '';
  const localKey = localStorage.getItem('schoolai_supabase_key') || '';

  const url = localUrl || envUrl;
  const key = localKey || envKey;

  return { url, key, isConfigured: Boolean(url && key && url.startsWith('http')) };
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (config.isConfigured) {
    if (!supabaseInstance) {
      try {
        supabaseInstance = createClient(config.url, config.key);
      } catch (err) {
        console.error('Error initializing Supabase client:', err);
        return null;
      }
    }
    return supabaseInstance;
  }
  return null;
}

export function resetSupabaseClient() {
  supabaseInstance = null;
}

// Local persistent store helper for demo / resilient offline execution
class LocalSchoolStore {
  private keyPrefix = 'schoolai_data_';

  private getItem<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(this.keyPrefix + key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.keyPrefix + key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  getSchools(): School[] {
    return this.getItem<School[]>('schools', DEMO_SCHOOLS);
  }

  setSchools(schools: School[]): void {
    this.setItem('schools', schools);
  }

  getActiveSchoolId(): string {
    return this.getItem<string>('active_school_id', DEMO_SCHOOLS[0].id);
  }

  setActiveSchoolId(id: string): void {
    this.setItem('active_school_id', id);
  }

  getActiveSchool(): School {
    const schools = this.getSchools();
    const activeId = this.getActiveSchoolId();
    return schools.find((s) => s.id === activeId) || schools[0] || DEMO_SCHOOL;
  }

  getSchool(schoolId?: string): School {
    const schools = this.getSchools();
    if (schoolId) {
      return schools.find((s) => s.id === schoolId) || this.getActiveSchool();
    }
    return this.getActiveSchool();
  }

  updateSchool(id: string, updates: Partial<School>): School {
    const schools = this.getSchools();
    const idx = schools.findIndex((s) => s.id === id);
    if (idx !== -1) {
      schools[idx] = {
        ...schools[idx],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      this.setSchools(schools);
      return schools[idx];
    }
    return this.getActiveSchool();
  }

  addSchool(schoolData: Partial<School>): School {
    const schools = this.getSchools();
    const newId = 'sch-' + Date.now().toString().slice(-6);
    const codeIndex = ['F', 'G', 'H', 'I', 'J', 'K'][schools.length - 5] || `${schools.length + 1}`;
    const newSchool: School = {
      id: newId,
      code: schoolData.code || `School ${codeIndex}`,
      name: schoolData.name || 'New Academy',
      curriculum: schoolData.curriculum || 'CBSE',
      address: schoolData.address || 'Knowledge Campus, Main Road',
      city: schoolData.city || 'Mumbai',
      state: schoolData.state || 'Maharashtra',
      country: 'India',
      phone: schoolData.phone || '+91 98765 43210',
      email: schoolData.email || 'info@school.edu',
      website: schoolData.website || 'https://school.edu',
      logo_url: schoolData.logo_url || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&h=120&fit=crop&crop=faces',
      plan: schoolData.plan || 'starter',
      billing_cycle: schoolData.billing_cycle || 'monthly',
      plan_renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      student_count: 50,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...schoolData,
    };
    schools.push(newSchool);
    this.setSchools(schools);

    // Auto-seed basic starter classes for new school
    const classes = this.getAllClasses();
    classes.push(
      {
        id: `cls-${newId}-10a`,
        school_id: newId,
        name: 'Class 10-A',
        grade: 10,
        section: 'A',
        class_teacher_name: 'Lead Educator',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: `cls-${newId}-9a`,
        school_id: newId,
        name: 'Class 9-A',
        grade: 9,
        section: 'A',
        class_teacher_name: 'Academic Mentor',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    );
    this.setClasses(classes);

    return newSchool;
  }

  getInvoices(schoolId?: string): Invoice[] {
    const targetId = schoolId || this.getActiveSchoolId();
    const invoices = this.getItem<Invoice[]>('invoices', DEMO_INVOICES);
    return invoices.filter((inv) => inv.school_id === targetId || !inv.school_id);
  }

  addInvoice(invoiceData: Omit<Invoice, 'id' | 'billing_date'>): Invoice {
    const invoices = this.getItem<Invoice[]>('invoices', DEMO_INVOICES);
    const newInv: Invoice = {
      ...invoiceData,
      id: 'inv-' + Date.now().toString().slice(-6),
      billing_date: new Date().toISOString().split('T')[0],
      invoice_number: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    this.setItem('invoices', [newInv, ...invoices]);
    return newInv;
  }

  getUsers(): UserProfile[] {
    return this.getItem<UserProfile[]>('users', DEMO_USERS);
  }

  setUsers(users: UserProfile[]): void {
    this.setItem('users', users);
  }

  updateUser(id: string, updates: Partial<UserProfile>): UserProfile {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      users[idx] = {
        ...users[idx],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      this.setUsers(users);
      return users[idx];
    } else {
      const newUser: UserProfile = {
        id,
        school_id: this.getActiveSchoolId(),
        full_name: updates.full_name || 'User',
        email: updates.email || 'user@school.edu',
        role: updates.role || 'super_admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...updates,
      };
      users.push(newUser);
      this.setUsers(users);
      return newUser;
    }
  }

  private getSeedStudents(): Student[] {
    // Combine Oakridge demo students + additional seed for other schools
    const additionalStudents: Student[] = [
      // School B: St. Xavier's High School (sch-xavier-002)
      {
        id: 'stu-xb-001',
        school_id: 'sch-xavier-002',
        admission_number: 'XAV-2025-101',
        first_name: 'Daniel',
        last_name: 'Fernandes',
        date_of_birth: '2010-03-12',
        gender: 'male',
        current_class: 'Class 10-A',
        current_section: 'A',
        roll_number: '101',
        attendance_percentage: 96,
        average_marks: 94,
        admission_date: '2022-06-01',
        status: 'active',
        created_at: '2024-02-15T00:00:00Z',
        updated_at: '2024-02-15T00:00:00Z',
      },
      {
        id: 'stu-xb-002',
        school_id: 'sch-xavier-002',
        admission_number: 'XAV-2025-102',
        first_name: 'Natasha',
        last_name: "D'Souza",
        date_of_birth: '2010-07-22',
        gender: 'female',
        current_class: 'Class 10-A',
        current_section: 'A',
        roll_number: '102',
        attendance_percentage: 89,
        average_marks: 88,
        admission_date: '2022-06-01',
        status: 'active',
        created_at: '2024-02-15T00:00:00Z',
        updated_at: '2024-02-15T00:00:00Z',
      },
      {
        id: 'stu-xb-003',
        school_id: 'sch-xavier-002',
        admission_number: 'XAV-2025-103',
        first_name: 'Kabir',
        last_name: 'Mehta',
        date_of_birth: '2010-11-05',
        gender: 'male',
        current_class: 'Class 10-B',
        current_section: 'B',
        roll_number: '103',
        attendance_percentage: 68, // Low attendance alert
        average_marks: 74,
        admission_date: '2023-01-10',
        status: 'active',
        created_at: '2024-02-15T00:00:00Z',
        updated_at: '2024-02-15T00:00:00Z',
      },
      // School C: Delhi Public Academy (sch-dps-003)
      {
        id: 'stu-dps-001',
        school_id: 'sch-dps-003',
        admission_number: 'DPS-2025-01',
        first_name: 'Aryan',
        last_name: 'Verma',
        date_of_birth: '2010-05-18',
        gender: 'male',
        current_class: 'Class 10-A',
        current_section: 'A',
        roll_number: '201',
        attendance_percentage: 92,
        average_marks: 90,
        admission_date: '2021-04-10',
        status: 'active',
        created_at: '2024-03-01T00:00:00Z',
        updated_at: '2024-03-01T00:00:00Z',
      },
      {
        id: 'stu-dps-002',
        school_id: 'sch-dps-003',
        admission_number: 'DPS-2025-02',
        first_name: 'Riya',
        last_name: 'Sengupta',
        date_of_birth: '2010-09-30',
        gender: 'female',
        current_class: 'Class 10-A',
        current_section: 'A',
        roll_number: '202',
        attendance_percentage: 98,
        average_marks: 96,
        admission_date: '2021-04-10',
        status: 'active',
        created_at: '2024-03-01T00:00:00Z',
        updated_at: '2024-03-01T00:00:00Z',
      },
      // School D: Greenfield World School (sch-greenfield-004)
      {
        id: 'stu-gf-001',
        school_id: 'sch-greenfield-004',
        admission_number: 'GF-2025-501',
        first_name: 'Tanvi',
        last_name: 'Joshi',
        date_of_birth: '2010-08-14',
        gender: 'female',
        current_class: 'Class 10-A',
        current_section: 'A',
        roll_number: '301',
        attendance_percentage: 91,
        average_marks: 86,
        admission_date: '2023-06-01',
        status: 'active',
        created_at: '2024-04-12T00:00:00Z',
        updated_at: '2024-04-12T00:00:00Z',
      },
      // School E: Cambridge International School (sch-cambridge-005)
      {
        id: 'stu-cam-001',
        school_id: 'sch-cambridge-005',
        admission_number: 'CAM-2025-801',
        first_name: 'Samantha',
        last_name: 'Rao',
        date_of_birth: '2010-01-25',
        gender: 'female',
        current_class: 'Class 10-A',
        current_section: 'A',
        roll_number: '401',
        attendance_percentage: 95,
        average_marks: 92,
        admission_date: '2022-08-01',
        status: 'active',
        created_at: '2024-05-20T00:00:00Z',
        updated_at: '2024-05-20T00:00:00Z',
      },
    ];
    return [...DEMO_STUDENTS, ...additionalStudents];
  }

  getAllStudents(): Student[] {
    return this.getItem<Student[]>('students', this.getSeedStudents());
  }

  getStudents(schoolId?: string): Student[] {
    const targetId = schoolId || this.getActiveSchoolId();
    const all = this.getAllStudents();
    return all.filter((s) => s.school_id === targetId);
  }

  setStudents(students: Student[]): void {
    this.setItem('students', students);
  }

  getGuardians(): Guardian[] {
    return this.getItem<Guardian[]>('guardians', DEMO_GUARDIANS);
  }

  setGuardians(guardians: Guardian[]): void {
    this.setItem('guardians', guardians);
  }

  getAllClasses(): ClassRoom[] {
    const seedClasses: ClassRoom[] = [
      ...DEMO_CLASSES,
      {
        id: 'cls-xb-10a',
        school_id: 'sch-xavier-002',
        name: 'Class 10-A',
        grade: 10,
        section: 'A',
        class_teacher_name: 'Father Thomas',
        created_at: '2024-02-15T00:00:00Z',
        updated_at: '2024-02-15T00:00:00Z',
      },
      {
        id: 'cls-xb-10b',
        school_id: 'sch-xavier-002',
        name: 'Class 10-B',
        grade: 10,
        section: 'B',
        class_teacher_name: 'Anthony Gomez',
        created_at: '2024-02-15T00:00:00Z',
        updated_at: '2024-02-15T00:00:00Z',
      },
      {
        id: 'cls-dps-10a',
        school_id: 'sch-dps-003',
        name: 'Class 10-A',
        grade: 10,
        section: 'A',
        class_teacher_name: 'Dr. Alok Mathur',
        created_at: '2024-03-01T00:00:00Z',
        updated_at: '2024-03-01T00:00:00Z',
      },
      {
        id: 'cls-gf-10a',
        school_id: 'sch-greenfield-004',
        name: 'Class 10-A',
        grade: 10,
        section: 'A',
        class_teacher_name: 'Suhas Kulkarni',
        created_at: '2024-04-12T00:00:00Z',
        updated_at: '2024-04-12T00:00:00Z',
      },
      {
        id: 'cls-cam-10a',
        school_id: 'sch-cambridge-005',
        name: 'Class 10-A',
        grade: 10,
        section: 'A',
        class_teacher_name: 'Elena Gilbert',
        created_at: '2024-05-20T00:00:00Z',
        updated_at: '2024-05-20T00:00:00Z',
      },
    ];
    return this.getItem<ClassRoom[]>('classes', seedClasses);
  }

  getClasses(schoolId?: string): ClassRoom[] {
    const targetId = schoolId || this.getActiveSchoolId();
    const all = this.getAllClasses();
    return all.filter((c) => c.school_id === targetId);
  }

  setClasses(classes: ClassRoom[]): void {
    this.setItem('classes', classes);
  }

  getSubjects(): Subject[] {
    return this.getItem<Subject[]>('subjects', DEMO_SUBJECTS);
  }

  setSubjects(subjects: Subject[]): void {
    this.setItem('subjects', subjects);
  }

  getExams(): Exam[] {
    return this.getItem<Exam[]>('exams', DEMO_EXAMS);
  }

  getAllMarks(): Mark[] {
    return this.getItem<Mark[]>('marks', DEMO_MARKS);
  }

  getMarks(schoolId?: string): Mark[] {
    const targetId = schoolId || this.getActiveSchoolId();
    const all = this.getAllMarks();
    return all.filter((m) => m.school_id === targetId);
  }

  setMarks(marks: Mark[]): void {
    this.setItem('marks', marks);
  }

  getAllAttendance(): Attendance[] {
    return this.getItem<Attendance[]>('attendance', DEMO_ATTENDANCE);
  }

  getAttendance(schoolId?: string): Attendance[] {
    const targetId = schoolId || this.getActiveSchoolId();
    const all = this.getAllAttendance();
    return all.filter((a) => a.school_id === targetId);
  }

  setAttendance(attendance: Attendance[]): void {
    this.setItem('attendance', attendance);
  }

  getAllTeachers(): Teacher[] {
    const seedTeachers: Teacher[] = [
      ...DEMO_TEACHERS,
      {
        id: 'tch-xb-01',
        school_id: 'sch-xavier-002',
        employee_number: 'EMP-XB-01',
        first_name: 'Father Thomas',
        last_name: 'D’Costa',
        phone: '+91 98765 44001',
        email: 'thomas@stxaviersmumbai.org',
        qualification: 'M.Ed, Ph.D Education',
        specialization: 'Moral Sciences & Leadership',
        joining_date: '2019-06-01',
        status: 'active',
        assigned_classes: ['Class 10-A'],
        assigned_subjects: ['English'],
        created_at: '2024-02-15T00:00:00Z',
        updated_at: '2024-02-15T00:00:00Z',
      },
      {
        id: 'tch-dps-01',
        school_id: 'sch-dps-003',
        employee_number: 'EMP-DPS-01',
        first_name: 'Dr. Alok',
        last_name: 'Mathur',
        phone: '+91 98765 55001',
        email: 'alok.mathur@dpsdelhi.edu.in',
        qualification: 'Ph.D Physics',
        specialization: 'Physics & Applied Mechanics',
        joining_date: '2018-07-01',
        status: 'active',
        assigned_classes: ['Class 10-A'],
        assigned_subjects: ['Science'],
        created_at: '2024-03-01T00:00:00Z',
        updated_at: '2024-03-01T00:00:00Z',
      },
    ];
    return this.getItem<Teacher[]>('teachers', seedTeachers);
  }

  getTeachers(schoolId?: string): Teacher[] {
    const targetId = schoolId || this.getActiveSchoolId();
    const all = this.getAllTeachers();
    return all.filter((t) => t.school_id === targetId);
  }

  setTeachers(teachers: Teacher[]): void {
    this.setItem('teachers', teachers);
  }

  getAllFees(): Fee[] {
    return this.getItem<Fee[]>('fees', DEMO_FEES);
  }

  getFees(schoolId?: string): Fee[] {
    const targetId = schoolId || this.getActiveSchoolId();
    const all = this.getAllFees();
    return all.filter((f) => f.school_id === targetId);
  }

  setFees(fees: Fee[]): void {
    this.setItem('fees', fees);
  }

  getAllNotices(): Notice[] {
    return this.getItem<Notice[]>('notices', DEMO_NOTICES);
  }

  getNotices(schoolId?: string): Notice[] {
    const targetId = schoolId || this.getActiveSchoolId();
    const all = this.getAllNotices();
    return all.filter((n) => n.school_id === targetId);
  }

  getAchievements(): StudentAchievement[] {
    return this.getItem<StudentAchievement[]>('achievements', DEMO_ACHIEVEMENTS);
  }

  getAuditLogs(): AuditLog[] {
    return this.getItem<AuditLog[]>('audit_logs', DEMO_AUDIT_LOGS);
  }

  addAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      ...log,
      id: 'aud-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    this.setItem('audit_logs', [newLog, ...logs]);
  }

  resetToDemo(): void {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(this.keyPrefix)) {
        localStorage.removeItem(key);
      }
    });
  }
}

export const localStore = new LocalSchoolStore();

// Unified Service Layer that abstracts Supabase / Local Fallback
export const SchoolService = {
  isSupabaseConnected(): boolean {
    return getStoredSupabaseConfig().isConfigured;
  },

  async getSchools(): Promise<School[]> {
    return localStore.getSchools();
  },

  async switchSchool(schoolId: string): Promise<School> {
    localStore.setActiveSchoolId(schoolId);
    return localStore.getActiveSchool();
  },

  async addSchool(data: Partial<School>, currentUser?: UserProfile): Promise<School> {
    const school = localStore.addSchool(data);
    localStore.addAuditLog({
      school_id: school.id,
      user_id: currentUser?.id || 'sys',
      user_name: currentUser?.full_name || 'System Admin',
      action: 'REGISTER_SCHOOL',
      entity_type: 'school',
      entity_id: school.id,
      metadata: { name: school.name, curriculum: school.curriculum, plan: school.plan },
    });
    return school;
  },

  async updateSchoolPlan(schoolId: string, plan: PlanTier, cycle: 'monthly' | 'yearly' = 'monthly'): Promise<School> {
    const updated = localStore.updateSchool(schoolId, {
      plan,
      billing_cycle: cycle,
      plan_renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    localStore.addInvoice({
      school_id: schoolId,
      invoice_number: `INV-${Date.now().toString().slice(-6)}`,
      plan,
      amount: plan === 'starter' ? 999 : plan === 'standard' ? 2999 : plan === 'professional' ? 5999 : 14999,
      status: 'paid',
    });
    localStore.addAuditLog({
      school_id: schoolId,
      user_id: 'sys',
      user_name: 'Billing System',
      action: 'UPDATE_SUBSCRIPTION_PLAN',
      entity_type: 'school_subscription',
      entity_id: schoolId,
      metadata: { plan, cycle },
    });
    return updated;
  },

  getPricingPlans(): PricingPlan[] {
    return PRICING_PLANS;
  },

  async getInvoices(schoolId?: string): Promise<Invoice[]> {
    return localStore.getInvoices(schoolId);
  },

  async getCurrentUser(roleOverride?: UserRole): Promise<UserProfile> {
    const users = localStore.getUsers();
    if (roleOverride) {
      const match = users.find((u) => u.role === roleOverride);
      if (match) return match;
    }
    return users[0]; // Super Admin by default
  },

  async login(usernameOrEmail: string, role?: UserRole): Promise<UserProfile> {
    const users = localStore.getUsers();
    const query = usernameOrEmail.trim().toLowerCase();
    const match = users.find(
      (u) =>
        u.email.toLowerCase() === query ||
        (u.username && u.username.toLowerCase() === query) ||
        (role && u.role === role)
    );
    if (match) {
      localStore.addAuditLog({
        school_id: match.school_id,
        user_id: match.id,
        user_name: match.full_name,
        action: 'USER_LOGIN',
        entity_type: 'user_session',
        entity_id: match.id,
      });
      return match;
    }
    // Fallback creates / returns active session
    const fallbackUser: UserProfile = {
      id: 'usr-' + Date.now().toString().slice(-6),
      school_id: localStore.getActiveSchoolId(),
      username: usernameOrEmail.includes('@') ? usernameOrEmail.split('@')[0] : usernameOrEmail,
      full_name: usernameOrEmail.includes('@') ? usernameOrEmail.split('@')[0] : usernameOrEmail,
      email: usernameOrEmail.includes('@') ? usernameOrEmail : `${usernameOrEmail}@school.edu`,
      role: role || 'school_admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return fallbackUser;
  },

  async signup(data: {
    fullName: string;
    email: string;
    role: UserRole;
    schoolId?: string;
    newSchoolName?: string;
  }): Promise<UserProfile> {
    let schoolId = data.schoolId || localStore.getActiveSchoolId();
    if (data.newSchoolName) {
      const newSchool = localStore.addSchool({
        name: data.newSchoolName,
        email: data.email,
      });
      schoolId = newSchool.id;
    }
    const newUser: UserProfile = {
      id: 'usr-' + Date.now().toString().slice(-6),
      school_id: schoolId,
      username: data.email.split('@')[0],
      full_name: data.fullName,
      email: data.email,
      role: data.role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const users = localStore.getUsers();
    users.push(newUser);
    localStore.setUsers(users);
    localStore.setActiveSchoolId(schoolId);
    return newUser;
  },

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const updated = localStore.updateUser(userId, updates);
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('profiles').update({
          username: updates.username,
          full_name: updates.full_name,
          email: updates.email,
          phone: updates.phone,
          avatar_url: updates.avatar_url,
          bio: updates.bio,
          department: updates.department,
          updated_at: new Date().toISOString(),
        }).eq('id', userId);
      } catch (err) {
        console.warn('Supabase profile update warning:', err);
      }
    }
    localStore.addAuditLog({
      school_id: updated.school_id || 'sch-oakridge-001',
      user_id: userId,
      user_name: updated.full_name,
      action: 'UPDATE_USER_PROFILE',
      entity_type: 'user_profile',
      entity_id: userId,
      metadata: {
        username: updated.username,
        avatar_url: updated.avatar_url,
        full_name: updated.full_name,
      },
    });
    return updated;
  },

  async getSchool(): Promise<School> {
    const client = getSupabaseClient();
    if (client) {
      const { data, error } = await client.from('schools').select('*').limit(1).single();
      if (data && !error) return data;
    }
    return localStore.getSchool();
  },

  async getStudents(): Promise<Student[]> {
    const client = getSupabaseClient();
    if (client) {
      const { data, error } = await client.from('students').select('*').order('created_at', { ascending: false });
      if (data && !error) return data;
    }
    return localStore.getStudents();
  },

  async getStudentById(id: string): Promise<{
    student: Student | undefined;
    guardians: Guardian[];
    marks: Mark[];
    attendance: Attendance[];
    fees: Fee[];
    achievements: StudentAchievement[];
  }> {
    const students = await this.getStudents();
    const student = students.find((s) => s.id === id);
    const guardians = localStore.getGuardians().filter((g) => g.student_id === id);
    const marks = localStore.getMarks().filter((m) => m.student_id === id);
    const attendance = localStore.getAttendance().filter((a) => a.student_id === id);
    const fees = localStore.getFees().filter((f) => f.student_id === id);
    const achievements = localStore.getAchievements().filter((a) => a.student_id === id);

    return { student, guardians, marks, attendance, fees, achievements };
  },

  async saveStudent(
    studentData: Partial<Student>,
    guardianData?: Partial<Guardian>,
    currentUser?: UserProfile
  ): Promise<{ success: boolean; student: Student; error?: string }> {
    const students = localStore.getStudents();
    let savedStudent: Student;

    if (studentData.id) {
      // Update
      const index = students.findIndex((s) => s.id === studentData.id);
      if (index === -1) throw new Error('Student not found');
      savedStudent = {
        ...students[index],
        ...studentData,
        updated_at: new Date().toISOString(),
      } as Student;
      students[index] = savedStudent;
      localStore.setStudents([...students]);

      localStore.addAuditLog({
        school_id: savedStudent.school_id,
        user_id: currentUser?.id || 'sys',
        user_name: currentUser?.full_name || 'System Admin',
        action: 'UPDATE_STUDENT',
        entity_type: 'student',
        entity_id: savedStudent.id,
        metadata: { name: `${savedStudent.first_name} ${savedStudent.last_name}`, class: savedStudent.current_class },
      });
    } else {
      // Check school subscription student limit
      const targetSchoolId = studentData.school_id || localStore.getActiveSchoolId();
      const targetSchool = localStore.getSchool(targetSchoolId);
      const currentPlan = PRICING_PLANS.find((p) => p.id === (targetSchool.plan || 'standard')) || PRICING_PLANS[1];
      const schoolStudents = students.filter((s) => s.school_id === targetSchoolId);
      if (schoolStudents.length >= currentPlan.studentLimit) {
        return {
          success: false,
          student: {} as Student,
          error: `Student limit reached! Your school's ${currentPlan.name} is capped at ${currentPlan.studentLimit.toLocaleString()} students. Please upgrade your tier on the Pricing & Plans page.`,
        };
      }

      // Create new
      const newId = 'stu-' + Date.now().toString().slice(-6);
      const admissionNum =
        studentData.admission_number || `ADM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

      savedStudent = {
        id: newId,
        school_id: studentData.school_id || localStore.getActiveSchoolId(),
        admission_number: admissionNum,
        first_name: studentData.first_name || 'Student',
        last_name: studentData.last_name || '',
        date_of_birth: studentData.date_of_birth || '2010-01-01',
        gender: studentData.gender || 'male',
        admission_date: new Date().toISOString().split('T')[0],
        status: 'active',
        current_class: studentData.current_class || 'Class 10-A',
        current_section: studentData.current_section || 'A',
        roll_number: studentData.roll_number || (students.length + 101).toString(),
        attendance_percentage: 100,
        average_marks: 85,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...studentData,
      };

      students.unshift(savedStudent);
      localStore.setStudents([...students]);

      // Guardian
      if (guardianData && guardianData.full_name) {
        const guardians = localStore.getGuardians();
        const newGuardian: Guardian = {
          id: 'grd-' + Date.now().toString().slice(-6),
          school_id: savedStudent.school_id,
          student_id: savedStudent.id,
          relationship: guardianData.relationship || 'father',
          full_name: guardianData.full_name,
          phone: guardianData.phone || '',
          email: guardianData.email || '',
          occupation: guardianData.occupation || '',
          address: guardianData.address || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        guardians.push(newGuardian);
        localStore.setGuardians(guardians);
      }

      localStore.addAuditLog({
        school_id: savedStudent.school_id,
        user_id: currentUser?.id || 'sys',
        user_name: currentUser?.full_name || 'System Admin',
        action: 'CREATE_STUDENT',
        entity_type: 'student',
        entity_id: savedStudent.id,
        metadata: { name: `${savedStudent.first_name} ${savedStudent.last_name}`, class: savedStudent.current_class },
      });
    }

    return { success: true, student: savedStudent };
  },

  async deleteStudent(id: string, currentUser?: UserProfile): Promise<boolean> {
    const students = localStore.getStudents().filter((s) => s.id !== id);
    localStore.setStudents(students);

    localStore.addAuditLog({
      school_id: localStore.getActiveSchoolId(),
      user_id: currentUser?.id || 'sys',
      user_name: currentUser?.full_name || 'System Admin',
      action: 'DELETE_STUDENT',
      entity_type: 'student',
      entity_id: id,
    });
    return true;
  },

  async getMarks(): Promise<Mark[]> {
    return localStore.getMarks();
  },

  async saveMark(markData: Partial<Mark>, currentUser?: UserProfile): Promise<Mark> {
    const marks = localStore.getMarks();
    let saved: Mark;
    const activeSchoolId = localStore.getActiveSchoolId();

    if (markData.id) {
      const idx = marks.findIndex((m) => m.id === markData.id);
      saved = { ...marks[idx], ...markData, updated_at: new Date().toISOString() } as Mark;
      marks[idx] = saved;
    } else {
      saved = {
        id: 'mrk-' + Date.now().toString().slice(-6),
        school_id: markData.school_id || activeSchoolId,
        student_id: markData.student_id || '',
        student_name: markData.student_name || '',
        subject_id: markData.subject_id || 'sub-math',
        subject_name: markData.subject_name || 'Mathematics',
        exam_id: markData.exam_id || 'ex-midterm',
        exam_name: markData.exam_name || 'Mid Term 2025',
        marks_obtained: markData.marks_obtained ?? 0,
        max_marks: markData.max_marks || 100,
        grade: markData.marks_obtained ? (markData.marks_obtained >= 90 ? 'A+' : markData.marks_obtained >= 80 ? 'A' : markData.marks_obtained >= 70 ? 'B+' : markData.marks_obtained >= 60 ? 'B' : markData.marks_obtained >= 40 ? 'C' : 'F') : 'N/A',
        remarks: markData.remarks || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      marks.push(saved);
    }
    localStore.setMarks([...marks]);

    localStore.addAuditLog({
      school_id: saved.school_id || activeSchoolId,
      user_id: currentUser?.id || 'sys',
      user_name: currentUser?.full_name || 'Teacher',
      action: 'SAVE_MARKS',
      entity_type: 'mark',
      entity_id: saved.id,
      metadata: { student: saved.student_name, subject: saved.subject_name, score: saved.marks_obtained },
    });

    return saved;
  },

  async getAttendance(): Promise<Attendance[]> {
    return localStore.getAttendance();
  },

  async recordAttendance(
    attendanceList: Array<{ student_id: string; student_name: string; class_id: string; date: string; status: 'present' | 'absent' | 'late' | 'leave'; remarks?: string }>,
    currentUser?: UserProfile
  ): Promise<boolean> {
    const existing = localStore.getAttendance();
    const updated = [...existing];
    const activeSchoolId = localStore.getActiveSchoolId();

    for (const item of attendanceList) {
      const idx = updated.findIndex((a) => a.student_id === item.student_id && a.attendance_date === item.date);
      if (idx !== -1) {
        updated[idx] = {
          ...updated[idx],
          status: item.status,
          remarks: item.remarks,
        };
      } else {
        updated.push({
          id: 'att-' + Date.now().toString().slice(-6) + Math.random().toString(36).slice(2, 5),
          school_id: activeSchoolId,
          student_id: item.student_id,
          student_name: item.student_name,
          class_id: item.class_id,
          attendance_date: item.date,
          status: item.status,
          remarks: item.remarks,
          created_at: new Date().toISOString(),
        });
      }
    }

    localStore.setAttendance(updated);

    localStore.addAuditLog({
      school_id: activeSchoolId,
      user_id: currentUser?.id || 'sys',
      user_name: currentUser?.full_name || 'Class Teacher',
      action: 'RECORD_ATTENDANCE',
      entity_type: 'attendance',
      metadata: { records_count: attendanceList.length, date: attendanceList[0]?.date },
    });

    return true;
  },

  async getFees(): Promise<Fee[]> {
    return localStore.getFees();
  },

  async updateFeePayment(feeId: string, paidAmount: number, paymentDate: string, remarks: string, currentUser?: UserProfile): Promise<Fee> {
    const fees = localStore.getFees();
    const idx = fees.findIndex((f) => f.id === feeId);
    if (idx === -1) throw new Error('Fee record not found');

    const fee = fees[idx];
    const newPaid = fee.paid_amount + paidAmount;
    const newStatus = newPaid >= fee.amount ? 'paid' : newPaid > 0 ? 'partial' : 'pending';

    const updated: Fee = {
      ...fee,
      paid_amount: newPaid,
      status: newStatus,
      payment_date: paymentDate,
      remarks: remarks || fee.remarks,
      updated_at: new Date().toISOString(),
    };

    fees[idx] = updated;
    localStore.setFees([...fees]);

    localStore.addAuditLog({
      school_id: DEMO_SCHOOL.id,
      user_id: currentUser?.id || 'sys',
      user_name: currentUser?.full_name || 'Staff',
      action: 'UPDATE_FEE_PAYMENT',
      entity_type: 'fee',
      entity_id: feeId,
      metadata: { student: fee.student_name, amount: paidAmount, status: newStatus },
    });

    return updated;
  },

  async getClasses(): Promise<ClassRoom[]> {
    return localStore.getClasses();
  },

  async getSubjects(): Promise<Subject[]> {
    return localStore.getSubjects();
  },

  async getExams(): Promise<Exam[]> {
    return localStore.getExams();
  },

  async getTeachers(): Promise<Teacher[]> {
    return localStore.getTeachers();
  },

  async getNotices(): Promise<Notice[]> {
    return localStore.getNotices();
  },

  async getAchievements(): Promise<StudentAchievement[]> {
    return localStore.getAchievements();
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    return localStore.getAuditLogs();
  },

  // Query engine for the AI Assistant: Returns safe, authorized data facts
  async querySchoolData(intent: string, params: Record<string, any>) {
    const students = localStore.getStudents();
    const marks = localStore.getMarks();
    const attendance = localStore.getAttendance();
    const fees = localStore.getFees();
    const classes = localStore.getClasses();
    const subjects = localStore.getSubjects();
    const teachers = localStore.getTeachers();

    switch (intent) {
      case 'getSchoolStatistics': {
        const totalFees = fees.reduce((sum, f) => sum + f.amount, 0);
        const collectedFees = fees.reduce((sum, f) => sum + f.paid_amount, 0);
        const pendingFees = totalFees - collectedFees;
        const lowAttendanceCount = students.filter((s) => (s.attendance_percentage || 0) < 75).length;
        const avgMarks = Math.round(marks.reduce((sum, m) => sum + m.marks_obtained, 0) / (marks.length || 1));

        return {
          total_students: students.length,
          active_students: students.filter((s) => s.status === 'active').length,
          total_teachers: teachers.length,
          total_classes: classes.length,
          average_marks: avgMarks,
          total_fees: totalFees,
          collected_fees: collectedFees,
          pending_fees: pendingFees,
          low_attendance_students_count: lowAttendanceCount,
        };
      }

      case 'searchStudents': {
        const query = (params.query || '').toLowerCase();
        const matches = students.filter(
          (s) =>
            s.first_name.toLowerCase().includes(query) ||
            s.last_name.toLowerCase().includes(query) ||
            s.admission_number.toLowerCase().includes(query) ||
            s.current_class?.toLowerCase().includes(query)
        );
        return matches;
      }

      case 'getStudentAcademicProfile': {
        const nameQuery = (params.name || '').toLowerCase();
        const student = students.find(
          (s) => `${s.first_name} ${s.last_name}`.toLowerCase().includes(nameQuery) || s.first_name.toLowerCase() === nameQuery
        );
        if (!student) return { error: 'Student not found in school database' };

        const studentMarks = marks.filter((m) => m.student_id === student.id);
        const studentAtt = attendance.filter((a) => a.student_id === student.id);
        const studentFees = fees.filter((f) => f.student_id === student.id);

        return {
          student,
          marks: studentMarks,
          attendance_history: studentAtt,
          fees: studentFees,
        };
      }

      case 'getTopPerformers': {
        const subjectQuery = (params.subject || '').toLowerCase();
        let targetMarks = marks;
        if (subjectQuery) {
          targetMarks = marks.filter((m) => m.subject_name?.toLowerCase().includes(subjectQuery));
        }
        const sorted = [...targetMarks].sort((a, b) => b.marks_obtained - a.marks_obtained);
        return sorted.slice(0, 5);
      }

      case 'getLowAttendanceStudents': {
        const threshold = params.threshold || 75;
        return students.filter((s) => (s.attendance_percentage || 0) < threshold);
      }

      case 'getPendingFees': {
        return fees.filter((f) => f.status === 'pending' || f.status === 'partial' || f.status === 'overdue');
      }

      case 'getClassStudents': {
        const className = (params.class_name || '').toLowerCase();
        return students.filter((s) => s.current_class?.toLowerCase().includes(className));
      }

      case 'getStudentsScoredBelow': {
        const threshold = params.threshold || 40;
        const subjectQuery = (params.subject || '').toLowerCase();
        let list = marks.filter((m) => m.marks_obtained < threshold);
        if (subjectQuery) {
          list = list.filter((m) => m.subject_name?.toLowerCase().includes(subjectQuery));
        }
        return list;
      }

      default:
        return { message: 'Data retrieved successfully', summary: 'School dataset active' };
    }
  },
};
