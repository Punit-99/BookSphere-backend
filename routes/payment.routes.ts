import express, { Router, Request, Response } from "express";
import { createCheckoutSession } from "../controllers/payment/createCheckoutSession.controller";
import { requireAuthMiddleware } from "../utils/requireAuth";
import { confirmBookingAfterPayment } from "../controllers/booking/bookingAfterPayment";
import redisClient from "../config/redis";

const router: Router = express.Router();

router.post(
  "/create-checkout-session",
  requireAuthMiddleware,
  createCheckoutSession as any,
);

router.post("/confirm-booking", requireAuthMiddleware, (req: Request, res: Response) =>
  (confirmBookingAfterPayment as any)(req, res, redisClient),
);

export default router;
