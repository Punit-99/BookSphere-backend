// controllers/auth/refreshToken.controller.ts

import jwt from "jsonwebtoken";

export const refreshTokenController = async (_, __, { req, res }) => {
  const token = req.cookies?.refreshToken;

  if (!token) throw new Error("Not authenticated");

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET
    );

    const accessToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRE }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
    });

    return { success: true };
  } catch {
    throw new Error("Invalid refresh token");
  }
};