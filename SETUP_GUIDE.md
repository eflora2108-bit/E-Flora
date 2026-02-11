# eFlora - Quick Setup Guide

This guide will help you get eFlora running on your local machine in minutes.

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18+ installed (`node --version`)
- ✅ PostgreSQL 15+ installed (`psql --version`)
- ✅ Git installed (`git --version`)

## Option 1: Quick Start (Local Development - Recommended for Getting Started)

### Step 1: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Setup PostgreSQL Database

```bash
# Create database (using psql)
createdb eflora_db

# Or if you need to login to PostgreSQL first:
psql -U postgres
CREATE DATABASE eflora_db;
\q
```

### Step 3: Run Database Migrations

```bash
cd backend

# Run the initial schema migration
psql -U postgres -d eflora_db -f migrations/001_initial_schema.sql
```

You should see output like:
```
CREATE EXTENSION
CREATE TABLE
CREATE TABLE
...
CREATE INDEX
CREATE TRIGGER
```

### Step 4: Configure Environment Variables

The `.env` files are already created with default values. You just need to update:

**Backend (.env):**
- Update `DB_PASSWORD` if your PostgreSQL password is different
- Update `SMTP_*` settings if you want email functionality (optional for now)

**Frontend (.env):**
- No changes needed for local development

### Step 5: Start the Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server started on port 5000
📝 Environment: development
✅ Database connection established
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
```

### Step 6: Verify Setup

1. **Frontend:** Open [http://localhost:3000](http://localhost:3000)
   - You should see the eFlora welcome page with a purple gradient

2. **Backend Health:** Open [http://localhost:5000/health](http://localhost:5000/health)
   - You should see: `{"success": true, "message": "Server is healthy"}`

3. **Database Connection:** Check backend terminal for:
   - ✅ Database connected successfully

🎉 **Success!** Your eFlora development environment is ready!

---

## Option 2: Docker Setup (For Advanced Users)

### Step 1: Create Environment File

```bash
# Copy backend .env to root directory
cp backend/.env .env
```

### Step 2: Start All Services

```bash
docker-compose up -d
```

This will start:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Backend (port 5000)
- Frontend (port 3000)

### Step 3: Run Migrations

```bash
# Access the backend container
docker-compose exec backend sh

# Run migrations
psql -h postgres -U postgres -d eflora_db -f migrations/001_initial_schema.sql
```

### Step 4: View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

---

## Troubleshooting

### Database Connection Failed

**Error:** `Database connection failed`

**Solution:**
1. Check PostgreSQL is running: `psql -U postgres -l`
2. Verify credentials in `backend/.env`
3. Ensure database exists: `psql -U postgres -c "\l" | grep eflora`

### Port Already in Use

**Error:** `Port 5000 is already in use`

**Solution:**
1. Find process using port: `lsof -i :5000` (Mac/Linux) or `netstat -ano | findstr :5000` (Windows)
2. Kill process or change PORT in `backend/.env`

### Node Modules Not Found

**Error:** `Cannot find module 'express'`

**Solution:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

**Error:** `Cannot find name 'xyz'`

**Solution:**
```bash
cd backend
npm install --save-dev @types/xyz
```

---

## Next Steps

Now that your environment is set up, you can:

1. **Explore the Project Structure:**
   - Check out `backend/src/` for backend code
   - Check out `frontend/src/` for frontend code
   - Review the database schema in `backend/migrations/001_initial_schema.sql`

2. **Read the Documentation:**
   - Main README: [README.md](README.md)
   - Implementation Plan: `~/.claude/plans/ticklish-giggling-patterson.md`

3. **Start Development:**
   - Phase 2: Authentication & Authorization
   - Phase 3: Supplier Verification
   - And so on...

---

## Quick Commands Reference

### Backend

```bash
# Development
npm run dev                  # Start dev server with hot reload

# Build
npm run build               # Compile TypeScript to JavaScript
npm start                   # Run production build

# Testing
npm test                    # Run tests
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Generate coverage report

# Code Quality
npm run lint                # Run ESLint
npm run format              # Format code with Prettier
```

### Frontend

```bash
# Development
npm run dev                 # Start Vite dev server

# Build
npm run build              # Build for production
npm run preview            # Preview production build

# Testing
npm test                   # Run tests
npm run test:ui            # Run tests with UI
```

### Docker

```bash
docker-compose up -d       # Start all services
docker-compose down        # Stop all services
docker-compose logs -f     # View logs
docker-compose ps          # List running containers
docker-compose exec backend sh  # Access backend container
```

---

## Environment Configuration

### Backend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 5000 | No |
| `DB_HOST` | PostgreSQL host | localhost | Yes |
| `DB_PORT` | PostgreSQL port | 5432 | Yes |
| `DB_NAME` | Database name | eflora_db | Yes |
| `DB_USER` | Database user | postgres | Yes |
| `DB_PASSWORD` | Database password | - | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `SMTP_HOST` | Email SMTP host | - | For emails |
| `RAZORPAY_KEY_ID` | Payment gateway key | - | For payments |

### Frontend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Backend API URL | http://localhost:5000/api/v1 | Yes |
| `VITE_RAZORPAY_KEY_ID` | Razorpay public key | - | For payments |

---

## Development Workflow

1. **Make changes** to code
2. **Server auto-restarts** (backend with tsx watch, frontend with Vite HMR)
3. **Test changes** in browser
4. **Commit changes** with descriptive messages
5. **Repeat**

---

## Getting Help

- Check [README.md](README.md) for comprehensive documentation
- Review the implementation plan for architecture details
- Check troubleshooting section above
- Search for error messages in logs

---

**Happy Coding! 🌱**
