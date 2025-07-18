import type { ClientOptions, InferSessionFromClient } from "better-auth/client";
import type { RouteLocationRaw } from "vue-router";
import { createAuthClient } from "better-auth/vue";
import type { User } from "better-auth";
import { adminClient, usernameClient } from "better-auth/client/plugins";

export function useNotAuth() {
  const url = useRequestURL();
  const headers = import.meta.server ? useRequestHeaders() : undefined;

  const client = createAuthClient({
    baseURL: url.origin,
    fetchOptions: {
      headers,
    },
    plugins: [usernameClient(), adminClient()],
  });

  const session = useState<InferSessionFromClient<ClientOptions> | null>(
    "auth:session",
    () => null
  );
  const user = useState<User | null>("auth:user", () => null);
  const sessionFetching = import.meta.server
    ? ref(false)
    : useState("auth:sessionFetching", () => false);

  const fetchSession = async () => {
    if (sessionFetching.value) {
      console.log("already fetching session");
      return;
    }
    sessionFetching.value = true;
    const { data, error } = await client.useSession(useFetch);
    if (error.value) {
      console.log("fetchSession error", error.value);
    }
    session.value = data.value?.session || null;
    user.value = data.value?.user ? { ...data.value.user } : null;
    sessionFetching.value = false;
    return data;
  };

  if (import.meta.client) {
    client.$store.listen("$sessionSignal", async (signal) => {
      if (!signal) return;
      await fetchSession();
    });
  }

  return {
    session,
    user,
    loggedIn: computed(() => !!session.value),
    signIn: client.signIn,
    signUp: client.signUp,
    forgetPassword: client.forgetPassword,
    resetPassword: client.resetPassword,
    sendVerificationEmail: client.sendVerificationEmail,
    errorCodes: client.$ERROR_CODES,
    async signOut({ redirectTo }: { redirectTo?: RouteLocationRaw } = {}) {
      const res = await client.signOut();
      session.value = null;
      user.value = null;
      if (redirectTo) {
        await navigateTo(redirectTo);
      }
      return res;
    },
    fetchSession,
    client,
  };
}
