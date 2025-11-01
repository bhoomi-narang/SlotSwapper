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

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Event {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  owner: User | string;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SwapRequest {
  _id: string;
  requesterSlotId: Event;
  desiredSlotId: Event;
  requesterId: User;
  ownerId: User;
  status: SwapRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}