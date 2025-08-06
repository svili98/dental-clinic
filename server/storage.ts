import { 
  type Patient, 
  type InsertPatient,
  type Appointment,
  type InsertAppointment,
  type PatientFile,
  type InsertPatientFile,
  type MedicalCondition,
  type DashboardStats,
  type PaginatedResponse
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
  
  // Dashboard
  getDashboardStats(): Promise<DashboardStats>;
}

export class MemStorage implements IStorage {
  private patients: Map<number, Patient>;
  private appointments: Map<number, Appointment>;
  private patientFiles: Map<number, PatientFile>;
  private medicalConditions: Map<number, MedicalCondition>;
  private idCounters: { patients: number; appointments: number; files: number; conditions: number };

  constructor() {
    this.patients = new Map();
    this.appointments = new Map();
    this.patientFiles = new Map();
    this.medicalConditions = new Map();
    this.idCounters = { patients: 1, appointments: 1, files: 1, conditions: 1 };
    
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
        createdAt: new Date("2024-12-15"),
        updatedAt: new Date("2024-12-15")
      }
    ];

    sampleAppointments.forEach(appointment => {
      this.appointments.set(appointment.id, appointment);
    });
    this.idCounters.appointments = 3;
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

  async getMedicalConditions(): Promise<MedicalCondition[]> {
    return Array.from(this.medicalConditions.values());
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
}

export const storage = new MemStorage();
