import type { H3Event } from "h3";
import { betterAuth } from "better-auth";
import { admin, username } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { useDb } from "../utils/useDb";
import * as authSchema from "../db/authSchema";
import { nanoid } from "nanoid";
import { useSplunk } from "../utils/useSplunk";

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
    // sendResetPassword: async ({ user, url }, request) => {
    //   const response = await useSplunk(
    //     `support`,
    //     user.email,
    //     "Reset your password",
    //     `Click the link to reset your password: ${url}`
    //   );
    //   if (response) {
    //     console.log("from auth.ts", response);
    //   }
    // },
  },
  //   emailVerification: {
  //     sendOnSignUp: true,
  //     autoSignInAfterVerification: true,
  //     sendVerificationEmail: async ({ user, url }, request) => {
  //       const response = await useSplunk(
  //         `joshuaogboloo@gmail.com`,
  //         user.email,
  //         "Verify your email",
  //         `Click the link to verify your email: ${url}`
  //       );
  //       if (response) {
  //         console.log("from auth.ts sent", response);
  //       }
  //     },
  //   },
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

// export const useServerAuth = () => {
//   if (runtimeConfig.preset == "node-server") {
//     return auth;
//   } else {
//     return auth;
//   }
// };

// export const getServerAuthSession = async (event: H3Event) => {
//   const headers = event.headers;
//   const serverAuth = useServerAuth();
//   const session = await serverAuth.api.getSession({
//     headers,
//   });
//   return session;
// };
