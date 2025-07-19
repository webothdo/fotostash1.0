<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import Card from "@/components/ui/card/Card.vue";
import CardContent from "@/components/ui/card/CardContent.vue";
import Button from "@/components/ui/button/Button.vue";
import Avatar from "@/components/ui/avatar/Avatar.vue";

const slug = useRoute().params.slug;
const { data, status, error }: any = await useFetch(`/api/photo/${slug}`, {
  lazy: true,
});

const photo = computed(() => data.value);

const isLoading = ref(false);
async function downloadImage() {
  if (!photo.value?.url) return;
  try {
    isLoading.value = true;
    const response = await fetch(photo.value.url, { mode: "cors" });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = photo.value.title || "downloaded-image";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    isLoading.value = false;
  } catch (e) {
    // fallback for browsers or CORS errors
    window.open(photo.value.url, "_blank");
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center py-8 px-2 bg-background">
    <div
      v-if="status === 'pending'"
      class="text-lg text-muted-foreground py-20"
    >
      Loading...
    </div>
    <div v-else-if="error" class="text-destructive py-20">
      Failed to load image.
    </div>
    <Card
      v-else-if="photo"
      class="w-full min-h-[70vh] max-w-5xl flex flex-col md:flex-row p-0 overflow-hidden"
    >
      <!-- Image Section -->
      <div class="flex-1 flex items-center justify-center bg-muted p-4">
        <img
          :src="photo.url"
          :alt="photo.title || 'Photo'"
          class="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-md"
        />
      </div>
      <!-- Details Section -->
      <CardContent class="flex-1 flex flex-col justify-between gap-6 py-6">
        <div>
          <h1 class="text-2xl font-bold mb-2">
            {{ photo.title || "Untitled Photo" }}
          </h1>
          <p class="text-muted-foreground mb-4" v-if="photo.description">
            {{ photo.description }}
          </p>
          <NuxtLink
            :to="`/@${photo.user?.username}`"
            class="flex items-center gap-3 mb-4 w-fit"
          >
            <Avatar>
              <span class="sr-only">{{ photo.user?.username }}</span>
              <span class="sr-only">View profile</span>
              <AvatarImage
                v-if="photo.user?.picture"
                :src="photo.user.picture"
                alt="@radix-vue"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <div class="font-medium">
                {{
                  photo.user?.name || photo.user?.username || "Unknown Author"
                }}
              </div>
              <div class="text-xs text-muted-foreground">
                @{{ photo.user?.username }}
              </div>
            </div>
          </NuxtLink>
          <div
            v-if="photo.tags && photo.tags.length"
            class="flex flex-wrap gap-2 mb-4"
          >
            <span
              v-for="tag in photo.tags"
              :key="tag"
              class="inline-block rounded-full bg-muted px-3 py-1 text-xs text-foreground"
              >#{{ tag }}</span
            >
          </div>
        </div>
        <div class="flex flex-col gap-3 mt-8">
          <Button
            :disabled="isLoading"
            @click="downloadImage"
            class="w-full md:w-auto"
            >{{ isLoading ? "Downloading..." : "Download Free" }}</Button
          >
          <div class="text-xs text-muted-foreground mt-2">
            Free to use under Fotostash License
          </div>
          <div class="text-xs text-muted-foreground">
            Published on {{ useFormatDate(photo.createdAt) }}
          </div>
        </div>
      </CardContent>
    </Card>
    <div v-else class="text-lg text-muted-foreground py-20">
      No photo found.
    </div>
  </div>
</template>
