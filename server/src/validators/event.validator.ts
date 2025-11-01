import { body, param } from 'express-validator';
import { EventStatus } from '../types/models.types';

export const createEventValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),

  body('startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .isISO8601()
    .withMessage('Start time must be a valid date')
    .custom((value) => {
      const startTime = new Date(value);
      if (startTime < new Date()) {
        throw new Error('Start time cannot be in the past');
      }
      return true;
    }),

  body('endTime')
    .notEmpty()
    .withMessage('End time is required')
    .isISO8601()
    .withMessage('End time must be a valid date')
    .custom((value, { req }) => {
      const startTime = new Date(req.body.startTime);
      const endTime = new Date(value);
      if (endTime <= startTime) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),

  body('status')
    .optional()
    .isIn(Object.values(EventStatus))
    .withMessage(`Status must be one of: ${Object.values(EventStatus).join(', ')}`),
];

export const updateEventValidation = [
  param('id').isMongoId().withMessage('Invalid event ID'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),

  body('startTime')
    .optional()
    .isISO8601()
    .withMessage('Start time must be a valid date'),

  body('endTime')
    .optional()
    .isISO8601()
    .withMessage('End time must be a valid date')
    .custom((value, { req }) => {
      if (req.body.startTime) {
        const startTime = new Date(req.body.startTime);
        const endTime = new Date(value);
        if (endTime <= startTime) {
          throw new Error('End time must be after start time');
        }
      }
      return true;
    }),

  body('status')
    .optional()
    .isIn(Object.values(EventStatus))
    .withMessage(`Status must be one of: ${Object.values(EventStatus).join(', ')}`),
];

export const deleteEventValidation = [
  param('id').isMongoId().withMessage('Invalid event ID'),
];