import { Request, Response } from 'express';
import User from '../models/User.model';
import { asyncHandler } from '../utils/asyncHandler.util';
import { generateToken } from '../utils/jwt.util';
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} from '../utils/ApiError.util';

interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body as SignupRequest;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginRequest;

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    },
  });
});