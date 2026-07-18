import { Request } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (req: Request): any => {
  const token = req.cookies?.accessToken;

  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);
  } catch {
    return null;
  }
};
