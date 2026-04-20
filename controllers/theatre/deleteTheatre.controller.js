import Theatre from "../../models/theatre.model.js";
import User from "../../models/user.model.js";
import { requireRole } from "../../utils/requireAuth.js";
import { ROLES } from "../../utils/constant.js";

export const deleteTheatreController = async ({ id }, user) => {
  const dbUser = await User.findById(user.id);
  if (!dbUser) throw new Error("User not found");

  requireRole(dbUser, [ROLES.ADMIN]);

  const theatre = await Theatre.findById(id);
  if (!theatre) throw new Error("Theatre not found");

  if (
    theatre.owner.toString() !== dbUser.id &&
    dbUser.role !== ROLES.SUPERADMIN
  ) {
    throw new Error("Not allowed");
  }

  await Theatre.findByIdAndDelete(id);

  return true;
};
