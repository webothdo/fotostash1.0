<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const { user, signOut } = useAuth();

const { data } = await useAsyncData("user", () => $fetch("/api/user"));
console.log(data.value, user.value?.createdAt);
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
          <Button variant="secondary" @click="signOut({ redirectTo: '/login' })"
            >Logout</Button
          >
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
