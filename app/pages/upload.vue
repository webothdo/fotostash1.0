<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import { ImagePlus, Loader2, X } from "lucide-vue-next";
import { toast } from "vue-sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

definePageMeta({
  middleware: "auth",
});

const SUPPORTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB, matches the upload API

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const name = ref("");
const isDragging = ref(false);
const isLoading = ref(false);

const fileSize = computed(() => {
  const size = selectedFile.value?.size ?? 0;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
});

const canUpload = computed(
  () => !!selectedFile.value && !!name.value.trim() && !isLoading.value
);

function openFilePicker() {
  fileInput.value?.click();
}

function selectFile(file?: File) {
  if (!file) return;

  if (!SUPPORTED_TYPES.includes(file.type)) {
    toast.error("Unsupported file type", {
      description: "Choose a JPEG, PNG, GIF, WebP or SVG image.",
    });
    return;
  }

  if (file.size > MAX_FILE_SIZE) {
    toast.error("File is too large", {
      description: "Please choose an image smaller than 10 MB.",
    });
    return;
  }

  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }

  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);

  if (!name.value.trim()) {
    name.value = file.name.replace(/\.[^./]+$/, "").trim();
  }
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  selectFile(input.files?.[0]);
}

function onDrop(event: DragEvent) {
  isDragging.value = false;
  selectFile(event.dataTransfer?.files?.[0]);
}

function clearSelection() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = null;
  }
  selectedFile.value = null;
  name.value = "";
  isDragging.value = false;
  if (fileInput.value) fileInput.value.value = "";
}

async function upload() {
  if (!canUpload.value || !selectedFile.value) return;

  isLoading.value = true;

  try {
    const formData = new FormData();
    formData.append("name", name.value.trim());
    formData.append("image", selectedFile.value);

    await $fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    toast.success("Photo uploaded", {
      description: "Your photo has been added to your profile.",
    });
    clearSelection();
  } catch (error) {
    toast.error("Upload failed", {
      description:
        (error as Error).message || "Something went wrong. Please try again.",
    });
  } finally {
    isLoading.value = false;
  }
}

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
});
</script>

<template>
  <div class="mx-auto w-full max-w-4xl px-4 py-10 md:py-14">
    <header class="mb-8">
      <p
        class="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground"
      >
        New upload
      </p>
      <h1 class="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
        Share a photo
      </h1>
      <p class="mt-2 max-w-xl text-sm text-muted-foreground">
        Add a high-quality image and a clear title so people can find it in the
        gallery.
      </p>
    </header>

    <Card class="overflow-hidden">
      <CardContent class="p-5 sm:p-8">
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
          class="sr-only"
          @change="onFileChange"
        />

        <div
          v-if="!selectedFile"
          class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors md:py-20"
          :class="
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50'
          "
          @dragenter.prevent="isDragging = true"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="onDrop"
        >
          <div
            class="mb-5 flex size-14 items-center justify-center rounded-2xl border bg-background shadow-xs"
          >
            <ImagePlus class="size-6 text-muted-foreground" />
          </div>
          <h2 class="text-base font-semibold">
            {{ isDragging ? "Drop your photo here" : "Drag and drop your photo" }}
          </h2>
          <p class="mt-1 text-sm text-muted-foreground">
            JPEG, PNG, GIF, WebP or SVG · up to 10 MB
          </p>
          <Button type="button" class="mt-6" @click="openFilePicker">
            Browse files
          </Button>
        </div>

        <div
          v-else
          class="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-start"
        >
          <div class="space-y-3">
            <div
              class="relative flex min-h-[240px] items-center justify-center overflow-hidden rounded-xl border bg-muted/40"
            >
              <img
                :src="previewUrl ?? ''"
                :alt="name || 'Selected photo'"
                class="max-h-[420px] w-full object-contain"
              />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                class="absolute right-2 top-2 shadow-sm"
                aria-label="Remove selected photo"
                :disabled="isLoading"
                @click="clearSelection"
              >
                <X class="size-4" />
              </Button>
            </div>
            <div
              class="flex items-center justify-between gap-3 px-1 text-xs text-muted-foreground"
            >
              <span class="truncate">{{ selectedFile.name }}</span>
              <span class="shrink-0">{{ fileSize }}</span>
            </div>
          </div>

          <form class="flex flex-col gap-5" @submit.prevent="upload">
            <div class="space-y-2">
              <Label for="photo-title">Title</Label>
              <Input
                id="photo-title"
                v-model="name"
                placeholder="e.g. Golden hour in Lisbon"
                maxlength="120"
                :disabled="isLoading"
              />
              <p class="text-xs text-muted-foreground">
                This is the name shown on your photo.
              </p>
            </div>

            <div
              class="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground"
            >
              <p class="font-medium text-foreground">Before you upload</p>
              <p class="mt-1">
                Only upload images you have the right to share. Your photo will
                be added to your profile.
              </p>
            </div>

            <div
              class="mt-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
            >
              <Button
                type="button"
                variant="outline"
                :disabled="isLoading"
                @click="clearSelection"
              >
                Cancel
              </Button>
              <Button type="submit" :disabled="!canUpload">
                <Loader2 v-if="isLoading" class="animate-spin" />
                {{ isLoading ? "Uploading..." : "Upload photo" }}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
