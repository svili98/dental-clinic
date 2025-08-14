// i18n Configuration and Translation System
import { createContext, useContext } from 'react';

export interface Translations {
  // Navigation
  dashboard: string;
  patients: string;
  appointments: string;
  medicalRecords: string;
  filesDocuments: string;
  settings: string;
  
  // Common
  loading: string;
  error: string;
  success: string;
  cancel: string;
  save: string;
  edit: string;
  delete: string;
  add: string;
  search: string;
  back: string;
  
  // Patient Details
  patientInformation: string;
  patientId: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  
  // Appointments
  appointmentScheduled: string;
  appointmentCompleted: string;
  appointmentCancelled: string;
  scheduleAppointment: string;
  duration: string;
  fee: string;
  
  // Treatment
  treatmentHistory: string;
  addTreatment: string;
  treatmentType: string;
  description: string;
  toothNumbers: string;
  cost: string;
  notes: string;
  treatmentNotes: string;
  
  // Financial
  financialOverview: string;
  totalPaid: string;
  outstanding: string;
  totalTreatments: string;
  unpaidTreatments: string;
  recordPayment: string;
  recentPayments: string;
  balanceDue: string;
  
  // Odontogram
  odontogram: string;
  maxilla: string;
  mandible: string;
  right: string;
  left: string;
  
  // Tooth Conditions
  healthy: string;
  caries: string;
  filled: string;
  crown: string;
  bridge: string;
  implant: string;
  extracted: string;
  impacted: string;
  fractured: string;
  rootCanal: string;
  veneer: string;
  wisdomTooth: string;
  missing: string;
  needsTreatment: string;
  
  // Medical
  medicalNotes: string;
  title: string;
  content: string;
  noteType: string;
  
  // Files
  files: string;
  uploadFiles: string;
  chooseFiles: string;
  dragAndDrop: string;
  
  // Quick Actions
  quickActions: string;
  sendMessage: string;
  
  // Stats
  quickStats: string;
  totalAppointments: string;
  completedTreatments: string;
  filesUploaded: string;
  lastVisit: string;
  patientSince: string;
  
  // Treatment Types
  dentalCleaning: string;
  toothFilling: string;
  rootCanalTreatment: string;
  crownInstallation: string;
  toothExtraction: string;
  orthodonticTreatment: string;
  dentalImplant: string;
  teethWhitening: string;
  periodontalTreatment: string;
  emergencyTreatment: string;
  
  // Financial specific translations
  transactionHistory: string;
  noTransactionsRecorded: string;
  financialTransactionsSummary: string;
  addCharge: string;
  currentBalance: string;
  totalCharges: string;
  totalPayments: string;
  totalRefunds: string;
  lastTransaction: string;
  
  // Common UI elements
  close: string;
  noResultsFound: string;
  services: string;
  dentalCare: string;
  
  // Odontogram specific
  affectedSurfaces: string;
  condition: string;
  
  // Medical Records
  noMedicalNotesAvailable: string;
  noAppointmentsAvailable: string;
  noTreatmentHistoryYet: string;
  noFilesFound: string;
  
  // General status messages
  noDataAvailable: string;
  loadMore: string;
  viewDetails: string;
  editPatient: string;
  
  // Dashboard specific
  recentPatients: string;
  addPatient: string;
  viewAll: string;
  todaysAppointments: string;
  totalPatients: string;
  activePatients: string;
  inactivePatients: string;
  newPatientsThisMonth: string;
  averageAge: string;
  ageDistribution: string;
  children: string;
  adults: string;
  seniors: string;
  
  // Patient status
  active: string;
  inactive: string;
  atRisk: string;
  
  // Table headers
  name: string;
  age: string;
  contact: string;
  patientStatus: string;
  actions: string;
  
  // Additional odontogram terms
  legend: string;
  upperJaw: string;
  lowerJaw: string;
  adultTeeth: string;
  primaryTeeth: string;
  
  // Medical record buttons
  addMedicalNote: string;
  addTreatment: string;
}

