import { createClient } from "redis";

const globalForRedis = global as any;

type RedisClientWithSafeWrappers = ReturnType<typeof createClient> & {
  safeGet: (key: string) => Promise<string | null>;
  safeSet: (key: string, value: string, ttl?: number) => Promise<void>;
  safeDel: (key: string) => Promise<void>;
};

const client = (globalForRedis.redisClient ||
  createClient({
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => {
        return Math.min(retries * 50, 1000);
      },
    },
  })) as RedisClientWithSafeWrappers;

if (!globalForRedis.redisClient) {
  globalForRedis.redisClient = client;

  client.on("error", (err: any) => {
    console.error("Redis Error:", err.message);
  });

  client.on("connect", () => {
    console.log("Redis connecting...");
  });

  client.on("ready", () => {
    console.log("Redis ready");
  });

  client.connect().catch((err: any) => {
    console.error("Redis connection failed:", err.message);
  });
}

const withTimeout = <T>(promise: Promise<T>, ms = 800): Promise<T> =>
  Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Redis timeout")), ms)
    ),
  ]);

client.safeGet = async (key: string) => {
  try {
    if (!client.isOpen) return null;
    return await withTimeout(client.get(key));
  } catch {
    return null;
  }
};

client.safeSet = async (key: string, value: string, ttl = 300) => {
  try {
    if (!client.isOpen) return;
    await withTimeout(client.setEx(key, ttl, value));
  } catch {
    // ignore
  }
};

client.safeDel = async (key: string) => {
  try {
    if (!client.isOpen) return;
    await withTimeout(client.del(key));
  } catch {
    // ignore
  }
};

export default client;
