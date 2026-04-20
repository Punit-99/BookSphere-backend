import Show from "../../models/show.model.js";

export const getAllShowsController = async ({ movieId }) => {
  try {
    const query = movieId ? { movie: movieId } : {};

    const shows = await Show.find(query)
      .populate("movie")
      .populate("theatre")
      .sort({ showTime: 1 });

    return shows;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch shows");
  }
};
