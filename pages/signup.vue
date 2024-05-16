<script setup>
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const nuxtApp = useNuxtApp()
const { account, id } = nuxtApp.$appwrite

const formSchema = toTypedSchema(z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Email must be a valid email" }),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" }),
}))

const form = useForm({
  validationSchema: formSchema
})

const onSubmit = form.handleSubmit(async (values) => {
  console.log("Submitted", values)
  try {
    // await account.create(id.unique(), values.email, values.password)
    const created = await useUserStore().signUpWithEmailAndPassword(id.unique(), values.email, values.password)
    console.log(created)
  } catch (error) {
    console.error(error)
  }
})


</script>
<template>
  <div class="flex flex-col items-center justify-center h-full">
    <ClientOnly>
      <form @submit="onSubmit" class="mx-auto shadow rounded-md p-4 max-w-sm space-y-4 w-80">
        <div class="space-y-1">
          <h1 class="text-xl font-bold">Signup</h1>
          <p class="text-sm text-muted-foreground">Please enter your email and password</p>

        </div>
        <FormField name="email" v-slot="{ componentField }">
          <FormItem class="space-y-2">
            <FormLabel class="font-semibold">Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="johndoe@example.com" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField name="password" v-slot="{ componentField }">
          <FormItem class="space-y-2">
            <FormLabel class="font-semibold">Password</FormLabel>
            <FormControl>
              <Input type="password" placeholder="12345678" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <Button type="submit" class="w-full">Create an account</Button>
        <Button variant="outline" class="w-full">
          Sign up with GitHub
        </Button>
      </form>
      <div class="mt-4 text-center text-sm">
        Already have an account?
        <NuxtLink to="/login" class="underline">
          Sign in
        </NuxtLink>
      </div>
    </ClientOnly>
  </div>
</template>
