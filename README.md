# Cool Shot Systems - Virtual Contact Gain World 🎯

A web application for collecting contact information from multiple visitors into a single, collective VCF (vCard) file. Perfect for events, meetups, or networking sessions where participants want to share their contact information with the entire group.

## Features

- 📝 **Simple Contact Form**: Visitors submit their Name, Phone, and optionally Email
- ⏱️ **Countdown Timer**: Live countdown showing the collection period (default: 7 days)
- 📊 **Real-time Stats**: Display of total contacts collected
- 📥 **VCF Download**: Generate and download a single VCF file containing all contacts
- 🏢 **Company Branding**: VCF file includes Cool Shot Systems branding
- 💅 **Modern UI**: Beautiful gradient design with responsive layout

## Installation

1. Clone the repository:
```bash
git clone https://github.com/RayBen445/Cool-Shot-Systems-Virtual-Contact-Gain-.git
cd Cool-Shot-Systems-Virtual-Contact-Gain-
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

### For Visitors

1. **Submit Your Contact**: Fill out the form with your Name and Phone (Email is optional)
2. **Watch the Countdown**: See how much time remains in the collection period
3. **Download VCF**: Once the collection period is active, click "Download VCF File" to get all contacts

### For Administrators

The application automatically:
- Creates a `contacts.json` file to store submitted contacts
- Sets a collection end date (7 days from server start by default)
- Generates VCF files on-demand with Cool Shot Systems branding

## Configuration

You can customize the collection end date by setting the `END_DATE` environment variable:

```bash
END_DATE="2025-12-31T23:59:59.999Z" npm start
```

You can also change the port:

```bash
PORT=8080 npm start
```

## API Endpoints

- `GET /api/countdown` - Get countdown information and contact count
- `POST /api/submit` - Submit a new contact
- `GET /api/download` - Download the VCF file

## VCF File Format

The generated VCF file includes:
1. **Cool Shot Systems Company Card** (at the top)
2. **All Submitted Contacts** with their:
   - Full Name
   - Phone Number
   - Email Address (if provided)

Example VCF output:
```
BEGIN:VCARD
VERSION:3.0
FN:Cool Shot Systems
ORG:Cool Shot Systems
NOTE:Virtual Contact Gain World - Collective Contact Collection
END:VCARD
BEGIN:VCARD
VERSION:3.0
FN:John Doe
TEL:555-1234
EMAIL:john@example.com
END:VCARD
```

## Technologies Used

- **Backend**: Node.js with Express
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Data Storage**: JSON file-based storage
- **VCF Generation**: Custom vCard 3.0 format

## File Structure

```
Cool-Shot-Systems-Virtual-Contact-Gain-/
├── server.js           # Express server and API endpoints
├── package.json        # Node.js dependencies
├── contacts.json       # Contact data storage (auto-generated)
├── public/
│   ├── index.html     # Main HTML page
│   ├── styles.css     # CSS styling
│   └── script.js      # Client-side JavaScript
└── README.md          # This file
```

## Screenshot

![Cool Shot Systems Website](screenshot.png)

## License

MIT

## Author

Cool Shot Systems - Virtual Contact Gain World

---

Made with ❤️ by Cool Shot Systems