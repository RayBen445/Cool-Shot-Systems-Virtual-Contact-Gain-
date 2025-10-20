const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Data directory to store sessions
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Collection end date (5 days from now by default)
const DEFAULT_DAYS = 5;

// Helper function to generate session ID using cryptographically secure random
function generateSessionId() {
  return crypto.randomBytes(8).toString('hex');
}

// Helper function to validate and sanitize session ID
// This prevents path injection attacks by only allowing safe characters
function sanitizeSessionId(sessionId) {
  // Only allow alphanumeric characters and 'default'
  if (sessionId === 'default') {
    return 'default';
  }
  // Validate format: only hex characters, 16 characters long
  if (/^[a-f0-9]{16}$/.test(sessionId)) {
    return sessionId;
  }
  return null;
}

// Helper function to get session file path
// Protected against path injection by sanitizeSessionId
function getSessionFile(sessionId) {
  const sanitized = sanitizeSessionId(sessionId);
  if (!sanitized) {
    return null;
  }
  // Safe to use sanitized value - only allows alphanumeric chars
  return path.join(DATA_DIR, `${sanitized}.json`);
}

// Helper function to read session data
// Protected against path injection by getSessionFile validation
function readSession(sessionId) {
  const sessionFile = getSessionFile(sessionId);
  if (!sessionFile || !fs.existsSync(sessionFile)) {
    return null;
  }
  // sessionFile is guaranteed to be safe due to sanitization
  const data = fs.readFileSync(sessionFile, 'utf8');
  return JSON.parse(data);
}

// Helper function to write session data
// Protected against path injection by getSessionFile validation
function writeSession(sessionId, data) {
  const sessionFile = getSessionFile(sessionId);
  if (!sessionFile) {
    throw new Error('Invalid session ID');
  }
  // sessionFile is guaranteed to be safe due to sanitization
  fs.writeFileSync(sessionFile, JSON.stringify(data, null, 2));
}

// Simple in-memory rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 30; // 30 requests per minute per IP

function checkRateLimit(ip) {
  const now = Date.now();
  const requestLog = rateLimitMap.get(ip) || [];
  
  // Filter out old requests outside the window
  const recentRequests = requestLog.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  
  // Clean up old entries periodically
  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.length === 0 || now - value[value.length - 1] > RATE_LIMIT_WINDOW) {
        rateLimitMap.delete(key);
      }
    }
  }
  
  return true;
}

// Rate limiting middleware
function rateLimitMiddleware(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }
  next();
}

// Helper function to generate VCF content
function generateVCF(contacts) {
  let vcfContent = '';
  
  // Add Cool Shot Systems company signature at the top
  vcfContent += 'BEGIN:VCARD\n';
  vcfContent += 'VERSION:3.0\n';
  vcfContent += 'FN:Cool Shot Systems\n';
  vcfContent += 'ORG:Cool Shot Systems\n';
  vcfContent += 'NOTE:Virtual Contact Gain World - Collective Contact Collection\n';
  vcfContent += 'END:VCARD\n';
  
  // Add all submitted contacts
  contacts.forEach(contact => {
    vcfContent += 'BEGIN:VCARD\n';
    vcfContent += 'VERSION:3.0\n';
    vcfContent += `FN:${contact.name}\n`;
    vcfContent += `TEL:${contact.phone}\n`;
    if (contact.email) {
      vcfContent += `EMAIL:${contact.email}\n`;
    }
    vcfContent += 'END:VCARD\n';
  });
  
  return vcfContent;
}

// API Routes

// Create a new session
app.post('/api/session/create', rateLimitMiddleware, (req, res) => {
  const { days } = req.body;
  const sessionId = generateSessionId();
  const daysToAdd = days || DEFAULT_DAYS;
  const endDate = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000).toISOString();
  
  const sessionData = {
    sessionId,
    contacts: [],
    endDate,
    createdAt: new Date().toISOString()
  };
  
  writeSession(sessionId, sessionData);
  
  res.json({
    success: true,
    sessionId,
    endDate,
    shareUrl: `/session/${sessionId}`
  });
});

// Get session info (for specific session)
app.get('/api/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const data = readSession(sessionId);
  
  if (!data) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.json({
    endDate: data.endDate,
    contactCount: data.contacts.length,
    createdAt: data.createdAt
  });
});

// Get countdown info (legacy endpoint - creates default session if needed)
app.get('/api/countdown', (req, res) => {
  const sessionId = req.query.sessionId || 'default';
  let data = readSession(sessionId);
  
  if (!data) {
    // Create default session
    const endDate = new Date(Date.now() + DEFAULT_DAYS * 24 * 60 * 60 * 1000).toISOString();
    data = {
      sessionId,
      contacts: [],
      endDate,
      createdAt: new Date().toISOString()
    };
    writeSession(sessionId, data);
  }
  
  res.json({ 
    endDate: data.endDate,
    contactCount: data.contacts.length 
  });
});

// Submit contact
app.post('/api/submit', rateLimitMiddleware, (req, res) => {
  const { name, phone, email, sessionId } = req.body;
  
  // Validate required fields
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }
  
  const sid = sessionId || 'default';
  let data = readSession(sid);
  
  if (!data) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  // Check if collection period has ended
  if (new Date() > new Date(data.endDate)) {
    return res.status(400).json({ error: 'Collection period has ended' });
  }
  
  // Add contact
  data.contacts.push({
    name: name.trim(),
    phone: phone.trim(),
    email: email ? email.trim() : null,
    submittedAt: new Date().toISOString()
  });
  
  writeSession(sid, data);
  
  res.json({ 
    success: true, 
    message: 'Contact added successfully',
    contactCount: data.contacts.length 
  });
});

// Download VCF file
app.get('/api/download', rateLimitMiddleware, (req, res) => {
  const sessionId = req.query.sessionId || 'default';
  const data = readSession(sessionId);
  
  if (!data) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  // Generate VCF content
  const vcfContent = generateVCF(data.contacts);
  
  // Set headers for file download
  res.setHeader('Content-Type', 'text/vcard');
  res.setHeader('Content-Disposition', 'attachment; filename="cool-shot-systems-contacts.vcf"');
  
  res.send(vcfContent);
});

// Serve session-specific page
app.get('/session/:sessionId', rateLimitMiddleware, (req, res) => {
  // Note: sessionId validation happens client-side via API calls
  // This endpoint just serves the static HTML page
  res.sendFile(path.join(__dirname, 'public', 'session.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Cool Shot Systems Virtual Contact Gain World running on port ${PORT}`);
  console.log(`Default collection period: ${DEFAULT_DAYS} days`);
});

module.exports = app;
