// middlewares/role.middleware.js

export const requireRole = (user, roles = []) => {
  if (!user) throw new Error("Not authenticated");

  if (!roles.includes(user.role)) {
    throw new Error("Not authorized");
  }
};