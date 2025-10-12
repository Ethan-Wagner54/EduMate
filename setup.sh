#!/bin/bash

# EduMate - Complete Application Setup Script
# This script sets up the entire EduMate application including Docker, database, and all dependencies
# Compatible with macOS, Linux, and Windows (using Git Bash/WSL)

set -e  # Exit immediately if a command exits with a non-zero status

# Color codes for better output formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to wait for PostgreSQL to be ready
wait_for_postgres() {
    print_info "Waiting for PostgreSQL to be ready..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker exec edumate-db pg_isready -U edumate_admin -d edumate > /dev/null 2>&1; then
            print_success "PostgreSQL is ready!"
            return 0
        fi
        
        print_info "Attempt $attempt/$max_attempts - PostgreSQL not ready yet, waiting 2 seconds..."
        sleep 2
        ((attempt++))
    done
    
    print_error "PostgreSQL failed to start after $max_attempts attempts"
    return 1
}

# Main setup function
main() {
    print_header "🚀 EduMate Complete Application Setup"
    echo ""
    print_info "This script will set up the entire EduMate application for you!"
    print_info "It will handle Docker, database setup, dependencies, and everything needed to run the app."
    echo ""
    
    # Check prerequisites
    print_header "📋 Checking Prerequisites"
    
    # Check for Node.js
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js (v18 or later) from https://nodejs.org/"
        exit 1
    fi
    
    node_version=$(node --version | cut -c 2-)
    print_success "Node.js found: v$node_version"
    
    # Check for npm
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    npm_version=$(npm --version)
    print_success "npm found: v$npm_version"
    
    # Check for Docker
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker Desktop from https://www.docker.com/products/docker-desktop/"
        exit 1
    fi
    
    docker_version=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
    print_success "Docker found: v$docker_version"
    
    # Check for Docker Compose
    if ! command_exists docker-compose && ! docker compose version > /dev/null 2>&1; then
        print_error "Docker Compose is not available. Please ensure Docker Desktop is properly installed."
        exit 1
    fi
    
    print_success "Docker Compose is available"
    
    # Verify Docker is running
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker daemon is not running. Please start Docker Desktop."
        exit 1
    fi
    
    print_success "Docker daemon is running"
    echo ""
    
    # Step 1: Setup Backend Environment
    print_header "🔧 Setting Up Backend Environment"
    
    cd edumate-backend
    
    # Copy environment file if it doesn't exist
    if [ ! -f .env ]; then
        print_info "Creating .env file from template..."
        cp .env.example .env
        print_success ".env file created"
    else
        print_warning ".env file already exists, skipping creation"
    fi
    
    # Step 2: Install Backend Dependencies
    print_info "Installing backend dependencies..."
    npm install
    print_success "Backend dependencies installed"
    echo ""
    
    # Step 3: Start Docker Services
    print_header "🐳 Starting Docker Services"
    
    # Stop and remove existing containers if they exist
    print_info "Stopping any existing EduMate containers..."
    docker-compose down --remove-orphans > /dev/null 2>&1 || true
    
    print_info "Starting PostgreSQL database container..."
    docker-compose up -d
    
    # Wait for PostgreSQL to be ready
    if ! wait_for_postgres; then
        print_error "Failed to start PostgreSQL. Please check Docker logs: docker-compose logs db"
        exit 1
    fi
    
    print_success "PostgreSQL database is running"
    echo ""
    
    # Step 4: Database Setup
    print_header "🗄️  Setting Up Database"
    
    print_info "Running database migrations..."
    npx prisma migrate dev --name init
    print_success "Database migrations completed"
    
    print_info "Seeding database with sample data..."
    npx prisma db seed
    print_success "Database seeded successfully"
    echo ""
    
    # Step 5: Build Backend
    print_info "Building backend application..."
    npm run build
    print_success "Backend built successfully"
    
    # Go back to root directory
    cd ..
    
    # Step 6: Setup Frontend
    print_header "🎨 Setting Up Frontend"
    
    cd edumate-frontend
    
    print_info "Installing frontend dependencies..."
    npm install
    print_success "Frontend dependencies installed"
    
    print_info "Building frontend application..."
    npm run build
    print_success "Frontend built successfully"
    
    # Go back to root directory
    cd ..
    
    # Step 7: Final Setup
    print_header "🏁 Final Setup Complete"
    
    print_success "EduMate application setup completed successfully!"
    echo ""
    
    # Display helpful information
    print_header "📋 Quick Start Information"
    echo ""
    
    print_info "🔐 Test Accounts Created:"
    echo ""
    echo "  👑 ADMIN:"
    echo "     Email: admin@edumate.com"
    echo "     Password: AdminPass123!"
    echo ""
    echo "  👨‍🏫 SAMPLE TUTOR:"
    echo "     Email: tutor1@edumate.com"
    echo "     Password: TutorPass123!"
    echo ""
    echo "  👨‍🎓 SAMPLE STUDENT:"
    echo "     Email: student1@edumate.com"
    echo "     Password: StudentPass123!"
    echo ""
    
    print_info "📚 Database Information:"
    echo "  • Database contains 10 modules across different faculties"
    echo "  • 5 tutors with different specialties and qualifications"
    echo "  • 5 students with diverse academic backgrounds"
    echo "  • Sample tutoring sessions with enrollments and reviews"
    echo "  • Group chat conversations with messages"
    echo ""
    
    print_info "🚀 To Start the Application:"
    echo ""
    echo "  1. Start the backend server:"
    echo "     cd edumate-backend && npm run dev"
    echo ""
    echo "  2. In a new terminal, start the frontend:"
    echo "     cd edumate-frontend && npm run dev"
    echo ""
    
    print_info "🔗 Application URLs:"
    echo "  • Backend API: http://localhost:3000"
    echo "  • Frontend App: http://localhost:5173 (or the port Vite displays)"
    echo "  • Database Admin: http://localhost:5555 (run: npx prisma studio)"
    echo ""
    
    print_info "📖 Additional Commands:"
    echo "  • View database: cd edumate-backend && npx prisma studio"
    echo "  • Check Docker logs: docker-compose logs"
    echo "  • Stop database: docker-compose down"
    echo "  • Restart database: docker-compose restart"
    echo ""
    
    print_success "🎉 Setup completed! Your EduMate application is ready to use."
    print_warning "💡 Tip: Keep this terminal open to see these instructions, and open new terminals to run the applications."
}

# Function to handle cleanup on exit
cleanup() {
    echo ""
    print_info "Setup interrupted. You may need to run this script again."
}

# Set up trap to catch interrupts
trap cleanup SIGINT SIGTERM

# Run the main function
main "$@"