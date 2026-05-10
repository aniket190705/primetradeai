const { getRedisClient } = require("../config/redis");

const getTaskCacheKey = (userId, page, limit, search) => {
  return `tasks:${userId}:page=${page}:limit=${limit}:search=${search || ""}`;
};

const getCachedTasks = async (key) => {
  const redisClient = getRedisClient();

  if (!redisClient) {
    return null;
  }

  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
};

const setCachedTasks = async (key, value) => {
  const redisClient = getRedisClient();

  if (!redisClient) {
    return;
  }

  await redisClient.setEx(key, 60, JSON.stringify(value));
};

const clearTaskCache = async (userId) => {
  const redisClient = getRedisClient();

  if (!redisClient) {
    return;
  }

  const keys = await redisClient.keys(`tasks:${userId}:*`);

  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};

module.exports = {
  getTaskCacheKey,
  getCachedTasks,
  setCachedTasks,
  clearTaskCache,
};
