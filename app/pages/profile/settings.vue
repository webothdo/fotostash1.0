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

const loginLoading = ref(false);

const formSchema = toTypedSchema(
  z.object({
    username: z.string({ required_error: "Username is required" }).min(5, {
      message: "Username must be at least 5 characters long",
    }),
  })
);

const form = useForm({
  validationSchema: formSchema,
});

const onSubmit = form.handleSubmit(async (values) => {
  loginLoading.value = true;

  try {
    const { data, status } = await useFetch("/api/user/update/username", {
      method: "POST",
      //@ts-ignore
      body: {
        username: values.username,
      },
    });
    if (status.value === "success") {
      toast.success("Username updated successfully");
    }
  } catch (error) {
    toast.error("Something went wrong", {
      description: (error as Error).message,
    });
  }

  loginLoading.value = false;
});

onMounted(() => {
  //@ts-ignore
  form.setFieldValue("username", useUser().user.value?.username);
});
</script>

<template>
  <div>
    <form
      @submit="onSubmit"
      class="mx-auto shadow rounded-md p-4 max-w-sm space-y-4 w-80"
    >
      <div class="space-y-1">
        <h1 class="text-xl font-bold">Settings</h1>
        <p class="text-sm text-muted-foreground">Please enter your username</p>
      </div>
      <FormField name="username" v-slot="{ componentField }">
        <FormItem class="space-y-2">
          <FormLabel class="font-semibold">Username</FormLabel>
          <FormControl>
            <Input type="text" placeholder="johndoe" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <Button type="submit" class="w-full" :disabled="loginLoading"
        >Update <Loader2 v-if="loginLoading" class="ml-2 h-4 w-4 animate-spin"
      /></Button>
    </form>
  </div>
</template>
