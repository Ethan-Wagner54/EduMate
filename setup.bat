@echo off
REM EduMate - Windows Setup Script
REM This script sets up the entire EduMate application on Windows
REM Requires Node.js and Docker Desktop to be installed

setlocal enabledelayedexpansion

echo ============================================
echo      🚀 EduMate Complete Application Setup
echo ============================================
echo.
echo This script will set up the entire EduMate application for you!
echo It will handle Docker, database setup, dependencies, and everything needed to run the app.
echo.

REM Check prerequisites
echo ============================================
echo      📋 Checking Prerequisites
echo ============================================

REM Check for Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js ^(v18 or later^) from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%a in ('node --version') do set node_version=%%a
echo ✅ Node.js found: %node_version%

REM Check for npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm.
    pause
    exit /b 1
)

for /f "tokens=*" %%a in ('npm --version') do set npm_version=%%a
echo ✅ npm found: v%npm_version%

REM Check for Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop from https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

for /f "tokens=1,2,3" %%a in ('docker --version') do set docker_version=%%c
echo ✅ Docker found: v%docker_version%

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker daemon is not running. Please start Docker Desktop.
    pause
    exit /b 1
)

echo ✅ Docker daemon is running
echo.

REM Step 1: Setup Backend Environment
echo ============================================
echo      🔧 Setting Up Backend Environment
echo ============================================

cd edumate-backend

REM Copy environment file if it doesn't exist
if not exist .env (
    echo ℹ️  Creating .env file from template...
    copy .env.example .env >nul
    echo ✅ .env file created
) else (
    echo ⚠️  .env file already exists, skipping creation
)

REM Step 2: Install Backend Dependencies
echo ℹ️  Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed
echo.

REM Step 3: Start Docker Services
echo ============================================
echo      🐳 Starting Docker Services
echo ============================================

REM Stop and remove existing containers if they exist
echo ℹ️  Stopping any existing EduMate containers...
docker-compose down --remove-orphans >nul 2>&1

echo ℹ️  Starting PostgreSQL database container...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ❌ Failed to start Docker containers
    pause
    exit /b 1
)

REM Wait for PostgreSQL to be ready
echo ℹ️  Waiting for PostgreSQL to be ready...
timeout /t 10 /nobreak >nul

:waitloop
docker exec edumate-db pg_isready -U edumate_admin -d edumate >nul 2>&1
if %errorlevel% equ 0 goto postgres_ready
echo ℹ️  PostgreSQL not ready yet, waiting 5 more seconds...
timeout /t 5 /nobreak >nul
goto waitloop

:postgres_ready
echo ✅ PostgreSQL database is running
echo.

REM Step 4: Database Setup
echo ============================================
echo      🗄️  Setting Up Database
echo ============================================

echo ℹ️  Running database migrations...
call npx prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo ❌ Failed to run database migrations
    pause
    exit /b 1
)
echo ✅ Database migrations completed

echo ℹ️  Seeding database with sample data...
call npx prisma db seed
if %errorlevel% neq 0 (
    echo ❌ Failed to seed database
    pause
    exit /b 1
)
echo ✅ Database seeded successfully
echo.

REM Step 5: Build Backend
echo ℹ️  Building backend application...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build backend
    pause
    exit /b 1
)
echo ✅ Backend built successfully

REM Go back to root directory
cd ..

REM Step 6: Setup Frontend
echo ============================================
echo      🎨 Setting Up Frontend
echo ============================================

cd edumate-frontend

echo ℹ️  Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed

echo ℹ️  Building frontend application...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build frontend
    pause
    exit /b 1
)
echo ✅ Frontend built successfully

REM Go back to root directory
cd ..

REM Step 7: Final Setup
echo ============================================
echo      🏁 Final Setup Complete
echo ============================================

echo ✅ EduMate application setup completed successfully!
echo.

REM Display helpful information
echo ============================================
echo      📋 Quick Start Information
echo ============================================
echo.

echo ℹ️  🔐 Test Accounts Created:
echo.
echo   👑 ADMIN:
echo      Email: admin@edumate.com
echo      Password: AdminPass123!
echo.
echo   👨‍🏫 SAMPLE TUTOR:
echo      Email: tutor1@edumate.com
echo      Password: TutorPass123!
echo.
echo   👨‍🎓 SAMPLE STUDENT:
echo      Email: student1@edumate.com
echo      Password: StudentPass123!
echo.

echo ℹ️  📚 Database Information:
echo   • Database contains 10 modules across different faculties
echo   • 5 tutors with different specialties and qualifications
echo   • 5 students with diverse academic backgrounds
echo   • Sample tutoring sessions with enrollments and reviews
echo   • Group chat conversations with messages
echo.

echo ℹ️  🚀 To Start the Application:
echo.
echo   1. Start the backend server:
echo      cd edumate-backend
echo      npm run dev
echo.
echo   2. In a new command prompt, start the frontend:
echo      cd edumate-frontend
echo      npm run dev
echo.

echo ℹ️  🔗 Application URLs:
echo   • Backend API: http://localhost:3000
echo   • Frontend App: http://localhost:5173 ^(or the port Vite displays^)
echo   • Database Admin: http://localhost:5555 ^(run: npx prisma studio^)
echo.

echo ℹ️  📖 Additional Commands:
echo   • View database: cd edumate-backend ^&^& npx prisma studio
echo   • Check Docker logs: docker-compose logs
echo   • Stop database: docker-compose down
echo   • Restart database: docker-compose restart
echo.

echo ✅ 🎉 Setup completed! Your EduMate application is ready to use.
echo ⚠️  💡 Tip: Keep this window open to see these instructions, and open new command prompts to run the applications.
echo.

pause