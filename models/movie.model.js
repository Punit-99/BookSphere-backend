import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    description: String,

    duration: {
      type: Number,
      required: true,
    },

    language: {
      type: [String],
      required: true,
    },

    genre: {
      type: [String],
      required: true,
    },

    releaseDate: Date,

    poster: [String],

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Movie", movieSchema);
