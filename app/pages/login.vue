<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "vue-sonner";

definePageMeta({
  middleware: "auth",
});

const oAuthLoading = ref(false);
const loginLoading = ref(false);

const formSchema = toTypedSchema(
  z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Email must be a valid email" }),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters" }),
  })
);

const form = useForm({
  validationSchema: formSchema,
});

const onSubmit = form.handleSubmit(async (values) => {
  loginLoading.value = true;

  await useAuth().signIn.email(
    {
      email: values.email,
      password: values.password,
    },
    {
      onSuccess() {
        navigateTo("/profile");
      },
      onError({ error }) {
        toast.error("Something went wrong", {
          description: error.message,
        });
      },
    }
  );

  loginLoading.value = false;
});

const signInWithGithub = async () => {
  oAuthLoading.value = true;
  await useAuth().signIn.social(
    {
      provider: "github",
      callbackURL: "/profile",
    },
    {
      onError({ error }) {
        toast.error("Something went wrong", {
          description: error.message,
        });
      },
    }
  );
  oAuthLoading.value = false;
};
</script>
<template>
  <div class="flex flex-col items-center justify-center h-full">
    <ClientOnly>
      <form
        @submit="onSubmit"
        class="mx-auto shadow rounded-md p-4 max-w-sm space-y-4 w-80"
      >
        <div class="space-y-1">
          <h1 class="text-xl font-bold">Login</h1>
          <p class="text-sm text-muted-foreground">
            Please enter your email and password
          </p>
        </div>
        <FormField name="email" v-slot="{ componentField }">
          <FormItem class="space-y-2">
            <FormLabel class="font-semibold">Email</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="johndoe@example.com"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField name="password" v-slot="{ componentField }">
          <FormItem class="space-y-2">
            <FormLabel class="font-semibold">Password</FormLabel>
            <!-- <NuxtLink to="#" class="text-sm underline ml-[80px]"
              >Forgot your password?</NuxtLink
            > -->
            <FormControl>
              <Input
                type="password"
                placeholder="12345678"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <Button
          type="submit"
          class="w-full"
          :disabled="loginLoading || oAuthLoading"
          >Login <Loader2 v-if="loginLoading" class="ml-2 h-4 w-4 animate-spin"
        /></Button>
        <Button
          variant="outline"
          class="w-full"
          @click="signInWithGithub"
          :disabled="oAuthLoading || loginLoading"
        >
          Login with GitHub
          <Loader2 v-if="oAuthLoading" class="ml-2 h-4 w-4 animate-spin"
        /></Button>
      </form>
      <div class="mt-4 text-center text-sm">
        Don't have an account?
        <NuxtLink to="/signup" class="underline"> Sign up </NuxtLink>
      </div>
    </ClientOnly>
  </div>
</template>
