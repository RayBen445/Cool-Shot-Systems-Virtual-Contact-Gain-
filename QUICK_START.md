# Quick Start Guide

## For Users

### How to Submit Your Contact

1. Open the website in your browser
2. Fill in the form:
   - **Name**: Your full name (required)
   - **Phone**: Your phone number (required)
   - **Email**: Your email address (optional)
3. Click "Submit Contact"
4. You'll see a success message and the contact counter will update

### How to Download the VCF File

1. Click the "Download VCF File" button
2. Your browser will download a file named `cool-shot-systems-contacts.vcf`
3. Import this file to your contacts app:
   - **iPhone/iPad**: Tap the file and select "Add All Contacts"
   - **Android**: Open Contacts app → Import → Select the VCF file
   - **Outlook**: File → Open & Export → Import/Export → Import a vCard file
   - **Gmail**: Contacts → Import → Select file

## For Administrators

### Initial Setup

```bash
# Install Node.js (if not already installed)
# Download from https://nodejs.org/

# Clone and setup
git clone <repository-url>
cd Cool-Shot-Systems-Virtual-Contact-Gain-
npm install
npm start
```

### Configuration Options

**Set Collection End Date:**
```bash
END_DATE="2025-12-31T23:59:59.999Z" npm start
```

**Change Server Port:**
```bash
PORT=8080 npm start
```

**Both:**
```bash
PORT=8080 END_DATE="2025-12-31T23:59:59.999Z" npm start
```

### Data Management

- **Location**: Contact data is stored in `contacts.json`
- **Backup**: Copy `contacts.json` to backup your data
- **Reset**: Delete `contacts.json` to start fresh (will be recreated)
- **View Data**: Open `contacts.json` in any text editor

### Deployment

**Deploy to Heroku:**
```bash
heroku create cool-shot-systems
git push heroku main
heroku config:set END_DATE="2025-12-31T23:59:59.999Z"
```

**Deploy to other platforms:**
- Ensure Node.js 14+ is available
- Set environment variables if needed
- The app will run on port 3000 or PORT environment variable

### Monitoring

Check contact submissions:
```bash
curl http://localhost:3000/api/countdown
```

Response:
```json
{
  "endDate": "2025-10-27T09:32:32.274Z",
  "contactCount": 42
}
```

## Troubleshooting

**Server won't start:**
- Check if port 3000 is already in use
- Try a different port: `PORT=8080 npm start`

**Can't submit contacts:**
- Check that both Name and Phone are filled
- Verify the collection period hasn't ended

**VCF file won't import:**
- Ensure you have contacts to download
- Try a different contacts app
- VCF format is vCard 3.0 (widely supported)

## Support

For issues or questions, please open an issue on the GitHub repository.
