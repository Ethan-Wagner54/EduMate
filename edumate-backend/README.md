# EduMate Backend (Skeleton)

Node.js + Express + TypeScript skeleton aligned with the EduMate specs. Uses PostgreSQL via Prisma ORM and JWT-based auth with role-based access control (RBAC).

## Quick start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   - Copy `.env.example` to `.env` and adjust values (DB, JWT secret, port).

3. **Set up database**
   ```bash
   npx prisma generate
   npm run prisma:migrate
   ```

4. **Run the server (dev)**
   ```bash
   npm run dev
   ```

## API (initial)

- `POST /auth/register` — create a user (defaults to `student` role).
- `POST /auth/login` — returns JWT token.

- `GET /sessions` — list sessions (query: `module`, `tutorId`).
- `POST /sessions` — (tutor/admin) create a session (prevents tutor overlaps).
- `POST /sessions/:id/join` — (student) join a session (prevents student overlaps & respects capacity).
- `POST /sessions/:id/leave` — (student) leave a session.

- `GET /messages` — list my messages.
- `POST /messages` — send message (tutor↔student only).

- `GET /admin/users` — (admin) list users.
- `POST /admin/users/role` — (admin) set user role.

All write actions are logged to `AuditLog`.

## Project structure

```
/src
  /controllers
  /middleware
  /routes
  /utils
  /types
/prisma
```

## Notes

- This is a minimal skeleton so you can iterate quickly.
- Add input validation (e.g., Zod schemas) and comprehensive error handling in later passes.
- Expose OpenAPI (Swagger) once endpoints stabilize.
- Add attendance + reporting endpoints next, following the same patterns.
