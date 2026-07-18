import jwt from "jsonwebtoken";

export const generateTokens = (user: any): { accessToken: string; refreshToken: string } => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_ACCESS_SECRET as string,
    { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRE) },
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRE) },
  );

  return { accessToken, refreshToken };
};
