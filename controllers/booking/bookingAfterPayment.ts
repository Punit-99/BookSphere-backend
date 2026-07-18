import { Request, Response } from "express";

export const confirmBookingAfterPayment = async (req: Request, res: Response, redis: any): Promise<any> => {
  try {
    const { sessionId } = req.body;
    return res.status(200).json({ success: true, message: "Booking confirmed mock" });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
