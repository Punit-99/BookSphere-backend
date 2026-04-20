import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import uploadRoutes from "./routes/upload.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

const app = express();

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
