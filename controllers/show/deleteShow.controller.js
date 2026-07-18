import Show from "../../models/show.model.js";
import User from "../../models/user.model.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { ROLES } from "../../utils/constant.js";

export const deleteShowController = async ({ id }, user, redis) => {
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
      throw new Error("Not allowed to delete this show");
    }

    await show.deleteOne();

    // 🔥 Cache Invalidation
    try {
      if (redis) {
        await redis.safeDel(`shows:${show.movie}`);
        await redis.safeDel(`shows:admin:${dbUser._id}`);
      }
    } catch (err) {
      console.log("Redis cache clear failed:", err.message);
    }

    return true;
  } catch (error) {
    console.error("Delete Show Error:", error);
    throw error;
  }
};
