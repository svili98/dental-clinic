import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPatientSchema, insertAppointmentSchema, insertPatientFileSchema, insertToothRecordSchema, insertRoleSchema, insertEmployeeSchema, insertSettingsSchema, loginSchema } from "@shared/schema";
import { getSetmoreService } from "./services/setmore-service";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Patients routes
  app.get("/api/patients", async (req, res) => {
    try {
      const { search, pageNumber, pageSize } = req.query;
      const params = {
        search: search as string,
        pageNumber: pageNumber ? parseInt(pageNumber as string) : undefined,
        pageSize: pageSize ? parseInt(pageSize as string) : undefined,
      };
      const result = await storage.getPatients(params);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  app.get("/api/patients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const patient = await storage.getPatient(id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.json(patient);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patient" });
    }
  });

  app.post("/api/patients", async (req, res) => {
    try {
      const validatedData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(validatedData);
      res.status(201).json(patient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create patient" });
    }
  });

  app.put("/api/patients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPatientSchema.partial().parse(req.body);
      const patient = await storage.updatePatient(id, validatedData);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.json(patient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update patient" });
    }
  });

  app.delete("/api/patients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePatient(id);
      if (!success) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete patient" });
    }
  });

  // Appointments routes
  app.get("/api/appointments", async (req, res) => {
    try {
      const { patientId, date, pageNumber, pageSize } = req.query;
      const params = {
        patientId: patientId ? parseInt(patientId as string) : undefined,
        date: date as string,
        pageNumber: pageNumber ? parseInt(pageNumber as string) : undefined,
        pageSize: pageSize ? parseInt(pageSize as string) : undefined,
      };
      const result = await storage.getAppointments(params);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.get("/api/appointments/today", async (req, res) => {
    try {
      const appointments = await storage.getTodayAppointments();
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's appointments" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(validatedData);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  // Files routes
  app.get("/api/patients/:patientId/files", async (req, res) => {
    try {
      const patientId = parseInt(req.params.patientId);
      const files = await storage.getPatientFiles(patientId);
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patient files" });
    }
  });

  app.post("/api/files", async (req, res) => {
    try {
      const validatedData = insertPatientFileSchema.parse(req.body);
      const file = await storage.createPatientFile(validatedData);
      res.status(201).json(file);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create file record" });
    }
  });

  app.delete("/api/files/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePatientFile(id);
      if (!success) {
        return res.status(404).json({ message: "File not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  // Medical conditions
  app.get("/api/medical-conditions", async (req, res) => {
    try {
      const conditions = await storage.getMedicalConditions();
      res.json(conditions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medical conditions" });
    }
  });

  // Tooth Records (Odontogram) routes
  app.get("/api/patients/:patientId/teeth", async (req, res) => {
    try {
      const patientId = parseInt(req.params.patientId);
      const toothRecords = await storage.getPatientToothRecords(patientId);
      res.json(toothRecords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tooth records" });
    }
  });

  app.post("/api/teeth", async (req, res) => {
    try {
      const validatedData = insertToothRecordSchema.parse(req.body);
      const toothRecord = await storage.createToothRecord(validatedData);
      res.status(201).json(toothRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create tooth record" });
    }
  });

  app.put("/api/teeth/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertToothRecordSchema.partial().parse(req.body);
      const toothRecord = await storage.updateToothRecord(id, validatedData);
      if (!toothRecord) {
        return res.status(404).json({ message: "Tooth record not found" });
      }
      res.json(toothRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update tooth record" });
    }
  });

  app.delete("/api/teeth/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteToothRecord(id);
      if (!success) {
        return res.status(404).json({ message: "Tooth record not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete tooth record" });
    }
  });

  // Medical Notes routes
  app.get("/api/patients/:patientId/medical-notes", async (req, res) => {
    try {
      const patientId = parseInt(req.params.patientId);
      const notes = await storage.getPatientMedicalNotes(patientId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medical notes" });
    }
  });

  app.post("/api/patients/:patientId/medical-notes", async (req, res) => {
    try {
      const patientId = parseInt(req.params.patientId);
      const { title, content, noteType = 'general' } = req.body;
      if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
      }
      const note = await storage.createMedicalNote({ patientId, title, content, noteType });
      res.status(201).json(note);
    } catch (error) {
      res.status(500).json({ message: "Failed to create medical note" });
    }
  });

  // Treatment History routes
  app.get("/api/patients/:patientId/treatment-history", async (req, res) => {
    try {
      const patientId = parseInt(req.params.patientId);
      const treatments = await storage.getPatientTreatmentHistory(patientId);
      res.json(treatments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch treatment history" });
    }
  });

  app.post("/api/patients/:patientId/treatment-history", async (req, res) => {
    try {
      const patientId = parseInt(req.params.patientId);
      const { treatmentType, description, toothNumbers, duration = 30, cost = 0, notes } = req.body;
      if (!treatmentType || !description) {
        return res.status(400).json({ message: 'Treatment type and description are required' });
      }
      const treatment = await storage.createTreatmentHistory({
        patientId, 
        treatmentType, 
        description, 
        toothNumbers, 
        duration: parseInt(duration) || 30, 
        cost: parseInt(cost) || 0, 
        notes
      });
      res.status(201).json(treatment);
    } catch (error) {
      res.status(500).json({ message: "Failed to create treatment history" });
    }
  });

  // Payment Records routes
  app.post("/api/patients/:patientId/payments", async (req, res) => {
    try {
      const patientId = parseInt(req.params.patientId);
      const { amount, paymentMethod = 'cash', appointmentId, treatmentId, notes } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Valid amount is required' });
      }
      const payment = await storage.createPaymentRecord({
        patientId,
        amount: parseInt(amount),
        paymentMethod,
        appointmentId: appointmentId ? parseInt(appointmentId) : undefined,
        treatmentId: treatmentId ? parseInt(treatmentId) : undefined,
        notes
      });
      res.status(201).json(payment);
    } catch (error) {
      res.status(500).json({ message: "Failed to create payment record" });
    }
  });

  app.get("/api/patients/:patientId/payments", async (req, res) => {
    try {
      const patientId = parseInt(req.params.patientId);
      const payments = await storage.getPatientPaymentRecords(patientId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payment records" });
    }
  });

  // Role Management Routes
  app.get("/api/roles", async (req, res) => {
    try {
      const roles = await storage.getRoles();
      res.json(roles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch roles" });
    }
  });

  app.get("/api/roles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const role = await storage.getRole(id);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      res.json(role);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch role" });
    }
  });

  app.post("/api/roles", async (req, res) => {
    try {
      const validatedData = insertRoleSchema.parse(req.body);
      const role = await storage.createRole(validatedData);
      res.status(201).json(role);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create role" });
    }
  });

  app.put("/api/roles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertRoleSchema.partial().parse(req.body);
      const role = await storage.updateRole(id, validatedData);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      res.json(role);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  app.delete("/api/roles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteRole(id);
      if (!deleted) {
        return res.status(400).json({ message: "Cannot delete role that is in use" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete role" });
    }
  });

  // Employee Management Routes
  app.get("/api/employees", async (req, res) => {
    try {
      const { search, isActive, roleId } = req.query;
      const params = {
        search: search as string,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        roleId: roleId ? parseInt(roleId as string) : undefined,
      };
      const employees = await storage.getEmployees(params);
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.get("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const employee = await storage.getEmployee(id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employee" });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      const validatedData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(validatedData);
      res.status(201).json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  app.put("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertEmployeeSchema.partial().parse(req.body);
      const employee = await storage.updateEmployee(id, validatedData);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update employee" });
    }
  });

  app.delete("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteEmployee(id);
      if (!deleted) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete employee" });
    }
  });

  app.patch("/api/employees/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isActive } = req.body;
      const employee = await storage.setEmployeeStatus(id, isActive);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: "Failed to update employee status" });
    }
  });

  // Setmore API Integration Routes
  const setmoreService = getSetmoreService();

  // Get all services
  app.get("/api/setmore/services", async (req, res) => {
    try {
      const result = await setmoreService.getAllServices();
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  // Get all staff
  app.get("/api/setmore/staff", async (req, res) => {
    try {
      const result = await setmoreService.getAllStaff();
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  // Get available time slots
  app.post("/api/setmore/slots", async (req, res) => {
    try {
      const { staff_key, service_key, selected_date, slot_limit } = req.body;
      const result = await setmoreService.getAvailableSlots({
        staff_key,
        service_key,
        selected_date,
        slot_limit: slot_limit || 20
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch time slots" });
    }
  });

  // Create Setmore customer and appointment
  app.post("/api/appointments/setmore", async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      
      // Get patient data to create Setmore customer
      const patient = await storage.getPatient(appointmentData.patientId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      // Create customer in Setmore (or get existing)
      let customerKey = patient.email ? `customer_${patient.email}` : `customer_${patient.id}`;
      
      // For development, we'll create the appointment directly in our system
      // In production, this would create the appointment in Setmore first
      const appointment = await storage.createAppointment({
        ...appointmentData,
        customerKey
      });

      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const employee = await storage.getEmployeeByEmail(validatedData.email);
      
      if (!employee || employee.password !== validatedData.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      if (!employee.isActive) {
        return res.status(403).json({ message: "Account is disabled" });
      }
      
      // For now, return the employee without password
      const { password, ...employeeWithoutPassword } = employee;
      res.json({ employee: employeeWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Settings routes
  app.get("/api/settings/:employeeId", async (req, res) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      const settings = await storage.getEmployeeSettings(employeeId);
      
      if (!settings) {
        // Create default settings if they don't exist
        const defaultSettings = await storage.updateEmployeeSettings(employeeId, {});
        return res.json(defaultSettings);
      }
      
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/settings/:employeeId", async (req, res) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      const validatedData = insertSettingsSchema.parse(req.body);
      const settings = await storage.updateEmployeeSettings(employeeId, validatedData);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
