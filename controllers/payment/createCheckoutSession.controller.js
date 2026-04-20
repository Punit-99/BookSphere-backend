import { stripe } from "../../config/stripe.js";
import Show from "../../models/show.model.js";
import Movie from "../../models/movie.model.js";
import Theatre from "../../models/theatre.model.js";

export const createCheckoutSession = async (req, res) => {
  try {
    const { movieId, showId, theatreId, tickets } = req.body;
    const userId = req.user?.id;

    if (!movieId || !showId || !theatreId || !tickets) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (tickets <= 0 || tickets > 6) {
      return res.status(400).json({ message: "Invalid ticket count" });
    }

    const show = await Show.findById(showId);
    const movie = await Movie.findById(movieId);
    const theatre = await Theatre.findById(theatreId);

    if (!show || !movie || !theatre) {
      return res.status(404).json({ message: "Invalid booking data" });
    }

    if (show.availableSeats < tickets) {
      return res.status(400).json({ message: "Not enough seats" });
    }

    const pricePerTicket = show.price;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: movie.title,
              description: `${theatre.name} - ${new Date(
                Number(show.showTime),
              ).toLocaleString()}`,
            },
            unit_amount: pricePerTicket * 100,
          },
          quantity: tickets,
        },
      ],

      metadata: {
        userId: userId || "",
        movieId,
        showId,
        theatreId,
        tickets: String(tickets),
      },

      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe full error:", err);
    console.error("Stripe message:", err?.message);

    return res.status(500).json({
      message: err?.message || "Payment session failed",
    });
  }
};
