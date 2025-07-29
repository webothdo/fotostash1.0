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
import { Loader2, CheckCircle2, XCircle } from "lucide-vue-next";
import { ref, computed, watch } from "vue";
import { useDebounce } from "@/composables/useDebounce";

definePageMeta({
  middleware: "auth",
});

const loginLoading = ref(false);
const usernameAvailable = ref<boolean | null>(null); // null = untouched, true = available, false = taken
const usernamePending = ref(false);
const MIN_USERNAME_LENGTH = 5;

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

const username = computed(() => form.values.username);
const { debouncedValue: debouncedUsername, pending: debouncePending } =
  useDebounce(username, 700);

watch(debouncedUsername, async (val) => {
  usernameAvailable.value = null;
  if (!val || val.length < MIN_USERNAME_LENGTH) {
    usernameAvailable.value = null;
    usernamePending.value = false;
    return;
  }
  usernamePending.value = true;
  try {
    const { data, pending, error } = await useFetch(
      `/api/username/check?username=${encodeURIComponent(val)}`
    );
    usernameAvailable.value =
      // @ts-ignore
      data.value && typeof data.value.isAvailable === "boolean"
        ? // @ts-ignore
          data.value.isAvailable
        : null;
  } catch (e) {
    usernameAvailable.value = null;
  } finally {
    usernamePending.value = false;
  }
});

const canSubmit = computed(() => {
  return (
    !loginLoading.value &&
    username.value &&
    username.value.length >= MIN_USERNAME_LENGTH &&
    usernameAvailable.value === true
  );
});

const onSubmit = form.handleSubmit(async (values) => {
  if (!canSubmit) return;
  loginLoading.value = true;
  try {
    const { data, status } = await useFetch("/api/user/update/username", {
      method: "POST",
      //@ts-ignore
      body: {
        username: values.username,
      },
    });
    reloadNuxtApp();
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
            <div class="relative flex items-center">
              <Input
                type="text"
                placeholder="johndoe"
                v-bind="componentField"
              />
              <span class="absolute right-2">
                <Loader2
                  v-if="usernamePending || debouncePending"
                  class="h-4 w-4 animate-spin text-muted-foreground"
                />
                <CheckCircle2
                  v-else-if="usernameAvailable === true"
                  class="h-4 w-4 text-green-500"
                />
                <XCircle
                  v-else-if="usernameAvailable === false"
                  class="h-4 w-4 text-red-500"
                />
              </span>
            </div>
          </FormControl>
          <FormMessage v-if="usernameAvailable === false">
            Username is not available
          </FormMessage>
          <FormMessage v-else />
        </FormItem>
      </FormField>
      <Button type="submit" class="w-full" :disabled="!canSubmit"
        >Update
        <Loader2 v-if="loginLoading" class="ml-2 h-4 w-4 animate-spin" />
      </Button>
    </form>
  </div>
</template>
