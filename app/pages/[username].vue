<script setup lang="ts">
definePageMeta({
  path: "/:username([@][\\w+\\-+]+)",
  // path: '/:user([@]\\w+)',
});

const username = useRoute().params.username;

const { data, status, error } = await useFetch(`/api/profile/${username}`);
</script>

<template>
  <div class="flex flex-col items-center min-h-screen bg-background">
    <Card class="w-full max-w-2xl mt-12 mb-8 flex flex-col items-center p-8">
      <Avatar class="h-[120px] w-[120px] mb-4">
        <AvatarImage
          v-if="data?.picture"
          :src="data?.picture"
          :alt="data?.name || username"
        />
        <AvatarFallback>{{ data?.name ? data.name[0] : "U" }}</AvatarFallback>
      </Avatar>
      <div class="flex flex-col items-center">
        <h2 class="text-2xl font-bold mb-1">
          {{ data?.name || username.replace(/^@/, "") }}
        </h2>
        <div class="text-muted-foreground mb-1">
          @{{ username?.replace(/^@/, "") }}
        </div>
        <div
          v-if="data?.bio"
          class="text-center text-foreground/80 mb-2 max-w-md"
        >
          {{ data.bio }}
        </div>
        <div class="flex gap-6 mt-2 mb-2" v-if="data?.photos">
          <div class="flex flex-col items-center">
            <span class="font-semibold text-lg">{{ data.photos.length }}</span>
            <span class="text-xs text-muted-foreground">Photos</span>
          </div>
        </div>
      </div>
    </Card>
    <section id="user-images" class="w-full max-w-5xl">
      <MasonryLoadingComp v-if="status === 'pending'" />
      <MasonryComp v-if="status === 'success'" :items="data.photos" />
      <div
        v-if="
          status === 'success' && (!data.photos || data.photos.length === 0)
        "
        class="text-center text-muted-foreground py-12"
      >
        No photos yet.
      </div>
    </section>
  </div>
</template>
