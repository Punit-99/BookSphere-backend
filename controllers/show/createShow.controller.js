import Show from "../../models/show.model.js";
import Movie from "../../models/movie.model.js";
import Theatre from "../../models/theatre.model.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import redisClient from "../../config/redis.js";
import { ROLES } from "../../utils/constant.js";
import User from "../../models/user.model.js";

export const createShowController = async (args, user) => {
  const dbUser = await User.findById(user.id);

  if (!dbUser) {
    throw new Error("User not found");
  }

  if (dbUser.role === ROLES.ADMIN && !dbUser.isApproved) {
    throw new Error("Admin not approved");
  }

  requireRole(dbUser, [ROLES.ADMIN]);

  if (args.totalSeats <= 0) {
    throw new Error("Total seats must be greater than 0");
  }

  const movie = await Movie.findOne({
    _id: args.movie,
    owner: dbUser._id,
  });

  if (!movie) {
    throw new Error("Movie not found or does not belong to you");
  }

  const theatre = await Theatre.findOne({
    _id: args.theatre,
    owner: dbUser._id,
  });

  if (!theatre) {
    throw new Error("Theatre not found or does not belong to you");
  }

  try {
    const show = await Show.create({
      ...args,
      availableSeats: args.totalSeats,
    });

    await redisClient.del(`shows:${args.movie}`);
    await redisClient.del(`shows:admin:${dbUser._id}`);
    await redisClient.del(`shows:admin:${dbUser._id}:${args.movie}`);

    return show;
  } catch (err) {
    if (err.code === 11000) {
      throw new Error("Show already exists for this time");
    }

    throw err;
  }
};
