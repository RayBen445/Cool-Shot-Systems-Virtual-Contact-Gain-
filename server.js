const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Data file to store contacts
const DATA_FILE = path.join(__dirname, 'contacts.json');

// Collection end date (7 days from now by default)
const COLLECTION_END_DATE = process.env.END_DATE || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

// Initialize contacts file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ contacts: [], endDate: COLLECTION_END_DATE }));
}

// Helper function to read contacts
function readContacts() {
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data);
}

// Helper function to write contacts
function writeContacts(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
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

// Get countdown info
app.get('/api/countdown', (req, res) => {
  const data = readContacts();
  res.json({ 
    endDate: data.endDate,
    contactCount: data.contacts.length 
  });
});

// Submit contact
app.post('/api/submit', (req, res) => {
  const { name, phone, email } = req.body;
  
  // Validate required fields
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }
  
  const data = readContacts();
  
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
  
  writeContacts(data);
  
  res.json({ 
    success: true, 
    message: 'Contact added successfully',
    contactCount: data.contacts.length 
  });
});

// Download VCF file
app.get('/api/download', (req, res) => {
  const data = readContacts();
  
  // Generate VCF content
  const vcfContent = generateVCF(data.contacts);
  
  // Set headers for file download
  res.setHeader('Content-Type', 'text/vcard');
  res.setHeader('Content-Disposition', 'attachment; filename="cool-shot-systems-contacts.vcf"');
  
  res.send(vcfContent);
});

// Start server
app.listen(PORT, () => {
  console.log(`Cool Shot Systems Virtual Contact Gain World running on port ${PORT}`);
  console.log(`Collection ends: ${COLLECTION_END_DATE}`);
});
