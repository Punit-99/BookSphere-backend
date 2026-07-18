import mongoose, { Document, Schema } from "mongoose";

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  show: mongoose.Types.ObjectId;
  seatsBooked: number;
  seatNumbers: string[];
  totalPrice: number;
  status: "confirmed" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  bookingReference?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    show: {
      type: Schema.Types.ObjectId,
      ref: "Show",
      required: true,
      index: true,
    },
    seatsBooked: {
      type: Number,
      required: true,
      min: 1,
    },
    seatNumbers: [
      {
        type: String,
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    bookingReference: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

bookingSchema.index({ show: 1, createdAt: -1 });

export default mongoose.models.Booking || mongoose.model<IBooking>("Booking", bookingSchema);
