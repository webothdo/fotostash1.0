<script setup lang="ts">
import { ref, watch } from "vue";
import { Check, FolderPlus, Loader2, Lock, Globe } from "lucide-vue-next";
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

const props = defineProps<{ photoId: string }>();
const open = defineModel<boolean>("open", { default: false });

interface CollectionSummary {
  id: string;
  name: string;
  isPrivate: boolean;
  contains: boolean;
}

const collections = ref<CollectionSummary[]>([]);
const loading = ref(false);
const loadError = ref<string | null>(null);
const pending = ref<Record<string, boolean>>({});
const newName = ref("");
const creating = ref(false);

async function load() {
  loading.value = true;
  loadError.value = null;

  try {
    collections.value = await $fetch<CollectionSummary[]>(
      "/api/me/collections",
      { query: { photoId: props.photoId } }
    );
  } catch (error) {
    loadError.value =
      (error as Error).message || "Could not load your collections.";
  } finally {
    loading.value = false;
  }
}

watch(open, (isOpen) => {
  if (isOpen) {
    newName.value = "";
    load();
  }
});

async function toggle(collection: CollectionSummary) {
  if (pending.value[collection.id]) return;
  pending.value[collection.id] = true;

  try {
    if (collection.contains) {
      await $fetch(
        `/api/collections/${collection.id}/photos/${props.photoId}`,
        { method: "DELETE" }
      );
      collection.contains = false;
      toast.success(`Removed from ${collection.name}`);
    } else {
      await $fetch(`/api/collections/${collection.id}/photos`, {
        method: "POST",
        body: { photoId: props.photoId },
      });
      collection.contains = true;
      toast.success(`Saved to ${collection.name}`);
    }
  } catch (error) {
    toast.error("Could not update collection", {
      description: (error as Error).message,
    });
  } finally {
    pending.value[collection.id] = false;
  }
}

async function createAndSave() {
  const name = newName.value.trim();
  if (!name || creating.value) return;

  creating.value = true;

  try {
    const collection = await $fetch<{ id: string; name: string }>(
      "/api/collections",
      { method: "POST", body: { name } }
    );

    await $fetch(`/api/collections/${collection.id}/photos`, {
      method: "POST",
      body: { photoId: props.photoId },
    });

    collections.value.unshift({
      id: collection.id,
      name: collection.name,
      isPrivate: true,
      contains: true,
    });
    newName.value = "";
    toast.success(`Saved to ${collection.name}`, {
      description: "New collections are private by default.",
    });
  } catch (error) {
    toast.error("Could not create collection", {
      description: (error as Error).message,
    });
  } finally {
    creating.value = false;
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Save to collection</DialogTitle>
        <DialogDescription>
          Group this photo with others you want to keep. You can change who can
          see a collection at any time.
        </DialogDescription>
      </DialogHeader>

      <div v-if="loading" class="flex items-center justify-center py-10">
        <Loader2 class="size-5 animate-spin text-muted-foreground" />
      </div>

      <div
        v-else
        class="max-h-64 space-y-1.5 overflow-y-auto pr-1"
        role="group"
        aria-label="Your collections"
      >
        <button
          v-for="collection in collections"
          :key="collection.id"
          type="button"
          class="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 disabled:cursor-wait disabled:opacity-60"
          :disabled="pending[collection.id]"
          :aria-pressed="collection.contains"
          @click="toggle(collection)"
        >
          <span
            class="flex size-5 shrink-0 items-center justify-center rounded border transition-colors"
            :class="
              collection.contains
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input bg-background'
            "
          >
            <Check v-if="collection.contains" class="size-3.5" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm font-medium">{{
              collection.name
            }}</span>
            <span
              class="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground"
            >
              <Lock v-if="collection.isPrivate" class="size-3" />
              <Globe v-else class="size-3" />
              {{ collection.isPrivate ? "Private" : "Public" }}
            </span>
          </span>
          <Loader2
            v-if="pending[collection.id]"
            class="size-4 animate-spin text-muted-foreground"
          />
        </button>

        <div
          v-if="!collections.length"
          class="rounded-lg border border-dashed bg-muted/20 px-4 py-6 text-center"
        >
          <FolderPlus class="mx-auto size-5 text-muted-foreground" />
          <p class="mt-2 text-sm font-medium">No collections yet</p>
          <p class="mt-0.5 text-xs text-muted-foreground">
            Create one below to start saving photos.
          </p>
        </div>
      </div>

      <p v-if="loadError" class="text-xs text-destructive">{{ loadError }}</p>

      <form
        class="flex items-center gap-2 border-t pt-4"
        @submit.prevent="createAndSave"
      >
        <Input
          v-model="newName"
          placeholder="New collection name"
          maxlength="80"
          aria-label="New collection name"
          :disabled="creating"
        />
        <Button type="submit" :disabled="!newName.trim() || creating">
          <Loader2 v-if="creating" class="animate-spin" />
          <FolderPlus v-else class="size-4" />
          Create
        </Button>
      </form>

      <DialogFooter>
        <Button variant="outline" @click="open = false">Done</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
