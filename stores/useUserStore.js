export const useUserStore = defineStore("user", async () => {
  const nuxtApp = useNuxtApp();
  const currentUser = ref(null);

  try {
    currentUser.value = await nuxtApp.$appwrite.account.get();
  } catch (error) {
    currentUser.value = null;
  }

  return {
    currentUser,
  };
});
