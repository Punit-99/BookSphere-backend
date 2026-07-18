export const requireRole = (user: any, roles: string[] = []): void => {
  if (!user) throw new Error("Not authenticated");

  if (!roles.includes(user.role)) {
    throw new Error("Not authorized");
  }
};
