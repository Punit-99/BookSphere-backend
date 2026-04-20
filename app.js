import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import uploadRoutes from "./routes/upload.routes.js";
import createApolloServer from "./graphql/index.graphql.js";
import paymentRoutes from "./routes/payment.routes.js";
import { connectDB } from "./config/db.js";
import { connectRedis } from "./config/redis.js";

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

let initialized = false;
let initializingPromise = null;

async function initializeApp() {
  if (initialized) return;
  if (initializingPromise) return initializingPromise;

  initializingPromise = (async () => {
    console.log("Connecting DB...");
    await connectDB();
    console.log("DB connected");

    if (process.env.REDIS_URL) {
      console.log("Connecting Redis...");
      await connectRedis();
      console.log("Redis connected");
    }

    console.log("Starting Apollo...");
    await createApolloServer(app);
    console.log("Apollo started");

    initialized = true;
    console.log("App initialized successfully");
  })();

  return initializingPromise;
}

app.use(async (req, res, next) => {
  try {
    await initializeApp();
    next();
  } catch (error) {
    console.error("Initialization failed:", error);
    res.status(500).json({
      success: false,
      message: "Server initialization failed",
      error: error.message,
    });
  }
});

export default app;
