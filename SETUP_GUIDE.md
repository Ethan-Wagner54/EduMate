# 🚀 EduMate - Easy Setup Guide

Welcome to EduMate! This guide will help you get the entire application running in just a few steps, even if you're not technical.

## 📋 What You Need Before Starting

Before running the setup script, make sure you have these installed on your computer:

### 1. Node.js (Required)
- **Download:** https://nodejs.org/
- **Version needed:** v18 or newer
- **How to check if installed:** Open terminal/command prompt and type: `node --version`

### 2. Docker Desktop (Required)
- **Download:** https://www.docker.com/products/docker-desktop/
- **Important:** Make sure Docker Desktop is running before you start the setup
- **How to check:** Look for Docker whale icon in your system tray/menu bar

## 🎯 One-Command Setup

Once you have Node.js and Docker installed, setting up EduMate is super simple:

### For Mac/Linux Users:
```bash
./setup.sh
```

### For Windows Users:
If you're using Git Bash or Windows Subsystem for Linux (WSL):
```bash
./setup.sh
```

If you're using Command Prompt or PowerShell, you might need to use Git Bash or install WSL first.

## ⏱️ What the Setup Script Does

The script automatically handles everything for you:

1. ✅ **Checks Prerequisites** - Verifies Node.js and Docker are installed
2. ✅ **Sets Up Backend** - Installs dependencies and configures environment
3. ✅ **Starts Database** - Launches PostgreSQL in Docker container
4. ✅ **Creates Database Schema** - Sets up all the database tables
5. ✅ **Seeds Sample Data** - Adds test users, modules, and sessions
6. ✅ **Sets Up Frontend** - Installs dependencies and builds the web app
7. ✅ **Provides Test Accounts** - Creates users you can login with immediately

**Estimated time:** 5-10 minutes (depending on your internet speed)

## 🎮 Starting the Application

After setup completes, you'll need to start two services:

### Terminal 1 - Start Backend:
```bash
cd edumate-backend
npm run dev
```

### Terminal 2 - Start Frontend:
```bash
cd edumate-frontend
npm run dev
```

## 🌐 Access the Application

Once both services are running:

- **Main Application:** http://localhost:5173 (or whatever port Vite shows)
- **API Backend:** http://localhost:3000
- **Database Admin:** http://localhost:5555 (run `npx prisma studio` in edumate-backend folder)

## 👥 Test Accounts

The setup creates these accounts for you to test with:

### Admin Account
- **Email:** admin@edumate.com
- **Password:** AdminPass123!

### Tutor Account
- **Email:** tutor1@edumate.com
- **Password:** TutorPass123!

### Student Account
- **Email:** student1@edumate.com
- **Password:** StudentPass123!

## 📚 Sample Data Included

Your database will be populated with:
- 🎓 **5 tutors** with different specialties (Computer Science, Math, Business, etc.)
- 👨‍🎓 **5 students** from various academic programs
- 📖 **10 modules** across different faculties
- 📅 **Sample tutoring sessions** (past and upcoming)
- 💬 **Group chat conversations** with messages
- ⭐ **Session reviews and ratings**

## 🛠️ Troubleshooting

### "Docker is not running"
- Make sure Docker Desktop is started and the whale icon appears in your system tray

### "Node.js not found"
- Download and install Node.js from https://nodejs.org/
- Restart your terminal after installation

### "Permission denied" on Mac/Linux
- Make sure the script is executable: `chmod +x setup.sh`

### Database connection issues
- Stop Docker containers: `docker-compose down`
- Start the setup script again: `./setup.sh`

### Port already in use
- Make sure no other applications are using ports 3000, 5432, or 5173
- Or restart your computer to free up ports

## 💡 Useful Commands

```bash
# View database in browser
cd edumate-backend && npx prisma studio

# Stop database container
docker-compose down

# Restart database container  
docker-compose restart

# Check database logs
docker-compose logs db

# Reset database (warning: deletes all data)
cd edumate-backend && npx prisma migrate reset
```

## 🆘 Need Help?

If you run into any issues:

1. **Check the error message** - The script provides helpful error messages
2. **Make sure prerequisites are installed** - Node.js and Docker Desktop
3. **Try restarting Docker Desktop** - Sometimes containers get stuck
4. **Run the script again** - It's safe to run multiple times

## 🎉 You're All Set!

Once everything is running, you can:
- Login with the test accounts provided
- Browse available tutoring sessions
- Create new sessions as a tutor
- Join sessions as a student
- Use the messaging system
- Explore all the features!

---

**Happy Learning! 📖✨**