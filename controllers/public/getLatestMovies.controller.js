// controllers/public/getLatestMovies.controller.js
import Movie from "../../models/movie.model.js";

export const getLatestMoviesController = async () => {
  try {
    const movies = await Movie.find()
      .sort({ releaseDate: -1 }) // IMPORTANT
      .limit(10);

    return movies.map((m) => ({
      id: m._id.toString(),
      title: m.title,
      description: m.description,
      duration: m.duration,
      language: m.language,
      genre: m.genre,
      releaseDate: m.releaseDate,
      poster: m.poster,
    }));
  } catch (err) {
    throw new Error("Failed to fetch latest movies");
  }
};
