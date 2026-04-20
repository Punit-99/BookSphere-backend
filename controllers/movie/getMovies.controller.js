import Movie from "../../models/movie.model.js";

export const getMoviesController = async (user, redis) => {
  if (!user) {
    throw new Error("Unauthorized");
  }

  const cacheKey = `movies:admin:${user.id}`;

  try {
    const cached = await redis.safeGet(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const movies = await Movie.find({
      owner: user.id,
    }).populate("owner");

    const formattedMovies = movies.map((m) => ({
      id: m._id.toString(),
      title: m.title,
      description: m.description,
      duration: m.duration,
      language: m.language,
      genre: m.genre,
      releaseDate: m.releaseDate,
      poster: m.poster,
      owner: m.owner,
    }));

    await redis.safeSet(cacheKey, 600, JSON.stringify(formattedMovies));

    return formattedMovies;
  } catch (err) {
    console.error("GET MOVIES ERROR:", err);
    throw new Error("Failed to fetch movies");
  }
};