const englishTranslations: Translations = {
  // Navigation
  dashboard: "Dashboard",
  patients: "Patients",
  appointments: "Appointments", 
  medicalRecords: "Medical Records",
  filesDocuments: "Files & Documents",
  settings: "Settings",
  
  // Common
  loading: "Loading...",
  error: "Error",
  success: "Success",
  cancel: "Cancel",
  save: "Save",
  edit: "Edit",
  delete: "Delete",
  add: "Add",
  search: "Search",
  back: "Back",
  
  // Patient Details
  patientInformation: "Patient Information",
  patientId: "Patient ID",
  fullName: "Full Name",
  dateOfBirth: "Date of Birth",
  gender: "Gender",
  phone: "Phone",
  email: "Email",
  address: "Address",
  status: "Status",
  active: "Active",
  
  // Appointments
  appointmentScheduled: "Scheduled",
  appointmentCompleted: "Completed",
  appointmentCancelled: "Cancelled",
  scheduleAppointment: "Schedule Appointment",
  duration: "Duration",
  fee: "Fee",
  
  // Treatment
  treatmentHistory: "Treatment History",
  addTreatment: "Add Treatment",
  treatmentType: "Treatment Type",
  description: "Description",
  toothNumbers: "Tooth Numbers",
  cost: "Cost",
  notes: "Notes",
  treatmentNotes: "Treatment Notes",
  
  // Financial
  financialOverview: "Financial Overview",
  totalPaid: "Total Paid",
  outstanding: "Outstanding",
  totalTreatments: "Total Treatments",
  unpaidTreatments: "Unpaid Treatments",
  recordPayment: "Record Payment",
  recentPayments: "Recent Payments",
  balanceDue: "Balance Due",
  
  // Odontogram
  odontogram: "Odontogram",
  upperJaw: "Upper Jaw",
  lowerJaw: "Lower Jaw", 
  maxilla: "Maxilla",
  mandible: "Mandible",
  right: "Right",
  left: "Left",
  legend: "Legend",
  adultTeeth: "Adult Teeth",
  primaryTeeth: "Primary Teeth",
  
  // Tooth Conditions
  healthy: "Healthy",
  caries: "Caries",
  filled: "Filled",
  crown: "Crown",
  bridge: "Bridge",
  implant: "Implant",
  extracted: "Extracted",
  impacted: "Impacted",
  fractured: "Fractured",
  rootCanal: "Root Canal",
  veneer: "Veneer",
  wisdomTooth: "Wisdom Tooth",
  missing: "Missing",
  needsTreatment: "Needs Treatment",
  
  // Medical
  medicalNotes: "Medical Notes",
  addMedicalNote: "Add Medical Note",
  title: "Title",
  content: "Content",
  noteType: "Note Type",
  
  // Files
  files: "Files",
  uploadFiles: "Upload Files",
  chooseFiles: "Choose Files",
  dragAndDrop: "Drag and drop files here, or click to browse",
  
  // Quick Actions
  quickActions: "Quick Actions",
  sendMessage: "Send Message",
  
  // Stats
  quickStats: "Quick Stats",
  totalAppointments: "Total Appointments",
  completedTreatments: "Completed Treatments",
  filesUploaded: "Files Uploaded",
  lastVisit: "Last Visit",
  patientSince: "Patient Since",
  
  // Treatment Types
  dentalCleaning: "Dental Cleaning",
  toothFilling: "Tooth Filling",
  rootCanalTreatment: "Root Canal",
  crownInstallation: "Crown Installation",
  toothExtraction: "Tooth Extraction",
  orthodonticTreatment: "Orthodontic Treatment",
  dentalImplant: "Dental Implant",
  teethWhitening: "Teeth Whitening",
  periodontalTreatment: "Periodontal Treatment",
  emergencyTreatment: "Emergency Treatment",
  
  // Page Titles
  patientManagement: "Patient Management",
  patientManagementDesc: "Manage patient records, appointments, and medical history",
  
  // Financial specific translations
  transactionHistory: "Transaction History",
  noTransactionsRecorded: "No transactions recorded",
  financialTransactionsSummary: "Financial transactions and balance summary",
  addCharge: "Add Charge",
  currentBalance: "Current Balance",
  totalCharges: "Total Charges",
  totalPayments: "Total Payments",
  totalRefunds: "Total Refunds",
  lastTransaction: "Last Transaction",
  
  // Common UI elements
  close: "Close",
  noResultsFound: "No results found",
  services: "Services",
  dentalCare: "DentalCare",
  
  // Odontogram specific
  affectedSurfaces: "Affected Surfaces",
  condition: "Condition",
  
  // Medical Records
  noMedicalNotesAvailable: "No medical notes available",
  noAppointmentsAvailable: "No appointments available",
  noTreatmentHistoryYet: "No treatment history yet",
  noFilesFound: "No files found",
  
  // General status messages
  noDataAvailable: "No data available",
  loadMore: "Load More",
  viewDetails: "View Details",
  editPatient: "Edit Patient",
  
  // Dashboard specific
  recentPatients: "Recent Patients",
  addPatient: "Add Patient",
  viewAll: "View All",
  todaysAppointments: "Today's Appointments",
  totalPatients: "Total Patients",
  activePatients: "Active Patients",
  inactivePatients: "Inactive Patients",
  newPatientsThisMonth: "New Patients This Month",
  averageAge: "Average Age",
  ageDistribution: "Age Distribution",
  children: "Children",
  adults: "Adults",
  seniors: "Seniors",
  
  // Patient status
  active: "Active",
  inactive: "Inactive",
  atRisk: "At Risk",
  
  // Table headers
  name: "Name",
  age: "Age",
  contact: "Contact",
  patientStatus: "Status",
  actions: "Actions",
  

};

