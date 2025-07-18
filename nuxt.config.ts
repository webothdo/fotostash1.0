// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: "2025-07-15",
  modules: ["shadcn-nuxt", "@nuxt/image", "@pinia/nuxt", "@nuxtjs/kinde"],
  css: ["@/assets/css/tailwind.css"],
  shadcn: {
    prefix: "",
    componentDir: "./app/components/ui",
  },
  kinde: {
    debug: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    betterAuthSecret: process.env.BETTER_AUTH_SECRET,
    betterAuthUrl: process.env.BETTER_AUTH_URL,
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    public: {
      appwriteEndpoint: process.env.APPWRITE_ENDPOINT,
      appwriteProjectId: process.env.APPWRITE_PROJECT_ID,
    },
  },
});
