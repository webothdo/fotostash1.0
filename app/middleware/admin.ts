export default defineNuxtRouteMiddleware(async (to, from) => {
  const { user } = useUser();
  const { user: auth } = useAuth();

  // skip middleware on server
  if (import.meta.server) return;

  if (!auth?.id) {
    return navigateTo("/api/login", {
      external: true,
    });
  }
  // @ts-ignore
  if (user.value?.role != "admin") {
    return navigateTo("/", {
      external: true,
    });
  }
});
