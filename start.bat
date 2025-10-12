@echo off
REM EduMate - Start Application Script for Windows
REM This script starts both backend and frontend services

setlocal enabledelayedexpansion

REM Check if setup has been run
if not exist "edumate-backend\.env" (
    echo ❌ Setup has not been completed yet. Please run 'setup.bat' first.
    pause
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop.
    pause
    exit /b 1
)

REM Check if database container is running
docker ps | findstr "edumate-db" >nul
if %errorlevel% neq 0 (
    echo ⚠️  Database container is not running. Starting it now...
    cd edumate-backend
    docker-compose up -d
    cd ..
)

echo ============================================
echo      🚀 Starting EduMate Application
echo ============================================
echo.

echo ℹ️  Starting backend server...
cd edumate-backend
start "EduMate Backend" cmd /k "npm run dev"
cd ..

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

echo ℹ️  Starting frontend development server...
cd edumate-frontend
start "EduMate Frontend" cmd /k "npm run dev"
cd ..

echo ✅ Both services are starting up!
echo.

echo ============================================
echo      📋 Application Information
echo ============================================
echo.

echo ℹ️  🔗 Application URLs:
echo   • Frontend: http://localhost:5173 ^(or the port Vite displays^)
echo   • Backend API: http://localhost:3000
echo   • Database Admin: http://localhost:5555 ^(run 'npx prisma studio' in backend folder^)
echo.

echo ℹ️  🔐 Test Accounts:
echo   • Admin: admin@edumate.com / AdminPass123!
echo   • Tutor: tutor1@edumate.com / TutorPass123!
echo   • Student: student1@edumate.com / StudentPass123!
echo.

echo ✅ 🎉 EduMate is now running!
echo ℹ️  Two new command windows have opened for backend and frontend services.
echo ℹ️  Close those windows to stop the services.
echo.

pause