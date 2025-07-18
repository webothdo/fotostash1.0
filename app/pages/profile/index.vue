<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const { user } = useAuth();

const { data } = await useFetch("/api/user", {
  lazy: true,
});
</script>

<template>
  <div>
    <main class="w-full flex flex-col items-center gap-2 mt-10">
      <Avatar class="h-[150px] w-[150px]">
        <AvatarImage :src="user?.picture || ''" alt="@radix-vue" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>

      <h2 v-if="user" class="font-[Arimo]">{{ data }}</h2>
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
    <section id="user-images">
      <!-- <div v-if="curr" v-for="photo in curr">
                <div>
                    <NuxtImg height="max" width="200" :src="photo.url" />
                    <p>{{ photo.title }}</p>
                </div>
            </div> -->
    </section>
  </div>
</template>
