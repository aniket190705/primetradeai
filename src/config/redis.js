const { createClient } = require("redis");

let redisClient = null;

const connectRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
      },
    });

    redisClient.on("error", (error) => {
      console.log("Redis error:", error);
    });

    await redisClient.connect();
    console.log("Redis connected");
  } catch (error) {
    console.log("Redis connection failed (continuing without cache):", error.message);
    redisClient = null;
  }
};

const getRedisClient = () => redisClient;

module.exports = {
  connectRedis,
  getRedisClient,
};
