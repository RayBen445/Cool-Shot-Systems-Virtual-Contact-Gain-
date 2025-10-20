# Multi-Session Feature Guide

## Overview

The Cool Shot Systems Virtual Contact Gain World now supports **multiple independent collection sessions**. Each session has its own unique URL, contact list, and countdown timer.

## Key Features

### 🔗 Session Creation
- Create unlimited collection sessions
- Each session gets a unique shareable link
- Customize collection period (1-30 days, default: 5 days)
- Sessions are completely independent

### 📤 Easy Sharing
- Copy and share session URLs with participants
- Anyone with the link can submit contacts
- No signup or authentication required
- Simple, clean URLs (e.g., `/session/abc123xyz`)

### 📊 Independent Data
- Each session maintains its own contact list
- Separate countdown timers per session
- Individual VCF downloads for each session
- No data mixing between sessions

## Use Cases

### 1. Multiple Events
Run separate collections for different events simultaneously:
- Conference A: 7-day collection
- Meetup B: 3-day collection
- Workshop C: 5-day collection

### 2. Team Networking
Different teams can have their own sessions:
- Sales team gathering
- Developer meetup
- Executive networking event

### 3. Time-Limited Campaigns
Create sessions with different durations:
- Weekend event: 2 days
- Weekly workshop: 7 days
- Monthly gathering: 30 days

## How to Create a Session

### Step 1: Visit Homepage
Navigate to the main page of the application.

### Step 2: Set Duration
Choose the collection period (1-30 days). Default is 5 days.

### Step 3: Create Session
Click "Create Session & Get Link" button.

### Step 4: Share Link
Copy the generated URL and share it with participants:
```
https://your-domain.com/session/abc123xyz
```

## Session Page Features

Each session page includes:

1. **Countdown Timer**: Shows time remaining in collection period
2. **Contact Counter**: Displays total contacts submitted to this session
3. **Submission Form**: Name (required), Phone (required), Email (optional)
4. **Download Button**: Get VCF file with all contacts from this session
5. **Back to Home**: Link to create new sessions

## Technical Details

### Session ID Generation
- Random alphanumeric string (16 characters)
- Unique per session
- Collision-resistant

### Data Storage
- Sessions stored in `data/` directory
- One JSON file per session (`{sessionId}.json`)
- Files excluded from git via `.gitignore`

### Session Data Structure
```json
{
  "sessionId": "abc123xyz",
  "contacts": [
    {
      "name": "John Doe",
      "phone": "555-1234",
      "email": "john@example.com",
      "submittedAt": "2025-10-20T12:00:00.000Z"
    }
  ],
  "endDate": "2025-10-25T12:00:00.000Z",
  "createdAt": "2025-10-20T12:00:00.000Z"
}
```

## API Endpoints

### Create Session
```bash
POST /api/session/create
Content-Type: application/json

{
  "days": 5  # Optional, defaults to 5
}

Response:
{
  "success": true,
  "sessionId": "abc123xyz",
  "endDate": "2025-10-25T12:00:00.000Z",
  "shareUrl": "/session/abc123xyz"
}
```

### Get Session Info
```bash
GET /api/session/:sessionId

Response:
{
  "endDate": "2025-10-25T12:00:00.000Z",
  "contactCount": 42,
  "createdAt": "2025-10-20T12:00:00.000Z"
}
```

### Submit Contact
```bash
POST /api/submit
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "555-1234",
  "email": "john@example.com",  # Optional
  "sessionId": "abc123xyz"
}
```

### Download VCF
```bash
GET /api/download?sessionId=abc123xyz
```

## Default Session

A special "default" session is automatically created when:
- Someone visits `/session/default`
- Someone calls `/api/countdown` without a sessionId

This provides backward compatibility and a quick-start option.

## Best Practices

1. **Descriptive Links**: When sharing, include context
   - ❌ "Here's the link: https://..."
   - ✅ "Join our Tech Meetup contacts: https://..."

2. **Duration Planning**: Match duration to event type
   - One-day event: 1-2 days
   - Weekly event: 5-7 days
   - Monthly gathering: 14-30 days

3. **Share Early**: Share the link before the event starts

4. **Remind Participants**: Send reminder near the end of collection period

5. **Download Promptly**: Download VCF files before they expire

## Limitations

- Session data is file-based (consider database for production)
- No session management UI (sessions persist until manually deleted)
- No password protection (anyone with link can access)
- No edit/delete functionality for submitted contacts

## Future Enhancements

Potential improvements for future versions:
- Session password protection
- Admin dashboard for session management
- Email notifications when contacts are submitted
- Custom branding per session
- Session expiration and auto-cleanup
- Export to CSV/Excel formats
- Duplicate contact detection
