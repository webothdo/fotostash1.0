<template>
  <footer class="mt-16 border-t border-border/60">
    <div
      class="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 text-sm md:flex-row md:items-center md:justify-between"
    >
      <div class="space-y-1">
        <NuxtLink to="/" class="text-2xl font-bold leading-none">fs.</NuxtLink>
        <p class="text-muted-foreground">Image sharing without the limits.</p>
      </div>

      <nav
        class="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground"
        aria-label="Footer"
      >
        <NuxtLink to="/" class="transition-colors hover:text-foreground">
          Browse
        </NuxtLink>
        <NuxtLink to="/upload" class="transition-colors hover:text-foreground">
          Upload
        </NuxtLink>
        <NuxtLink to="/profile" class="transition-colors hover:text-foreground">
          Profile
        </NuxtLink>
      </nav>

      <p class="text-xs text-muted-foreground">© {{ year }} Fotostash</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear();
</script>
