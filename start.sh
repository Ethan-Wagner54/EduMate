#!/bin/bash

# EduMate - Start Application Script
# This script starts both backend and frontend services

set -e

# Color codes for better output formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo -e "${BLUE}"
    echo "============================================"
    echo "$1"
    echo "============================================"
    echo -e "${NC}"
}

# Check if setup has been run
if [ ! -f "edumate-backend/.env" ]; then
    print_error "Setup has not been completed yet. Please run './setup.sh' first."
    exit 1
fi

# Check if Docker is running and database container exists
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Check if database container is running
if ! docker ps | grep "edumate-db" > /dev/null; then
    print_warning "Database container is not running. Starting it now..."
    cd edumate-backend
    docker-compose up -d
    cd ..
fi

print_header "🚀 Starting EduMate Application"
echo ""

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    print_info "Stopping services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo ""
    print_success "Services stopped. Goodbye!"
}

# Set up trap to catch interrupts
trap cleanup SIGINT SIGTERM

print_info "Starting backend server..."
cd edumate-backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

print_info "Starting frontend development server..."
cd edumate-frontend
npm run dev &
FRONTEND_PID=$!
cd ..

print_success "Both services are starting up!"
echo ""

print_header "📋 Application Information"
echo ""

print_info "🔗 Application URLs:"
echo "  • Frontend: http://localhost:5173 (or the port Vite displays)"
echo "  • Backend API: http://localhost:3000"
echo "  • Database Admin: http://localhost:5555 (run 'npx prisma studio' in backend folder)"
echo ""

print_info "🔐 Test Accounts:"
echo "  • Admin: admin@edumate.com / AdminPass123!"
echo "  • Tutor: tutor1@edumate.com / TutorPass123!"
echo "  • Student: student1@edumate.com / StudentPass123!"
echo ""

print_success "🎉 EduMate is now running!"
print_info "Press Ctrl+C to stop both services"
echo ""

# Wait for background processes
wait $BACKEND_PID $FRONTEND_PID