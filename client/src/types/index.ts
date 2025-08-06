export * from "@shared/schema";
import type { Patient, Appointment } from "@shared/schema";

export interface PatientWithLastVisit extends Patient {
  lastVisit?: string;
}

export interface AppointmentWithPatient extends Appointment {
  patientName?: string;
}

export interface SearchParams {
  search?: string;
  pageNumber?: number;
  pageSize?: number;
}
