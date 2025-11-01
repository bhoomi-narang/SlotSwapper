import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.util';

interface ErrorResponse {
  success: false;
  message: string;
  stack?: string;
  errors?: any;
}

export const errorHandler = (
  err: Error | ApiError,
  _: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  }

  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    statusCode = 409;
    const field = Object.keys((err as any).keyPattern)[0];
    message = `${field} already exists`;
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  const response: ErrorResponse = {
    success: false,
    message,
  };
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  if (!isOperational) {
    console.error('ERROR:', err);
  }

  res.status(statusCode).json(response);
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const message = `Route ${req.originalUrl} not found`;
  res.status(404).json({
    success: false,
    message,
  });
};