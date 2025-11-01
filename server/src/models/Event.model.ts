import mongoose, { Schema } from 'mongoose';
import { IEventDocument, EventStatus } from '../types/models.types';

const eventSchema = new Schema<IEventDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
      validate: {
        validator: function (this: IEventDocument, value: Date) {
          return value > this.startTime;
        },
        message: 'End time must be after start time',
      },
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(EventStatus),
        message: '{VALUE} is not a valid status',
      },
      default: EventStatus.BUSY,
      required: [true, 'Status is required'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_, ret:any) {
        delete ret?.__v;;
        return ret;
      },
    },
  }
);

eventSchema.index({ owner: 1, startTime: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ startTime: 1, endTime: 1 });

eventSchema.index({ status: 1, owner: 1 });

const Event = mongoose.model<IEventDocument>('Event', eventSchema);

export default Event;