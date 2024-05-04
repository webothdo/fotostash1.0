export const useUserStore = defineStore("user", () => {
  const nuxtApp = useNuxtApp();
  const currentUser = ref(null);

  async function getCurrentUser() {
    try {
      currentUser.value = await nuxtApp.$appwrite.account.get();
    } catch (error) {
      currentUser.value = null;
    }
  }
  getCurrentUser();

  return {
    currentUser,
  };
});
