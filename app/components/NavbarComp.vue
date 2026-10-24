<script setup lang="ts">
const { user } = useAuth();
</script>

<template>
  <nav
    class="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4"
  >
    <NuxtLink to="/" class="shrink-0 text-3xl font-bold leading-none">
      fs.
    </NuxtLink>
    <div v-if="user?.id" class="flex items-center gap-3">
      <Button as-child>
        <NuxtLink to="/upload">Upload</NuxtLink>
      </Button>
      <NuxtLink to="/profile" aria-label="Your profile">
        <Avatar>
          <AvatarImage
            v-if="user?.picture"
            :src="user?.picture"
            alt="user avatar"
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </NuxtLink>
    </div>
    <div v-else class="flex items-center gap-3">
      <Button as-child>
        <NuxtLink to="/api/login" external>Login</NuxtLink>
      </Button>
      <Button as-child variant="outline">
        <NuxtLink to="/api/register" external>Sign up</NuxtLink>
      </Button>
    </div>
  </nav>
</template>
