import Movie from "../../models/movie.model.js";
import { ROLES } from "../../utils/constant.js";
import User from "../../models/user.model.js";
import { requireRole } from "../../middlewares/role.middleware.js";

export const deleteMovieController = async ({ id }, user, redis) => {
  const dbUser = await User.findById(user.id);
  if (!dbUser) throw new Error("User not found");

  requireRole(dbUser, [ROLES.ADMIN]);

  await Movie.findByIdAndDelete(id);

  // 🔥 cache invalidation (now injected)
  try {
    await redis.safeDel("movies:all");
  } catch (err) {
    console.log("Redis cache delete failed:", err.message);
  }

  return true;
};
