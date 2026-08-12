const storageService = require('./services/storage');
const logger = require('./services/logger');

async function test() {
  logger.info('===================================================');
  logger.info('CGST Storage Verification Test Initiated');
  logger.info('===================================================');
  
  // 1. Initialize DB / directory structures
  await storageService.init();
  logger.info('Storage initialized.');

  // 2. Fetch upcoming token ID
  const token = await storageService.getNextToken();
  logger.info(`Token generation test: OK. Next Token: ${token}`);

  // 3. Mock Check-In Registration
  const mockVisitor = {
    name: 'Jatin Verification',
    address: 'Gemini Lab Headquarters',
    mobile: '9876543210',
    purpose: 'Official Meeting',
    hostName: 'Dr. Jatin',
    idType: 'Government ID',
    idNumber: 'GOV-5544-2211'
  };
  
  // Minimal valid 1x1 base64 JPEG photo string
  const mockPhotoBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
  
  const saved = await storageService.saveVisitor(mockVisitor, mockPhotoBase64, 'http://localhost:5000');
  logger.info(`Register API test: OK. Token: ${saved.token} | Name: ${saved.name} | Status: ${saved.status}`);
  logger.info(`Photo upload handler test: OK. Photo URL: ${saved.photoUrl}`);

  // 4. Fetch records and assert check-in row
  const list = await storageService.getVisitors();
  const found = list.find(v => v.token === saved.token);
  if (found) {
    logger.info(`Database read test: OK. Visitor row found in database logs.`);
  } else {
    throw new Error('Visitor entry missing from logs DB!');
  }

  // 5. Checkout Exit Update Check
  const updated = await storageService.updateVisitorExit(saved.token);
  logger.info(`Checkout API test: OK. Token: ${updated.token} | Status: ${updated.status} | Exit Time: ${updated.exitTime}`);

  // 6. Assert checkout row in DB
  const updatedList = await storageService.getVisitors();
  const updatedFound = updatedList.find(v => v.token === saved.token);
  if (updatedFound && updatedFound.status === 'Exited' && updatedFound.exitTime) {
    logger.info(`Database exit status sync test: OK. Status is 'Exited'.`);
  } else {
    throw new Error('Database exit status verification assertion failed!');
  }

  logger.info('===================================================');
  logger.info('CGST Storage Verification Test Completed Successfully');
  logger.info('===================================================');
}

test().catch(err => {
  logger.error(`Storage Verification Assertion Failed: ${err.message}`);
  process.exit(1);
});
