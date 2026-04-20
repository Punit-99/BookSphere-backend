import express from "express";
import { createCheckoutSession } from "../controllers/payment/createCheckoutSession.controller.js";
import { requireAuthMiddleware } from "../utils/requireAuth.js";
import { confirmBookingAfterPayment } from "../controllers/booking/bookingAfterPayment.js";
import redisClient from "../config/redis.js";

const router = express.Router();

router.post(
  "/create-checkout-session",
  requireAuthMiddleware,
  createCheckoutSession,
);

router.post("/confirm-booking", requireAuthMiddleware, (req, res) =>
  confirmBookingAfterPayment(req, res, redisClient),
);

export default router;
