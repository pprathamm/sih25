# Overview

This is a healthcare terminology microservice that bridges India's NAMASTE (Ayurveda, Siddha, Unani) coding system with WHO's ICD-11 Traditional Medicine Module 2 (TM2) and Biomedicine modules. The application provides a FHIR R4-compliant API for EMR systems to integrate standardized medical terminology, enabling dual-coding workflows that comply with India's 2016 EHR Standards.

The platform offers both technical APIs for EMR integration and a user-friendly web interface for healthcare professionals to search terminology, validate FHIR bundles, and manage medical coding workflows. It includes AI-powered features for intelligent code mapping and terminology assistance.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Shadcn/ui** component library with Radix UI primitives for accessibility
- **TailwindCSS** for styling with custom healthcare-focused theme
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state management and API caching

The frontend follows a component-driven architecture with separate pages for landing (unauthenticated users) and dashboard (authenticated users). Key components include terminology search, API playground, CSV ingestion, FHIR bundle validation, problem list management, and audit trail viewing.

## Backend Architecture
- **Express.js** server with TypeScript for API routes
- **FHIR R4 compliance** with structured schemas for healthcare data exchange
- **RESTful API design** following healthcare interoperability standards
- **Middleware-based** request processing with authentication, logging, and error handling

The backend implements a modular route structure handling terminology search, concept mapping, FHIR operations, CSV data ingestion, and AI-powered assistance through structured service layers.

## Database Design
- **PostgreSQL** with connection pooling via Neon serverless
- **Drizzle ORM** for type-safe database operations
- **Schema separation** between shared types and database models

Core entities include users, NAMASTE codes, ICD-11 codes, concept mappings, problem entries, audit logs, and chat messages. The schema supports both authentication requirements and healthcare terminology relationships.

## Authentication & Security
- **Replit Auth** integration with OpenID Connect
- **Session management** with PostgreSQL store
- **OAuth 2.0** secured endpoints with ABHA token compatibility
- **Audit logging** for regulatory compliance and security monitoring

Session persistence uses connect-pg-simple with the existing database connection, ensuring scalable user management.

## AI Integration
- **Google Gemini API** for intelligent terminology mapping
- **Concept mapping suggestions** between NAMASTE and ICD-11 codes
- **Natural language processing** for terminology search enhancement
- **Chat-based assistance** for coding guidance and best practices

The AI layer provides confidence scoring for mappings and explanations to help healthcare professionals make informed coding decisions.

# External Dependencies

## Healthcare Standards & APIs
- **WHO ICD-11 API** for fetching Traditional Medicine Module 2 and Biomedicine codes
- **FHIR R4 specification** compliance for healthcare data exchange
- **SNOMED-CT/LOINC semantics** following India's 2016 EHR Standards
- **ISO 22600** compliance for health informatics security

## Cloud Services & Infrastructure
- **Neon PostgreSQL** for serverless database hosting
- **Google Gemini AI** for intelligent terminology processing
- **Replit hosting** environment with integrated authentication

## Development & UI Libraries
- **Radix UI** for accessible component primitives
- **Lucide React** for consistent iconography
- **React Hook Form** with Zod validation for form handling
- **Date-fns** for temporal data processing

## Build & Development Tools
- **ESBuild** for optimized production builds
- **PostCSS & Autoprefixer** for CSS processing
- **Drizzle Kit** for database schema management
- **TypeScript** for type safety across the entire stack

The application is designed to be lightweight and deployable as a microservice, with minimal external dependencies while maintaining full FHIR R4 compliance and healthcare interoperability standards.