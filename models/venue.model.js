import mongoose from "mongoose";

const venueSchema = new mongoose.Schema(
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

export default mongoose.models.Venue || mongoose.model("Venue", venueSchema);
