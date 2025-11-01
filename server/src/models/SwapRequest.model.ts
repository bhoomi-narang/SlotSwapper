import mongoose, { Schema } from 'mongoose';
import { ISwapRequestDocument, SwapRequestStatus } from '../types/models.types';

const swapRequestSchema = new Schema<ISwapRequestDocument>(
  {
    requesterSlotId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Requester slot ID is required'],
      index: true,
    },
    desiredSlotId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Desired slot ID is required'],
      index: true,
    },
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester ID is required'],
      index: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(SwapRequestStatus),
        message: '{VALUE} is not a valid status',
      },
      default: SwapRequestStatus.PENDING,
      required: [true, 'Status is required'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret) {
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

swapRequestSchema.index({ requesterId: 1, status: 1 });
swapRequestSchema.index({ ownerId: 1, status: 1 });
swapRequestSchema.index({ requesterSlotId: 1, desiredSlotId: 1 });

swapRequestSchema.index(
  { requesterSlotId: 1, desiredSlotId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: SwapRequestStatus.PENDING } }
);

const SwapRequest = mongoose.model<ISwapRequestDocument>(
  'SwapRequest',
  swapRequestSchema
);

export default SwapRequest;