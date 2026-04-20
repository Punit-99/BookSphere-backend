import Booking from "../../models/booking.model.js";

export const getMyBookingsController = async (user, redis) => {
  if (!user) throw new Error("Not authenticated");

  const cacheKey = `bookings:${user.id}`;

  try {
    const cached = await redis.safeGet(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    console.log("Redis read error:", err.message);
  }

  const bookings = await Booking.find({ user: user.id })
    .sort({ createdAt: -1 })
    .populate({
      path: "show",
      populate: [{ path: "movie" }, { path: "theatre" }],
    });

  try {
    await redis.safeSet(cacheKey, 300, JSON.stringify(bookings));
  } catch (err) {
    console.log("Redis write error:", err.message);
  }
  console.log(bookings);
  return bookings;
};
