import mongoose, { Document, Schema } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  category: "Movie" | "Music" | "Comedy" | "Sports" | "Theatre";
  poster: string[];
  duration: number;
  organizer: mongoose.Types.ObjectId;
  venue: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
      enum: ["Movie", "Music", "Comedy", "Sports", "Theatre"],
    },
    poster: {
      type: [String],
      default: [],
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    venue: {
      type: Schema.Types.ObjectId,
      ref: "Venue",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model<IEvent>("Event", eventSchema);
