import { useNuxtApp } from "nuxt/app";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const nuxtApp = useNuxtApp();
  const { account, id } = nuxtApp.$appwrite;
  const user = useAppwriteUser();

  if (to.path === "/profile" && !user) {
    console.log("please login");
    // return navigateTo("/login");
  }

  if (to.path === "/profile" && user) {
    console.log("you are authorized");
  }
});
