const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../data');
const logFile = path.join(logDir, 'audit.log');

// Ensure directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type}] ${message}\n`;
  console.log(logMessage.trim());
  try {
    fs.appendFileSync(logFile, logMessage, 'utf8');
  } catch (err) {
    console.error('Failed to write to audit log file:', err.message);
  }
}

module.exports = {
  info: (msg) => log(msg, 'INFO'),
  warn: (msg) => log(msg, 'WARN'),
  error: (msg) => log(msg, 'ERROR'),
  audit: (user, action, details) => log(`User: ${user} | Action: ${action} | Details: ${details}`, 'AUDIT')
};
