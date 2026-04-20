import Theatre from "../../models/theatre.model.js";

export const getAllTheatresController = async () => {
  try {
    const theatres = await Theatre.find()
      .populate("owner")
      .sort({ createdAt: -1 });

    return theatres;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch theatres");
  }
};