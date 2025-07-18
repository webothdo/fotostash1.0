export default defineNuxtPlugin(async (nuxtApp) => {
  const user = await useUser().getUser();
});
