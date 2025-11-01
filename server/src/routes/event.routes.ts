import { Router } from 'express';
import {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  getSwappableSlots,
} from '../controllers/event.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createEventValidation,
  updateEventValidation,
  deleteEventValidation,
} from '../validators/event.validator';

const router = Router();

router.use(authenticate);

router.post('/', validate(createEventValidation), createEvent);

router.get('/', getEvents);

router.get('/swappable-slots', getSwappableSlots);

router.put('/:id', validate(updateEventValidation), updateEvent);

router.delete('/:id', validate(deleteEventValidation), deleteEvent);

export default router;