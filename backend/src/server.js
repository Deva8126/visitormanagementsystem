require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const logger = require('./services/logger');
const storageService = require('./services/storage');
const googleConfig = require('./config/google');
const { authenticateToken, authorizeRoles } = require('./middleware/auth');
const { login } = require('./controllers/auth');
const { registerVisitor, getVisitorHistory, markVisitorExit } = require('./controllers/visitor');
const { visitorValidationRules } = require('./middleware/validate');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

app.use(express.static(path.join(__dirname, "../public/dist")));

// Configure body parsing with increased size limit to hold webcam image payloads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static assets for the uploads directory in local mode
const uploadsPath = path.join(__dirname, '../data/uploads');
app.use('/uploads', express.static(uploadsPath));

// API health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    googleMode: googleConfig.useGoogle
  });
});

// Authentication Routes
app.post('/api/auth/login', login);

// Protected Visitor Management Routes (Both admin and receptionist allowed)
app.post('/api/visitors/register', authenticateToken, authorizeRoles('admin', 'receptionist'), visitorValidationRules, registerVisitor);
app.get('/api/visitors/history', authenticateToken, authorizeRoles('admin', 'receptionist'), getVisitorHistory);
app.put('/api/visitors/exit/:token', authenticateToken, authorizeRoles('admin', 'receptionist'), markVisitorExit);

// Connection Status API for the Settings page dashboard
app.get('/api/settings/status', authenticateToken, (req, res) => {
  res.json({
    googleIntegration: {
      enabled: googleConfig.useGoogle,
      sheetId: googleConfig.spreadsheetId || 'Not Configured',
      folderId: googleConfig.driveFolderId || 'Not Configured',
      serviceAccount: googleConfig.sheetsClient ? 'Connected' : 'Disconnected'
    },
    localFallback: {
      active: !googleConfig.useGoogle,
      databaseFileExists: require('fs').existsSync(path.join(__dirname, '../data/db.json'))
    }
  });
});

// Global Exception Filter
app.use((err, req, res, next) => {
  logger.error(`Express Global Exception: ${err.message}`);
  res.status(500).json({ error: 'An unexpected backend error occurred.' });
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/dist/index.html"));
});

// Start CGST Backend API Server
async function startServer() {
  try {
    await storageService.init();
    app.listen(PORT, () => {
      logger.info(`===================================================`);
      logger.info(`CGST REST Server listening on port ${PORT}`);
      logger.info(`Active database: ${googleConfig.useGoogle ? 'Google Sheets & Drive' : 'Local Fallback (db.json & local uploads)'}`);
      logger.info(`===================================================`);
    });
  } catch (err) {
    logger.error(`Critical: Express Server boot failure: ${err.message}`);
    process.exit(1);
  }
}

startServer();
