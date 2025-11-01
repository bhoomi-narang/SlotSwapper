import { Router } from 'express';
import { signup, login } from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { signupValidation, loginValidation } from '../validators/auth.validator';

const router = Router();

router.post('/signup', validate(signupValidation), signup);

router.post('/login', validate(loginValidation), login);

export default router;