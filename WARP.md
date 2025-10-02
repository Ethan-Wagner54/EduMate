# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

EduMate is a peer-to-peer tutoring platform for North-West University students. The repository contains a Node.js/TypeScript backend API using Express, Prisma ORM with PostgreSQL, and Docker for database containerization.

## Tech Stack Architecture

The backend follows a layered architecture:
- **Express.js** - Web framework with CORS, JSON middleware, and route organization
- **Prisma ORM** - Database layer with PostgreSQL, handles migrations and seeding
- **JWT Authentication** - Stateless auth with role-based access (student/tutor/admin)
- **PostgreSQL + Docker** - Containerized database for local development
- **TypeScript** - Full TypeScript implementation with strict configuration

The data model centers around Users (with roles), Sessions (tutoring sessions), Modules (academic courses), and supporting entities for enrollments, attendance, messaging, and audit logging.

## Development Commands

### Initial Setup
```bash
# Clone and navigate to backend
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
```

### Daily Development
```bash
# Start development server with hot reload
npm run dev

# Build TypeScript to JavaScript  
npm run build

# Start production build
npm start

# Database management
npx prisma studio          # Open database GUI
npx prisma migrate dev     # Create and apply new migration
npx prisma db seed         # Re-seed database with test data
```

### Testing & API Development
```bash
# Run tests (Note: Test suite not yet implemented)
npm test

# Server health check
curl http://localhost:3000/health
```

The API Testing Guide in `docs/API_Testing_Guide.md` provides complete end-to-end testing workflows using seeded data.

## Core Architecture Patterns

### Authentication & Authorization
- JWT-based authentication with role checks (student/tutor/admin)
- Middleware-based auth verification in `src/middleware/auth.ts`
- Role-specific route protection via `requireRole` middleware
- All protected routes use Bearer token authentication

### Database Layer
- Prisma schema defines relationships between Users, Sessions, Modules, and Enrollments  
- Migrations in `prisma/migrations/` for schema versioning
- Seed script creates test users and modules for development
- Audit logging tracks entity changes via `AuditLog` model

### API Structure
- RESTful routes organized by domain (`/auth`, `/sessions`, `/messages`, `/admin`)
- Controllers handle business logic, middleware handles cross-cutting concerns
- Request logging and error handling implemented at app level
- Health endpoint at `/health` for monitoring

### Key Business Logic
- Session management: draft → published → cancelled status flow
- Enrollment system: students join/leave sessions with capacity limits
- Module-based tutoring: tutors approved per module by admins
- Messaging system tied to sessions and user relationships

### Environment & Configuration
- `.env` file required with DATABASE_URL, JWT_SECRET, and Docker variables
- Default development setup uses localhost:5432 PostgreSQL
- Server runs on port 3000 by default
- Docker Compose handles PostgreSQL container management

### Development Workflow Notes
- Use `npm run dev` for development with nodemon auto-restart
- Database schema changes require `npx prisma migrate dev`
- Seeded test users: `tutor@edumate.com` and `student1@edumate.com` (passwords in API guide)
- TypeScript compilation outputs to `dist/` folder for production