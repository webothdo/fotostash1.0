import { useRedis } from "~~/server/utils/useRedis";

export default defineEventHandler(async (event) => {
  await useRedis().set("foo", "bar");
  await useRedis().get("foo");

  return {};
});
