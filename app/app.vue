<script setup lang="ts">
import { Toaster } from "vue-sonner";
import "vue-sonner/style.css";
</script>

<template>
  <div class="flex min-h-dvh w-full flex-col px-1">
    <NavbarComp />
    <NuxtLoadingIndicator />
    <NuxtRouteAnnouncer />
    <main class="flex-1">
      <NuxtPage />
    </main>
    <SiteFooter />
    <Toaster />
  </div>
</template>
