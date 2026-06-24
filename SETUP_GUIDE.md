# 🚀 SJL Tournament - Setup Guide

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/TPilate/SJLTournament.git
cd SJLTournament
```

### 2. Install Dependencies

```bash
npm install
```

> ⚠️ **Note**: If you get SSL certificate errors, try:
> ```bash
> npm config set strict-ssl false
> npm install
> ```

### 3. Set Up PostgreSQL Database

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL container
docker run --name sjl-tournament-db \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=sjl_tournament \
  -p 5432:5432 \
  -d postgres:15-alpine
```

#### Option B: Using docker-compose

```bash
# This will start both the app and database
docker-compose up -d

# Then initialize the database
docker-compose exec app npx prisma migrate dev
```

#### Option C: Local PostgreSQL Installation

**On Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo -u postgres psql
```

**In psql:**
```sql
CREATE DATABASE sjl_tournament;
CREATE USER user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE sjl_tournament TO user;
\q
```

### 4. Configure Environment Variables

Copy the example file and update with your database credentials:

```bash
cp .env.example .env
```

Edit `.env` file:

```env
# Database configuration
DATABASE_URL="postgresql://user:password@localhost:5432/sjl_tournament"

# If using Docker, change localhost to db:
# DATABASE_URL="postgresql://user:password@db:5432/sjl_tournament"

# JWT Secret (generate a strong secret in production)
JWT_SECRET="your-super-strong-secret-key-here"

# Socket.IO configuration
SOCKET_IO_PORT=3001
SOCKET_IO_CORS_ORIGIN="http://localhost:3000"

# Application
NODE_ENV="development"
PORT=3000
```

### 5. Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Apply migrations
npx prisma migrate dev

# Or push schema directly (for development)
npx prisma db push
```

> ⚠️ **Troubleshooting**: If you get certificate errors with `npx prisma generate`, try:
> ```bash
> npm config set strict-ssl false
> npx prisma generate
> ```

### 6. Start the Application

```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

## 📋 Detailed Setup Instructions

### Database Connection Issues

If you get connection errors, check:

1. **Is PostgreSQL running?**
   ```bash
   # For Docker
   docker ps
   
   # For local installation
   sudo service postgresql status
   ```

2. **Can you connect manually?**
   ```bash
   psql -h localhost -U user -d sjl_tournament
   ```
   (Password: `password`)

3. **Check the connection string** in `.env`:
   - If using Docker: `postgresql://user:password@db:5432/sjl_tournament`
   - If using local: `postgresql://user:password@localhost:5432/sjl_tournament`

### SSL Certificate Issues

If you're behind a corporate proxy or have SSL issues:

```bash
# Temporarily disable SSL verification
npm config set strict-ssl false
npm config set registry http://registry.npmjs.org/

# Install dependencies
npm install

# Reset to default
npm config set strict-ssl true
npm config set registry https://registry.npmjs.org/
```

### Using a Different Database Port

If PostgreSQL is using a different port (not 5432), update the `DATABASE_URL`:

```env
DATABASE_URL="postgresql://user:password@localhost:YOUR_PORT/sjl_tournament"
```

## 🎯 First Steps After Setup

### 1. Create an Admin User

You can either:

**Option A: Register via the UI**
- Go to http://localhost:3000/register
- Register with any email
- Then manually change the role in the database:
  ```bash
  npx prisma studio
  ```
  Find your user and change `role` from `PLAYER` to `ADMIN`

**Option B: Create admin directly in database**
```bash
npx prisma studio
```
Then create a new User record with `role: ADMIN`

### 2. Create Your First Tournament

1. Login as admin
2. Go to Dashboard
3. Click "Create Tournament"
4. Fill in the details and select a format
5. The system will automatically create stages based on the format

### 3. Create Teams

1. Go to Teams section
2. Create teams and assign captains
3. Add players to teams (max 6 per team)

### 4. Schedule Matches

1. Go to Matches section
2. Create matches between teams
3. Assign referee teams (cannot be one of the playing teams)
4. Set match mode (timed or score target)

### 5. Test Live Scoring

1. Login as a player from the referee team
2. Go to the live match page
3. Update scores in real-time
4. Verify that:
   - Scores update instantly for all connected clients
   - Match locks automatically when conditions are met
   - Score history is recorded

## 🐳 Docker Deployment

### Development with Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Update after changes
docker-compose down
docker-compose up -d --build
```

### Production with Docker

1. Build the image:
   ```bash
   docker build -t sjl-tournament .
   ```

2. Run the container:
   ```bash
   docker run -d \
     --name sjl-tournament \
     -p 3000:3000 \
     -p 3001:3001 \
     -e DATABASE_URL=postgresql://user:password@your-db-host:5432/sjl_tournament \
     -e JWT_SECRET=your-strong-secret \
     -e NODE_ENV=production \
     sjl-tournament
   ```

## 🔧 Troubleshooting

### Common Issues

#### 1. Prisma Generate Fails with SSL Error

```
npm error code SELF_SIGNED_CERT_IN_CHAIN
```

**Solution:**
```bash
npm config set strict-ssl false
npx prisma generate
```

#### 2. Database Connection Refused

```
PrismaClientInitializationError: Can't reach database server
```

**Solution:**
- Check if PostgreSQL is running
- Verify the connection string in `.env`
- If using Docker, make sure to use `db` as hostname, not `localhost`

#### 3. Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Find and kill the process using port 3000
lsof -i :3000
kill -9 <PID>

# Or use a different port
PORT=3001 npm run dev
```

#### 4. Missing Environment Variables

```
Error: Environment variable DATABASE_URL is not set
```

**Solution:**
```bash
# Make sure .env file exists
cp .env.example .env

# Edit .env with your database credentials
nano .env  # or use any text editor
```

### Debug Mode

To see detailed logs:

```bash
# Set debug mode
DEBUG=* npm run dev

# Or for Prisma specifically
PRISMA_DEBUG=1 npm run dev
```

## 📞 Support

If you encounter issues:

1. Check the [Prisma Documentation](https://www.prisma.io/docs)
2. Check the [Nuxt 3 Documentation](https://nuxt.com/docs)
3. Review the error message carefully
4. Check the console logs for more details
5. Make sure all dependencies are installed (`npm install`)

## 🎉 Success!

Once everything is set up correctly, you should be able to:

- ✅ Access the application at http://localhost:3000
- ✅ Register and login as users
- ✅ Create tournaments, teams, and matches
- ✅ Update scores in real-time
- ✅ See live updates across all connected clients

Happy tournament managing! 🏆
