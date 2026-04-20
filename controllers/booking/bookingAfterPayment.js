import { stripe } from "../../config/stripe.js";
import Booking from "../../models/booking.model.js";
import Show from "../../models/show.model.js";
import redisClient from "../../config/redis.js";

export const confirmBookingAfterPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        message: "Payment not completed",
      });
    }

    const { showId, tickets } = session.metadata;

    const show = await Show.findById(showId);

    if (!show) {
      return res.status(404).json({
        message: "Show not found",
      });
    }

    const existingBooking = await Booking.findOne({
      bookingReference: sessionId,
    });

    if (existingBooking) {
      return res.json({
        success: true,
        booking: existingBooking,
      });
    }

    const booking = await Booking.create({
      user: req.user.id,
      show: showId,
      seatsBooked: Number(tickets),
      totalPrice: show.price * Number(tickets),
      paymentStatus: "paid",
      status: "confirmed",
      bookingReference: sessionId,
    });

    await Show.findByIdAndUpdate(showId, {
      $inc: {
        availableSeats: -Number(tickets),
      },
    });

    // clear booking cache
    await redisClient.del(`bookings:${req.user.id}`);

    return res.json({
      success: true,
      booking,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: err.message || "Booking confirmation failed",
    });
  }
};
