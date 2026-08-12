const jwt = require('jsonwebtoken');
const logger = require('../services/logger');

const JWT_SECRET = 'supersecretjwtkeyforcgstapp2026';

const ADMIN_EMAIL = 'admin@cgst.com';
const ADMIN_PASSWORD = 'adminpassword';
const RECEPTIONIST_EMAIL = 'receptionist@cgst.com';
const RECEPTIONIST_PASSWORD ='receptionistpassword';

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    let role = null;
    let name = '';

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      role = 'admin';
      name = 'System Administrator';
    } else if (email === RECEPTIONIST_EMAIL && password === RECEPTIONIST_PASSWORD) {
      role = 'receptionist';
      name = 'Front Desk Receptionist';
    }

    if (!role) {
      logger.audit('System', 'LOGIN_FAILURE', `Failed login attempt for email: ${email}`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { email, role, name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    logger.audit(name, 'LOGIN_SUCCESS', `User connected with role: ${role}`);

    return res.json({
      token,
      user: {
        email,
        role,
        name
      }
    });
  } catch (error) {
    logger.error(`Login process error: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
}

module.exports = {
  login
};
