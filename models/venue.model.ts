import mongoose, { Document, Schema } from "mongoose";

export interface IVenue extends Document {
  name: string;
  address: string;
  city: string;
  state: string;
  capacity: number;
  rows: number;
  cols: number;
  createdAt: Date;
  updatedAt: Date;
}

const venueSchema = new Schema<IVenue>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    rows: {
      type: Number,
      default: 10,
    },
    cols: {
      type: Number,
      default: 10,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Venue || mongoose.model<IVenue>("Venue", venueSchema);
