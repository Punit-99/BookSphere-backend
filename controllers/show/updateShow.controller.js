import Show from "../../models/show.model.js";
import Movie from "../../models/movie.model.js";
import Theatre from "../../models/theatre.model.js";
import User from "../../models/user.model.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { ROLES } from "../../utils/constant.js";

export const updateShowController = async ({ id, input }, user, redis) => {
  try {
    const dbUser = await User.findById(user.id);
    if (!dbUser) {
      throw new Error("User not found");
    }

    if (dbUser.role === ROLES.ADMIN && !dbUser.isApproved) {
      throw new Error("Admin not approved");
    }

    requireRole(dbUser, [ROLES.ADMIN]);

    const show = await Show.findById(id).populate("theatre");
    if (!show) {
      throw new Error("Show not found");
    }

    // Check ownership of the theatre the show is at
    if (show.theatre.owner.toString() !== dbUser.id) {
      throw new Error("Not allowed to update this show");
    }

    // ✅ update fields safely
    if (input.movie) {
      const movie = await Movie.findOne({ _id: input.movie, owner: dbUser._id });
      if (!movie) {
        throw new Error("Movie not found or does not belong to you");
      }
      show.movie = input.movie;
    }

    if (input.theatre) {
      const theatre = await Theatre.findOne({ _id: input.theatre, owner: dbUser._id });
      if (!theatre) {
        throw new Error("Theatre not found or does not belong to you");
      }
      show.theatre = input.theatre;
    }

    if (input.showTime) show.showTime = new Date(input.showTime);
    if (input.totalSeats !== undefined) {
      show.totalSeats = input.totalSeats;

      // 🔥 keep availableSeats in sync
      show.availableSeats = input.totalSeats;
    }
    if (input.price !== undefined) show.price = input.price;

    await show.save();

    // 🔥 Cache Invalidation
    try {
      if (redis) {
        await redis.safeDel(`shows:${show.movie}`);
        await redis.safeDel(`shows:admin:${dbUser._id}`);
      }
    } catch (err) {
      console.log("Redis cache clear failed:", err.message);
    }

    return show;
  } catch (error) {
    console.error("Update Show Error:", error);
    throw error;
  }
};
