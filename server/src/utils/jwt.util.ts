import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { Types } from 'mongoose';

interface JwtPayload {
  userId: string;
}

export const generateToken = (userId: Types.ObjectId): string => {
  const secret = process.env.JWT_SECRET as Secret;
  const expiresIn = process.env.JWT_EXPIRE || '7d'; 

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const payload: JwtPayload = { userId: userId.toString() };
  const options: SignOptions = { expiresIn: expiresIn as any }; 

  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_SECRET as Secret;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.verify(token, secret) as JwtPayload;
};
