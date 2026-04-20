import Movie from "../../models/movie.model.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import redisClient from "../../config/redis.js";
import { ROLES } from "../../utils/constant.js";
import User from "../../models/user.model.js";

export const createMovieController = async (args, user) => {
  const dbUser = await User.findById(user.id);

  if (!dbUser) {
    throw new Error("User not found");
  }

  if (dbUser.role === ROLES.ADMIN && !dbUser.isApproved) {
    throw new Error("Admin not approved");
  }

  requireRole(dbUser, [ROLES.ADMIN]);

  const movieData = {
    ...args,
    owner: dbUser._id,

    duration: Number(args.duration),

    language: Array.isArray(args.language) ? args.language : [args.language],

    genre: Array.isArray(args.genre) ? args.genre : [args.genre],

    poster: Array.isArray(args.poster)
      ? args.poster
      : args.poster
        ? [args.poster]
        : [],
  };

  const movie = await Movie.create(movieData);

  // clear both admin + public caches
  await redisClient.del(`movies:admin:${dbUser._id}`);
  await redisClient.del("movies:all");

  return movie;
};
