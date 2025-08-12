import { 
  type Patient, 
  type InsertPatient,
  type Appointment,
  type InsertAppointment,
  type PatientFile,
  type InsertPatientFile,
  type ToothRecord,
  type InsertToothRecord,
  type MedicalCondition,
  type MedicalNote,
  type TreatmentHistory,
  type PaymentRecord,
  type DashboardStats,
  type PaginatedResponse,
  type Role,
  type InsertRole,
  type Employee,
  type InsertEmployee,
  type InsertEmployeeWithPassword,
  type Settings,
  type InsertSettings,
  type LoginData
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Patients
  getPatients(params: { search?: string; pageNumber?: number; pageSize?: number }): Promise<PaginatedResponse<Patient>>;
  getPatient(id: number): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient | undefined>;
  deletePatient(id: number): Promise<boolean>;
  
  // Appointments
  getAppointments(params: { patientId?: number; date?: string; pageNumber?: number; pageSize?: number }): Promise<PaginatedResponse<Appointment>>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<boolean>;
  getTodayAppointments(): Promise<Appointment[]>;
  
  // Files
  getPatientFiles(patientId: number): Promise<PatientFile[]>;
  createPatientFile(file: InsertPatientFile): Promise<PatientFile>;
  deletePatientFile(id: number): Promise<boolean>;
  
  // Medical Conditions
  getMedicalConditions(): Promise<MedicalCondition[]>;
  
  // Tooth Records (Odontogram)
  getPatientToothRecords(patientId: number): Promise<ToothRecord[]>;
  createToothRecord(record: InsertToothRecord): Promise<ToothRecord>;
  updateToothRecord(id: number, record: Partial<InsertToothRecord>): Promise<ToothRecord | undefined>;
  deleteToothRecord(id: number): Promise<boolean>;
  
  // Medical Notes
  getPatientMedicalNotes(patientId: number): Promise<MedicalNote[]>;
  createMedicalNote(note: { patientId: number; title: string; content: string; noteType: string }): Promise<MedicalNote>;
  deleteMedicalNote(id: number): Promise<boolean>;
  
  // Treatment History
  getPatientTreatmentHistory(patientId: number): Promise<TreatmentHistory[]>;
  createTreatmentHistory(treatment: { 
    patientId: number; 
    treatmentType: string; 
    description: string; 
    toothNumbers?: string; 
    duration: number; 
    cost: number;
    currency: string;
    notes?: string; 
  }): Promise<TreatmentHistory>;
  
  // Payment Records
  getPatientPaymentRecords(patientId: number): Promise<PaymentRecord[]>;
  createPaymentRecord(payment: {
    patientId: number;
    appointmentId?: number;
    treatmentId?: number;
    amount: number;
    currency?: string;
    paymentMethod: string;
    treatmentContext?: string;
    doctorName?: string;
    notes?: string;
  }): Promise<PaymentRecord>;

  // Financial Transactions (New System)
  createFinancialTransaction(transaction: {
    patientId: number;
    type: 'payment' | 'charge' | 'refund' | 'adjustment';
    amount: number;
    currency: string;
    description: string;
    category?: string;
    paymentMethod?: string;
    transactionReference?: string;
    appointmentId?: number;
    treatmentId?: number;
    recordedBy: number;
    authorizedBy?: number;
    status?: string;
    notes?: string;
  }): Promise<any>;
  getPatientFinancialTransactions(patientId: number): Promise<any[]>;
  getPatientFinancialSummary(patientId: number): Promise<{
    patientId: number;
    totalCharges: Record<string, number>;
    totalPayments: Record<string, number>;
    totalRefunds: Record<string, number>;
    balance: Record<string, number>;
    lastTransactionDate?: string;
    transactionCount: number;
  }>;
  updateFinancialTransaction(id: number, updates: {
    status?: string;
    notes?: string;
    authorizedBy?: number;
  }): Promise<any | undefined>;
  
  // Dashboard
  getDashboardStats(): Promise<DashboardStats>;
  
  // Employee Management
  getRoles(): Promise<Role[]>;
  getRole(id: number): Promise<Role | undefined>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: number, role: Partial<InsertRole>): Promise<Role | undefined>;
  deleteRole(id: number): Promise<boolean>;

  getEmployees(params: { search?: string; isActive?: boolean; roleId?: number }): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;
  setEmployeeStatus(id: number, isActive: boolean): Promise<Employee | undefined>;
  
  // Authentication
  getEmployeeByEmail(email: string): Promise<Employee | undefined>;
  createEmployeeWithPassword(employee: InsertEmployeeWithPassword): Promise<Employee>;
  
  // Settings
  getEmployeeSettings(employeeId: number): Promise<Settings | undefined>;
  updateEmployeeSettings(employeeId: number, settings: Partial<InsertSettings>): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private patients: Map<number, Patient>;
  private appointments: Map<number, Appointment>;
  private patientFiles: Map<number, PatientFile>;
  private medicalConditions: Map<number, MedicalCondition>;
  private toothRecords: Map<number, ToothRecord>;
  private medicalNotes: Map<number, MedicalNote>;
  private treatmentHistory: Map<number, TreatmentHistory>;
  private paymentRecords: Map<number, PaymentRecord>;
  private financialTransactions: Map<number, any>;
  private roles: Map<number, Role>;
  private employees: Map<number, Employee>;
  private settings: Map<number, Settings>;
  private idCounters: { 
    patients: number; 
    appointments: number; 
    files: number; 
    conditions: number; 
    teeth: number; 
    notes: number; 
    treatments: number; 
    payments: number; 
    transactions: number;
    roles: number;
    employees: number;
    settings: number;
  };

  constructor() {
    this.patients = new Map();
    this.appointments = new Map();
    this.patientFiles = new Map();
    this.medicalConditions = new Map();
    this.toothRecords = new Map();
    this.medicalNotes = new Map();
    this.treatmentHistory = new Map();
    this.paymentRecords = new Map();
    this.financialTransactions = new Map();
    this.roles = new Map();
    this.employees = new Map();
    this.settings = new Map();
    this.idCounters = { 
      patients: 1, 
      appointments: 1, 
      files: 1, 
      conditions: 1, 
      teeth: 1, 
      notes: 1, 
      treatments: 1, 
      payments: 1,
      transactions: 1,
      roles: 1,
      employees: 1,
      settings: 1
    };
    
    this.seedData();
  }

  private seedData() {
    // Seed patients
    const samplePatients: Patient[] = [
      {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        phone: "+1 234 567 8900",
        email: "john.doe@email.com",
        dateOfBirth: "1985-01-15",
        address: "123 Main St, City, State 12345",
        gender: "Male",
        jmbg: "1234567890123",
        statusId: 1,
        createdAt: new Date("2024-12-01"),
        updatedAt: new Date("2024-12-15")
      },
      {
        id: 2,
        firstName: "Jane",
        lastName: "Smith",
        phone: "+1 234 567 8901",
        email: "jane.smith@email.com",
        dateOfBirth: "1992-03-22",
        address: "456 Oak Ave, City, State 12345",
        gender: "Female",
        jmbg: "1234567890124",
        statusId: 1,
        createdAt: new Date("2024-12-02"),
        updatedAt: new Date("2024-12-14")
      },
      {
        id: 3,
        firstName: "Robert",
        lastName: "Johnson",
        phone: "+1 234 567 8902",
        email: "robert.j@email.com",
        dateOfBirth: "1978-11-08",
        address: "789 Pine Rd, City, State 12345",
        gender: "Male",
        jmbg: "1234567890125",
        statusId: 1,
        createdAt: new Date("2024-12-03"),
        updatedAt: new Date("2024-12-13")
      }
    ];

    samplePatients.forEach(patient => {
      this.patients.set(patient.id, patient);
    });
    this.idCounters.patients = 4;

    // Seed appointments
    const sampleAppointments: Appointment[] = [
      {
        id: 1,
        patientId: 1,
        appointmentDate: new Date("2024-12-20T10:00:00"),
        duration: 60,
        description: "Routine Checkup",
        status: "scheduled",
        setmoreAppointmentKey: null,
        serviceKey: "cleaning",
        serviceName: "Dental Cleaning",
        staffKey: "dr-smith",
        staffName: "Dr. Smith",
        cost: 15000,
        currency: "EUR",
        customerKey: null,
        createdAt: new Date("2024-12-15"),
        updatedAt: new Date("2024-12-15")
      },
      {
        id: 2,
        patientId: 2,
        appointmentDate: new Date("2024-12-20T11:30:00"),
        duration: 45,
        description: "Cleaning",
        status: "completed",
        setmoreAppointmentKey: null,
        serviceKey: "cleaning",
        serviceName: "Dental Cleaning",
        staffKey: "dr-smith",
        staffName: "Dr. Smith",
        cost: 12000,
        currency: "EUR",
        customerKey: null,
        createdAt: new Date("2024-12-15"),
        updatedAt: new Date("2024-12-15")
      }
    ];

    sampleAppointments.forEach(appointment => {
      this.appointments.set(appointment.id, appointment);
    });
    this.idCounters.appointments = 3;

    // Seed roles
    const sampleRoles: Role[] = [
      {
        id: 1,
        name: "Administrator",
        description: "Full system access with all permissions",
        permissions: {
          view_patients: true,
          create_patients: true,
          edit_patients: true,
          delete_patients: true,
          view_medical_history: true,
          edit_medical_history: true,
          view_appointments: true,
          create_appointments: true,
          edit_appointments: true,
          cancel_appointments: true,
          view_calendar: true,
          view_payments: true,
          record_payments: true,
          view_revenue: true,
          view_financial_reports: true,
          manage_pricing: true,
          manage_users: true,
          manage_roles: true,
          system_settings: true,
          view_audit_logs: true,
          backup_restore: true,
          view_odontogram: true,
          edit_odontogram: true,
          view_treatment_history: true,
          create_treatment_plans: true,
          manage_prescriptions: true,
          view_files: true,
          upload_files: true,
          delete_files: true,
          manage_file_categories: true
        },
        createdAt: new Date("2024-12-01").toISOString(),
        updatedAt: new Date("2024-12-01").toISOString()
      },
      {
        id: 2,
        name: "Dentist",
        description: "Medical professionals with patient and treatment access",
        permissions: {
          view_patients: true,
          create_patients: true,
          edit_patients: true,
          delete_patients: false,
          view_medical_history: true,
          edit_medical_history: true,
          view_appointments: true,
          create_appointments: true,
          edit_appointments: true,
          cancel_appointments: true,
          view_calendar: true,
          view_payments: true,
          record_payments: true,
          view_revenue: false,
          view_financial_reports: false,
          manage_pricing: false,
          manage_users: false,
          manage_roles: false,
          system_settings: false,
          view_audit_logs: false,
          backup_restore: false,
          view_odontogram: true,
          edit_odontogram: true,
          view_treatment_history: true,
          create_treatment_plans: true,
          manage_prescriptions: true,
          view_files: true,
          upload_files: true,
          delete_files: false,
          manage_file_categories: false
        },
        createdAt: new Date("2024-12-01").toISOString(),
        updatedAt: new Date("2024-12-01").toISOString()
      },
      {
        id: 3,
        name: "Dental Assistant",
        description: "Support staff with limited access",
        permissions: {
          view_patients: true,
          create_patients: false,
          edit_patients: false,
          delete_patients: false,
          view_medical_history: true,
          edit_medical_history: false,
          view_appointments: true,
          create_appointments: true,
          edit_appointments: true,
          cancel_appointments: false,
          view_calendar: true,
          view_payments: false,
          record_payments: false,
          view_revenue: false,
          view_financial_reports: false,
          manage_pricing: false,
          manage_users: false,
          manage_roles: false,
          system_settings: false,
          view_audit_logs: false,
          backup_restore: false,
          view_odontogram: true,
          edit_odontogram: false,
          view_treatment_history: true,
          create_treatment_plans: false,
          manage_prescriptions: false,
          view_files: true,
          upload_files: true,
          delete_files: false,
          manage_file_categories: false
        },
        createdAt: new Date("2024-12-01").toISOString(),
        updatedAt: new Date("2024-12-01").toISOString()
      },
      {
        id: 4,
        name: "Receptionist",
        description: "Front desk staff with basic access",
        permissions: {
          view_patients: true,
          create_patients: true,
          edit_patients: true,
          delete_patients: false,
          view_medical_history: false,
          edit_medical_history: false,
          view_appointments: true,
          create_appointments: true,
          edit_appointments: true,
          cancel_appointments: true,
          view_calendar: true,
          view_payments: true,
          record_payments: true,
          view_revenue: false,
          view_financial_reports: false,
          manage_pricing: false,
          manage_users: false,
          manage_roles: false,
          system_settings: false,
          view_audit_logs: false,
          backup_restore: false,
          view_odontogram: false,
          edit_odontogram: false,
          view_treatment_history: false,
          create_treatment_plans: false,
          manage_prescriptions: false,
          view_files: true,
          upload_files: true,
          delete_files: false,
          manage_file_categories: false
        },
        createdAt: new Date("2024-12-01").toISOString(),
        updatedAt: new Date("2024-12-01").toISOString()
      }
    ];

    sampleRoles.forEach(role => {
      this.roles.set(role.id, role);
    });
    this.idCounters.roles = 5;

    // Seed default administrator employee
    const defaultAdmin: Employee = {
      id: 1,
      firstName: "Admin",
      lastName: "User",
      email: "admin@dentalcare.com",
      password: "admin123", // In production, this should be hashed
      phone: "+1 555 0100",
      position: "System Administrator",
      department: "IT",
      roleId: 1, // Administrator role
      isActive: true,
      startDate: "2024-01-01",
      profileImageUrl: null,
      notes: "Default system administrator account",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.employees.set(defaultAdmin.id, defaultAdmin);
    this.idCounters.employees = 2;

    // Seed default settings for administrator
    const defaultSettings: Settings = {
      id: 1,
      employeeId: 1,
      showRevenue: true,
      language: "en",
      theme: "light",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.settings.set(defaultSettings.id, defaultSettings);
    this.idCounters.settings = 2;

    // Seed employees  
    const sampleEmployees: Employee[] = [
      {
        id: 2,
        firstName: "Dr. Sarah",
        lastName: "Johnson",
        email: "dr.johnson@dentalclinic.com",
        phone: "+1 555 0101",
        position: "Chief Dentist",
        department: "Clinical",
        roleId: 2,
        isActive: true,
        startDate: "2020-01-15",
        profileImageUrl: null,
        notes: "Chief dental officer with 15 years of experience",
        createdAt: new Date("2024-12-01").toISOString(),
        updatedAt: new Date("2024-12-01").toISOString()
      },
      {
        id: 3,
        firstName: "Mike",
        lastName: "Brown",
        email: "mike.brown@dentalclinic.com",
        phone: "+1 555 0102",
        position: "Clinic Administrator",
        department: "Administration",
        roleId: 1,
        isActive: true,
        startDate: "2021-03-01",
        profileImageUrl: null,
        notes: "Manages all clinic operations and staff",
        createdAt: new Date("2024-12-01").toISOString(),
        updatedAt: new Date("2024-12-01").toISOString()
      },
      {
        id: 4,
        firstName: "Lisa",
        lastName: "Davis",
        email: "lisa.davis@dentalclinic.com",
        phone: "+1 555 0103",
        position: "Dental Assistant",
        department: "Clinical",
        roleId: 3,
        isActive: true,
        startDate: "2022-06-15",
        profileImageUrl: null,
        notes: "Specialized in pediatric dental care",
        createdAt: new Date("2024-12-01").toISOString(),
        updatedAt: new Date("2024-12-01").toISOString()
      },
      {
        id: 5,
        firstName: "Emma",
        lastName: "Wilson",
        email: "emma.wilson@dentalclinic.com",
        phone: "+1 555 0104",
        position: "Receptionist",
        department: "Front Desk",
        roleId: 4,
        isActive: true,
        startDate: "2023-02-01",
        profileImageUrl: null,
        notes: "Handles appointment scheduling and patient communications",
        createdAt: new Date("2024-12-01").toISOString(),
        updatedAt: new Date("2024-12-01").toISOString()
      }
    ];

    sampleEmployees.forEach(employee => {
      this.employees.set(employee.id, employee);
    });
    this.idCounters.employees = 6;
  }

  async getPatients(params: { search?: string; pageNumber?: number; pageSize?: number }): Promise<PaginatedResponse<Patient>> {
    const { search = "", pageNumber = 1, pageSize = 10 } = params;
    let allPatients = Array.from(this.patients.values());

    if (search) {
      allPatients = allPatients.filter(patient =>
        patient.firstName.toLowerCase().includes(search.toLowerCase()) ||
        patient.lastName.toLowerCase().includes(search.toLowerCase()) ||
        patient.phone.includes(search) ||
        patient.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    const totalCount = allPatients.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (pageNumber - 1) * pageSize;
    const items = allPatients.slice(startIndex, startIndex + pageSize);

    return {
      items,
      totalCount,
      pageNumber,
      pageSize,
      totalPages
    };
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const id = this.idCounters.patients++;
    const newPatient: Patient = {
      ...patient,
      id,
      address: patient.address || null,
      email: patient.email || null,
      statusId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.patients.set(id, newPatient);
    return newPatient;
  }

  async updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient | undefined> {
    const existing = this.patients.get(id);
    if (!existing) return undefined;

    const updated: Patient = {
      ...existing,
      ...patient,
      updatedAt: new Date()
    };
    this.patients.set(id, updated);
    return updated;
  }

  async deletePatient(id: number): Promise<boolean> {
    return this.patients.delete(id);
  }

  async getAppointments(params: { patientId?: number; date?: string; pageNumber?: number; pageSize?: number }): Promise<PaginatedResponse<Appointment>> {
    const { patientId, date, pageNumber = 1, pageSize = 10 } = params;
    let allAppointments = Array.from(this.appointments.values());

    if (patientId) {
      allAppointments = allAppointments.filter(appointment => appointment.patientId === patientId);
    }

    if (date) {
      const targetDate = new Date(date);
      allAppointments = allAppointments.filter(appointment => {
        const appointmentDate = new Date(appointment.appointmentDate);
        return appointmentDate.toDateString() === targetDate.toDateString();
      });
    }

    const totalCount = allAppointments.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (pageNumber - 1) * pageSize;
    const items = allAppointments.slice(startIndex, startIndex + pageSize);

    return {
      items,
      totalCount,
      pageNumber,
      pageSize,
      totalPages
    };
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const id = this.idCounters.appointments++;
    const newAppointment: Appointment = {
      ...appointment,
      id,
      duration: appointment.duration || 30,
      description: appointment.description || null,
      appointmentDate: new Date(appointment.appointmentDate),
      setmoreAppointmentKey: appointment.setmoreAppointmentKey || null,
      customerKey: appointment.customerKey || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.appointments.set(id, newAppointment);
    return newAppointment;
  }

  async updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const existing = this.appointments.get(id);
    if (!existing) return undefined;

    const updated: Appointment = {
      ...existing,
      ...appointment,
      appointmentDate: appointment.appointmentDate ? new Date(appointment.appointmentDate) : existing.appointmentDate,
      updatedAt: new Date()
    };
    this.appointments.set(id, updated);
    return updated;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    return this.appointments.delete(id);
  }

  async getTodayAppointments(): Promise<Appointment[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return Array.from(this.appointments.values()).filter(appointment => {
      const appointmentDate = new Date(appointment.appointmentDate);
      return appointmentDate >= today && appointmentDate < tomorrow;
    });
  }

  async getPatientFiles(patientId: number): Promise<PatientFile[]> {
    return Array.from(this.patientFiles.values()).filter(file => file.patientId === patientId);
  }

  async createPatientFile(file: InsertPatientFile): Promise<PatientFile> {
    const id = this.idCounters.files++;
    const newFile: PatientFile = {
      ...file,
      id,
      description: file.description || null,
      thumbnailPath: file.thumbnailPath || null,
      uploadedAt: new Date()
    };
    this.patientFiles.set(id, newFile);
    return newFile;
  }

  async deletePatientFile(id: number): Promise<boolean> {
    return this.patientFiles.delete(id);
  }

  getPatientFileById(fileId: number): PatientFile | undefined {
    return this.patientFiles.get(fileId);
  }

  async getMedicalConditions(): Promise<MedicalCondition[]> {
    return Array.from(this.medicalConditions.values());
  }

  // Tooth Records (Odontogram) methods
  async getPatientToothRecords(patientId: number): Promise<ToothRecord[]> {
    return Array.from(this.toothRecords.values()).filter(record => record.patientId === patientId);
  }

  async createToothRecord(record: InsertToothRecord): Promise<ToothRecord> {
    const id = this.idCounters.teeth++;
    const newRecord: ToothRecord = {
      ...record,
      id,
      surfaces: record.surfaces || null,
      treatment: record.treatment || null,
      treatmentDate: record.treatmentDate || null,
      notes: record.notes || null,
      appointmentId: record.appointmentId || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.toothRecords.set(id, newRecord);
    return newRecord;
  }

  async updateToothRecord(id: number, record: Partial<InsertToothRecord>): Promise<ToothRecord | undefined> {
    const existingRecord = this.toothRecords.get(id);
    if (!existingRecord) return undefined;

    const updatedRecord: ToothRecord = {
      ...existingRecord,
      ...record,
      id,
      updatedAt: new Date()
    };
    this.toothRecords.set(id, updatedRecord);
    return updatedRecord;
  }

  async deleteToothRecord(id: number): Promise<boolean> {
    return this.toothRecords.delete(id);
  }

  // Medical Notes Methods
  async getPatientMedicalNotes(patientId: number): Promise<MedicalNote[]> {
    return Array.from(this.medicalNotes.values())
      .filter(note => note.patientId === patientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createMedicalNote(noteData: { patientId: number; title: string; content: string; noteType: string }): Promise<MedicalNote> {
    const note: MedicalNote = {
      id: this.idCounters.notes++,
      ...noteData,
      createdBy: "Dr. Smith",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.medicalNotes.set(note.id, note);
    return note;
  }

  async deleteMedicalNote(id: number): Promise<boolean> {
    return this.medicalNotes.delete(id);
  }

  // Treatment History Methods
  async getPatientTreatmentHistory(patientId: number): Promise<TreatmentHistory[]> {
    return Array.from(this.treatmentHistory.values())
      .filter(treatment => treatment.patientId === patientId)
      .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime());
  }

  async createTreatmentHistory(treatmentData: { 
    patientId: number; 
    treatmentType: string; 
    description: string; 
    toothNumbers?: string; 
    duration: number; 
    cost: number;
    currency: string;
    notes?: string; 
  }): Promise<TreatmentHistory> {
    const treatment: TreatmentHistory = {
      id: this.idCounters.treatments++,
      ...treatmentData,
      toothNumbers: treatmentData.toothNumbers || null,
      notes: treatmentData.notes || null,
      appointmentId: null,
      status: "completed",
      performedBy: "Dr. Smith",
      performedAt: new Date(),
      createdAt: new Date(),
    };
    this.treatmentHistory.set(treatment.id, treatment);
    return treatment;
  }

  // Payment Records Methods
  async getPatientPaymentRecords(patientId: number): Promise<PaymentRecord[]> {
    return Array.from(this.paymentRecords.values())
      .filter(payment => payment.patientId === patientId)
      .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
  }

  async createPaymentRecord(paymentData: {
    patientId: number;
    appointmentId?: number;
    treatmentId?: number;
    amount: number;
    currency?: string;
    paymentMethod: string;
    treatmentContext?: string;
    doctorName?: string;
    notes?: string;
  }): Promise<PaymentRecord> {
    const payment: PaymentRecord = {
      id: this.idCounters.payments++,
      ...paymentData,
      appointmentId: paymentData.appointmentId || null,
      treatmentId: paymentData.treatmentId || null,
      currency: paymentData.currency || "EUR",
      treatmentContext: paymentData.treatmentContext || null,
      doctorName: paymentData.doctorName || null,
      notes: paymentData.notes || null,
      paymentStatus: "completed",
      paidAt: new Date(),
      createdAt: new Date(),
    };
    this.paymentRecords.set(payment.id, payment);
    return payment;
  }

  // Financial Transactions Methods (New System)
  async createFinancialTransaction(transactionData: {
    patientId: number;
    type: 'payment' | 'charge' | 'refund' | 'adjustment';
    amount: number;
    currency: string;
    description: string;
    category?: string;
    paymentMethod?: string;
    transactionReference?: string;
    appointmentId?: number;
    treatmentId?: number;
    recordedBy: number;
    authorizedBy?: number;
    status?: string;
    notes?: string;
  }): Promise<any> {
    const employee = this.employees.get(transactionData.recordedBy);
    const transaction = {
      id: this.idCounters.transactions++,
      ...transactionData,
      status: transactionData.status || 'completed',
      category: transactionData.category || null,
      paymentMethod: transactionData.paymentMethod || null,
      transactionReference: transactionData.transactionReference || null,
      appointmentId: transactionData.appointmentId || null,
      treatmentId: transactionData.treatmentId || null,
      authorizedBy: transactionData.authorizedBy || null,
      notes: transactionData.notes || null,
      recordedByName: employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown',
      processedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.financialTransactions.set(transaction.id, transaction);
    return transaction;
  }

  async getPatientFinancialTransactions(patientId: number): Promise<any[]> {
    return Array.from(this.financialTransactions.values())
      .filter(transaction => transaction.patientId === patientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getPatientFinancialSummary(patientId: number): Promise<{
    patientId: number;
    totalCharges: Record<string, number>;
    totalPayments: Record<string, number>;
    totalRefunds: Record<string, number>;
    balance: Record<string, number>;
    lastTransactionDate?: string;
    transactionCount: number;
  }> {
    const transactions = await this.getPatientFinancialTransactions(patientId);
    
    const summary = {
      patientId,
      totalCharges: {} as Record<string, number>,
      totalPayments: {} as Record<string, number>,
      totalRefunds: {} as Record<string, number>,
      balance: {} as Record<string, number>,
      lastTransactionDate: undefined as string | undefined,
      transactionCount: transactions.length,
    };

    transactions.forEach(transaction => {
      if (transaction.status !== 'completed') return;

      const currency = transaction.currency;
      
      // Initialize currency totals if not present
      if (!summary.totalCharges[currency]) summary.totalCharges[currency] = 0;
      if (!summary.totalPayments[currency]) summary.totalPayments[currency] = 0;
      if (!summary.totalRefunds[currency]) summary.totalRefunds[currency] = 0;
      if (!summary.balance[currency]) summary.balance[currency] = 0;

      switch (transaction.type) {
        case 'charge':
          summary.totalCharges[currency] += transaction.amount;
          summary.balance[currency] += transaction.amount;
          break;
        case 'payment':
          summary.totalPayments[currency] += Math.abs(transaction.amount);
          summary.balance[currency] += transaction.amount; // Payments are negative
          break;
        case 'refund':
          summary.totalRefunds[currency] += transaction.amount;
          summary.balance[currency] += transaction.amount;
          break;
        case 'adjustment':
          summary.balance[currency] += transaction.amount;
          break;
      }
    });

    if (transactions.length > 0) {
      summary.lastTransactionDate = transactions[0].createdAt;
    }

    return summary;
  }

  async updateFinancialTransaction(id: number, updates: {
    status?: string;
    notes?: string;
    authorizedBy?: number;
  }): Promise<any | undefined> {
    const transaction = this.financialTransactions.get(id);
    if (!transaction) return undefined;

    const updatedTransaction = {
      ...transaction,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.financialTransactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const totalPatients = this.patients.size;
    const todayAppointments = (await this.getTodayAppointments()).length;
    const monthlyRevenue = 32849; // Mock value

    return {
      totalPatients,
      todayAppointments,
      monthlyRevenue
    };
  }

  // Role Management Methods
  async getRoles(): Promise<Role[]> {
    return Array.from(this.roles.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getRole(id: number): Promise<Role | undefined> {
    return this.roles.get(id);
  }

  async createRole(roleData: InsertRole): Promise<Role> {
    const role: Role = {
      id: this.idCounters.roles++,
      ...roleData,
      permissions: roleData.permissions || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.roles.set(role.id, role);
    return role;
  }

  async updateRole(id: number, roleData: Partial<InsertRole>): Promise<Role | undefined> {
    const existingRole = this.roles.get(id);
    if (!existingRole) return undefined;

    const updatedRole: Role = {
      ...existingRole,
      ...roleData,
      updatedAt: new Date().toISOString(),
    };
    this.roles.set(id, updatedRole);
    return updatedRole;
  }

  async deleteRole(id: number): Promise<boolean> {
    // Check if any employees are using this role
    const employeesWithRole = Array.from(this.employees.values()).filter(emp => emp.roleId === id);
    if (employeesWithRole.length > 0) {
      return false; // Cannot delete role that is in use
    }
    return this.roles.delete(id);
  }

  // Employee Management Methods
  async getEmployees(params: { search?: string; isActive?: boolean; roleId?: number }): Promise<Employee[]> {
    let employees = Array.from(this.employees.values());

    if (params.search) {
      const searchLower = params.search.toLowerCase();
      employees = employees.filter(emp =>
        emp.firstName.toLowerCase().includes(searchLower) ||
        emp.lastName.toLowerCase().includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower) ||
        emp.position?.toLowerCase().includes(searchLower) ||
        emp.department?.toLowerCase().includes(searchLower)
      );
    }

    if (params.isActive !== undefined) {
      employees = employees.filter(emp => emp.isActive === params.isActive);
    }

    if (params.roleId !== undefined) {
      employees = employees.filter(emp => emp.roleId === params.roleId);
    }

    return employees.sort((a, b) => a.firstName.localeCompare(b.firstName));
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async createEmployee(employeeData: InsertEmployee): Promise<Employee> {
    const employee: Employee = {
      id: this.idCounters.employees++,
      ...employeeData,
      isActive: employeeData.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.employees.set(employee.id, employee);
    return employee;
  }

  async updateEmployee(id: number, employeeData: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const existingEmployee = this.employees.get(id);
    if (!existingEmployee) return undefined;

    const updatedEmployee: Employee = {
      ...existingEmployee,
      ...employeeData,
      updatedAt: new Date().toISOString(),
    };
    this.employees.set(id, updatedEmployee);
    return updatedEmployee;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    return this.employees.delete(id);
  }

  async setEmployeeStatus(id: number, isActive: boolean): Promise<Employee | undefined> {
    const employee = this.employees.get(id);
    if (!employee) return undefined;

    const updatedEmployee: Employee = {
      ...employee,
      isActive,
      updatedAt: new Date().toISOString(),
    };
    this.employees.set(id, updatedEmployee);
    return updatedEmployee;
  }

  // Authentication Methods
  async getEmployeeByEmail(email: string): Promise<Employee | undefined> {
    return Array.from(this.employees.values()).find(emp => emp.email === email);
  }

  async createEmployeeWithPassword(employeeData: InsertEmployeeWithPassword): Promise<Employee> {
    const employee: Employee = {
      id: this.idCounters.employees++,
      ...employeeData,
      isActive: employeeData.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.employees.set(employee.id, employee);
    
    // Create default settings for new employee
    const defaultSettings: Settings = {
      id: this.idCounters.settings++,
      employeeId: employee.id,
      showRevenue: false, // Default to false for new employees
      language: "en",
      theme: "light",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.settings.set(defaultSettings.id, defaultSettings);
    
    return employee;
  }

  // Settings Methods
  async getEmployeeSettings(employeeId: number): Promise<Settings | undefined> {
    return Array.from(this.settings.values()).find(setting => setting.employeeId === employeeId);
  }

  async updateEmployeeSettings(employeeId: number, settingsData: Partial<InsertSettings>): Promise<Settings> {
    let existingSettings = Array.from(this.settings.values()).find(setting => setting.employeeId === employeeId);
    
    if (existingSettings) {
      const updatedSettings: Settings = {
        ...existingSettings,
        ...settingsData,
        employeeId, // Ensure employeeId doesn't change
        updatedAt: new Date().toISOString(),
      };
      this.settings.set(existingSettings.id, updatedSettings);
      return updatedSettings;
    } else {
      // Create new settings if they don't exist
      const newSettings: Settings = {
        id: this.idCounters.settings++,
        employeeId,
        showRevenue: false,
        language: "en",
        theme: "light",
        ...settingsData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.settings.set(newSettings.id, newSettings);
      return newSettings;
    }
  }
}

export const storage = new MemStorage();
