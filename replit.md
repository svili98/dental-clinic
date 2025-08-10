# Overview

DentalCare is a full-stack dental clinic management system built with modern web technologies. The application provides comprehensive patient management, appointment scheduling, file storage, and medical record keeping capabilities for dental practices. It features a React-based frontend with TypeScript for type safety, an Express.js backend with in-memory storage, and a PostgreSQL database using Drizzle ORM for data persistence.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes

## August 10, 2025 - Migration from Replit Agent to Replit Environment
- Successfully migrated project from Replit Agent to standard Replit environment
- Resolved dependency installation issues and ensured all packages are properly installed
- Fixed API parameter order issues in authentication and data mutations
- Corrected employee seeding to prevent ID conflicts in storage
- Verified application startup and all API endpoints are functioning correctly
- Authentication system working properly with admin@dentalcare.com / admin123 credentials
- Application now runs cleanly on Replit infrastructure with proper security practices
- All existing functionality preserved including employee management, appointments, odontogram, and patient records

# Recent Changes

## August 10, 2025 - Comprehensive Dental File Management System Enhancement
- Enhanced patient file system to handle all types of dental files: X-rays, clinical photos, 3D models, and documents
- Added dental-specific file categories with proper icons and acceptance rules (DICOM, STL, HEIC support)
- Built comprehensive file upload interface with category selection, metadata forms, and tag management
- Added support for tooth number associations, treatment dates, and detailed file descriptions
- Created enhanced file list component with category filtering, search, and professional dental file organization
- Improved file preview system with dental-specific viewing controls for X-rays and clinical images
- Updated database schema to support dental file categories, tags, tooth associations, and metadata
- All file types properly categorized: X-Ray Images, Clinical Photos, 3D Models & Scans, Documents & Reports
- Professional dental workflow with proper file organization and searchable metadata

## August 10, 2025 - Complete Migration from Replit Agent to Replit Environment
- Successfully completed migration from Replit Agent to standard Replit environment
- Fixed all dependency installation issues and verified all packages are properly installed
- Resolved authentication system issues and confirmed login functionality works correctly
- Fixed multiple API request parameter order issues in frontend code (apiRequest calls)
- Corrected employee seeding data to prevent ID conflicts and ensure admin account accessibility
- Application now runs cleanly on port 5000 with all core functionality operational
- All existing features preserved: employee management, appointments, odontogram, patient records, and settings
- Admin login credentials confirmed working: admin@dentalcare.com / admin123

## August 8, 2025 - Employee Management and Role-Based Access Control System
- Created comprehensive employee management system with PostgreSQL database integration
- Added roles, employees, and user sessions tables with proper relationships and foreign key constraints
- Built complete employee management interface with search, filtering, and status management
- Implemented role-based permission system (Administrator, Dentist, Dental Assistant, Receptionist)
- Created tabbed settings page with General Settings, Employee Management, and Permissions sections
- Added employee statistics dashboard showing total, active, inactive employees and roles
- Built permission matrix showing detailed access rights for each role across all system features
- Employee management includes profile information, role assignment, and activation/deactivation
- All employee data stored in database with proper validation and type safety using Drizzle ORM
- Settings page now provides comprehensive user access control and permission management

## August 8, 2025 - Complete Setmore Appointment System with Calendar and Booking
- Successfully integrated Setmore API with full mock data support for development mode
- Enhanced appointment schema with all Setmore-specific fields (service keys, staff keys, customer data)
- Built complete appointment booking modal with patient selection, service selection, and time slot booking
- Implemented comprehensive calendar view with monthly navigation and appointment visualization
- Added services management page showing all available dental treatments and healthcare providers
- Created tabbed appointments page with both calendar and list views
- Updated patient details page with integrated appointment booking functionality
- Fixed Setmore integration to use mock data in development with clear production switch comments
- Added services navigation link to sidebar for easy access to treatment options
- Created comprehensive financial recording system supporting both payments and outstanding balances
- Fixed odontogram layout to match proper FDI World Dental Federation numbering system
- All appointment booking functionality working with proper data flow and calendar integration

## August 7, 2025 - Comprehensive Odontogram Implementation
- Successfully migrated project from Replit Agent to Replit environment
- Added complete odontogram (dental chart) functionality to patient details:
  - Database schema for tooth records with Universal Numbering System (1-32)
  - Support for 14 different tooth conditions (healthy, caries, filled, crown, etc.)
  - Color-coded visual representation of all teeth
  - Interactive tooth selection with detailed condition editing
  - Surface notation support (M, O, D, B/L, I) for precise treatment tracking
  - Treatment history and notes for each tooth
  - Professional dental charting with proper legend and symbols
- Backend API implementation:
  - RESTful endpoints for CRUD operations on tooth records
  - Proper validation using Zod schemas
  - Integration with existing patient management system
