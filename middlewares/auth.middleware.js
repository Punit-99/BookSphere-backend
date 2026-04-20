// middlewares/auth.middleware.js

import jwt from "jsonwebtoken";

export const authMiddleware = (req) => {
  const token = req.cookies?.accessToken;

  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch {
    return null;
  }
};