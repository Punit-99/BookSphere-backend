import Theatre from "../../models/theatre.model.js";
import User from "../../models/user.model.js";
import { requireRole } from "../../utils/requireAuth.js";
import { ROLES } from "../../utils/constant.js";

export const updateTheatreController = async (args, user) => {
  const dbUser = await User.findById(user.id);
  if (!dbUser) throw new Error("User not found");

  requireRole(dbUser, [ROLES.ADMIN]);

  const theatre = await Theatre.findById(args.id);
  if (!theatre) throw new Error("Theatre not found");

  // only owner or superadmin can update
  if (theatre.owner.toString() !== dbUser.id) {
    throw new Error("Not allowed");
  }

  return await Theatre.findByIdAndUpdate(
    args.id,
    {
      name: args.input.name,
      state: args.input.state,
      city: args.input.city,
      address: args.input.address,
      screens: args.input.screens,
    },
    { new: true, runValidators: true },
  );
};
