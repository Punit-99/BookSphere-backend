import mongoose from "mongoose";

const seatSchema = new mongoose.Schema({
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
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  lockExpiresAt: {
    type: Date,
    default: null,
  },
});

const showSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    venue: {
      type: mongoose.Schema.Types.ObjectId,
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

// Prevent duplicate shows
showSchema.index(
  { event: 1, venue: 1, showTime: 1 },
  { unique: true }
);

export default mongoose.models.Show || mongoose.model("Show", showSchema);