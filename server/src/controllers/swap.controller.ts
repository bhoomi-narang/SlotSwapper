import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Event from '../models/Event.model';
import SwapRequest from '../models/SwapRequest.model';
import { asyncHandler } from '../utils/asyncHandler.util';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from '../utils/ApiError.util';
import { EventStatus, SwapRequestStatus } from '../types/models.types';

interface CreateSwapRequestBody {
  mySlotId: string;
  theirSlotId: string;
}

interface SwapResponseBody {
  accept: boolean;
}

export const createSwapRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { mySlotId, theirSlotId } = req.body as CreateSwapRequestBody;
    const userId = req.userId;

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const mySlot = await Event.findById(mySlotId).session(session);
      const theirSlot = await Event.findById(theirSlotId).session(session);

      if (!mySlot) {
        throw new NotFoundError('Your slot not found');
      }

      if (!theirSlot) {
        throw new NotFoundError('Desired slot not found');
      }
      if (mySlot.owner.toString() !== userId.toString()) {
        throw new ForbiddenError('You do not own the slot you are trying to swap');
      }
      if (theirSlot.owner.toString() === userId.toString()) {
        throw new BadRequestError('You cannot swap with your own slot');
      }
      if (mySlot.status !== EventStatus.SWAPPABLE) {
        throw new BadRequestError(
          `Your slot must have status SWAPPABLE (current: ${mySlot.status})`
        );
      }

      if (theirSlot.status !== EventStatus.SWAPPABLE) {
        throw new BadRequestError(
          `Desired slot must have status SWAPPABLE (current: ${theirSlot.status})`
        );
      }
      const existingRequest = await SwapRequest.findOne({
        $or: [
          {
            requesterSlotId: mySlotId,
            desiredSlotId: theirSlotId,
            status: SwapRequestStatus.PENDING,
          },
          {
            requesterSlotId: theirSlotId,
            desiredSlotId: mySlotId,
            status: SwapRequestStatus.PENDING,
          },
        ],
      }).session(session);

      if (existingRequest) {
        throw new ConflictError(
          'A pending swap request already exists for these slots'
        );
      }
      const swapRequest = await SwapRequest.create(
        [
          {
            requesterSlotId: mySlotId,
            desiredSlotId: theirSlotId,
            requesterId: userId,
            ownerId: theirSlot.owner,
            status: SwapRequestStatus.PENDING,
          },
        ],
        { session }
      );

      await Event.findByIdAndUpdate(
        mySlotId,
        { status: EventStatus.SWAP_PENDING },
        { session }
      );

      await Event.findByIdAndUpdate(
        theirSlotId,
        { status: EventStatus.SWAP_PENDING },
        { session }
      );

      await session.commitTransaction();

      const populatedRequest = await SwapRequest.findById(swapRequest[0]._id)
        .populate('requesterSlotId', 'title startTime endTime')
        .populate('desiredSlotId', 'title startTime endTime')
        .populate('requesterId', 'name email')
        .populate('ownerId', 'name email');

      res.status(201).json({
        success: true,
        message: 'Swap request created successfully',
        data: {
          swapRequest: populatedRequest,
        },
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
);

export const respondToSwapRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { requestId } = req.params;
    const { accept } = req.body as SwapResponseBody;
    const userId = req.userId;

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    const session = await mongoose.startSession();
    session.startTransaction()

    try {
      const swapRequest = await SwapRequest.findById(requestId).session(session);

      if (!swapRequest) {
        throw new NotFoundError('Swap request not found');
      }

      if (swapRequest.ownerId.toString() !== userId.toString()) {
        throw new ForbiddenError(
          'You are not authorized to respond to this swap request'
        );
      }

      if (swapRequest.status !== SwapRequestStatus.PENDING) {
        throw new BadRequestError(
          `This swap request has already been ${swapRequest.status.toLowerCase()}`
        );
      }

      const requesterSlot = await Event.findById(
        swapRequest.requesterSlotId
      ).session(session);
      const desiredSlot = await Event.findById(
        swapRequest.desiredSlotId
      ).session(session);

      if (!requesterSlot || !desiredSlot) {
        throw new NotFoundError('One or both slots not found');
      }

      if (!accept) {
        swapRequest.status = SwapRequestStatus.REJECTED;
        await swapRequest.save({ session });

        await Event.findByIdAndUpdate(
          swapRequest.requesterSlotId,
          { status: EventStatus.SWAPPABLE },
          { session }
        );

        await Event.findByIdAndUpdate(
          swapRequest.desiredSlotId,
          { status: EventStatus.SWAPPABLE },
          { session }
        );

        await session.commitTransaction();

        res.status(200).json({
          success: true,
          message: 'Swap request rejected successfully',
          data: {
            swapRequest,
          },
        });
        return;
      }

      swapRequest.status = SwapRequestStatus.ACCEPTED;
      await swapRequest.save({ session });

      const originalRequesterOwner = requesterSlot.owner;
      const originalDesiredOwner = desiredSlot.owner;

      requesterSlot.owner = originalDesiredOwner;
      requesterSlot.status = EventStatus.BUSY;
      await requesterSlot.save({ session });

      desiredSlot.owner = originalRequesterOwner;
      desiredSlot.status = EventStatus.BUSY;
      await desiredSlot.save({ session });

      await session.commitTransaction();

      const populatedRequest = await SwapRequest.findById(requestId)
        .populate('requesterSlotId')
        .populate('desiredSlotId')
        .populate('requesterId', 'name email')
        .populate('ownerId', 'name email');

      res.status(200).json({
        success: true,
        message: 'Swap request accepted successfully. Slots have been swapped!',
        data: {
          swapRequest: populatedRequest,
          swappedSlots: {
            slot1: {
              id: requesterSlot._id,
              title: requesterSlot.title,
              newOwner: originalDesiredOwner,
            },
            slot2: {
              id: desiredSlot._id,
              title: desiredSlot.title,
              newOwner: originalRequesterOwner,
            },
          },
        },
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
);

export const getSwapRequests = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId;

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    const swapRequests = await SwapRequest.find({
      $or: [{ requesterId: userId }, { ownerId: userId }],
    })
      .populate('requesterSlotId', 'title startTime endTime status')
      .populate('desiredSlotId', 'title startTime endTime status')
      .populate('requesterId', 'name email')
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 }); 

    const incomingRequests = swapRequests.filter(
      (req) => req.ownerId._id.toString() === userId.toString()
    );

    const outgoingRequests = swapRequests.filter(
      (req) => req.requesterId._id.toString() === userId.toString()
    );

    res.status(200).json({
      success: true,
      message: 'Swap requests retrieved successfully',
      data: {
        incoming: {
          requests: incomingRequests,
          count: incomingRequests.length,
        },
        outgoing: {
          requests: outgoingRequests,
          count: outgoingRequests.length,
        },
        total: swapRequests.length,
      },
    });
  }
);