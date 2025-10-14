// DentalCare C# Data Models
// Complete model definitions for ASP.NET Core backend

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DentalCare.Models
{
    // ==================== ENUMS ====================
    
    public enum PatientStatus
    {
        Active = 1,
        Inactive = 2,
        Completed = 3,
        Suspended = 4,
        Transferred = 5
    }

    public enum Gender
    {
        Male,
        Female
    }

    public enum Currency
    {
        EUR,
        RSD,
        CHF
    }

    public enum AppointmentStatus
    {
        Scheduled,
        Completed,
        Cancelled
    }

    public enum TransactionType
    {
        Payment,
        Charge,
        Refund,
        Adjustment
    }

    public enum PaymentMethod
    {
        Cash,
        Card,
        BankTransfer,
        Insurance
    }

    public enum FileCategory
    {
        Xray,
        Photo,
        Model,
        Document,
        General
    }

    public enum NoteType
    {
        General,
        Treatment,
        Diagnosis,
        FollowUp
    }

    // ==================== PATIENT MODELS ====================

    [Table("patients")]
    public class Patient
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("first_name")]
        public string FirstName { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("last_name")]
        public string LastName { get; set; }

        [Required]
        [MaxLength(20)]
        [Column("phone")]
        public string Phone { get; set; }

        [EmailAddress]
        [MaxLength(255)]
        [Column("email")]
        public string Email { get; set; }

        [Required]
        [Column("date_of_birth", TypeName = "date")]
        public DateTime DateOfBirth { get; set; }

        [Column("address")]
        public string Address { get; set; }

        [Required]
        [MaxLength(10)]
        [Column("gender")]
        public string Gender { get; set; }

        [Required]
        [StringLength(13, MinimumLength = 13)]
        [Column("jmbg")]
        public string Jmbg { get; set; } // Unique national ID

        [MaxLength(500)]
        [Column("profile_picture")]
        public string ProfilePicture { get; set; }

        [Required]
        [Column("status_id")]
        public int StatusId { get; set; } = 1;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public virtual ICollection<Appointment> Appointments { get; set; }
        public virtual ICollection<PatientFile> Files { get; set; }
        public virtual ICollection<ToothRecord> ToothRecords { get; set; }
        public virtual ICollection<MedicalNote> MedicalNotes { get; set; }
        public virtual ICollection<TreatmentHistory> TreatmentHistory { get; set; }
        public virtual ICollection<FinancialTransaction> Transactions { get; set; }
        public virtual ICollection<PatientMedicalCondition> MedicalConditions { get; set; }
        public virtual ICollection<PaymentRecord> PaymentRecords { get; set; }
    }

    // ==================== APPOINTMENT MODELS ====================

    [Table("appointments")]
    public class Appointment
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("patient_id")]
        public int PatientId { get; set; }

        [Required]
        [Column("appointment_date")]
        public DateTime AppointmentDate { get; set; }

        [Required]
        [Column("duration")]
        public int Duration { get; set; } = 30; // minutes

        [Column("description")]
        public string Description { get; set; }

        [Required]
        [MaxLength(20)]
        [Column("status")]
        public string Status { get; set; } = "scheduled";

        // Setmore Integration Fields
        [MaxLength(100)]
        [Column("setmore_appointment_key")]
        public string SetmoreAppointmentKey { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("service_key")]
        public string ServiceKey { get; set; } = "cleaning";

        [Required]
        [MaxLength(200)]
        [Column("service_name")]
        public string ServiceName { get; set; } = "Dental Cleaning";

        [Required]
        [MaxLength(100)]
        [Column("staff_key")]
        public string StaffKey { get; set; } = "dr-smith";

        [Required]
        [MaxLength(200)]
        [Column("staff_name")]
        public string StaffName { get; set; } = "Dr. Smith";

        [Required]
        [Column("cost")]
        public int Cost { get; set; } = 0; // in cents/paras

        [Required]
        [MaxLength(5)]
        [Column("currency")]
        public string Currency { get; set; } = "EUR";

        [MaxLength(100)]
        [Column("customer_key")]
        public string CustomerKey { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("PatientId")]
        public virtual Patient Patient { get; set; }
    }

    // ==================== FILE MODELS ====================

    [Table("patient_files")]
    public class PatientFile
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("patient_id")]
        public int PatientId { get; set; }

        [Required]
        [MaxLength(255)]
        [Column("file_name")]
        public string FileName { get; set; }

        [Required]
        [MaxLength(500)]
        [Column("file_path")]
        public string FilePath { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("file_type")]
        public string FileType { get; set; }

        [Required]
        [Column("file_size")]
        public int FileSize { get; set; }

        [Column("description")]
        public string Description { get; set; }

        [MaxLength(500)]
        [Column("thumbnail_path")]
        public string ThumbnailPath { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("category")]
        public string Category { get; set; } = "general";

        [Column("tags", TypeName = "text[]")]
        public string[] Tags { get; set; }

        [Column("tooth_numbers", TypeName = "integer[]")]
        public int[] ToothNumbers { get; set; }

        [Column("treatment_date", TypeName = "date")]
        public DateTime? TreatmentDate { get; set; }

        [Column("metadata", TypeName = "jsonb")]
        public string Metadata { get; set; } // JSON string

        [Column("uploaded_at")]
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("PatientId")]
        public virtual Patient Patient { get; set; }
    }

    // ==================== TOOTH RECORD MODELS ====================

    [Table("tooth_records")]
    public class ToothRecord
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("patient_id")]
        public int PatientId { get; set; }

        [Required]
        [Column("tooth_number")]
        public int ToothNumber { get; set; } // 1-32 Universal or 11-48 ISO

        [Required]
        [MaxLength(50)]
        [Column("condition")]
        public string Condition { get; set; } = "healthy";

        [MaxLength(20)]
        [Column("surfaces")]
        public string Surfaces { get; set; } // M, O, D, B/L, I

        [MaxLength(100)]
        [Column("treatment")]
        public string Treatment { get; set; }

        [Column("treatment_date", TypeName = "date")]
        public DateTime? TreatmentDate { get; set; }

        [Column("notes")]
        public string Notes { get; set; }

        [Required]
        [MaxLength(20)]
        [Column("color")]
        public string Color { get; set; } = "#ffffff";

        [Required]
        [Column("is_completed")]
        public bool IsCompleted { get; set; } = true;

        [Column("appointment_id")]
        public int? AppointmentId { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("PatientId")]
        public virtual Patient Patient { get; set; }

        [ForeignKey("AppointmentId")]
        public virtual Appointment Appointment { get; set; }
    }

    // ==================== MEDICAL NOTE MODELS ====================

    [Table("medical_notes")]
    public class MedicalNote
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("patient_id")]
        public int PatientId { get; set; }

        [Required]
        [MaxLength(255)]
        [Column("title")]
        public string Title { get; set; }

        [Required]
        [Column("content")]
        public string Content { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("note_type")]
        public string NoteType { get; set; } = "general";

        [Required]
        [MaxLength(100)]
        [Column("created_by")]
        public string CreatedBy { get; set; } = "Dr. Smith";

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("PatientId")]
        public virtual Patient Patient { get; set; }
    }

    // ==================== TREATMENT HISTORY MODELS ====================

    [Table("treatment_history")]
    public class TreatmentHistory
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("patient_id")]
        public int PatientId { get; set; }

        [Column("appointment_id")]
        public int? AppointmentId { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("treatment_type")]
        public string TreatmentType { get; set; }

        [Required]
        [Column("description")]
        public string Description { get; set; }

        [MaxLength(100)]
        [Column("tooth_numbers")]
        public string ToothNumbers { get; set; } // e.g., "1,2,3"

        [Required]
        [Column("duration")]
        public int Duration { get; set; } = 30;

        [Required]
        [Column("cost")]
        public int Cost { get; set; } = 0; // in cents/paras

        [Required]
        [MaxLength(3)]
        [Column("currency")]
        public string Currency { get; set; } = "EUR";

        [Required]
        [MaxLength(20)]
        [Column("status")]
        public string Status { get; set; } = "completed";

        [Column("notes")]
        public string Notes { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("performed_by")]
        public string PerformedBy { get; set; } = "Dr. Smith";

        [Column("performed_at")]
        public DateTime PerformedAt { get; set; } = DateTime.UtcNow;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("PatientId")]
        public virtual Patient Patient { get; set; }

        [ForeignKey("AppointmentId")]
        public virtual Appointment Appointment { get; set; }
    }

    // ==================== FINANCIAL TRANSACTION MODELS ====================

    [Table("financial_transactions")]
    public class FinancialTransaction
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("patient_id")]
        public int PatientId { get; set; }

        [Required]
        [MaxLength(20)]
        [Column("type")]
        public string Type { get; set; } // payment, charge, refund, adjustment

        [Required]
        [Column("amount")]
        public int Amount { get; set; } // positive for charges, negative for payments

        [Required]
        [MaxLength(3)]
        [Column("currency")]
        public string Currency { get; set; } = "EUR";

        [Column("appointment_id")]
        public int? AppointmentId { get; set; }

        [Column("treatment_id")]
        public int? TreatmentId { get; set; }

        [MaxLength(50)]
        [Column("payment_method")]
        public string PaymentMethod { get; set; }

        [MaxLength(100)]
        [Column("transaction_reference")]
        public string TransactionReference { get; set; }

        [Required]
        [Column("recorded_by")]
        public int RecordedBy { get; set; }

        [Column("authorized_by")]
        public int? AuthorizedBy { get; set; }

        [Required]
        [Column("description")]
        public string Description { get; set; }

        [MaxLength(50)]
        [Column("category")]
        public string Category { get; set; }

        [Column("notes")]
        public string Notes { get; set; }

        [Required]
        [MaxLength(20)]
        [Column("status")]
        public string Status { get; set; } = "completed";

        [Column("processed_at")]
        public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("PatientId")]
        public virtual Patient Patient { get; set; }

        [ForeignKey("AppointmentId")]
        public virtual Appointment Appointment { get; set; }

        [ForeignKey("TreatmentId")]
        public virtual TreatmentHistory Treatment { get; set; }

        [ForeignKey("RecordedBy")]
        public virtual Employee RecordedByEmployee { get; set; }

        [ForeignKey("AuthorizedBy")]
        public virtual Employee AuthorizedByEmployee { get; set; }
    }

    // ==================== EMPLOYEE MODELS ====================

    [Table("employees")]
    public class Employee
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("first_name")]
        public string FirstName { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("last_name")]
        public string LastName { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(255)]
        [Column("email")]
        public string Email { get; set; }

        [Required]
        [Column("password_hash")]
        public string PasswordHash { get; set; }

        [MaxLength(20)]
        [Column("phone")]
        public string Phone { get; set; }

        [Required]
        [Column("role_id")]
        public int RoleId { get; set; }

        [Required]
        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("hire_date", TypeName = "date")]
        public DateTime? HireDate { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("RoleId")]
        public virtual Role Role { get; set; }
    }

    // ==================== ROLE MODELS ====================

    [Table("roles")]
    public class Role
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("name")]
        public string Name { get; set; }

        [Column("description")]
        public string Description { get; set; }

        [Column("permissions", TypeName = "text[]")]
        public string[] Permissions { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public virtual ICollection<Employee> Employees { get; set; }
    }

    // ==================== SETTINGS MODELS ====================

    [Table("settings")]
    public class Settings
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("employee_id")]
        public int EmployeeId { get; set; }

        [Required]
        [Column("show_revenue")]
        public bool ShowRevenue { get; set; } = true;

        [Required]
        [MaxLength(10)]
        [Column("language")]
        public string Language { get; set; } = "en";

        [Required]
        [MaxLength(20)]
        [Column("theme")]
        public string Theme { get; set; } = "light";

        [Required]
        [Column("notifications")]
        public bool Notifications { get; set; } = true;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("EmployeeId")]
        public virtual Employee Employee { get; set; }
    }

    // ==================== DTO MODELS ====================

    // ==================== PAYMENT RECORD MODELS (Legacy) ====================

    [Table("payment_records")]
    public class PaymentRecord
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("patient_id")]
        public int PatientId { get; set; }

        [Column("appointment_id")]
        public int? AppointmentId { get; set; }

        [Column("treatment_id")]
        public int? TreatmentId { get; set; }

        [Required]
        [Column("amount")]
        public int Amount { get; set; } // in cents/paras

        [Required]
        [MaxLength(3)]
        [Column("currency")]
        public string Currency { get; set; } = "EUR";

        [Required]
        [MaxLength(50)]
        [Column("payment_method")]
        public string PaymentMethod { get; set; } = "cash";

        [Required]
        [MaxLength(20)]
        [Column("payment_status")]
        public string PaymentStatus { get; set; } = "completed";

        [MaxLength(100)]
        [Column("treatment_context")]
        public string TreatmentContext { get; set; }

        [MaxLength(100)]
        [Column("doctor_name")]
        public string DoctorName { get; set; }

        [Column("notes")]
        public string Notes { get; set; }

        [Column("paid_at")]
        public DateTime PaidAt { get; set; } = DateTime.UtcNow;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("PatientId")]
        public virtual Patient Patient { get; set; }

        [ForeignKey("AppointmentId")]
        public virtual Appointment Appointment { get; set; }

        [ForeignKey("TreatmentId")]
        public virtual TreatmentHistory Treatment { get; set; }
    }

    // ==================== MEDICAL CONDITION MODELS ====================

    [Table("medical_conditions")]
    public class MedicalCondition
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        [Column("name")]
        public string Name { get; set; }

        [Column("description")]
        public string Description { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    [Table("patient_medical_conditions")]
    public class PatientMedicalCondition
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("patient_id")]
        public int PatientId { get; set; }

        [Required]
        [Column("medical_condition_id")]
        public int MedicalConditionId { get; set; }

        [Column("diagnosed_date", TypeName = "date")]
        public DateTime? DiagnosedDate { get; set; }

        [Column("notes")]
        public string Notes { get; set; }

        [Required]
        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("PatientId")]
        public virtual Patient Patient { get; set; }

        [ForeignKey("MedicalConditionId")]
        public virtual MedicalCondition MedicalCondition { get; set; }
    }

    // ==================== DTO MODELS ====================

    // Request DTOs
    public class CreatePatientDto
    {
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; }

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; }

        [Required]
        [Phone]
        public string Phone { get; set; }

        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public DateTime DateOfBirth { get; set; }

        public string Address { get; set; }

        [Required]
        public string Gender { get; set; }

        [Required]
        [StringLength(13, MinimumLength = 13)]
        public string Jmbg { get; set; }

        public int StatusId { get; set; } = 1;

        // Medical conditions sent as array of condition names (not stored in Patient table)
        public List<string> MedicalConditions { get; set; }
    }

    public class CreateAppointmentDto
    {
        [Required]
        public int PatientId { get; set; }

        [Required]
        public DateTime AppointmentDate { get; set; }

        [Required]
        [Range(15, 240)]
        public int Duration { get; set; }

        public string Description { get; set; }

        [Required]
        public string Status { get; set; } = "scheduled";

        [Required]
        public string ServiceKey { get; set; }

        [Required]
        public string ServiceName { get; set; }

        [Required]
        public string StaffKey { get; set; }

        [Required]
        public string StaffName { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int Cost { get; set; }

        [Required]
        public string Currency { get; set; } = "EUR";
    }

    public class CreateToothRecordDto
    {
        [Required]
        public int PatientId { get; set; }

        [Required]
        [Range(1, 48)]
        public int ToothNumber { get; set; }

        [Required]
        public string Condition { get; set; }

        public string Surfaces { get; set; }

        public string Treatment { get; set; }

        public DateTime? TreatmentDate { get; set; }

        public string Notes { get; set; }

        public string Color { get; set; } = "#ffffff";

        public bool IsCompleted { get; set; } = true;

        public int? AppointmentId { get; set; }
    }

    public class CreateTransactionDto
    {
        [Required]
        public int PatientId { get; set; }

        [Required]
        public string Type { get; set; }

        [Required]
        public int Amount { get; set; }

        [Required]
        public string Currency { get; set; }

        public int? AppointmentId { get; set; }

        public int? TreatmentId { get; set; }

        public string PaymentMethod { get; set; }

        public string TransactionReference { get; set; }

        [Required]
        public int RecordedBy { get; set; }

        public int? AuthorizedBy { get; set; }

        [Required]
        public string Description { get; set; }

        public string Category { get; set; }

        public string Notes { get; set; }

        public string Status { get; set; } = "completed";
    }

    public class LoginDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }
    }

    // Response DTOs
    public class PaginatedResponse<T>
    {
        public List<T> Items { get; set; }
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
    }

    public class FinancialSummaryDto
    {
        public int PatientId { get; set; }
        public Dictionary<string, int> TotalCharges { get; set; }
        public Dictionary<string, int> TotalPayments { get; set; }
        public Dictionary<string, int> Balance { get; set; }
    }

    public class DashboardStatsDto
    {
        public int TotalPatients { get; set; }
        public int ActivePatients { get; set; }
        public int TodayAppointments { get; set; }
        public int MonthlyRevenue { get; set; }
    }

    public class LoginResponseDto
    {
        public EmployeeDto User { get; set; }
    }

    public class EmployeeDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public int RoleId { get; set; }
    }
}
