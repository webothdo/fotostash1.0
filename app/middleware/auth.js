import { toast } from "vue-sonner";

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (
    (to.path.includes("/profile") || to.path.includes("/upload")) &&
    !useAuth().user.value?.id
  ) {
    toast.warning("Please login to access this page", {
      description: "You will be redirected to login page",
    });
    return await navigateTo("/login");
  }
});
