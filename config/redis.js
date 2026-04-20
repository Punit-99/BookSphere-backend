import { createClient } from "redis";

let redisClient;

export const getRedis = () => {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL,
    });

    redisClient.on("error", (err) => {
      console.error("Redis Error:", err);
    });
  }

  return redisClient;
};

export const connectRedis = async () => {
  const client = getRedis();

  if (!client.isOpen) {
    await client.connect();
  }

  return client;
};
