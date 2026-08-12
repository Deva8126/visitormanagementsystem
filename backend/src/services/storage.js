const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const googleConfig = require('../config/google');
const logger = require('./logger');

const dataDir = path.join(__dirname, '../../data');
const dbFile = path.join(dataDir, 'db.json');
const uploadsDir = path.join(dataDir, 'uploads');

// Ensure local directories exist
function ensureLocalDirectories() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, JSON.stringify({ visitors: [] }, null, 2), 'utf8');
  }
}

// Convert base64 data URI to buffer
function decodeBase64Image(dataString) {
  const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 image string format');
  }
  return {
    type: matches[1],
    buffer: Buffer.from(matches[2], 'base64')
  };
}

// Helper to convert buffer to readable stream for Google Drive upload
function bufferToStream(buffer) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

// Service implementation
const storageService = {
  async init() {
    ensureLocalDirectories();
    
    if (googleConfig.useGoogle) {
      try {
        const { sheetsClient, spreadsheetId } = googleConfig;
        // Check sheet access and verify if headers exist
        const response = await sheetsClient.spreadsheets.values.get({
          spreadsheetId,
          range: 'Sheet1!A1:S1'
        });
        
        const rows = response.data.values;
        if (!rows || rows.length === 0) {
          // Write default headers
          const headers = [
            'Timestamp', 'Token No', 'Visitor Name', 'Address', 
            'Mobile', 'Purpose', 'Host Name', 'ID Type', 
            'ID Number', 'Photo URL', 'Status', 'Exit Time', 'Registered By', 'Document URL',
            'Purpose Type', 'Purpose Category', 'Purpose Subcategory', 'Custom Purpose', 'Room No'
          ];
          await sheetsClient.spreadsheets.values.update({
            spreadsheetId,
            range: 'Sheet1!A1:S1',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [headers] }
          });
          logger.info('Google Sheets initialized: Headers written successfully.');
        } else {
          logger.info('Google Sheets initialized: Existing sheet headers verified.');
        }
      } catch (err) {
        logger.error(`Failed to initialize Google Sheets. Falling back to local storage. Error: ${err.message}`);
        googleConfig.useGoogle = false; // Disable Google mode on initial contact error
      }
    }
  },

  async getNextToken() {
    if (googleConfig.useGoogle) {
      try {
        const { sheetsClient, spreadsheetId } = googleConfig;
        const response = await sheetsClient.spreadsheets.values.get({
          spreadsheetId,
          range: 'Sheet1!B:B' // Only fetch Token column
        });
        const rows = response.data.values || [];
        const count = rows.length; // includes headers, so if length is 1, next index is T1001
        return `T${1000 + count}`;
      } catch (err) {
        logger.error(`Error fetching token from Google Sheets: ${err.message}. Using fallback token.`);
      }
    }
    
    // Local fallback
    ensureLocalDirectories();
    const data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
    const count = data.visitors.length;
    return `T${1001 + count}`;
  },

  async saveVisitor(visitorInput, photoBase64, documentBase64, reqBaseUrl) {
    const token = await this.getNextToken();
    const timestamp = new Date().toISOString();
    let photoUrl = '';
    let documentUrl = '';
    
    // 1. Process and save Photo
    if (photoBase64) {
      const decoded = decodeBase64Image(photoBase64);
      
      if (googleConfig.useGoogle) {
        try {
          const { driveClient, driveFolderId } = googleConfig;
          
          // Upload file to Google Drive
          const media = {
            mimeType: decoded.type,
            body: bufferToStream(decoded.buffer)
          };
          
          const fileMetadata = {
            name: `${token}.jpg`,
            parents: [driveFolderId]
          };
          
          const driveResponse = await driveClient.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, webViewLink, webContentLink'
          });
          
          const fileId = driveResponse.data.id;
          
          // Set anyone reader permissions so the image is public
          await driveClient.permissions.create({
            fileId: fileId,
            requestBody: {
              role: 'reader',
              type: 'anyone'
            }
          });
          
          photoUrl = `https://docs.google.com/uc?export=view&id=${fileId}`;
          logger.info(`Photo uploaded to Google Drive. File ID: ${fileId}`);
        } catch (err) {
          logger.error(`Failed to upload photo to Google Drive: ${err.message}. Falling back to local storage.`);
          // Save local copy
          const localFileName = `${token}.jpg`;
          const localPath = path.join(uploadsDir, localFileName);
          fs.writeFileSync(localPath, decoded.buffer);
          photoUrl = `${reqBaseUrl}/uploads/${localFileName}`;
        }
      } else {
        // Local upload
        const localFileName = `${token}.jpg`;
        const localPath = path.join(uploadsDir, localFileName);
        fs.writeFileSync(localPath, decoded.buffer);
        photoUrl = `${reqBaseUrl}/uploads/${localFileName}`;
        logger.info(`Photo saved locally to ${localPath}`);
      }
    }

    // 2. Process and save Document
    if (documentBase64) {
      try {
        const decoded = decodeBase64Image(documentBase64);
        const mimeToExt = {
          'image/jpeg': 'jpg',
          'image/png': 'png',
          'image/webp': 'webp',
          'image/gif': 'gif',
          'application/pdf': 'pdf'
        };
        const ext = mimeToExt[decoded.type] || 'jpg';
        const docFileName = `${token}_doc.${ext}`;
        
        if (googleConfig.useGoogle) {
          try {
            const { driveClient, driveFolderId } = googleConfig;
            
            // Upload file to Google Drive
            const media = {
              mimeType: decoded.type,
              body: bufferToStream(decoded.buffer)
            };
            
            const fileMetadata = {
              name: docFileName,
              parents: [driveFolderId]
            };
            
            const driveResponse = await driveClient.files.create({
              requestBody: fileMetadata,
              media: media,
              fields: 'id, webViewLink, webContentLink'
            });
            
            const fileId = driveResponse.data.id;
            
            // Set anyone reader permissions so the image is public
            await driveClient.permissions.create({
              fileId: fileId,
              requestBody: {
                role: 'reader',
                type: 'anyone'
              }
            });
            
            documentUrl = `https://docs.google.com/uc?export=view&id=${fileId}`;
            logger.info(`Document uploaded to Google Drive. File ID: ${fileId}`);
          } catch (err) {
            logger.error(`Failed to upload document to Google Drive: ${err.message}. Falling back to local storage.`);
            // Save local copy
            const localPath = path.join(uploadsDir, docFileName);
            fs.writeFileSync(localPath, decoded.buffer);
            documentUrl = `${reqBaseUrl}/uploads/${docFileName}`;
          }
        } else {
          // Local upload
          const localPath = path.join(uploadsDir, docFileName);
          fs.writeFileSync(localPath, decoded.buffer);
          documentUrl = `${reqBaseUrl}/uploads/${docFileName}`;
          logger.info(`Document saved locally to ${localPath}`);
        }
      } catch (err) {
        logger.error(`Error processing document upload: ${err.message}`);
      }
    }

    const newVisitor = {
      timestamp,
      token,
      name: visitorInput.name,
      address: visitorInput.address,
      mobile: visitorInput.mobile,
      purpose: visitorInput.purpose,
      purposeType: visitorInput.purposeType,
      purposeCategory: visitorInput.purposeCategory,
      purposeSubcategory: visitorInput.purposeSubcategory,
      customPurpose: visitorInput.customPurpose || '',
      roomNo: visitorInput.roomNo || '',
      hostName: visitorInput.hostName,
      idType: visitorInput.idType,
      idNumber: visitorInput.idNumber,
      registeredBy: visitorInput.registeredBy || 'Unknown',
      photoUrl,
      documentUrl,
      status: 'Inside',
      exitTime: ''
    };

    // 3. Save visitor record
    if (googleConfig.useGoogle) {
      try {
        const { sheetsClient, spreadsheetId } = googleConfig;
        const rowValue = [
          newVisitor.timestamp,
          newVisitor.token,
          newVisitor.name,
          newVisitor.address,
          newVisitor.mobile,
          newVisitor.purpose,
          newVisitor.hostName,
          newVisitor.idType,
          newVisitor.idNumber,
          newVisitor.photoUrl,
          newVisitor.status,
          newVisitor.exitTime,
          newVisitor.registeredBy,
          newVisitor.documentUrl,
          newVisitor.purposeType || '',
          newVisitor.purposeCategory || '',
          newVisitor.purposeSubcategory || '',
          newVisitor.customPurpose || '',
          newVisitor.roomNo || ''
        ];
        
        await sheetsClient.spreadsheets.values.append({
          spreadsheetId,
          range: 'Sheet1!A:S',
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [rowValue]
          }
        });
        logger.info(`Saved visitor ${token} to Google Sheet.`);
      } catch (err) {
        logger.error(`Failed to save visitor to Google Sheets: ${err.message}. Saving to local backup.`);
        this.saveToLocalDb(newVisitor);
      }
    } else {
      this.saveToLocalDb(newVisitor);
    }

    return newVisitor;
  },

  saveToLocalDb(visitor) {
    ensureLocalDirectories();
    const data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
    data.visitors.push(visitor);
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf8');
  },

  async updateVisitorExit(token) {
    const exitTime = new Date().toISOString();
    let updatedRecord = null;

    if (googleConfig.useGoogle) {
      try {
        const { sheetsClient, spreadsheetId } = googleConfig;
        // 1. Fetch current rows
        const response = await sheetsClient.spreadsheets.values.get({
          spreadsheetId,
          range: 'Sheet1!A:L'
        });
        const rows = response.data.values || [];
        
        // Find row index (headers is rows[0])
        let rowIndex = -1;
        for (let i = 1; i < rows.length; i++) {
          if (rows[i][1] === token) {
            rowIndex = i + 1; // 1-indexed for Sheet row
            break;
          }
        }

        if (rowIndex === -1) {
          throw new Error(`Visitor with token ${token} not found in Google Sheets`);
        }

        // Update columns K (Status) and L (Exit Time) for that row index
        await sheetsClient.spreadsheets.values.update({
          spreadsheetId,
          range: `Sheet1!K${rowIndex}:L${rowIndex}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [['Exited', exitTime]]
          }
        });
        logger.info(`Updated visitor ${token} exit in Google Sheet.`);
        
        // Re-read updated record
        const getRow = await sheetsClient.spreadsheets.values.get({
          spreadsheetId,
          range: `Sheet1!A${rowIndex}:S${rowIndex}`
        });
        
        const updatedRow = getRow.data.values[0];
        updatedRecord = {
          timestamp: updatedRow[0],
          token: updatedRow[1],
          name: updatedRow[2],
          address: updatedRow[3],
          mobile: updatedRow[4],
          purpose: updatedRow[5],
          hostName: updatedRow[6],
          idType: updatedRow[7],
          idNumber: updatedRow[8],
          photoUrl: updatedRow[9],
          status: updatedRow[10],
          exitTime: updatedRow[11],
          registeredBy: updatedRow[12] || '',
          documentUrl: updatedRow[13] || '',
          purposeType: updatedRow[14] || '',
          purposeCategory: updatedRow[15] || '',
          purposeSubcategory: updatedRow[16] || '',
          customPurpose: updatedRow[17] || '',
          roomNo: updatedRow[18] || ''
        };
        return updatedRecord;
      } catch (err) {
        logger.error(`Google Sheet update exit failed: ${err.message}. Running local exit update.`);
      }
    }

    // Local fallback exit update
    ensureLocalDirectories();
    const data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
    const visitor = data.visitors.find(v => v.token === token);
    if (!visitor) {
      throw new Error(`Visitor with token ${token} not found`);
    }
    visitor.status = 'Exited';
    visitor.exitTime = exitTime;
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf8');
    logger.info(`Updated visitor ${token} exit locally.`);
    return visitor;
  },

  async getVisitors() {
    if (googleConfig.useGoogle) {
      try {
        const { sheetsClient, spreadsheetId } = googleConfig;
        const response = await sheetsClient.spreadsheets.values.get({
          spreadsheetId,
          range: 'Sheet1!A:S'
        });
        const rows = response.data.values || [];
        if (rows.length <= 1) return []; // Only header or empty
        
        // Map rows to objects
        const visitors = [];
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          visitors.push({
            timestamp: row[0] || '',
            token: row[1] || '',
            name: row[2] || '',
            address: row[3] || '',
            mobile: row[4] || '',
            purpose: row[5] || '',
            hostName: row[6] || '',
            idType: row[7] || '',
            idNumber: row[8] || '',
            photoUrl: row[9] || '',
            status: row[10] || 'Inside',
            exitTime: row[11] || '',
            registeredBy: row[12] || '',
            documentUrl: row[13] || '',
            purposeType: row[14] || '',
            purposeCategory: row[15] || '',
            purposeSubcategory: row[16] || '',
            customPurpose: row[17] || '',
            roomNo: row[18] || ''
          });
        }
        return visitors;
      } catch (err) {
        logger.error(`Failed to fetch from Google Sheets: ${err.message}. Fetching from local DB.`);
      }
    }

    // Local DB
    ensureLocalDirectories();
    const data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
    return data.visitors;
  }
};

module.exports = storageService;
