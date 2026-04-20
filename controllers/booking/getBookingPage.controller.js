import Movie from "../../models/movie.model.js";
import Show from "../../models/show.model.js";

export const getBookingPageController = async (movieId) => {
  if (!movieId) {
    throw new Error("Movie ID required");
  }

  const movie = await Movie.findById(movieId);

  if (!movie) {
    throw new Error("Movie not found");
  }

  const shows = await Show.find({
    movie: movieId,
    availableSeats: { $gt: 0 },
  })
    .populate("theatre")
    .sort({ showTime: 1 });

  const theatreMap = new Map();

  for (const show of shows) {
    if (!show.theatre) continue;

    const theatreId = show.theatre._id.toString();

    if (!theatreMap.has(theatreId)) {
      theatreMap.set(theatreId, {
        theatre: show.theatre,
        shows: [],
      });
    }

    theatreMap.get(theatreId).shows.push(show);
  }

  return {
    movie,
    theatres: Array.from(theatreMap.values()),
  };
};
