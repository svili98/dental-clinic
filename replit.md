# Overview

DentalCare is a full-stack dental clinic management system designed to streamline patient management, appointment scheduling, file storage, and medical record keeping. It aims to provide a comprehensive, modern solution for dental practices, enhancing efficiency and patient care. The system integrates a React-based frontend with an Express.js backend and a PostgreSQL database.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is a Single Page Application (SPA) built with React 18 and TypeScript, using Vite for development and optimized production builds.
- **State Management**: React Query (TanStack Query) handles server state, while React's `useState` manages local UI state for efficient data handling.
- **UI Framework**: `shadcn/ui` components, built on Radix UI primitives, provide accessible and customizable UI. Tailwind CSS is used for styling with a custom medical theme.
- **Routing**: Wouter is used for lightweight client-side routing.
- **Component Structure**: Components are organized feature-wise, promoting reusability and maintainability.

## Backend Architecture

The backend is a simplified REST API using Express.js with TypeScript. It supports an in-memory storage pattern, designed for easy transition to persistent database storage.
- **API Design**: Follows standard RESTful conventions for patients, appointments, files, and dashboard statistics.
- **Data Validation**: Zod schemas provide runtime type validation, shared between frontend and backend for consistency.
- **Error Handling**: Centralized middleware ensures consistent error formatting.
- **File Handling**: Includes file upload capabilities with validation and storage management for patient documents and medical images, supporting dental-specific file categories (X-rays, clinical photos, 3D models, documents) and metadata.

## Data Storage Strategy

- **Database**: PostgreSQL is the primary database, managed by Drizzle ORM for type-safe operations and migrations.
- **Schema Design**: Includes core entities for patients, appointments, medical conditions, and patient files with proper relationships and audit fields.
- **Current Implementation**: Utilizes in-memory storage for development, with a flexible interface for seamless transition to database operations.

## Authentication and Authorization

The system includes session-based authentication infrastructure, prepared for future implementation of role-based access control (Administrator, Dentist, Dental Assistant, Receptionist). It features a comprehensive employee management system and a permission matrix defining access rights across system features.

## Key Features Implemented

- **Patient Management**: Comprehensive patient details, medical history, financial overview, and detailed treatment history with profile picture support.
- **Appointment Scheduling**: Integration with a calendar view, service management, and booking modal, supporting mock data for development.
- **Odontogram**: Complete dental chart functionality with Universal Numbering System, interactive tooth selection, condition tracking, surface notation, and treatment history for each tooth.
- **File Management**: Streamlined system for X-rays, clinical photos, 3D models, and documents, with unified upload/view interface, category selection, metadata, tag management, image cropping, and clinical photo timeline view.
- **Medical Records**: Centralized medical records page with tabbed interface (Overview, Medical Notes, Odontogram, Treatments, Files, Clinical Photos) and cross-navigation from patient details. "Add Record" button functionality working correctly.
- **Financial System**: Unified multi-currency financial transaction system supporting EUR, RSD, and CHF with proper validation. Features centralized currency formatting, multi-currency financial totals, transaction history, and financial overview. Legacy payment systems removed for clarity.
- **Employee Management**: System with roles, search, filtering, status management, and role-based access control.
- **Settings Page**: Comprehensive administrative controls for general settings, employee management, and permissions.
- **Dashboard**: Streamlined dashboard with key metrics display (Total Patients, Today's Appointments, Monthly Revenue) and consolidated patient management.
- **Patient Avatars**: Professional avatar system with initials fallback for patients without profile pictures.

# External Dependencies

## UI and Design System
- **shadcn/ui**: Component library
- **Radix UI**: Accessible UI components
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

## State Management and Data Fetching
- **TanStack React Query**: Server state management
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime schema validation

## Database and ORM
- **Drizzle ORM**: Type-safe ORM for PostgreSQL
- **Neon Database**: Serverless PostgreSQL database service
- **PostgreSQL**: Primary database system

## Development and Build Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type-safe JavaScript
- **ESBuild**: Fast JavaScript bundler

## File Upload and Handling
- **React Dropzone**: Drag-and-drop file upload interface
- **react-image-crop**: Image cropping functionality

## Date and Time Management
- **date-fns**: Date utility library

## Navigation and Routing
- **Wouter**: Lightweight client-side routing

## Session Management
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## Currency Support
- **Multi-Currency System**: Supports EUR (€), RSD (дин), and CHF (Fr) currencies throughout the application
- **Centralized Currency Utilities**: `@/lib/currency.ts` provides consistent formatting and calculation functions
- **Multi-Currency Totals**: Financial overview displays separate totals for each currency used

## Recent Changes (January 2025)

### Application Simplification and Cleanup
- **Removed Duplicate Components**: Eliminated redundant payment-record-modal.tsx and use-payments.ts in favor of unified transaction system
- **Dashboard Streamlined**: Removed duplicate "Patient Management" section that showed same PatientTable as "Recent Patients"
- **File Management Simplified**: Consolidated duplicate file upload/view tabs into unified interface
- **Legacy Code Cleanup**: Removed appointments-new.tsx, settings-old.tsx, and other unused redundant files
- **Financial Interface Redesigned**: Consolidated to single Financial Overview + Transaction History layout in grid format
- **Navigation Improved**: Removed redundant "Medical Records" button from patient details header since functionality is integrated into the page