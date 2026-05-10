// ---------------------------------------------------------------------------
// Redis config — supports two modes:
//
//  1. Upstash (production / Vercel)
//     Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in the
//     Vercel dashboard. Upstash uses HTTP/REST so it works in serverless.
//
//  2. Regular Redis (local development)
//     Set REDIS_URL (e.g. redis://localhost:6379).
//     Falls back gracefully if Redis is not running.
//
// Both modes expose the same interface so taskCache.js needs no changes.
// ---------------------------------------------------------------------------

let redisClient = null;

// ─── Upstash adapter ────────────────────────────────────────────────────────
// Wraps @upstash/redis to match the regular redis package API used in taskCache.
class UpstashAdapter {
  constructor(client) {
    this._client = client;
  }

  // Upstash auto-parses JSON on get(); re-stringify so taskCache can JSON.parse
  async get(key) {
    const val = await this._client.get(key);
    if (val === null || val === undefined) return null;
    return typeof val === "string" ? val : JSON.stringify(val);
  }

  async setEx(key, seconds, value) {
    return this._client.set(key, value, { ex: seconds });
  }

  async keys(pattern) {
    return this._client.keys(pattern);
  }

  async del(keys) {
    if (!keys || keys.length === 0) return;
    return this._client.del(...keys);
  }
}

// ─── Connect ────────────────────────────────────────────────────────────────
const connectRedis = async () => {
  try {
    if (
      process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN
    ) {
      // Upstash mode (Vercel / production)
      const { Redis } = require("@upstash/redis");
      const upstash = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      redisClient = new UpstashAdapter(upstash);
      console.log("Upstash Redis connected");
    } else if (process.env.REDIS_URL) {
      // Regular Redis mode (local dev)
      const { createClient } = require("redis");
      const client = createClient({
        url: process.env.REDIS_URL,
        socket: {
          reconnectStrategy: (retries) => Math.min(retries * 50, 500),
        },
      });
      client.on("error", (error) => {
        console.log("Redis error:", error);
      });
      await client.connect();
      redisClient = client;
      console.log("Redis connected");
    } else {
      console.log("No Redis config found, running without cache");
    }
  } catch (error) {
    console.log(
      "Redis connection failed (continuing without cache):",
      error.message
    );
    redisClient = null;
  }
};

const getRedisClient = () => redisClient;

module.exports = {
  connectRedis,
  getRedisClient,
};
