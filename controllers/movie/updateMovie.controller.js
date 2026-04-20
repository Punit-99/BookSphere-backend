import Movie from "../../models/movie.model.js";
import { ROLES } from "../../utils/constant.js";
import User from "../../models/user.model.js";
import { requireRole } from "../../middlewares/role.middleware.js";

export const updateMovieController = async ({ id, input }, user, redis) => {
  const dbUser = await User.findById(user.id);
  if (!dbUser) throw new Error("User not found");

  requireRole(dbUser, [ROLES.ADMIN]);

  const movie = await Movie.findByIdAndUpdate(id, input, {
    new: true,
  });

  // 🔥 cache invalidation
  try {
    await redis.safeDel("movies:all");
    await redis.safeDel(`movies:admin:${dbUser._id}`);
  } catch (err) {
    console.log("Redis cache clear failed:", err.message);
  }

  return movie;
};
