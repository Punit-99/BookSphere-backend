import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import uploadRoutes from "./routes/upload.routes";
import paymentRoutes from "./routes/payment.routes";

const app: Application = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/upload", uploadRoutes);
app.use("/api/payment", paymentRoutes);

export default app;
