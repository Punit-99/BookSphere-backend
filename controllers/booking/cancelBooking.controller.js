// controllers/booking/cancelBooking.controller.js
import Booking from "../../models/booking.model.js";
import Show from "../../models/show.model.js";
import redisClient from "../../config/redis.js";

export const cancelBookingController = async ({ bookingId }, user) => {
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

  // 🔥 Invalidate caches
  await redisClient.del(`bookings:${user.id}`);

  return booking;
};