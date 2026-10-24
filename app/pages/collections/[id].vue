<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import {
  ArrowLeft,
  FolderPlus,
  Globe,
  Loader2,
  Lock,
  Pencil,
  Trash2,
} from "lucide-vue-next";
import { toast } from "vue-sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Photo } from "@/types/photo";

interface CollectionDetail {
  id: string;
  name: string;
  description?: string | null;
  isPrivate: boolean;
  isOwner: boolean;
  user?: {
    username?: string | null;
    name?: string | null;
    picture?: string | null;
  } | null;
  photos: Photo[];
}

const route = useRoute();
const id = String(route.params.id ?? "");
const { data: collection, status, error, refresh } = await useFetch<CollectionDetail>(
  `/api/collections/${id}`
);

if (import.meta.server && (error.value || !collection.value)) {
  setResponseStatus(404);
}

const siteUrl = useSiteUrl();
const pageTitle = computed(() =>
  collection.value?.name
    ? `${collection.value.name} — Collection — Fotostash`
    : "Collection — Fotostash"
);
const pageDescription = computed(
  () =>
    collection.value?.description ||
    `A photo collection on Fotostash${collection.value?.user?.username ? ` by @${collection.value.user.username}` : ""}.`
);

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  ogType: "website",
  robots: computed(() =>
    collection.value?.isPrivate ? "noindex, nofollow" : "index, follow"
  ),
});

useHead(() => ({
  link: collection.value
    ? [{ rel: "canonical", href: `${siteUrl}/collections/${collection.value.id}` }]
    : [],
}));

const editing = ref(false);
const saving = ref(false);
const form = reactive({ name: "", description: "", isPrivate: true });

watch(
  collection,
  (value) => {
    if (!value) return;
    form.name = value.name;
    form.description = value.description ?? "";
    form.isPrivate = value.isPrivate;
  },
  { immediate: true }
);

async function saveCollection() {
  const name = form.name.trim();
  if (name.length < 2 || saving.value) return;

  saving.value = true;

  try {
    await $fetch(`/api/collections/${id}`, {
      method: "PATCH",
      body: {
        name,
        description: form.description,
        isPrivate: form.isPrivate,
      },
    });
    await refresh();
    editing.value = false;
    toast.success("Collection updated");
  } catch (updateError) {
    toast.error("Could not update collection", {
      description: (updateError as Error).message,
    });
  } finally {
    saving.value = false;
  }
}

const deleteOpen = ref(false);
const deleting = ref(false);

async function deleteCollection() {
  if (deleting.value) return;
  deleting.value = true;

  try {
    await $fetch(`/api/collections/${id}`, { method: "DELETE" });
    toast.success("Collection deleted", {
      description: "The photos themselves are still available.",
    });
    await navigateTo("/saved");
  } catch (deleteError) {
    toast.error("Could not delete collection", {
      description: (deleteError as Error).message,
    });
    deleting.value = false;
  }
}

const removingId = ref<string | null>(null);

async function removePhoto(photo: Photo) {
  if (removingId.value) return;
  removingId.value = photo.id;

  try {
    await $fetch(`/api/collections/${id}/photos/${photo.id}`, {
      method: "DELETE",
    });
    await refresh();
    toast.success("Removed from collection");
  } catch (removeError) {
    toast.error("Could not remove photo", {
      description: (removeError as Error).message,
    });
  } finally {
    removingId.value = null;
  }
}

const backTo = computed(() =>
  collection.value?.isOwner
    ? "/saved"
    : collection.value?.user?.username
      ? `/@${collection.value.user.username}`
      : "/"
);
</script>

