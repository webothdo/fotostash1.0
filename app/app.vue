<script setup lang="ts">
import { Toaster } from "vue-sonner";
import "vue-sonner/style.css";
</script>

<template>
  <div class="w-dvw h-dvh px-1">
    <NavbarComp />
    <NuxtLoadingIndicator />
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <Toaster />
  </div>
</template>
