export const useUserStore = defineStore("user", () => {
  const nuxtApp = useNuxtApp();
  const currentUser = ref(null);
  const user = ref(null);
  const profile = ref(null);
  const count = ref(0);

  const increaseCount = () => {
    count.value += 1;
  };

  async function getCurrentUser() {
    try {
      currentUser.value = await nuxtApp.$appwrite.account.get();
    } catch (error) {
      currentUser.value = null;
    }
  }
  getCurrentUser();

  async function init() {
    try {
      user.value = await nuxtApp.$appwrite.account.get();
      console.log("user", user.value);
    } catch (error) {
      user.value = null;
      console.log(error);
    }
  }

  async function initProfile() {
    try {
      profile.value = await $fetch("/api/user", {
        method: "GET",
        query: {
          id: user.value?.$id,
        },
      });
      console.log("profile", profile?.value);
    } catch (error) {
      console.log("profile", profile.value);
    }
  }

  async function signUpWithEmailAndPassword(uniqueId, email, password) {
    try {
      const response = await nuxtApp.$appwrite.account.create(
        uniqueId,
        email,
        password
      );
      profile.value = await $fetch("/api/createProfile", {
        method: "POST",
        body: {
          id: response.$id,
        },
      });

      await loginWithEmailAndPassword(email, password);
      //TODO: add ability to generate random profile
      // and login
      console.log(profile.value);
    } catch (error) {
      console.log(error);
    }
  }

  async function loginWithEmailAndPassword(email, password) {
    try {
      const response =
        await nuxtApp.$appwrite.account.createEmailPasswordSession(
          email,
          password
        );
      await init();
      await initProfile();
      useRouter().push("/profile");
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  }

  async function logout() {
    await nuxtApp.$appwrite.account.deleteSession("current");
    user.value = null;
    useRouter().push("/login");
  }

  return {
    currentUser,
    user,
    profile,
    init,
    initProfile,
    signUpWithEmailAndPassword,
    loginWithEmailAndPassword,
    logout,
    count,
    increaseCount,
  };
});
