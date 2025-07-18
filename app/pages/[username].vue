<script setup lang="ts">
definePageMeta({
  path: "/:username([@][\\w+\\-+]+)",
  // path: '/:user([@]\\w+)',
});

const username = useRoute().params.username;

const { data, status, error } = await useFetch(`/api/profile/${username}`);
</script>

<template>
  <div>
    <main class="w-full flex flex-col items-center gap-2 mt-10">
      <Avatar class="h-[150px] w-[150px]">
        <AvatarImage
          src="https://images.pexels.com/photos/7244112/pexels-photo-7244112.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          alt="@radix-vue"
        />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <h2 v-if="data" class="font-[Arimo]">{{ username }}</h2>
    </main>
    <section id="user-images" class="w-full mt-10">
      <MasonryLoadingComp v-if="status === 'pending'" />
      <MasonryComp v-if="status === 'success'" :items="data.photos" />
    </section>
  </div>
</template>
