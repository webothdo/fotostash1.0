<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const { user } = useAuth();

const { data, status, error }: any = await useFetch("/api/user", {
  lazy: true,
});

const {
  data: photos,
  status: photosStatus,
  error: photosError,
}: any = await useFetch("/api/user/photos", {
  lazy: true,
});
</script>

<template>
  <div class="flex flex-col items-center min-h-screen bg-background">
    <!-- Hero/Banner -->
    <div class="w-full max-w-2xl h-32 md:h-40 rounded-b-3xl bg-gradient-to-tr from-primary/60 to-secondary/40 flex items-end justify-center relative shadow-md">
      <div class="absolute bottom-0 left-1/2 -translate-x-1/2 z-20">
        <Avatar class="h-[140px] w-[140px] shadow-xl ring-4 ring-background -mb-16">
          <AvatarImage
            v-if="useUser().user.value?.picture"
            :src="useUser().user.value?.picture || ''"
            :alt="data?.name || data?.username"
          />
          <AvatarFallback class="text-4xl">{{ data?.name ? data.name[0] : "U" }}</AvatarFallback>
        </Avatar>
      </div>
    </div>
    <!-- Profile Card -->
    <Card class="w-full max-w-2xl mt-24 mb-8 flex flex-col md:flex-row items-center md:items-start p-8 gap-8 relative z-10">
      <!-- Profile Info -->
      <div class="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
        <h2 class="text-3xl font-bold mb-1">{{ data?.name || data?.username }}</h2>
        <div class="text-muted-foreground mb-1 text-lg">@{{ data?.username }}</div>
        <div v-if="data?.bio" class="text-foreground/80 mb-3 max-w-md">{{ data.bio }}</div>
        <div class="flex gap-8 mt-2 mb-4" v-if="photos">
          <div class="flex flex-col items-center md:items-start">
            <span class="font-semibold text-2xl">{{ photos.length }}</span>
            <span class="text-xs text-muted-foreground">Photos</span>
          </div>
        </div>
      </div>
      <!-- Profile Actions -->
      <div class="flex flex-col gap-3 w-full md:w-auto md:items-end items-center justify-center mt-4 md:mt-0">
        <ClientOnly>
          <Button as-child variant="outline" class="w-full md:w-auto">
            <NuxtLink to="/profile/settings">Edit Profile</NuxtLink>
          </Button>
          <Button as-child class="w-full md:w-auto">
            <NuxtLink to="/upload">Upload</NuxtLink>
          </Button>
          <Button variant="secondary" class="w-full md:w-auto">
            <NuxtLink to="/api/logout" external>Logout</NuxtLink>
          </Button>
        </ClientOnly>
      </div>
    </Card>
    <section id="user-images" class="w-full max-w-5xl">
      <h3 class="text-xl font-semibold mb-6 px-2">Your Photos</h3>
      <MasonryLoadingComp v-if="photosStatus === 'pending'" />
      <MasonryComp v-if="photosStatus === 'success'" :items="photos" />
      <div v-if="photosStatus === 'success' && (!photos || photos.length === 0)" class="text-center text-muted-foreground py-12">You haven't uploaded any photos yet. Start sharing your moments!</div>
      <p v-if="photosStatus === 'error'" class="text-center text-destructive py-12">{{ photosError }}</p>
    </section>
  </div>
</template>
