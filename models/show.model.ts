import mongoose, { Document, Schema } from "mongoose";

export interface ISeat {
  number: string;
  tier: "Standard" | "Premium" | "VIP";
  status: "Available" | "Locked" | "Sold";
  lockedBy?: mongoose.Types.ObjectId | null;
  lockExpiresAt?: Date | null;
}

export interface IShow extends Document {
  event: mongoose.Types.ObjectId;
  venue: mongoose.Types.ObjectId;
  showTime: Date;
  totalSeats: number;
  availableSeats: number;
  price: number;
  seats: ISeat[];
  createdAt: Date;
  updatedAt: Date;
}

const seatSchema = new Schema<ISeat>({
  number: {
    type: String,
    required: true,
  },
  tier: {
    type: String,
    enum: ["Standard", "Premium", "VIP"],
    default: "Standard",
  },
  status: {
    type: String,
    enum: ["Available", "Locked", "Sold"],
    default: "Available",
  },
  lockedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  lockExpiresAt: {
    type: Date,
    default: null,
  },
});

const showSchema = new Schema<IShow>(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    venue: {
      type: Schema.Types.ObjectId,
      ref: "Venue",
      required: true,
      index: true,
    },
    showTime: {
      type: Date,
      required: true,
      index: true,
    },
    totalSeats: {
      type: Number,
      required: true,
      min: 1,
    },
    availableSeats: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    seats: {
      type: [seatSchema],
      default: [],
    },
  },
  { timestamps: true }
);

showSchema.index(
  { event: 1, venue: 1, showTime: 1 },
  { unique: true }
);

export default mongoose.models.Show || mongoose.model<IShow>("Show", showSchema);
