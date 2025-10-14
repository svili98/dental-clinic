# DentalCare API Documentation for C# Backend

## Overview
Complete REST API documentation for DentalCare dental clinic management system. This document provides all endpoints, request/response models, and validation rules needed to implement a C# backend.

## Base URL
```
http://localhost:5000/api
```

## Authentication
- **Method**: Session-based authentication
- **Login Endpoint**: `POST /api/auth/login`
- **Session Cookie**: `connect.sid`

---

## 📊 Dashboard Endpoints

### Get Dashboard Statistics
```http
GET /api/dashboard/stats
```

**Response:**
```json
{
  "totalPatients": 150,
  "activePatients": 120,
  "todayAppointments": 8,
  "monthlyRevenue": 25000
}
```

---

## 👤 Patient Management Endpoints

### 1. Get All Patients (Paginated)
```http
GET /api/patients?search={search}&pageNumber={page}&pageSize={size}
```

**Query Parameters:**
- `search` (optional): Search by name, phone, or email
- `pageNumber` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 10)

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+381641234567",
      "email": "john.doe@example.com",
      "dateOfBirth": "1990-05-15",
      "address": "Bulevar Kralja Aleksandra 73",
      "gender": "Male",
      "jmbg": "1505990123456",
      "profilePicture": "/uploads/patients/1/avatar.jpg",
      "statusId": 1,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "totalCount": 150,
  "pageNumber": 1,
  "pageSize": 10
}
```

### 2. Get Patient by ID
```http
GET /api/patients/:id
```

**Response:** Single patient object (same structure as above)

### 3. Create New Patient
```http
POST /api/patients
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+381641234568",
  "email": "jane.smith@example.com",
  "dateOfBirth": "1985-03-20",
  "address": "Kneza Miloša 50",
  "gender": "Female",
  "jmbg": "2003985123457",
  "statusId": 1,
  "medicalConditions": ["Diabetes", "Hypertension"]
}
```

**Validation Rules:**
- `firstName`: required, max 100 chars
- `lastName`: required, max 100 chars
- `phone`: required, max 20 chars
- `email`: optional, valid email format, max 255 chars
- `dateOfBirth`: required, ISO date format
- `gender`: required, "Male" or "Female"
- `jmbg`: required, exactly 13 digits, unique
- `statusId`: required, integer 1-5
- `medicalConditions`: optional, array of strings

**Response:** 201 Created with patient object

### 4. Update Patient
```http
PUT /api/patients/:id
PATCH /api/patients/:id
Content-Type: application/json
```

**Request Body:** Same as create, all fields optional for PATCH

**Response:** 200 OK with updated patient object

### 5. Delete Patient
```http
DELETE /api/patients/:id
```

**Response:** 204 No Content

---

## 📅 Appointment Endpoints

### 1. Get Appointments
```http
GET /api/appointments?patientId={id}&date={date}&pageNumber={page}&pageSize={size}
```

**Query Parameters:**
- `patientId` (optional): Filter by patient
- `date` (optional): Filter by date (ISO format)
- `pageNumber` (optional): default 1
- `pageSize` (optional): default 10

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "patientId": 1,
      "appointmentDate": "2024-10-10T14:30:00Z",
      "duration": 60,
      "description": "Regular checkup and cleaning",
      "status": "scheduled",
      "serviceKey": "cleaning",
      "serviceName": "Dental Cleaning",
      "staffKey": "dr-smith",
      "staffName": "Dr. Smith",
      "cost": 5000,
      "currency": "EUR",
      "setmoreAppointmentKey": "abc123",
      "customerKey": "cust456",
      "createdAt": "2024-10-01T10:00:00Z",
      "updatedAt": "2024-10-01T10:00:00Z"
    }
  ],
  "totalCount": 25,
  "pageNumber": 1,
  "pageSize": 10
}
```

### 2. Get Today's Appointments
```http
GET /api/appointments/today
```

**Response:** Array of appointment objects for current date

### 3. Create Appointment
```http
POST /api/appointments
Content-Type: application/json
```

**Request Body:**
```json
{
  "patientId": 1,
  "appointmentDate": "2024-10-15T10:00:00Z",
  "duration": 45,
  "description": "Root canal treatment",
  "status": "scheduled",
  "serviceKey": "root-canal",
  "serviceName": "Root Canal",
  "staffKey": "dr-smith",
  "staffName": "Dr. Smith",
  "cost": 15000,
  "currency": "EUR"
}
```

