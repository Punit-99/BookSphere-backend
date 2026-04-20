// src/app.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import uploadRoutes from "./routes/upload.routes.js";
import createApolloServer from "./graphql/index.graphql.js";
import paymentRoutes from "./routes/payment.routes.js";
import { connectDB } from "./config/db.js";
import { connectRedis } from "./config/redis.js";

const app = express();

// middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// routes
app.use("/api/upload", uploadRoutes);
app.use("/api/payment", paymentRoutes);

let isInitialized = false;

const initializeApp = async () => {
  if (isInitialized) return;

  try {
    await connectDB();

    // only connect redis if REDIS_URL exists
    if (process.env.REDIS_URL) {
      await connectRedis();
    }

    await createApolloServer(app);

    isInitialized = true;
    console.log("App initialized successfully");
  } catch (error) {
    console.error("App initialization failed:", error);
    throw error;
  }
};

await initializeApp();

export default app;
