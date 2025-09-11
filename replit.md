# NAMASTE × ICD-11 Terminology Service

## Overview

This is a FHIR R4-compliant terminology microservice that integrates India's NAMASTE terminologies with WHO's ICD-11 Traditional Medicine Module 2 (TM2) and biomedicine codes. The service provides a complete solution for healthcare interoperability in India's AYUSH sector, enabling EMR systems to transition from paper-based records to standardized digital health systems.

The application features a modern React frontend with a comprehensive dashboard for terminology search, concept mapping, CSV data ingestion, FHIR bundle validation, and audit tracking. The backend provides RESTful APIs and FHIR-compliant endpoints for terminology operations, with AI-powered mapping suggestions using Google's Gemini AI.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite for build tooling
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM module system
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful APIs with FHIR-compliant endpoints for healthcare interoperability
- **Validation**: Zod schemas for request/response validation
- **Development**: Hot module replacement with Vite middleware integration

### Database Design
- **Primary Database**: PostgreSQL with Drizzle schema definitions
- **Core Tables**:
  - `terminology_codes`: Stores NAMASTE, ICD-11 TM2, and biomedicine terminology codes
  - `concept_mappings`: Manages relationships between different coding systems
  - `problem_list_entries`: FHIR-compliant problem list storage
  - `audit_events`: Comprehensive audit trail for all system operations
  - `users`: User management for authentication

### AI Integration
- **Service**: Google Gemini AI for intelligent terminology mapping
- **Functionality**: Automated suggestion of code mappings between NAMASTE and ICD-11 systems
- **Response Format**: Structured JSON with confidence scores and rationale

### Authentication & Security
- **Planned**: OAuth 2.0 integration with ABHA (Ayushman Bharat Health Account) tokens
- **Audit**: Comprehensive logging of all operations for compliance with India's 2016 EHR Standards
- **Standards Compliance**: ISO 22600 security measures and SNOMED-CT/LOINC semantic compatibility

## External Dependencies

### Core Infrastructure
- **Database**: PostgreSQL via Neon serverless database platform
- **Session Management**: PostgreSQL-based session storage using connect-pg-simple

### AI and Machine Learning
- **Google Gemini AI**: Powers intelligent terminology mapping suggestions and concept relationship analysis

### Healthcare Standards
- **FHIR R4**: Healthcare interoperability standard implementation
- **ICD-11 API**: WHO International Classification of Diseases integration
- **NAMASTE CSV**: India's National AYUSH Morbidity terminology system

### Development and Deployment
- **Replit Integration**: Development environment with runtime error overlays and cartographer plugin
- **Build System**: Vite with React plugin and esbuild for production builds
- **Package Management**: NPM with lock file for dependency consistency

### UI and Design System
- **Radix UI**: Accessible component primitives for complex UI components
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography
- **Google Fonts**: Inter, IBM Plex Mono, and Source Serif Pro typography

The system is designed to be lightweight, scalable, and fully compliant with Indian healthcare standards while providing modern developer experience and user interface design.