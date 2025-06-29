// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: "2025-06-29",
  future: {
    compatibilityVersion: 4,
  },
  modules: ["shadcn-nuxt", "@nuxt/image", "@pinia/nuxt"],
  css: ["@/assets/css/tailwind.css"],
  shadcn: {
    prefix: "",
    componentDir: "./app/components/ui",
  },
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    public: {
      appwriteEndpoint: process.env.APPWRITE_ENDPOINT,
      appwriteProjectId: process.env.APPWRITE_PROJECT_ID,
    },
  },
});
