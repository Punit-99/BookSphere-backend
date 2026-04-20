import bcrypt from "bcryptjs";
import User from "../../models/user.model.js";
import { generateTokens } from "../../utils/generateTokens.js";

export const loginUser = async ({ email, password }, { res }) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new Error("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const { accessToken, refreshToken } = generateTokens(user);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: process.env.COOKIE_SAME_SITE || "lax",
    maxAge: Number(process.env.ACCESS_TOKEN_EXPIRE) || 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: process.env.COOKIE_SAME_SITE || "lax",
    path: process.env.REFRESH_TOKEN_PATH  || "/",
    maxAge: Number(process.env.REFRESH_TOKEN_EXPIRE) || 7 * 24 * 60 * 60 * 1000,
  });

  return { user };
};
