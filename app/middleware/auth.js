import { useNuxtApp } from "nuxt/app";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const nuxtApp = useNuxtApp();
  const curr = useUserStore();

  //To call every time a user wants to access the profile page
  async () => {
    await useAsyncData("profie", () => curr.initProfile());
    // await useAsyncData("user", () => curr.init());
  };

  //To call the api only once
  // await callOnce(async () => {
  //   await curr.init();
  //   await curr.initProfile();
  // });

  if (to.path === "/profile" && !curr?.user) {
    console.log("please login");
    return navigateTo("/login");
  }

  if (to.path === "/upload" && curr?.user === null) {
    console.log("please login");
    return navigateTo("/login");
  }

  if (to.path === "/profile/settings" && curr?.user === null) {
    console.log("please login");
    return navigateTo("/login");
  }

  // if (to.path === "/profile" && curr?.user) {
  //   console.log("you are authorized");
  // }

  if (to.path === "/login" && curr?.user) {
    console.log("you are already logged in");
    return navigateTo("/profile");
  }
});
