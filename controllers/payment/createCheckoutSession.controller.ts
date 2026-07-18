import { Request, Response } from "express";

export const createCheckoutSession = async (req: Request, res: Response): Promise<any> => {
  try {
    const { showId, tickets } = req.body;
    return res.status(200).json({ id: "mock_session_id", url: "https://stripe.com/mock" });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
