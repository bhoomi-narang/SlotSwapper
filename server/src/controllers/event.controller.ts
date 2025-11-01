import { Request, Response } from 'express';
import Event from '../models/Event.model';
import { asyncHandler } from '../utils/asyncHandler.util';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from '../utils/ApiError.util';
import { EventStatus } from '../types/models.types';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

interface CreateEventRequest {
  title: string;
  startTime: Date;
  endTime: Date;
  status?: EventStatus;
}

interface UpdateEventRequest {
  title?: string;
  startTime?: Date;
  endTime?: Date;
  status?: EventStatus;
}

export const createEvent = asyncHandler(
  async (req: Request, res: Response) => {
    const { title, startTime, endTime, status } = req.body as CreateEventRequest;
    const userId = req.userId;

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    const event = await Event.create({
      title,
      startTime,
      endTime,
      owner: userId,
      status: status || EventStatus.BUSY,
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: {
        event,
      },
    });
  }
);

export const getEvents = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    throw new BadRequestError('User ID is required');
  }

  const events = await Event.find({ owner: userId }).sort({ startTime: 1 });

  res.status(200).json({
    success: true,
    message: 'Events retrieved successfully',
    data: {
      events,
      count: events.length,
    },
  });
});

export const updateEvent = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.userId;
    const updateData = req.body as UpdateEventRequest;

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    const event = await Event.findById(id);

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    if (event.owner.toString() !== userId.toString()) {
      throw new ForbiddenError('You are not authorized to update this event');
    }

    if (updateData.startTime && updateData.endTime) {
      if (new Date(updateData.endTime) <= new Date(updateData.startTime)) {
        throw new BadRequestError('End time must be after start time');
      }
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: {
        event: updatedEvent,
      },
    });
  }
);

export const deleteEvent = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    const event = await Event.findById(id);

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    if (event.owner.toString() !== userId.toString()) {
      throw new ForbiddenError('You are not authorized to delete this event');
    }

    await Event.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
      data: null,
    });
  }
);

export const getSwappableSlots = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId;

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    const swappableSlots = await Event.find({
      status: EventStatus.SWAPPABLE,
      owner: { $ne: userId }, 
    })
      .populate('owner', 'name email') 
      .sort({ startTime: 1 }); 

    res.status(200).json({
      success: true,
      message: 'Swappable slots retrieved successfully',
      data: {
        slots: swappableSlots,
        count: swappableSlots.length,
      },
    });
  }
);