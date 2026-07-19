import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import uploadRoutes from "./routes/upload.routes";
import paymentRoutes from "./routes/payment.routes";

const app: Application = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/upload", uploadRoutes);
app.use("/api/payment", paymentRoutes);

export default app;
