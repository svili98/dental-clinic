import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, date, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Patient status definitions
export const PATIENT_STATUSES = {
  1: { id: 1, name: 'Active', color: 'green', description: 'Currently receiving treatment' },
  2: { id: 2, name: 'Inactive', color: 'gray', description: 'Not currently receiving treatment' },
  3: { id: 3, name: 'Completed', color: 'blue', description: 'Treatment completed' },
  4: { id: 4, name: 'Suspended', color: 'orange', description: 'Treatment temporarily suspended' },
  5: { id: 5, name: 'Transferred', color: 'purple', description: 'Transferred to another clinic' }
} as const;

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
  profilePicture: varchar("profile_picture", { length: 500 }), // URL or path to profile picture
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
  
  // Setmore integration fields
  setmoreAppointmentKey: varchar("setmore_appointment_key", { length: 100 }), // Setmore appointment ID
  serviceKey: varchar("service_key", { length: 100 }).notNull().default("cleaning"), // Setmore service key
  serviceName: varchar("service_name", { length: 200 }).notNull().default("Dental Cleaning"),
  staffKey: varchar("staff_key", { length: 100 }).notNull().default("dr-smith"), // Setmore staff key
  staffName: varchar("staff_name", { length: 200 }).notNull().default("Dr. Smith"),
  cost: integer("cost").notNull().default(0), // in cents
  currency: varchar("currency", { length: 5 }).notNull().default("EUR"),
  customerKey: varchar("customer_key", { length: 100 }), // Setmore customer ID
  
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
  category: varchar("category", { length: 50 }).notNull().default("general"), // xray, photo, model, document
  tags: text("tags").array(), // searchable tags like "intraoral", "panoramic", "pre-treatment"
  toothNumbers: integer("tooth_numbers").array(), // associated teeth for specific procedures
  treatmentDate: date("treatment_date"), // when the procedure/image was taken
  metadata: jsonb("metadata"), // additional file-specific data (dimensions, settings, etc.)
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
  cost: integer("cost").notNull().default(0), // in smallest currency unit (cents, paras, etc.)
  currency: varchar("currency", { length: 3 }).notNull().default("EUR"), // EUR, RSD, CHF
  status: varchar("status", { length: 20 }).notNull().default("completed"),
  notes: text("notes"),
  performedBy: varchar("performed_by", { length: 100 }).notNull().default("Dr. Smith"),
  performedAt: timestamp("performed_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Payment records
// Financial transactions table - unified approach for all money movements
export const financialTransactions = pgTable("financial_transactions", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  type: varchar("type", { length: 20 }).notNull(), // 'payment', 'charge', 'refund', 'adjustment'
  amount: integer("amount").notNull(), // in smallest currency unit (positive for charges, negative for payments/refunds)
  currency: varchar("currency", { length: 3 }).notNull().default("EUR"), // EUR, RSD, CHF
  
  // Reference fields
  appointmentId: integer("appointment_id").references(() => appointments.id),
  treatmentId: integer("treatment_id").references(() => treatmentHistory.id),
  
  // Payment specific fields
  paymentMethod: varchar("payment_method", { length: 50 }), // cash, card, bank_transfer, insurance
  transactionReference: varchar("transaction_reference", { length: 100 }), // external reference number
  
  // Employee tracking
  recordedBy: integer("recorded_by").notNull().references(() => employees.id),
  authorizedBy: integer("authorized_by").references(() => employees.id), // for large amounts or adjustments
  
  // Context and metadata
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }), // 'treatment', 'consultation', 'emergency', 'equipment'
  notes: text("notes"),
  
  // Status and timestamps
  status: varchar("status", { length: 20 }).notNull().default("completed"), // completed, pending, cancelled, refunded
  processedAt: timestamp("processed_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Legacy payment records table (kept for migration compatibility)
export const paymentRecords = pgTable("payment_records", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  treatmentId: integer("treatment_id").references(() => treatmentHistory.id),
  amount: integer("amount").notNull(), // in smallest currency unit (cents, paras, etc.)
  currency: varchar("currency", { length: 3 }).notNull().default("EUR"), // EUR, RSD, CHF
  paymentMethod: varchar("payment_method", { length: 50 }).notNull().default("cash"),
  paymentStatus: varchar("payment_status", { length: 20 }).notNull().default("completed"),
  treatmentContext: varchar("treatment_context", { length: 100 }), // e.g., "orthodontic", "emergency", "routine"
  doctorName: varchar("doctor_name", { length: 100 }), // Name of the doctor who provided the treatment
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
  serviceKey: z.string().default("cleaning"),
  serviceName: z.string().default("Dental Cleaning"),
  staffKey: z.string().default("dr-smith"),
  staffName: z.string().default("Dr. Smith"),
  cost: z.number().default(0),
  currency: z.string().default("EUR"),
});

