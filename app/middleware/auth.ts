export default defineNuxtRouteMiddleware((to, from) => {
  const { user } = useAuth();
  if (!user?.id) {
    return navigateTo("/api/login", {
      external: true,
    });
  }
});
