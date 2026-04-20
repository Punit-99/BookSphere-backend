import express from "express";
import { createCheckoutSession } from "../controllers/payment/createCheckoutSession.controller.js";
import { requireAuthMiddleware } from "../utils/requireAuth.js";
import { confirmBookingAfterPayment } from "../controllers/booking/bookingAfterPayment.js";

const router = express.Router();

router.post(
  "/create-checkout-session",
  requireAuthMiddleware,
  createCheckoutSession,
);
// routes/payment.routes.js

router.post(
  "/confirm-booking",
  requireAuthMiddleware,
  confirmBookingAfterPayment,
);

export default router;
