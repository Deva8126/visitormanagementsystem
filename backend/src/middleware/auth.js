const jwt = require('jsonwebtoken');
const logger = require('../services/logger');

const JWT_SECRET = 'supersecretjwtkeyforcgstapp2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expecting Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      logger.warn('Failed API authentication attempt: Token invalid or expired');
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = decodedUser;
    next();
  });
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      const email = req.user ? req.user.email : 'unknown';
      const role = req.user ? req.user.role : 'none';
      logger.warn(`Role-Based Access: User ${email} (role: ${role}) denied access to ${req.originalUrl}`);
      return res.status(403).json({ error: 'Access denied: Insufficient privileges' });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles
};
