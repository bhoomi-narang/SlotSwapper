import { Router } from 'express';
import authRoutes from './auth.routes';
import eventRoutes from './event.routes';
import swapRoutes from './swap.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/swap-request', swapRoutes);

export default router;