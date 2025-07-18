<script setup>
onMounted(() => {});

const items = ref([
  {
    id: "1",
    img: "https://picsum.photos/300/400?random=1",
    url: "https://picsum.photos",
    height: 400,
  },
  {
    id: "2",
    img: "https://picsum.photos/300/600?random=2",
    url: "https://picsum.photos",
    height: 600,
  },
  {
    id: "3",
    img: "https://picsum.photos/300/350?random=3",
    url: "https://picsum.photos",
    height: 350,
  },
  // ... more items
]);
</script>

<template>
  <div>
    <HeaderComp />
    <MasonryComp
      :items="items"
      :duration="0.6"
      :stagger="0.05"
      animate-from="bottom"
      :scale-on-hover="true"
      :hover-scale="0.95"
      :blur-to-focus="true"
      :color-shift-on-hover="false"
    />
  </div>
</template>
