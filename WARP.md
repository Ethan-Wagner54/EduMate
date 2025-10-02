# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

EduMate is a full-stack peer-to-peer tutoring platform for North-West University students. The repository contains both frontend and backend applications in a monorepo structure.

## Full-Stack Architecture

### Frontend (`edumate-frontend/`)
- **React 19** + **Vite** - Modern React development with fast HMR
- **TypeScript/JavaScript** - Mixed TS/JS codebase with type safety where needed
- **Tailwind CSS** - Utility-first styling with custom EduMate theme colors
- **React Router DOM** - Client-side routing with role-based dashboards
- **Axios** - HTTP client for backend API communication
- **Radix UI + Lucide Icons** - Accessible component primitives and icon system

### Backend (`edumate-backend/`)
- **Express.js** - Web framework with CORS, JSON middleware, and route organization
- **Prisma ORM** - Database layer with PostgreSQL, handles migrations and seeding
- **JWT Authentication** - Stateless auth with role-based access (student/tutor/admin)
- **PostgreSQL + Docker** - Containerized database for local development
- **TypeScript** - Full TypeScript implementation with strict configuration

### Data Architecture
The data model centers around Users (with roles), Sessions (tutoring sessions), Modules (academic courses), and supporting entities for enrollments, attendance, messaging, and audit logging.

### Frontend Application Structure
- **Role-based Dashboards** - Separate interfaces for students, tutors, and admins
- **Session Management** - Create, browse, join/leave tutoring sessions
- **Messaging System** - Real-time communication between users
- **Authentication Flow** - Login/register with JWT token management
- **Component Architecture** - Reusable UI components with variant patterns

## Development Commands

### Initial Setup
```bash
# Backend setup
cd edumate-backend
npm install

# Environment setup (Windows)
copy .env.example .env
# Environment setup (macOS/Linux)  
cp .env.example .env

# Start PostgreSQL container
docker-compose up -d

# Run database migrations and seed data
npx prisma migrate dev
npx prisma db seed

# Frontend setup (separate terminal)
cd edumate-frontend
npm install
```

### Daily Development
```bash
# Backend development server (port 3000)
cd edumate-backend
npm run dev

# Frontend development server (port 5173) - separate terminal
cd edumate-frontend
npm run dev

# Backend build commands
cd edumate-backend
npm run build              # Build TypeScript to JavaScript  
npm start                  # Start production build

# Frontend build commands
cd edumate-frontend
npm run build              # Build for production
npm run preview            # Preview production build
npm run lint               # Run ESLint

# Database management
cd edumate-backend
npx prisma studio          # Open database GUI
npx prisma migrate dev     # Create and apply new migration
npx prisma db seed         # Re-seed database with test data
```

### Testing & API Development
```bash
# Backend tests (Note: Test suite not yet implemented)
cd edumate-backend
npm test

# Server health check
curl http://localhost:3000/health

# Automated API testing script
cd edumate-backend
./eduMate-test.sh          # Full end-to-end test workflow
```

The API Testing Guide in `docs/API_Testing_Guide.md` provides complete manual testing workflows using seeded data.

## Core Architecture Patterns

### Frontend Architecture
- **Component Structure** - Pages, components, services, and utilities separation
- **Routing** - React Router with role-based route protection and nested layouts
- **State Management** - Local state with React hooks, JWT token in localStorage
- **API Layer** - Axios-based service modules (`auth`, `sessions`, `user`) with TypeScript types
- **UI System** - Variant-based components using `class-variance-authority` and Tailwind
- **Configuration** - Vite environment variables (`VITE_API_URL`) for different deployment environments

### Authentication & Authorization
- **Backend**: JWT-based authentication with role checks (student/tutor/admin)
- **Frontend**: Token stored in localStorage, decoded client-side for user info
- **Middleware**: Backend auth verification in `src/middleware/auth.ts`
- **Route Protection**: Frontend role-specific routes and backend `requireRole` middleware
- **API Communication**: Axios interceptors add Bearer token to requests automatically

### Database Layer
- Prisma schema defines relationships between Users, Sessions, Modules, and Enrollments  
- Migrations in `prisma/migrations/` for schema versioning
- Seed script creates test users and modules for development
- Audit logging tracks entity changes via `AuditLog` model
- New user controller provides user profile endpoints

### API Structure
- RESTful routes organized by domain (`/auth`, `/sessions`, `/messages`, `/admin`, `/user`)
- Controllers handle business logic, middleware handles cross-cutting concerns
- Request logging and error handling implemented at app level
- Health endpoint at `/health` for monitoring
- Frontend services mirror backend API structure with TypeScript types

### Key Business Logic
- **Session Management**: draft → published → cancelled status flow
- **Enrollment System**: students join/leave sessions with capacity limits
- **Module-based Tutoring**: tutors approved per module by admins
- **Messaging System**: tied to sessions and user relationships
- **Role-based UI**: Different dashboard experiences for students, tutors, and admins

### Environment & Configuration
- **Backend**: `.env` file with DATABASE_URL, JWT_SECRET, and Docker variables
- **Frontend**: Vite environment variables for API URL and deployment settings
- **Development**: Backend on port 3000, frontend on port 5173
- **Database**: PostgreSQL via Docker Compose on localhost:5432

### Frontend-Backend Integration
- **CORS Configuration**: Backend allows frontend origin for development
- **API Base URL**: Frontend configurable via `VITE_API_URL` (defaults to localhost:3000)
- **Authentication Flow**: Login returns JWT, frontend stores and uses for subsequent requests
- **Type Safety**: Shared TypeScript interfaces between frontend services and backend responses

### Development Workflow Notes
- Run both backend (`npm run dev`) and frontend (`npm run dev`) simultaneously
- Database schema changes require `npx prisma migrate dev`
- Frontend hot reload with Vite, backend auto-restart with nodemon
- Seeded test users: `tutor@edumate.com` and `student1@edumate.com` (passwords in API guide)
- Automated testing available via `eduMate-test.sh` script

### Current Connection Status

⚠️ **Frontend and backend are NOT fully connected**:
- **Authentication**: Login page uses mock JSON data (`/public/mocks/users.json`) instead of backend API
- **Database Setup**: PostgreSQL container and migrations may not be configured  
- **Mixed Data Sources**: Frontend has both real API service layers and fallback mock data
- **Testing Required**: Backend builds and runs, but integration with frontend needs verification
- **CORS Configuration**: May need adjustment for local development between ports 3000 and 5173

**To Complete Integration**:
1. Set up `.env` file in backend with proper database credentials
2. Start PostgreSQL container: `docker-compose up -d`
3. Run migrations: `npx prisma migrate dev && npx prisma db seed`
4. Update frontend Login component to remove mock data fallbacks
5. Test actual API endpoints with frontend service calls
