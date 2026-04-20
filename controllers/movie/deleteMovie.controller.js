import Movie from "../../models/movie.model.js";
import redisClient from "../../config/redis.js";
import { ROLES } from "../../utils/constant.js";
import User from "../../models/user.model.js";
import { requireRole } from "../../middlewares/role.middleware.js";

// ================= DELETE MOVIE =================
export const deleteMovieController = async ({ id }, user) => {
  const dbUser = await User.findById(user.id);
  if (!dbUser) throw new Error("User not found");

  requireRole(dbUser, [ROLES.ADMIN]);

  await Movie.findByIdAndDelete(id);

  await redisClient.del("movies:all");

  return true;
};
