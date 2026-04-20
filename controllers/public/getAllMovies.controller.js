import Movie from "../../models/movie.model.js";

export const getAllMoviesController = async () => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    return movies;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch movies");
  }
};