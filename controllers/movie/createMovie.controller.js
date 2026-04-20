import Movie from "../../models/movie.model.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { ROLES } from "../../utils/constant.js";
import User from "../../models/user.model.js";

export const createMovieController = async (args, user, redis) => {
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

  // 🔥 cache invalidation (now injected)
  try {
    await redis.safeDel(`movies:admin:${dbUser._id}`);
    await redis.safeDel("movies:all");
  } catch (err) {
    console.log("Redis cache clear failed:", err.message);
  }

  return movie;
};
