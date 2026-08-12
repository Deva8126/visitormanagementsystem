const { google } = require('googleapis');
const logger = require('../services/logger');

let sheetsClient = null;
let driveClient = null;
let useGoogle = false;

const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
let privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

if (clientEmail && privateKey && spreadsheetId && driveFolderId) {
  try {
    // Format private key if it contains escaped newlines
    const formattedKey = privateKey.replace(/\\n/g, '\n');
    
    const auth = new google.auth.JWT(
      clientEmail,
      null,
      formattedKey,
      [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive'
      ]
    );
    
    sheetsClient = google.sheets({ version: 'v4', auth });
    driveClient = google.drive({ version: 'v3', auth });
    useGoogle = true;
    logger.info('Google Cloud Integration: Credentials loaded. Initializing Google Sheets and Drive API.');
  } catch (error) {
    logger.error(`Google Cloud Integration: Initialization failed: ${error.message}. Defaulting to Local Mode.`);
    useGoogle = false;
  }
} else {
  logger.info('Google Cloud Integration: Config is incomplete. Defaulting to Local Mode.');
}

module.exports = {
  useGoogle,
  sheetsClient,
  driveClient,
  spreadsheetId,
  driveFolderId
};
