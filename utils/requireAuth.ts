import { Request, Response, NextFunction } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { AuthenticationError } from "./authError.js";

export const requireAuth = (user: any): void => {
  if (!user) {
    throw new AuthenticationError("Not authenticated");
  }
};

export const requireAuthMiddleware = (req: Request, res: Response, next: NextFunction): any => {
  const user = authMiddleware(req);

  if (!user) {
    return res.status(401).json({
      message: "Not authenticated",
    });
  }

  (req as any).user = user;
  next();
};

export const requireRole = (user: any, allowedRoles: string[] = []): void => {
  if (!user) {
    throw new AuthenticationError("Not authenticated");
  }

  if (!allowedRoles.includes(user.role)) {
    throw new AuthenticationError("Not authorized");
  }
};
