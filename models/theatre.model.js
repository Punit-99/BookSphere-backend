import mongoose from "mongoose";

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
      index: true,
    },

    address: String,

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    screens: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Theatre", theatreSchema);
