import Movie from "../../models/movie.model.js";

export const getHomeMoviesController = async () => {
  try {
    const movies = await Movie.find()
      .sort({ createdAt: -1 })
      .select("title description poster"); // LIGHTWEIGHT ONLY

    return movies;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch home movies");
  }
};