<template>
  <div class="mx-auto w-full max-w-7xl px-4 py-10 md:py-14">
    <div v-if="status === 'pending'" class="py-24 text-center">
      <Loader2 class="mx-auto size-6 animate-spin text-muted-foreground" />
    </div>

    <div v-else-if="error || !collection" class="mx-auto max-w-md py-20 text-center">
      <div
        class="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl border bg-muted/40"
      >
        <FolderPlus class="size-6 text-muted-foreground" />
      </div>
      <h1 class="text-xl font-semibold">Collection not found</h1>
      <p class="mt-1 text-sm text-muted-foreground">
        It may be private or no longer available.
      </p>
      <Button variant="outline" class="mt-5" as-child>
        <NuxtLink to="/">Browse photos</NuxtLink>
      </Button>
    </div>

    <template v-else>
      <NuxtLink
        :to="backTo"
        class="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft class="size-4" />
        {{ collection.isOwner ? "Back to saved" : "Back to profile" }}
      </NuxtLink>

      <header class="mt-5 flex flex-wrap items-start justify-between gap-5">
        <div class="max-w-2xl">
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="text-3xl font-bold tracking-tight md:text-4xl">
              {{ collection.name }}
            </h1>
            <span
              class="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
            >
              <Lock v-if="collection.isPrivate" class="size-3" />
              <Globe v-else class="size-3" />
              {{ collection.isPrivate ? "Private" : "Public" }}
            </span>
          </div>
          <p v-if="collection.description" class="mt-3 text-muted-foreground">
            {{ collection.description }}
          </p>
          <div class="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <NuxtLink
              v-if="collection.user?.username"
              :to="`/@${collection.user.username}`"
              class="font-medium text-foreground transition-colors hover:text-primary"
            >
              @{{ collection.user.username }}
            </NuxtLink>
            <span>·</span>
            <span>
              {{ collection.photos.length }}
              {{ collection.photos.length === 1 ? "photo" : "photos" }}
            </span>
          </div>
        </div>

        <div v-if="collection.isOwner" class="flex flex-wrap gap-2">
          <Button variant="outline" @click="editing = !editing">
            <Pencil class="size-4" />
            {{ editing ? "Cancel" : "Edit collection" }}
          </Button>
          <Button variant="outline" @click="deleteOpen = true">
            <Trash2 class="size-4" />
            Delete
          </Button>
        </div>
      </header>

      <form
        v-if="collection.isOwner && editing"
        class="mt-6 max-w-xl space-y-4 rounded-xl border bg-card p-5"
        @submit.prevent="saveCollection"
      >
        <div class="space-y-2">
          <label for="collection-name" class="text-sm font-medium">Name</label>
          <Input
            id="collection-name"
            v-model="form.name"
            maxlength="80"
            :disabled="saving"
          />
        </div>
        <div class="space-y-2">
          <label for="collection-description" class="text-sm font-medium">
            Description
          </label>
          <textarea
            id="collection-description"
            v-model="form.description"
            rows="3"
            maxlength="300"
            :disabled="saving"
            placeholder="What is this collection about?"
            class="flex w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
          />
        </div>
        <label class="flex items-center gap-2 text-sm">
          <input
            v-model="form.isPrivate"
            type="checkbox"
            class="size-4 accent-primary"
          />
          Keep this collection private
        </label>
        <div class="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            :disabled="saving"
            @click="editing = false"
          >
            Cancel
          </Button>
          <Button type="submit" :disabled="saving || form.name.trim().length < 2">
            <Loader2 v-if="saving" class="animate-spin" />
            Save changes
          </Button>
        </div>
      </form>

      <section class="mt-8">
        <MasonryComp
          v-if="collection.photos.length"
          :items="collection.photos"
          :removable="collection.isOwner"
          @remove="removePhoto"
        />

        <div
          v-else
          class="rounded-xl border border-dashed bg-muted/20 px-6 py-14 text-center"
        >
          <FolderPlus class="mx-auto size-8 text-muted-foreground" />
          <h2 class="mt-3 text-lg font-semibold">This collection is empty</h2>
          <p class="mt-1 text-sm text-muted-foreground">
            Open a photo and use “Save” to add it here.
          </p>
          <Button variant="outline" class="mt-5" as-child>
            <NuxtLink to="/">Browse photos</NuxtLink>
          </Button>
        </div>
      </section>

      <Dialog v-model:open="deleteOpen">
        <DialogContent class="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete “{{ collection.name }}”?</DialogTitle>
            <DialogDescription>
              This removes the collection only. The photos stay on Fotostash.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" :disabled="deleting" @click="deleteOpen = false">
              Cancel
            </Button>
            <Button variant="destructive" :disabled="deleting" @click="deleteCollection">
              <Loader2 v-if="deleting" class="animate-spin" />
              Delete collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </template>
  </div>
</template>
