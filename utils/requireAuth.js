import { authMiddleware } from "../middlewares/auth.middleware.js";
import { AuthenticationError } from "./authError.js";

export const requireAuth = (user) => {
  if (!user) {
    throw new AuthenticationError("Not authenticated");
  }
};

export const requireAuthMiddleware = (req, res, next) => {
  const user = authMiddleware(req);

  if (!user) {
    return res.status(401).json({
      message: "Not authenticated",
    });
  }

  req.user = user;

  next();
};

export const requireRole = (user, allowedRoles = []) => {
  if (!user) {
    throw new AuthenticationError("Not authenticated");
  }

  if (!allowedRoles.includes(user.role)) {
    throw new AuthenticationError("Not authorized");
  }
};
