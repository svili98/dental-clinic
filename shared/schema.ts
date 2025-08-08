import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const patients = pgTable("patients", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }),
  dateOfBirth: date("date_of_birth").notNull(),
  address: text("address"),
  gender: varchar("gender", { length: 10 }).notNull(),
  jmbg: varchar("jmbg", { length: 13 }).notNull().unique(),
  statusId: integer("status_id").notNull().default(1),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const appointments = pgTable("appointments", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  appointmentDate: timestamp("appointment_date").notNull(),
  duration: integer("duration").notNull().default(30),
  description: text("description"),
  status: varchar("status", { length: 20 }).notNull().default("scheduled"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const medicalConditions = pgTable("medical_conditions", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const patientMedicalConditions = pgTable("patient_medical_conditions", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  medicalConditionId: integer("medical_condition_id").notNull().references(() => medicalConditions.id),
  diagnosedDate: date("diagnosed_date"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const patientFiles = pgTable("patient_files", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  fileType: varchar("file_type", { length: 50 }).notNull(),
  fileSize: integer("file_size").notNull(),
  description: text("description"),
  thumbnailPath: varchar("thumbnail_path", { length: 500 }),
  uploadedAt: timestamp("uploaded_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const toothRecords = pgTable("tooth_records", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  toothNumber: integer("tooth_number").notNull(), // Universal numbering system 1-32
  condition: varchar("condition", { length: 50 }).notNull().default("healthy"), // healthy, caries, filled, crown, extracted, etc.
  surfaces: varchar("surfaces", { length: 20 }), // Affected surfaces: M, O, D, B/L, I
  treatment: varchar("treatment", { length: 100 }), // Treatment performed
  treatmentDate: date("treatment_date"),
  notes: text("notes"),
  color: varchar("color", { length: 20 }).notNull().default("#ffffff"), // Visual color on odontogram
  isCompleted: boolean("is_completed").notNull().default(true),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Medical notes for patients
export const medicalNotes = pgTable("medical_notes", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  noteType: varchar("note_type", { length: 50 }).notNull().default("general"), // general, treatment, diagnosis, follow-up
  createdBy: varchar("created_by", { length: 100 }).notNull().default("Dr. Smith"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Treatment history records
export const treatmentHistory = pgTable("treatment_history", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  treatmentType: varchar("treatment_type", { length: 100 }).notNull(),
  description: text("description").notNull(),
  toothNumbers: varchar("tooth_numbers", { length: 100 }), // e.g., "1,2,3" for multiple teeth
  duration: integer("duration").notNull().default(30), // minutes
  cost: integer("cost").notNull().default(0), // in cents
  status: varchar("status", { length: 20 }).notNull().default("completed"),
  notes: text("notes"),
  performedBy: varchar("performed_by", { length: 100 }).notNull().default("Dr. Smith"),
  performedAt: timestamp("performed_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Payment records
export const paymentRecords = pgTable("payment_records", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  treatmentId: integer("treatment_id").references(() => treatmentHistory.id),
  amount: integer("amount").notNull(), // in cents
  paymentMethod: varchar("payment_method", { length: 50 }).notNull().default("cash"),
  paymentStatus: varchar("payment_status", { length: 20 }).notNull().default("completed"),
  notes: text("notes"),
  paidAt: timestamp("paid_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Insert schemas
export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Male", "Female"]),
  jmbg: z.string().length(13, "JMBG must be 13 digits").regex(/^\d{13}$/, "JMBG must contain only digits"),
  medicalConditions: z.array(z.string()).optional(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  appointmentDate: z.string().min(1, "Appointment date is required"),
  status: z.enum(["scheduled", "completed", "cancelled"]).default("scheduled"),
});

export const insertPatientFileSchema = createInsertSchema(patientFiles).omit({
  id: true,
  uploadedAt: true,
});

export const insertToothRecordSchema = createInsertSchema(toothRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  condition: z.enum([
    "healthy", "caries", "filled", "crown", "bridge", "implant", 
    "extracted", "impacted", "fractured", "root_canal", "veneer",
    "wisdom_tooth", "missing", "needs_treatment"
  ]).default("healthy"),
  surfaces: z.string().optional(),
  treatment: z.string().optional(),
  treatmentDate: z.string().optional(),
  color: z.string().default("#ffffff"),
  isCompleted: z.boolean().default(true),
});

// Types
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type MedicalCondition = typeof medicalConditions.$inferSelect;

export type PatientMedicalCondition = typeof patientMedicalConditions.$inferSelect;

export type PatientFile = typeof patientFiles.$inferSelect;
export type InsertPatientFile = z.infer<typeof insertPatientFileSchema>;

export type ToothRecord = typeof toothRecords.$inferSelect;
export type InsertToothRecord = z.infer<typeof insertToothRecordSchema>;

export type MedicalNote = typeof medicalNotes.$inferSelect;
export type TreatmentHistory = typeof treatmentHistory.$inferSelect;
export type PaymentRecord = typeof paymentRecords.$inferSelect;

// Response types
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  monthlyRevenue: number;
}
