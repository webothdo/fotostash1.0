<script setup lang="ts">
import { fileToBase64 } from "file64";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "vue-sonner";
import { useBase64 } from "@vueuse/core";

definePageMeta({
  middleware: "auth",
});

const show = ref(false);
const isLoading = ref(false);
const picture = ref("/");
const name = ref("");

const upload = async () => {
  isLoading.value = true;
  let pictureInput = document.querySelector("#picture") as HTMLInputElement;
  if (!pictureInput) {
    return;
  }

  const image = pictureInput.files?.[0];
  if (!image) {
    return;
  }
  const baseImage = useBase64(image);
  //@ts-ignore
  const userId = useUser().user.value?.id;
  try {
    const data = await $fetch("/api/upload", {
      method: "POST",
      body: {
        name: name.value,
        image: baseImage,
      },
    });
    toast.success("Image uploaded successfully");
  } catch (error) {
    toast.warning("An error occured", {
      description: (error as Error).message,
    });
  }
  show.value = false;
  name.value = "";
  isLoading.value = false;
};

const inputChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    //@ts-ignore
    picture.value = URL.createObjectURL(target.files[0]);
    show.value = true;
  }
};
</script>

<template>
  <div>
    <main
      v-show="!show"
      class="w-[320px] h-[320px] border flex flex-col items-center justify-center gap-3 mx-auto rounded"
    >
      <h2 class="font-bold text-2xl">Upload your picture</h2>
      <Input @change="inputChange" id="picture" type="file" class="w-1/2" />
    </main>
    <Card v-show="show" class="md:max-w-[600px] mx-auto">
      <CardHeader>
        <CardTitle>Upload your image</CardTitle>
      </CardHeader>
      <CardContent class="flex gap-3">
        <NuxtImg id="preview" :src="picture" class="w-[50%]" />
        <div class="w-[50%]">
          <div class="space-y-2">
            <Label for="name">Enter a descriptive name</Label>
            <Input v-model="name" id="name" type="text" />
          </div>
          <div class="space-y-2 mt-3">
            <Label for="name"
              >Add a few tags<span class="text-slate-400 text-sm">
                seperated with comma</span
              ></Label
            >
            <Input id="name" type="text" />
          </div>
        </div>
      </CardContent>
      <CardFooter class="flex justify-end">
        <ClientOnly>
          <Button @click="upload" :disabled="isLoading">{{
            isLoading ? "Uploading..." : "Upload"
          }}</Button>
        </ClientOnly>
      </CardFooter>
    </Card>
  </div>
</template>
