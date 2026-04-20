import Movie from "../../models/movie.model.js";

export const getMovieByIdController = async ({ id }) => {
  if (!id) throw new Error("Movie ID required");

  const movie = await Movie.findById(id);

  if (!movie) throw new Error("Movie not found");

  return movie;
};
