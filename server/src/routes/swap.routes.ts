import { Router } from 'express';
import {
  createSwapRequest,
  respondToSwapRequest,
  getSwapRequests,
} from '../controllers/swap.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createSwapRequestValidation,
  swapResponseValidation,
} from '../validators/swap.validator';

const router = Router();

router.use(authenticate);

router.post('/', validate(createSwapRequestValidation), createSwapRequest);

router.post(
  '/response/:requestId',
  validate(swapResponseValidation),
  respondToSwapRequest
);

router.get('/requests', getSwapRequests);

export default router;
