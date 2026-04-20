import { createClient } from "redis";

const globalForRedis = global;

const redisClient =
  globalForRedis.redisClient ||
  createClient({
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => {
        // prevent infinite aggressive reconnect loops in serverless
        return Math.min(retries * 50, 1000);
      },
    },
  });

if (!globalForRedis.redisClient) {
  globalForRedis.redisClient = redisClient;

  redisClient.on("error", (err) => {
    console.error("Redis Error:", err.message);
  });

  redisClient.on("connect", () => {
    console.log("Redis connecting...");
  });

  redisClient.on("ready", () => {
    console.log("Redis ready");
  });

  // 🔥 safe connect (non-blocking)
  redisClient.connect().catch((err) => {
    console.error("Redis connection failed:", err.message);
  });
}

// ================= GLOBAL TIMEOUT WRAPPER =================
const withTimeout = (promise, ms = 800) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Redis timeout")), ms),
    ),
  ]);

// ================= SAFE WRAPPERS =================
redisClient.safeGet = async (key) => {
  try {
    if (!redisClient.isOpen) return null;
    return await withTimeout(redisClient.get(key));
  } catch {
    return null;
  }
};

redisClient.safeSet = async (key, value, ttl = 300) => {
  try {
    if (!redisClient.isOpen) return;
    await withTimeout(redisClient.setEx(key, ttl, value));
  } catch {
    // ignore
  }
};

redisClient.safeDel = async (key) => {
  try {
    if (!redisClient.isOpen) return;
    await withTimeout(redisClient.del(key));
  } catch {
    // ignore
  }
};

export default redisClient;
