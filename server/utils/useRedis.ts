import { redis } from "../lib/upstashRedis";

export const useRedis = () => {
  return redis;
};
