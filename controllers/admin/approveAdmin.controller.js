// controllers/admin/getAdmins.controller.js

import User from "../../models/user.model.js";
import { ROLES } from "../../utils/constant.js";

export const toggleAdminApprovalController = async ({ userId }, user) => {
  if (!user) throw new Error("Not authenticated");

  if (user.role !== ROLES.SUPERADMIN) {
    throw new Error("Only superadmin can approve admins");
  }

  const admin = await User.findById(userId);

  if (!admin) throw new Error("User not found");

  if (admin.role !== ROLES.ADMIN) {
    throw new Error("User is not an admin");
  }

  admin.isApproved = !admin.isApproved;
  await admin.save();

  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    isApproved: admin.isApproved,
  };
};
