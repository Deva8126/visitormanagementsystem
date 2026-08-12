const logger = require('../services/logger');

// Google Cloud integration is disabled.
// The application will use local storage instead.

const useGoogle = false;
const sheetsClient = null;
const driveClient = null;
const spreadsheetId = null;
const driveFolderId = null;

logger.info('Google Cloud Integration: Disabled. Using local storage mode.');

module.exports = {
  useGoogle,
  sheetsClient,
  driveClient,
  spreadsheetId,
  driveFolderId
};