**Validation:**
- `patientId`: required, integer
- `appointmentDate`: required, ISO datetime
- `duration`: required, integer (minutes)
- `status`: required, one of: "scheduled", "completed", "cancelled"
- `cost`: required, integer (in cents)
- `currency`: required, one of: "EUR", "RSD", "CHF"

**Response:** 201 Created with appointment object

---

## 📁 File Management Endpoints

### 1. Get Patient Files
```http
GET /api/patients/:patientId/files
```

**Response:**
```json
[
  {
    "id": 1,
    "patientId": 1,
    "fileName": "xray_panoramic_2024.jpg",
    "filePath": "/uploads/patients/1/xray_panoramic_2024.jpg",
    "fileType": "image/jpeg",
    "fileSize": 2048000,
    "description": "Panoramic X-ray - October 2024",
    "thumbnailPath": "/uploads/patients/1/thumb_xray_panoramic_2024.jpg",
    "category": "xray",
    "tags": ["panoramic", "pre-treatment"],
    "toothNumbers": [14, 15, 16],
    "treatmentDate": "2024-10-08",
    "metadata": { "resolution": "3000x1500", "dpi": 300 },
    "uploadedAt": "2024-10-08T14:20:00Z"
  }
]
```

### 2. Upload File
```http
POST /api/files
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: File (required)
- `patientId`: integer (required)
- `category`: string (required) - "xray", "photo", "model", "document"
- `description`: string (optional)
- `tags`: JSON array (optional)
- `toothNumbers`: JSON array of integers (optional)
- `treatmentDate`: ISO date (optional)

**Response:** 201 Created with file object

### 3. Get File Content
```http
GET /api/files/:fileId/content
```

**Response:** 302 Redirect to file URL or file stream

### 4. Delete File
```http
DELETE /api/files/:id
```

**Response:** 204 No Content

---

## 🦷 Odontogram (Tooth Records) Endpoints

### 1. Get Patient Teeth
```http
GET /api/patients/:patientId/teeth
```

**Response:**
```json
[
  {
    "id": 1,
    "patientId": 1,
    "toothNumber": 16,
    "condition": "caries",
    "surfaces": "MO",
    "treatment": "Composite filling",
    "treatmentDate": "2024-10-05",
    "notes": "Large carious lesion on mesial and occlusal surfaces",
    "color": "#ff6b6b",
    "isCompleted": true,
    "appointmentId": 5,
    "createdAt": "2024-10-05T15:30:00Z",
    "updatedAt": "2024-10-05T15:30:00Z"
  }
]
```

### 2. Create Tooth Record
```http
POST /api/teeth
Content-Type: application/json
```

**Request Body:**
```json
{
  "patientId": 1,
  "toothNumber": 16,
  "condition": "filled",
  "surfaces": "MOD",
  "treatment": "Composite restoration",
  "treatmentDate": "2024-10-08",
  "notes": "3-surface amalgam replacement with composite",
  "color": "#4dabf7",
  "isCompleted": true,
  "appointmentId": 8
}
```

**Tooth Conditions:**
- healthy, caries, filled, crown, bridge, root_canal, extracted, implant, missing, fractured

**Surface Notations:**
- M = Mesial
- O = Occlusal
- D = Distal
- B = Buccal
- L = Lingual
- I = Incisal

**Validation:**
- `toothNumber`: required, integer 1-32 (Universal Numbering), or 11-48 (ISO 3950/FDI)
- `condition`: required, max 50 chars
- `color`: optional, hex color code

**Response:** 201 Created with tooth record object

### 3. Update Tooth Record
```http
PUT /api/teeth/:id
```

**Response:** 200 OK with updated tooth record

### 4. Delete Tooth Record
```http
DELETE /api/teeth/:id
```

**Response:** 204 No Content

---

## 📝 Medical Notes Endpoints

### 1. Get Patient Medical Notes
```http
GET /api/patients/:patientId/medical-notes
```

**Response:**
```json
[
  {
    "id": 1,
    "patientId": 1,
    "title": "Post-operative checkup",
    "content": "Patient recovered well from extraction. No signs of infection. Advised to continue antibiotics for 3 more days.",
    "noteType": "follow-up",
    "createdBy": "Dr. Smith",
    "createdAt": "2024-10-08T11:00:00Z",
    "updatedAt": "2024-10-08T11:00:00Z"
  }
]
```

### 2. Create Medical Note
```http
POST /api/patients/:patientId/medical-notes
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Initial Consultation",
  "content": "Patient complains of sensitivity on upper right molars. Visible decay on tooth 16. Recommended filling.",
  "noteType": "diagnosis",
  "createdBy": "Dr. Smith"
}
```

**Note Types:** general, treatment, diagnosis, follow-up

**Response:** 201 Created with medical note object

---

## 💼 Treatment History Endpoints

### 1. Get Patient Treatment History
```http
GET /api/patients/:patientId/treatment-history
```

**Response:**
```json
[
  {
    "id": 1,
    "patientId": 1,
    "appointmentId": 3,
    "treatmentType": "Filling",
    "description": "Composite filling on tooth 16, MOD surfaces",
    "toothNumbers": "16",
    "duration": 45,
    "cost": 8000,
    "currency": "EUR",
    "status": "completed",
    "notes": "Patient tolerated procedure well",
    "performedBy": "Dr. Smith",
    "performedAt": "2024-10-05T14:00:00Z",
    "createdAt": "2024-10-05T14:00:00Z"
  }
]
```

### 2. Create Treatment Record
```http
POST /api/patients/:patientId/treatment-history
Content-Type: application/json
```

**Request Body:**
```json
{
  "appointmentId": 5,
  "treatmentType": "Root Canal",
  "description": "Root canal treatment on tooth 14",
  "toothNumbers": "14",
  "duration": 90,
  "cost": 25000,
  "currency": "EUR",
  "status": "completed",
  "notes": "First session completed. Schedule second visit in 1 week.",
  "performedBy": "Dr. Smith"
}
```

**Response:** 201 Created with treatment record object

---

## 💰 Financial Endpoints

### 1. Create Financial Transaction
```http
POST /api/financial-transactions
Content-Type: application/json
```

**Request Body:**
```json
{
  "patientId": 1,
  "type": "payment",
  "amount": 5000,
  "currency": "EUR",
  "appointmentId": 5,
  "treatmentId": null,
  "paymentMethod": "card",
  "transactionReference": "TXN-2024-001",
  "recordedBy": 1,
  "description": "Payment for dental cleaning",
  "category": "treatment",
  "notes": "Paid by credit card",
  "status": "completed"
}
```

**Transaction Types:** payment, charge, refund, adjustment
**Payment Methods:** cash, card, bank_transfer, insurance
**Currencies:** EUR, RSD, CHF
**Status:** completed, pending, cancelled, refunded

**Validation:**
- `amount`: integer (in smallest currency unit - cents/paras)
- `type`: required
- `currency`: required, one of EUR/RSD/CHF
- `recordedBy`: required, employee ID

**Response:** 201 Created with transaction object

### 2. Get Patient Transactions
```http
GET /api/patients/:patientId/transactions
```

**Response:** Array of transaction objects

### 3. Get Patient Financial Summary
```http
GET /api/patients/:patientId/financial-summary
```

**Response:**
```json
{
  "patientId": 1,
  "totalCharges": {
    "EUR": 50000,
    "RSD": 0,
    "CHF": 0
  },
  "totalPayments": {
    "EUR": 30000,
    "RSD": 0,
    "CHF": 0
  },
  "balance": {
    "EUR": 20000,
    "RSD": 0,
    "CHF": 0
  }
}
```

### 4. Update Transaction
```http
PATCH /api/financial-transactions/:id
Content-Type: application/json
```

**Request Body:** Any transaction fields to update

**Response:** 200 OK with updated transaction

---

## 👥 Employee Management Endpoints

### 1. Get All Employees
```http
GET /api/employees?search={search}&roleId={roleId}
```

**Response:**
```json
[
  {
    "id": 1,
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@dentalcare.com",
    "phone": "+381641111111",
    "roleId": 1,
    "isActive": true,
    "hireDate": "2024-01-01",
    "createdAt": "2024-01-01T08:00:00Z"
  }
]
```

### 2. Get Employee by ID
```http
GET /api/employees/:id
```

### 3. Create Employee
```http
POST /api/employees
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Dentist",
  "email": "john.dentist@dentalcare.com",
  "phone": "+381642222222",
  "roleId": 2,
  "password": "securePassword123",
  "hireDate": "2024-10-01"
}
```

**Response:** 201 Created

### 4. Update Employee
```http
PUT /api/employees/:id
```

### 5. Delete Employee
```http
DELETE /api/employees/:id
```

### 6. Update Employee Status
```http
PATCH /api/employees/:id/status
Content-Type: application/json
```

**Request Body:**
```json
{
  "isActive": false
}
```

---

## 🔐 Role Management Endpoints

### 1. Get All Roles
```http
GET /api/roles
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Administrator",
    "description": "Full system access",
    "permissions": ["all"],
    "createdAt": "2024-01-01T08:00:00Z"
  }
]
```

### 2. Get Role by ID
```http
GET /api/roles/:id
```

### 3. Create Role
```http
POST /api/roles
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Receptionist",
  "description": "Front desk operations",
  "permissions": ["patients.view", "patients.create", "appointments.manage"]
}
```

### 4. Update Role
```http
PUT /api/roles/:id
```

### 5. Delete Role
```http
DELETE /api/roles/:id
```

---

## ⚙️ Settings Endpoints

### 1. Get User Settings
```http
GET /api/settings/:employeeId
```

**Response:**
```json
{
  "id": 1,
  "employeeId": 1,
  "showRevenue": true,
  "language": "en",
  "theme": "light",
  "notifications": true,
  "updatedAt": "2024-10-08T10:00:00Z"
}
```

### 2. Update Settings
```http
PUT /api/settings/:employeeId
Content-Type: application/json
```

**Request Body:**
```json
{
  "showRevenue": false,
  "language": "sr",
  "theme": "dark"
}
```

---

## 🔑 Authentication Endpoints

### Login
```http
POST /api/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "admin@dentalcare.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@dentalcare.com",
    "roleId": 1
  }
}
```

**Default Credentials:**
- Email: admin@dentalcare.com
- Password: admin123

---

## 📦 Setmore Integration Endpoints

### 1. Get Services
```http
GET /api/setmore/services
```

### 2. Get Staff
```http
GET /api/setmore/staff
```

### 3. Get Available Slots
```http
POST /api/setmore/slots
Content-Type: application/json
```

**Request Body:**
```json
{
  "staffKey": "dr-smith",
  "serviceKey": "cleaning",
  "date": "2024-10-15"
}
```

### 4. Create Setmore Appointment
```http
POST /api/appointments/setmore
Content-Type: application/json
```

---

## 📊 Data Models

### Patient Status IDs
```csharp
public enum PatientStatus
{
    Active = 1,        // Currently receiving treatment
    Inactive = 2,      // Not currently receiving treatment
    Completed = 3,     // Treatment completed
    Suspended = 4,     // Treatment temporarily suspended
    Transferred = 5    // Transferred to another clinic
}
```

### Currency Codes
- **EUR** - Euro (€)
- **RSD** - Serbian Dinar (дин)
- **CHF** - Swiss Franc (Fr)

### File Categories
- **xray** - X-ray images
- **photo** - Clinical photographs
- **model** - 3D scans/models
- **document** - PDFs, documents

### Tooth Numbering System
The system supports **Universal Numbering System (1-32)** and **ISO 3950/FDI (11-48)**

**Universal:**
- Upper: 1-16 (right to left)
- Lower: 32-17 (left to right)

**ISO 3950/FDI:**
- Upper right: 11-18
- Upper left: 21-28
- Lower left: 31-38
- Lower right: 41-48

---

## 🔄 Error Responses

### 400 Bad Request
```json
{
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 404 Not Found
```json
{
  "message": "Patient not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Failed to create patient"
}
```

---

## 📝 Notes for C# Implementation

### Currency Handling
- Store amounts as **integers** in smallest currency unit (cents for EUR/CHF, paras for RSD)
- EUR: 1€ = 100 cents
- RSD: 1дин = 100 para
- CHF: 1Fr = 100 centimes

### Date Formats
- All dates use **ISO 8601** format
- Timestamps include timezone (UTC)
- Date-only fields: "YYYY-MM-DD"
- DateTime fields: "YYYY-MM-DDTHH:mm:ssZ"

### File Upload
- Use **multipart/form-data**
- Max file size: 10MB
- Supported types: PDF, JPG, PNG, DOC, DOCX
- Store files in `/uploads/patients/{patientId}/` directory

### Pagination
- Default page size: 10
- Page numbers start at 1
- Always return `totalCount`, `pageNumber`, `pageSize` in response

---

## 🚀 Getting Started with C# Backend

1. **Create Models** using the schemas defined above
2. **Implement Controllers** for each endpoint group
3. **Add Validation** using Data Annotations or FluentValidation
4. **Configure CORS** to allow frontend access
5. **Setup Authentication** using ASP.NET Identity or JWT
6. **Implement File Storage** using local filesystem or cloud storage
7. **Add Logging** for debugging and monitoring

---

*Last Updated: October 2025*
