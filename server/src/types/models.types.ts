import { Document, Types } from 'mongoose';

export enum EventStatus {
  BUSY = 'BUSY',
  SWAPPABLE = 'SWAPPABLE',
  SWAP_PENDING = 'SWAP_PENDING',
}

export enum SwapRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export interface IUser {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEvent {
  title: string;
  startTime: Date;
  endTime: Date;
  owner: Types.ObjectId;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEventDocument extends IEvent, Document {
  _id: Types.ObjectId;
}

export interface ISwapRequest {
  requesterSlotId: Types.ObjectId;
  desiredSlotId: Types.ObjectId;
  requesterId: Types.ObjectId;
  ownerId: Types.ObjectId;
  status: SwapRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISwapRequestDocument extends ISwapRequest, Document {
  _id: Types.ObjectId;
}