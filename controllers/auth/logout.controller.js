export const logoutController = (_, __, { res }) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  return { success: true };
};