- Frontend implementation:
  - Comprehensive odontogram UI component with visual tooth chart
  - Modal dialogs for editing tooth conditions and treatments
  - Integration with patient details page for easy access
  - Responsive design with professional dental clinic aesthetics
- All functionality tested and working correctly with proper data flow

## January 6, 2025 - Enhanced Patient Details and Medical Records
- Fixed medical-records route functionality - now fully working with comprehensive patient selection
- Enhanced patient details page with detailed treatment history showing:
  - Treatment notes and comments for each appointment
  - Doctor information and treatment IDs
  - Duration and fee information
  - Follow-up requirements
- Added comprehensive financial tracking system:
  - Payment summary cards (Total Paid, Outstanding, Total Due)
  - Outstanding payment details with due dates
  - Patient financial overview in sidebar
  - Record payment functionality
- Improved appointment history display with:
  - Detailed treatment descriptions
  - Status indicators and completion notes
  - Treatment progression tracking
  - Professional medical record format

## January 6, 2025 - Dashboard and Patient Form Improvements
- Removed "Files Uploaded" statistic from dashboard per user feedback
- Updated dashboard to show only 3 key metrics: Total Patients, Today's Appointments, Monthly Revenue
- Enhanced patient creation form with medical conditions selection:
  - Added 15 common medical conditions with checkbox selection
  - Visual display of selected conditions with removal capability
  - Professional medical conditions tracking
- Added file upload capability to patient creation:
  - Drag-and-drop file upload interface
  - Support for PDF, JPG, PNG, DOC, DOCX files
  - File size display and removal functionality
  - Professional document management during patient registration
- Created comprehensive Settings page for administrators:
  - Revenue visibility controls for different user roles
  - Administrator vs Staff member permission management
  - Financial data access configuration
  - Professional role-based access control system

# System Architecture

## Frontend Architecture

The frontend is built as a Single Page Application (SPA) using React 18 with TypeScript for enhanced type safety and developer experience. The application uses Vite as the build tool for fast development and optimized production builds.

**State Management**: The application employs a hybrid approach using React Query (TanStack Query) for server state management combined with React's built-in useState for local UI state. This separation ensures efficient data fetching, caching, and synchronization with the backend while keeping local state management simple.

**UI Framework**: The project uses shadcn/ui components built on top of Radix UI primitives, providing accessible and customizable components. Tailwind CSS handles styling with a custom medical theme incorporating dental-specific color schemes and design patterns.

**Routing**: Wouter is used for client-side routing, providing a lightweight alternative to React Router with similar functionality.

**Component Structure**: Components are organized into feature-based folders (patients, appointments, files) with shared UI components in a common directory. This promotes code reusability and maintainable architecture.

## Backend Architecture

The backend follows a simplified REST API design using Express.js with TypeScript. Currently implements an in-memory storage pattern but is architected to easily transition to database persistence.

**API Design**: RESTful endpoints follow standard HTTP conventions with consistent response formats. The API includes routes for patients, appointments, files, and dashboard statistics.

**Data Validation**: Zod schemas provide runtime type validation and are shared between frontend and backend through the shared directory, ensuring type consistency across the application.

**Error Handling**: Centralized error handling middleware captures and formats errors consistently across all endpoints.

**File Handling**: The system includes file upload capabilities for patient documents and medical images, with proper file type validation and storage management.

## Data Storage Strategy

**Database**: PostgreSQL is configured as the primary database with Drizzle ORM providing type-safe database operations and migrations.

**Schema Design**: The database schema includes core entities for patients, appointments, medical conditions, and patient files with proper relationships and constraints. Audit fields track creation and modification timestamps.

**Current Implementation**: The application currently uses in-memory storage for development, with the storage interface designed to seamlessly transition to database operations.

## Authentication and Authorization

The current implementation includes session-based authentication infrastructure with placeholder for future authentication implementation. The system is prepared for role-based access control for different user types (doctors, staff, administrators).

# External Dependencies

## UI and Design System
- **shadcn/ui**: Component library built on Radix UI primitives
- **Radix UI**: Accessible, unstyled UI components
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography

## State Management and Data Fetching
- **TanStack React Query**: Server state management and caching
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime schema validation

## Database and ORM
- **Drizzle ORM**: Type-safe ORM for PostgreSQL
- **Neon Database**: Serverless PostgreSQL database service
- **PostgreSQL**: Primary database system

## Development and Build Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type-safe JavaScript development
- **ESBuild**: Fast JavaScript bundler for production builds

## File Upload and Handling
- **React Dropzone**: Drag-and-drop file upload interface

## Date and Time Management
- **date-fns**: Modern JavaScript date utility library

## Navigation and Routing
- **Wouter**: Lightweight client-side routing

## Session Management
- **connect-pg-simple**: PostgreSQL session store for Express sessions