const serbianTranslations: Translations = {
  // Navigation
  dashboard: "Kontrolna tabla",
  patients: "Pacijenti",
  appointments: "Zakazani termini",
  medicalRecords: "Medicinski kartoni",
  filesDocuments: "Fajlovi i dokumenti",
  settings: "Podešavanja",
  
  // Common
  loading: "Učitavanje...",
  error: "Greška",
  success: "Uspeh",
  cancel: "Otkaži",
  save: "Sačuvaj",
  edit: "Uredi",
  delete: "Obriši",
  add: "Dodaj",
  search: "Pretraži",
  back: "Nazad",
  
  // Patient Details
  patientInformation: "Informacije o pacijentu",
  patientId: "ID pacijenta",
  fullName: "Puno ime",
  dateOfBirth: "Datum rođenja",
  gender: "Pol",
  phone: "Telefon",
  email: "Email",
  address: "Adresa",
  status: "Status",
  active: "Aktivan",
  
  // Appointments
  appointmentScheduled: "Zakazano",
  appointmentCompleted: "Završeno",
  appointmentCancelled: "Otkazano",
  scheduleAppointment: "Zakaži termin",
  duration: "Trajanje",
  fee: "Naknada",
  
  // Treatment
  treatmentHistory: "Istorija lečenja",
  addTreatment: "Dodaj tretman",
  treatmentType: "Tip tretmana",
  description: "Opis",
  toothNumbers: "Brojevi zuba",
  cost: "Cena",
  notes: "Napomene",
  treatmentNotes: "Napomene o tretmanu",
  
  // Financial
  financialOverview: "Finansijski pregled",
  totalPaid: "Ukupno plaćeno",
  outstanding: "Dugovanje",
  totalTreatments: "Ukupni tretmani",
  unpaidTreatments: "Neplaćeni tretmani",
  recordPayment: "Evidentiraj plaćanje",
  recentPayments: "Nedavna plaćanja",
  balanceDue: "Dugovanje",
  
  // Odontogram
  odontogram: "Odontogram",
  adultTeeth: "Stalni zubi",
  primaryTeeth: "Mlečni zubi",
  upperJaw: "Gornja vilica",
  lowerJaw: "Donja vilica",
  maxilla: "Maksila",
  mandible: "Mandibula",
  right: "Desno",
  left: "Levo",
  legend: "Legenda",
  
  // Tooth Conditions
  healthy: "Zdrav",
  caries: "Karijes",
  filled: "Plombiran",
  crown: "Krunica",
  bridge: "Most",
  implant: "Implantat",
  extracted: "Izvađen",
  impacted: "Impaktiran",
  fractured: "Prelomljen",
  rootCanal: "Endodoncija",
  veneer: "Faseta",
  wisdomTooth: "Umnjak",
  missing: "Nedostaje",
  needsTreatment: "Potrebno lečenje",
  
  // Medical
  medicalNotes: "Medicinske napomene",
  addMedicalNote: "Dodaj medicinsku napomenu",
  title: "Naslov",
  content: "Sadržaj",
  noteType: "Tip napomene",
  
  // Files
  files: "Fajlovi",
  uploadFiles: "Otpremi fajlove",
  chooseFiles: "Izaberi fajlove",
  dragAndDrop: "Prevuci i spusti fajlove ovde, ili klikni za pretraživanje",
  
  // Quick Actions
  quickActions: "Brze akcije",
  sendMessage: "Pošalji poruku",
  
  // Stats
  quickStats: "Brza statistika",
  totalAppointments: "Ukupni termini",
  completedTreatments: "Završeni tretmani",
  filesUploaded: "Otpremljeni fajlovi",
  lastVisit: "Poslednja poseta",
  patientSince: "Pacijent od",
  
  // Treatment Types
  dentalCleaning: "Čišćenje zuba",
  toothFilling: "Plombiranje zuba",
  rootCanalTreatment: "Endodoncija",
  crownInstallation: "Postavljanje krunice",
  toothExtraction: "Vađenje zuba",
  orthodonticTreatment: "Ortodontski tretman",
  dentalImplant: "Dentalni implantat",
  teethWhitening: "Beljenje zuba",
  periodontalTreatment: "Parodontalni tretman",
  emergencyTreatment: "Hitni tretman",
  
  // Page Titles
  patientManagement: "Upravljanje pacijentima",
  patientManagementDesc: "Upravljajte kartonima pacijenata, terminima i medicinskom istorijom",
  
  // Financial specific translations
  transactionHistory: "Istorija transakcija",
  noTransactionsRecorded: "Nema evidentirane transakcije",
  financialTransactionsSummary: "Pregled finansijskih transakcija i balansa",
  addCharge: "Dodaj naknadu",
  currentBalance: "Trenutni balans",
  totalCharges: "Ukupne naknade",
  totalPayments: "Ukupna plaćanja",
  totalRefunds: "Ukupni povraćaji",
  lastTransaction: "Poslednja transakcija",
  
  // Common UI elements
  close: "Zatvori",
  noResultsFound: "Nema rezultata",
  services: "Usluge",
  dentalCare: "DentalCare",
  
  // Odontogram specific
  affectedSurfaces: "Zahvaćene površine",
  condition: "Stanje",
  
  // Medical Records
  noMedicalNotesAvailable: "Nema dostupnih medicinskih napomena",
  noAppointmentsAvailable: "Nema dostupnih termina",
  noTreatmentHistoryYet: "Još nema istorije lečenja",
  noFilesFound: "Nema pronađenih fajlova",
  
  // General status messages
  noDataAvailable: "Nema dostupnih podataka",
  loadMore: "Učitaj više",
  viewDetails: "Prikaži detalje",
  editPatient: "Uredi pacijenta",
  
  // Dashboard specific
  recentPatients: "Poslednji pacijenti",
  addPatient: "Dodaj pacijenta",
  viewAll: "Prikaži sve",
  todaysAppointments: "Današnji termini",
  totalPatients: "Ukupno pacijenata",
  activePatients: "Aktivni pacijenti",
  inactivePatients: "Neaktivni pacijenti",
  newPatientsThisMonth: "Novi pacijenti ovog meseca",
  averageAge: "Prosečne godine",
  ageDistribution: "Raspored godina",
  children: "Deca",
  adults: "Odrasli",
  seniors: "Stariji",
  
  // Patient status
  active: "Aktivan",
  inactive: "Neaktivan",
  atRisk: "U riziku",
  
  // Table headers
  name: "Ime",
  age: "Godine",
  contact: "Kontakt",
  patientStatus: "Status",
  actions: "Akcije",
  

};

export const translations = {
  en: englishTranslations,
  sr: serbianTranslations,
};

export type Language = keyof typeof translations;

export const LanguageContext = createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}>({
  language: 'en',
  setLanguage: () => {},
  t: englishTranslations,
});

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};