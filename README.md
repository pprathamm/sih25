# NAMASTE × ICD-11 Terminology Service

## Overview

This is a **FHIR R4-compliant terminology microservice** that integrates India’s NAMASTE terminologies with WHO’s ICD-11 Traditional Medicine Module 2 (TM2) and biomedicine codes. The service provides a complete solution for healthcare interoperability in India’s AYUSH sector, enabling EMR systems to transition from paper-based records to standardized digital health systems.

The application features a **modern React frontend** with a comprehensive dashboard for terminology search, concept mapping, CSV data ingestion, FHIR bundle validation, and audit tracking. The **backend** provides RESTful APIs and FHIR-compliant endpoints for terminology operations, with AI-powered mapping suggestions using **Google Gemini AI**.

**Preferred communication style:** Simple, everyday language.

---

## System Architecture

### Frontend

* **Framework:** React 18 with TypeScript (Vite build tooling)
* **UI Framework:** Shadcn/ui components built on Radix UI primitives with Tailwind CSS
* **Routing:** Wouter for lightweight client-side routing
* **State Management:** TanStack Query (React Query)
* **Styling:** Tailwind CSS with custom design tokens and CSS variables for theming

### Backend

* **Runtime:** Node.js with Express.js framework
* **Language:** TypeScript (ESM module system)
* **Database ORM:** Drizzle ORM for type-safe DB operations
* **API Design:** RESTful APIs with FHIR-compliant endpoints
* **Validation:** Zod schemas for request/response validation
* **Development:** Hot module replacement via Vite middleware integration

### Database

* **Primary DB:** PostgreSQL (Drizzle schema definitions)
* **Core Tables:**

  * `terminology_codes` → Stores NAMASTE, ICD-11 TM2, and biomedicine codes
  * `concept_mappings` → Manages relationships between different coding systems
  * `problem_list_entries` → FHIR-compliant problem list storage
  * `audit_events` → Comprehensive audit trail for all operations
  * `users` → User management for authentication

### AI Integration

* **Service:** Google Gemini AI
* **Functionality:** Automated suggestion of code mappings between NAMASTE and ICD-11 systems
* **Response Format:** Structured JSON with confidence scores and rationale

### Authentication & Security

* **Planned:** OAuth 2.0 with ABHA tokens
* **Audit:** Comprehensive logging for compliance with India’s 2016 EHR Standards
* **Standards Compliance:** ISO 22600 and SNOMED-CT/LOINC compatibility

---

## External Dependencies

### Core Infrastructure

* **Database:** PostgreSQL via Neon serverless platform
* **Session Management:** PostgreSQL-based sessions (`connect-pg-simple`)

### AI & ML

* Google Gemini AI for intelligent terminology mapping and relationship analysis

### Healthcare Standards

* FHIR R4 implementation
* WHO ICD-11 API integration
* NAMASTE CSV (India’s AYUSH morbidity terminology)

### Development & Deployment

* Replit integration for dev environment
* Vite + React plugin + esbuild for production builds
* NPM package management with lockfile

### UI & Design

* Radix UI primitives for accessibility
* Tailwind CSS with custom design tokens
* Lucide React icons
* Google Fonts: Inter, IBM Plex Mono, Source Serif Pro

---

## Running the Project

### Prerequisites

* Node.js ≥ 18
* PostgreSQL database (Neon, Railway, or local)
* Environment variables configured:

```bash
# .env file at project root
PORT=5000
DATABASE_URL=postgresql://user:password@host:port/dbname
NODE_ENV=development
```

---

### 1. Development (Hot Reload)

```bash
# Install dependencies
npm install

# Run in development mode (hot reload)
npm run dev
```

* Frontend and backend run together locally
* Accessible at `http://localhost:5000` (or your configured PORT)

---

### 2. Production

```bash
# Build TypeScript and frontend
npm run build

# Start production server
npm start
```

* Reads `process.env.PORT` (Railway/EC2) or defaults to `5000` locally
* Logs running port and host on startup

---

### 3. Environment Variables

| Variable       | Description                     |
| -------------- | ------------------------------- |
| `PORT`         | Port for server (default: 5000) |
| `DATABASE_URL` | PostgreSQL connection URL       |
| `NODE_ENV`     | `development` or `production`   |

---

### 4. Optional: PM2 for Background Running

```bash
# Install PM2 globally
npm install -g pm2

# Start app with PM2
pm2 start dist/index.js --name namaste-icd11
pm2 save
pm2 startup
```

---

## Notes

* Railway or EC2 is recommended for hosting backend with a **live database**.
* Frontend can be deployed separately on **Netlify/Vercel** if desired.
* Ensure `DATABASE_URL` is accessible from the deployed environment.

---
