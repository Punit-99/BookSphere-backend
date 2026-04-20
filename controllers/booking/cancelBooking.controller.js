import Booking from "../../models/booking.model.js";
import Show from "../../models/show.model.js";

export const cancelBookingController = async ({ bookingId }, user, redis) => {
  if (!user) throw new Error("Not authenticated");

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error("Booking not found");

  if (booking.user.toString() !== user.id) {
    throw new Error("Not authorized");
  }

  booking.status = "cancelled";
  await booking.save();

  await Show.findByIdAndUpdate(booking.show, {
    $inc: { availableSeats: booking.seatsBooked },
  });

  // 🔥 cache invalidation
  try {
    await redis.del(`bookings:${user.id}`);
  } catch (err) {
    console.log("Redis cache delete failed:", err.message);
  }

  return booking;
};
