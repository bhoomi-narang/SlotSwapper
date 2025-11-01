import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { verifyToken } from '../utils/jwt.util';
import { UnauthorizedError } from '../utils/ApiError.util';
import { asyncHandler } from '../utils/asyncHandler.util';

export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided, authorization denied');
    }

    const token = authHeader.substring(7); 

    if (!token) {
      throw new UnauthorizedError('No token provided, authorization denied');
    }

    try {
      const decoded = verifyToken(token);

      req.userId = new Types.ObjectId(decoded.userId).toString();

      next();
    } catch (error) {
      throw new UnauthorizedError('Invalid token, authorization denied');
    }
  }
);