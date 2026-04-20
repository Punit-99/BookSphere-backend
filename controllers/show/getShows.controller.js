import Show from "../../models/show.model.js";
import redisClient from "../../config/redis.js";

export const getShowsController = async ({ movieId }, user) => {
  try {
    const shows = await Show.find(movieId ? { movie: movieId } : {})
      .populate("movie")
      .populate("theatre")
      .sort({ showTime: 1 });

    const filteredShows = shows.filter((show) => {
      const movieOwner = show.movie?.owner?.toString();
      const theatreOwner = show.theatre?.owner?.toString();

      return movieOwner === user.id && theatreOwner === user.id;
    });

    return filteredShows;
  } catch (err) {
    console.error("getShowsController error:", err);
    throw err;
  }
};
