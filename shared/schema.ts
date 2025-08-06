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

// Types
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type MedicalCondition = typeof medicalConditions.$inferSelect;

export type PatientMedicalCondition = typeof patientMedicalConditions.$inferSelect;

export type PatientFile = typeof patientFiles.$inferSelect;
export type InsertPatientFile = z.infer<typeof insertPatientFileSchema>;

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
