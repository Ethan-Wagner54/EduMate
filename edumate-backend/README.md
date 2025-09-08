\# EduMate Backend



\## Overview



EduMate is a peer-to-peer tutoring platform designed to streamline academic support at North-West University. The application provides a centralized web-based solution where students can easily find tutors, book sessions, and connect for academic assistance.



This backend API handles user authentication, session management, and data persistence for the EduMate platform.



\## Prerequisites



Before you begin, ensure you have the following installed on your machine:



\- \*\*Node.js\*\* (v18 or later)

\- \*\*Docker Desktop\*\*



\## Getting Started



\### 1. Clone and Setup



```bash

git clone https://github.com/Ethan-Wagner54/EduMate.git

cd edumate-backend

npm install

```



\### 2. Environment Configuration



```bash

\# Copy the environment template to create your local .env file



\# On Windows

copy .env.example .env



\# On macOS or Linux

cp .env.example .env

```



\*(The default values in the `.env` file should work for local development).\*



\### 3. Database Setup



```bash

\# Start the PostgreSQL container in the background

docker-compose up -d



\# Run migrations to create the database schema

npx prisma migrate dev



\# Seed the database with sample data

npx prisma db seed

```



\### 4. Start the Development Server



```bash

npm run dev

```



The server will now be running and watching for changes at `http://localhost:3000`.



\## Testing Your Setup



Verify your installation by testing the login endpoint with a seeded user.



1\. \*\*Open Postman\*\* (or any API client).

2\. Send a \*\*POST\*\* request to \*\*`http://localhost:3000/auth/login`\*\*.

3\. Set the \*\*Body\*\* to \*\*raw\*\* and \*\*JSON\*\*.

4\. Use the following credentials:

&nbsp;  ```json

&nbsp;  {

&nbsp;    "email": "tutor@edumate.com",

&nbsp;    "password": "TutorPass123"

&nbsp;  }

&nbsp;  ```

5\. You should receive a \*\*200 OK\*\* response containing a JWT token.



\## API Endpoints



\- `POST /auth/register` - Create a new user account

\- `POST /auth/login` - Authenticate a user and return a JWT token

\- `GET /sessions` - List all available tutoring sessions

\- `POST /sessions` - Create a new session (tutor/admin only)

\- ...and more



\## Development Commands



```bash

npm run dev          # Start the development server with nodemon

npm run build        # Compile TypeScript to JavaScript for production

npm test             # Run test suite (Note: tests are not yet implemented)

npx prisma studio    # Open the database GUI in your browser

npx prisma migrate dev # Create and apply a new migration during development

```



\## Project Structure



```

/src

&nbsp; /controllers  - Handles request logic

&nbsp; /middleware   - Authentication, validation, etc.

&nbsp; /routes       - API route definitions

&nbsp; /utils        - Helper functions (passwords, JWT)

&nbsp; /types        - TypeScript type definitions

/prisma         - Database schema, migrations, and seed script

```

