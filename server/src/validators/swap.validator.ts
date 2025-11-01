import { body, param } from 'express-validator';

export const createSwapRequestValidation = [
  body('mySlotId')
    .notEmpty()
    .withMessage('mySlotId is required')
    .isMongoId()
    .withMessage('mySlotId must be a valid MongoDB ObjectId'),

  body('theirSlotId')
    .notEmpty()
    .withMessage('theirSlotId is required')
    .isMongoId()
    .withMessage('theirSlotId must be a valid MongoDB ObjectId')
    .custom((value, { req }) => {
      if (value === req.body.mySlotId) {
        throw new Error('Cannot swap a slot with itself');
      }
      return true;
    }),
];

export const swapResponseValidation = [
  param('requestId')
    .notEmpty()
    .withMessage('requestId is required')
    .isMongoId()
    .withMessage('requestId must be a valid MongoDB ObjectId'),

  body('accept')
    .notEmpty()
    .withMessage('accept field is required')
    .isBoolean()
    .withMessage('accept must be a boolean (true or false)'),
];