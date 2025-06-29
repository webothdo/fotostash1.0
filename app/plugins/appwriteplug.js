import { Client, Account, ID } from "appwrite";

export default defineNuxtPlugin((nuxtApp) => {
  const client = new Client()
    .setEndpoint(nuxtApp.$config.public.appwriteEndpoint)
    .setProject(nuxtApp.$config.public.appwriteProjectId);

  const account = new Account(client);

  const id = ID;

  const appwrite = {
    account,
    id,
  };

  return {
    provide: {
      appwrite,
    },
  };
});
