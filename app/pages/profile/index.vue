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
  <div>
    <main class="w-full flex flex-col items-center gap-2 mt-10">
      <Avatar class="h-[150px] w-[150px]">
        <AvatarImage
          v-if="useUser().user.value?.picture"
          :src="useUser().user.value?.picture || ''"
          alt="@radix-vue"
        />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>

      <h2 v-if="status === 'success'" class="font-[Arimo]">
        {{ data?.username }}
      </h2>
      <h2 v-if="status === 'pending'">loading....</h2>
      <!-- <p>{{ data }}</p> -->
      <div class="space-x-2 font-[Poppins] font-bold">
        <ClientOnly>
          <Button as-child variant="outline">
            <NuxtLink to="/profile/settings">Edit Profile</NuxtLink>
          </Button>
          <Button as-child>
            <NuxtLink to="/upload">Upload</NuxtLink>
          </Button>
          <Button variant="secondary">
            <NuxtLink to="/api/logout" external>Logout</NuxtLink>
          </Button>
        </ClientOnly>
      </div>
    </main>
    <section id="user-images" class="w-full mt-10">
      <MasonryLoadingComp v-if="photosStatus === 'pending'" />
      <MasonryComp v-if="photosStatus === 'success'" :items="photos" />
      <p v-if="photosStatus === 'error'">{{ photosError }}</p>
    </section>
  </div>
</template>
