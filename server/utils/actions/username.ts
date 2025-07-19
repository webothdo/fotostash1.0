import { useRedis } from "../useRedis";

export const isUsernameAvailable = async (username: string) => {
  const redis = useRedis();
  const isAvailable = await redis.sismember("usernames", username);
  if (isAvailable === 0) {
    return true;
  }
  return false;
};

export const addUsername = async (username: string): Promise<boolean> => {
  const redis = useRedis();
  const added = await redis.sadd("usernames", username);
  return added === 1;
};

export const removeUsername = async (username: string): Promise<boolean> => {
  const redis = useRedis();
  const removed = await redis.srem("usernames", username);
  return removed === 1;
};