export const insertPatientFileSchema = createInsertSchema(patientFiles).omit({
  id: true,
  uploadedAt: true,
});

// Financial transaction schemas
export const insertFinancialTransactionSchema = createInsertSchema(financialTransactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  processedAt: true,
}).extend({
  type: z.enum(["payment", "charge", "refund", "adjustment"]),
  amount: z.number(),
  currency: z.enum(["EUR", "RSD", "CHF"]).default("EUR"),
  paymentMethod: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  category: z.string().optional(),
  status: z.enum(["completed", "pending", "cancelled", "refunded"]).default("completed"),
  recordedBy: z.number().min(1, "Recorded by employee ID is required"),
  authorizedBy: z.number().optional(),
  transactionReference: z.string().optional(),
  appointmentId: z.number().optional(),
  treatmentId: z.number().optional(),
  notes: z.string().optional(),
});

export const insertPaymentRecordSchema = createInsertSchema(paymentRecords).omit({
  id: true,
  createdAt: true,
}).extend({
  currency: z.enum(["EUR", "RSD", "CHF"]).default("EUR"),
  treatmentContext: z.string().optional(),
  doctorName: z.string().optional(),
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

export const insertTreatmentHistorySchema = createInsertSchema(treatmentHistory).omit({
  id: true,
  createdAt: true,
  performedAt: true,
}).extend({
  currency: z.enum(["EUR", "RSD", "CHF"]).default("EUR"),
  status: z.enum(["planned", "in_progress", "completed", "cancelled"]).default("completed"),
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
export type InsertTreatmentHistory = z.infer<typeof insertTreatmentHistorySchema>;
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

// User Management and Access Control Tables
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  permissions: jsonb("permissions").notNull().default('{}'), // Store permissions as JSON
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(), // Added password field
  phone: varchar("phone", { length: 20 }),
  position: varchar("position", { length: 100 }),
  department: varchar("department", { length: 100 }),
  roleId: integer("role_id").references(() => roles.id),
  isActive: boolean("is_active").default(true),
  startDate: date("start_date"),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id),
  sessionToken: varchar("session_token", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Settings table for storing user preferences
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  showRevenue: boolean("show_revenue").default(true),
  language: varchar("language", { length: 10 }).default("en"),
  theme: varchar("theme", { length: 20 }).default("light"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const rolesRelations = relations(roles, ({ many }) => ({
  employees: many(employees),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  role: one(roles, {
    fields: [employees.roleId],
    references: [roles.id],
  }),
  sessions: many(userSessions),
  settings: one(settings, {
    fields: [employees.id],
    references: [settings.employeeId],
  }),
}));

export const settingsRelations = relations(settings, ({ one }) => ({
  employee: one(employees, {
    fields: [settings.employeeId],
    references: [employees.id],
  }),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  employee: one(employees, {
    fields: [userSessions.employeeId],
    references: [employees.id],
  }),
}));

// Insert schemas
export const insertRoleSchema = createInsertSchema(roles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true, createdAt: true, updatedAt: true, password: true });
export const insertEmployeeWithPasswordSchema = createInsertSchema(employees).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type InsertEmployeeWithPassword = z.infer<typeof insertEmployeeWithPasswordSchema>;
export type UserSession = typeof userSessions.$inferSelect;
export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginData = z.infer<typeof loginSchema>;
