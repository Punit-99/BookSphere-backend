import mongoose from "mongoose";
import crypto from "crypto";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    show: {
      type: mongoose.Schema.Types.ObjectId,
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
  { timestamps: true },
);

bookingSchema.index({ show: 1, createdAt: -1 });

export default mongoose.model("Booking", bookingSchema);
