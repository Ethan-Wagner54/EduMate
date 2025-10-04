# 🚀 EduMate

EduMate is a peer-to-peer tutoring platform designed to streamline academic support at North-West University. The application provides a centralized web-based solution where students can easily find tutors, book sessions, and connect for academic assistance.

## ⚡ Quick Setup (Recommended)

**For the fastest and easiest setup experience, use our automated setup script:**

### Mac/Linux Users:
```bash
./setup.sh
```

### Windows Users:
```batch
setup.bat
```

**That's it!** The script will handle everything automatically:
- ✅ Check prerequisites (Node.js, Docker)
- ✅ Install all dependencies (backend & frontend)
- ✅ Start PostgreSQL database in Docker
- ✅ Run database migrations and seeding
- ✅ Build both applications
- ✅ Provide test accounts and instructions

## 🎮 Running the Application

After setup completes, start both services easily:

### Mac/Linux:
```bash
./start.sh
```

### Windows:
```batch
start.bat
```

### Manual Start (Alternative):
```bash
# Terminal 1 - Backend
cd edumate-backend && npm run dev

# Terminal 2 - Frontend  
cd edumate-frontend && npm run dev
```

## 📋 What You Get

- 🎓 **5 tutors** with different specialties and qualifications
- 👨‍🎓 **5 students** from various academic programs  
- 📖 **10 modules** across different faculties
- 📅 **Sample tutoring sessions** with enrollments and reviews
- 💬 **Group chat conversations** with messages
- 🔐 **Test accounts** ready to use

## 🔗 Application URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Database Admin:** http://localhost:5555 (run `npx prisma studio`)

## 🔐 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@edumate.com | AdminPass123! |
| Tutor | tutor1@edumate.com | TutorPass123! |
| Student | student1@edumate.com | StudentPass123! |

## 📖 Manual Setup

If you prefer manual setup or need to understand the process, see:
- [Backend Setup Guide](./edumate-backend/README.md)
- [Detailed Setup Guide](./SETUP_GUIDE.md)
