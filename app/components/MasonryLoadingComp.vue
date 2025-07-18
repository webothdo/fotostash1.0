<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
    <!-- First column items -->
    <div class="space-y-4">
      <Skeleton class="h-64 w-full rounded-lg" />
      <Skeleton class="h-48 w-full rounded-lg" />
      <Skeleton class="h-56 w-full rounded-lg" />
    </div>
    
    <!-- Second column items -->
    <div class="space-y-4">
      <Skeleton class="h-40 w-full rounded-lg" />
      <Skeleton class="h-64 w-full rounded-lg" />
      <Skeleton class="h-52 w-full rounded-lg" />
    </div>
    
    <!-- Third column items -->
    <div class="space-y-4">
      <Skeleton class="h-56 w-full rounded-lg" />
      <Skeleton class="h-48 w-full rounded-lg" />
      <Skeleton class="h-64 w-full rounded-lg" />
    </div>
    
    <!-- Fourth column items -->
    <div class="space-y-4">
      <Skeleton class="h-48 w-full rounded-lg" />
      <Skeleton class="h-64 w-full rounded-lg" />
      <Skeleton class="h-40 w-full rounded-lg" />
    </div>
  </div>
</template>
