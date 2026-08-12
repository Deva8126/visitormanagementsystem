const { body } = require('express-validator');

const visitorValidationRules = [
  body('name').trim().notEmpty().withMessage('Visitor Name is required'),
  body('address').trim().notEmpty().withMessage('Address / Organization is required'),
  body('mobile')
    .trim()
    .notEmpty().withMessage('Mobile Number is required')
    .isLength({ min: 10, max: 15 }).withMessage('Mobile number must be between 10 and 15 digits')
    .matches(/^[0-9+\s]+$/).withMessage('Mobile number can only contain numbers, spaces, or "+"'),
  body('purpose').trim().notEmpty().withMessage('Purpose of Visit is required'),
  body('purposeType')
    .trim()
    .notEmpty().withMessage('Purpose Type is required')
    .isIn(['Officers / Official Visitors', 'Other Than Official']).withMessage('Purpose Type must be Officers / Official Visitors or Other Than Official'),
  body('purposeCategory').trim().notEmpty().withMessage('Category is required'),
  body('purposeSubcategory').trim().notEmpty().withMessage('Subcategory is required'),
  body('customPurpose')
    .custom((value, { req }) => {
      if (req.body.purposeSubcategory === 'Other' && (!value || !value.trim())) {
        throw new Error('Custom purpose of visit is required when "Other" is selected');
      }
      return true;
    }),
  body('roomNo')
    .trim()
    .custom((value, { req }) => {
      if (req.body.purposeType === 'Officers / Official Visitors' && (!value || !value.trim())) {
        throw new Error('Room Number is required for official visits');
      }
      return true;
    }),
  body('hostName').trim().notEmpty().withMessage('Host Name (Person to Meet) is required'),
  body('idType').trim().notEmpty().withMessage('ID Type is required'),
  body('idNumber').trim().notEmpty().withMessage('ID Number is required'),
  body('photo')
    .notEmpty().withMessage('Visitor photo capture is required')
    .custom((value) => {
      if (!value.startsWith('data:image/')) {
        throw new Error('Photo must be a valid captured webcam image URI');
      }
      return true;
    }),
  body('document')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (value && !value.startsWith('data:image/') && !value.startsWith('data:application/pdf')) {
        throw new Error('Uploaded document must be a valid image or PDF');
      }
      return true;
    })
];

module.exports = {
  visitorValidationRules
};
