# Vercel Deployment Guide

## Overview

This application is configured to deploy on Vercel with a serverless architecture. However, there are important considerations about data persistence.

## Deployment Steps

1. **Connect to GitHub**
   - Visit [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select this GitHub repository

2. **Configure Project**
   - Vercel will automatically detect the configuration
   - No additional build settings needed
   - Click "Deploy"

3. **Access Your App**
   - Once deployed, Vercel will provide a URL
   - Your app will be available at `https://your-project.vercel.app`

## Important: Data Persistence

### ⚠️ Limitation on Vercel

**Sessions are stored in-memory on Vercel**, which means:

- ❌ Data is **NOT persistent** across deployments
- ❌ Sessions will be **lost** when the serverless function restarts
- ❌ Data will be **lost** after ~15 minutes of inactivity
- ✅ Works fine for **temporary/demo purposes**
- ✅ Great for **testing the application**

### When to Use Vercel (In-Memory Storage)

- ✓ Demo or prototype deployments
- ✓ Short-lived events (few hours)
- ✓ Testing and development
- ✓ Low-traffic applications where occasional data loss is acceptable

### For Production Use

If you need **persistent data storage**, you have two options:

#### Option 1: Use Vercel with a Database

Add a database service to your Vercel deployment:

**Vercel Postgres** (Recommended)
```bash
# Install Vercel Postgres
npm install @vercel/postgres

# Add to your Vercel project
vercel env add DATABASE_URL
```

**MongoDB Atlas**
```bash
npm install mongodb
# Set MONGODB_URI in Vercel environment variables
```

**Redis** (for session data)
```bash
npm install ioredis
# Set REDIS_URL in Vercel environment variables
```

#### Option 2: Deploy to Another Platform

Platforms that support persistent file storage:

- **Railway**: Supports persistent volumes
- **Render**: Supports persistent disks
- **DigitalOcean App Platform**: Supports persistent storage
- **AWS EC2/Lightsail**: Full control over file system
- **Heroku**: Supports persistent storage with add-ons

## Current Behavior

### Local Development
- ✅ Uses file-based storage (`data/` directory)
- ✅ Data persists between restarts
- ✅ Sessions are saved to JSON files

### Vercel Deployment
- ⚠️ Uses in-memory storage (JavaScript Map)
- ❌ Data does NOT persist
- ⚠️ Sessions lost on serverless function restart

## How It Works

The application automatically detects the environment:

```javascript
// Detected via environment variable
const IS_VERCEL = process.env.VERCEL === '1';

if (IS_VERCEL) {
  // Use in-memory storage (ephemeral)
  memoryStorage.set(sessionId, data);
} else {
  // Use file storage (persistent)
  fs.writeFileSync(sessionFile, data);
}
```

## Recommended Setup for Production

### Step 1: Choose a Database

For production on Vercel, we recommend **Vercel Postgres**:

1. Install the package:
   ```bash
   npm install @vercel/postgres
   ```

2. Add to your Vercel project:
   - Go to your project dashboard
   - Click "Storage" → "Create Database"
   - Select "Postgres"
   - Copy the connection string

3. Update code to use the database (see `MIGRATION_GUIDE.md`)

### Step 2: Migrate Data Model

You'll need to update the code to use SQL queries instead of JSON files. See the migration guide for details.

## Testing on Vercel

You can test the current deployment (with in-memory storage):

1. Deploy to Vercel
2. Create a session
3. Add contacts
4. Download VCF

**Note**: Sessions will work temporarily but will be lost after function restarts.

## Alternative: Self-Hosting

If you prefer to keep the file-based storage:

```bash
# Run locally or on a VPS
npm install
npm start

# Or use Docker
docker build -t cool-shot-systems .
docker run -p 3000:3000 -v $(pwd)/data:/app/data cool-shot-systems
```

## Environment Variables

The following environment variables are supported:

- `PORT`: Server port (default: 3000)
- `VERCEL`: Set to '1' by Vercel (auto-detected)
- `DATABASE_URL`: Database connection string (if using database)

## Questions?

- **"Why doesn't data persist on Vercel?"**
  Vercel uses serverless functions which have ephemeral file systems. Files written during a request are lost when the function shuts down.

- **"How long do sessions last on Vercel?"**
  Sessions persist while the serverless function is warm (~15 minutes of activity). After that, they're lost.

- **"Should I use Vercel for production?"**
  Yes, but add a database for data persistence. The current setup is fine for demos and testing.

## Summary

| Feature | Local Development | Vercel (Current) | Vercel + Database |
|---------|------------------|------------------|-------------------|
| Data Persistence | ✅ Yes | ❌ No | ✅ Yes |
| Easy Setup | ✅ Yes | ✅ Yes | ⚠️ Moderate |
| Scalability | ❌ Limited | ✅ Excellent | ✅ Excellent |
| Cost | ✅ Free | ✅ Free tier | 💰 Database costs |
| Best For | Development | Demos/Testing | Production |

---

**Last Updated**: October 20, 2025  
**Status**: ✅ Vercel-compatible (with in-memory storage limitation noted)
