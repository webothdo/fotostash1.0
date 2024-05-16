import getUser from "../actions/getUser";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  try {
    const profile = await getUser(query.id);
    return profile;
  } catch (error) {
    return error;
  }
});
