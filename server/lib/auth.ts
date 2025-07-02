import { betterAuth } from "better-auth";
import { admin, username } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { useDb } from "../utils/useDb";
import * as authSchema from "../db/authSchema";
import { nanoid } from "nanoid";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  database: drizzleAdapter(useDb(), {
    provider: "sqlite",
    schema: authSchema,
  }),
  advanced: {
    database: {
      generateId: () => nanoid(),
    },
  },
  user: {
    deleteUser: {
      enabled: true,
    },
    additionalFields: {
      firstName: {
        type: "string",
        required: false,
      },
      lastName: {
        type: "string",
        required: false,
      },
      bio: {
        type: "string",
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      mapProfileToUser: async (profile) => {
        return {
          firstName: profile.name.split(" ")[0],
          lastName: profile.name.split(" ")[1],
          image: profile.avatar_url,
        };
      },
    },
  },
  plugins: [
    username({
      minUsernameLength: 4,
    }),
    admin(),
  ],
});
