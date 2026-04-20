import { createClient } from "redis";

const globalForRedis = global;

const redisClient =
  globalForRedis.redisClient ||
  createClient({
    url: process.env.REDIS_URL,
  });

if (!globalForRedis.redisClient) {
  globalForRedis.redisClient = redisClient;

  redisClient.on("error", (err) => {
    console.error("Redis Error:", err);
  });

  // 🔥 connect ONCE globally (important for Vercel)
  redisClient.connect().catch((err) => {
    console.error("Redis connection failed:", err.message);
  });
}

export default redisClient;
