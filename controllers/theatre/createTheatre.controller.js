import Theatre from "../../models/theatre.model.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { ROLES } from "../../utils/constant.js";
import User from "../../models/user.model.js"; // 🔥 ADD THIS

export const createTheatreController = async (args, user) => {
  const dbUser = await User.findById(user.id); // 🔥 fetch real user

  if (!dbUser) {
    throw new Error("User not found");
  }

  if (dbUser.role === ROLES.ADMIN && !dbUser.isApproved) {
    throw new Error("Admin not approved");
  }

  requireRole(dbUser, [ROLES.ADMIN]); // ✅ use dbUser

  return await Theatre.create({
    ...args,
    owner: dbUser.id,
  });
};
