import Booking from "../../models/booking.model.js";
import redisClient from "../../config/redis.js";

export const getMyBookingsController = async (user) => {
  if (!user) {
    throw new Error("Not authenticated");
  }

  const cacheKey = `bookings:${user.id}`;

  const cached = await redisClient.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  const bookings = await Booking.find({ user: user.id })
    .sort({ createdAt: -1 })
    .populate({
      path: "show",
      populate: [{ path: "movie" }, { path: "theatre" }],
    });

  await redisClient.setEx(cacheKey, 300, JSON.stringify(bookings));

  return bookings;
};
