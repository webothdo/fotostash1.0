<script setup lang="ts">
const { user } = useAuth();
</script>

<template>
  <nav class="flex justify-between align-middle px-4 pt-4">
    <NuxtLink to="/" class="text-3xl font-bold">fs.</NuxtLink>
    <div v-if="user?.id" class="flex align-middle gap-3">
      <Button as-child>
        <NuxtLink to="/upload">Upload</NuxtLink>
      </Button>
      <NuxtLink to="/profile">
        <Avatar>
          <AvatarImage
            v-if="user?.image"
            :src="user?.image"
            alt="user avatar"
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </NuxtLink>
    </div>
    <div v-else>
      <div class="flex align-middle gap-3">
        <Button as-child>
          <NuxtLink to="/login">Login</NuxtLink>
        </Button>
        <Button as-child variant="outline">
          <NuxtLink to="/signup">Sign up</NuxtLink>
        </Button>
      </div>
    </div>
  </nav>
</template>
