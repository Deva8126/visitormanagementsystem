const { validationResult } = require('express-validator');
const storageService = require('../services/storage');
const logger = require('../services/logger');

async function registerVisitor(req, res) {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
 
    const { 
      name, 
      address, 
      mobile, 
      purpose, 
      purposeType, 
      purposeCategory, 
      purposeSubcategory, 
      customPurpose, 
      roomNo,
      hostName, 
      idType, 
      idNumber, 
      photo, 
      document 
    } = req.body;
    
    // Construct base URL for local file fallback
    const reqBaseUrl = `${req.protocol}://${req.get('host')}`;
    
    const newVisitor = await storageService.saveVisitor(
      {  
        name, 
        address, 
        mobile, 
        purpose, 
        purposeType, 
        purposeCategory, 
        purposeSubcategory, 
        customPurpose, 
        roomNo,
        hostName, 
        idType, 
        idNumber, 
        registeredBy: req.user.name 
      },
      photo,
      document,
      reqBaseUrl
    );

    logger.audit(req.user.name, 'VISITOR_REGISTER', `Token: ${newVisitor.token} | Visitor: ${name} | Host: ${hostName}`);
    
    return res.status(201).json(newVisitor);
  } catch (err) {
    logger.error(`Failed to register visitor: ${err.message}`);
    return res.status(500).json({ error: `Failed to register visitor: ${err.message}` });
  }
}

async function getVisitorHistory(req, res) {
  try {
    const visitors = await storageService.getVisitors();
    return res.json(visitors);
  } catch (err) {
    logger.error(`Failed to fetch visitor history: ${err.message}`);
    return res.status(500).json({ error: 'Failed to fetch visitor history' });
  }
}

async function markVisitorExit(req, res) {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ error: 'Visitor token is required' });
    }

    const updatedVisitor = await storageService.updateVisitorExit(token);
    logger.audit(req.user.name, 'VISITOR_EXIT', `Token: ${token} | Status: Exited`);
    
    return res.json(updatedVisitor);
  } catch (err) {
    logger.error(`Failed to mark visitor exit: ${err.message}`);
    return res.status(500).json({ error: err.message || 'Failed to update visitor exit' });
  }
}

module.exports = {
  registerVisitor,
  getVisitorHistory,
  markVisitorExit
};
