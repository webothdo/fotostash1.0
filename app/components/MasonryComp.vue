<script setup lang="ts">
import { onMounted, ref } from "vue";
import { gsap } from "gsap";

interface Item {
  slug?: string | null;
  id: string;
  img?: string;
  url: string;
  title?: string | null;
  height: number;
  width?: number | null;
}

interface MasonryProps {
  items: Item[];
  ease?: string;
  duration?: number;
  stagger?: number;
  animateFrom?: "bottom" | "top" | "left" | "right" | "center" | "random";
  scaleOnHover?: boolean;
  hoverScale?: number;
  blurToFocus?: boolean;
  colorShiftOnHover?: boolean;
}

const props = withDefaults(defineProps<MasonryProps>(), {
  ease: "power3.out",
  duration: 0.6,
  stagger: 0.05,
  animateFrom: "bottom",
  scaleOnHover: true,
  hoverScale: 0.95,
  blurToFocus: true,
  colorShiftOnHover: false,
});

const root = ref<HTMLElement | null>(null);
const loadedImages = ref<Record<string, boolean>>({});

const imageUrl = (item: Item) => item.img ?? item.url;
const imageAlt = (item: Item) => item.title ?? "Photo";

const hasDimensions = (item: Item): item is Item & { width: number } =>
  typeof item.width === "number" && item.width > 0 && item.height > 0;

const aspectRatio = (item: Item) =>
  hasDimensions(item) ? `${item.width} / ${item.height}` : "3 / 2";

const markLoaded = (id: string) => {
  loadedImages.value[id] = true;
};

const openUrl = (item: Item) => {
  navigateTo(`/photo/${item.slug ?? item.id}`);
};

const handleMouseEnter = (event: MouseEvent) => {
  if (!props.scaleOnHover) return;
  gsap.to(event.currentTarget as HTMLElement, {
    scale: props.hoverScale,
    duration: 0.3,
    ease: "power2.out",
  });
};

const handleMouseLeave = (event: MouseEvent) => {
  if (!props.scaleOnHover) return;
  gsap.to(event.currentTarget as HTMLElement, {
    scale: 1,
    duration: 0.3,
    ease: "power2.out",
  });
};

onMounted(() => {
  if (!root.value) return;

  // Images may finish loading before hydration, so their load event can be missed.
  root.value
    .querySelectorAll<HTMLImageElement>("img[data-photo-id]")
    .forEach((image) => {
      if (image.complete && image.dataset.photoId) {
        markLoaded(image.dataset.photoId);
      }
    });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const nodes = root.value.querySelectorAll<HTMLElement>("[data-masonry-item]");
  if (!nodes.length) return;

  const from: gsap.TweenVars = { opacity: 0 };

  switch (props.animateFrom) {
    case "top":
      from.y = -32;
      break;
    case "left":
      from.x = -32;
      break;
    case "right":
      from.x = 32;
      break;
    case "center":
      from.scale = 0.96;
      break;
    case "bottom":
    case "random":
    default:
      from.y = 32;
      break;
  }

  if (props.blurToFocus) from.filter = "blur(8px)";

  gsap.from(nodes, {
    ...from,
    duration: props.duration,
    stagger: props.stagger,
    ease: props.ease,
    clearProps: "opacity,transform,filter",
  });
});
</script>

<template>
  <div
    ref="root"
    class="columns-1 gap-4 min-[400px]:columns-2 min-[600px]:columns-3 min-[1000px]:columns-4 min-[1500px]:columns-5"
  >
    <div
      v-for="item in items"
      :key="item.id"
      data-masonry-item
      class="group relative mb-4 break-inside-avoid cursor-pointer overflow-hidden rounded-[10px] shadow-[0px_10px_50px_-10px_rgba(0,0,0,0.2)]"
      @click="openUrl(item)"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <div
        class="relative w-full overflow-hidden rounded-[10px] bg-muted"
        :style="{ aspectRatio: aspectRatio(item) }"
      >
        <div
          v-if="!loadedImages[item.id]"
          class="shimmer absolute inset-0 bg-muted"
          aria-hidden="true"
        />
        <img
          :data-photo-id="item.id"
          :src="imageUrl(item)"
          :alt="imageAlt(item)"
          :width="item.width ?? undefined"
          :height="item.height ?? undefined"
          loading="lazy"
          class="h-full w-full transition-opacity duration-500"
          :class="[
            loadedImages[item.id] ? 'opacity-100' : 'opacity-0',
            hasDimensions(item) ? 'object-cover' : 'object-contain',
          ]"
          @load="markLoaded(item.id)"
          @error="markLoaded(item.id)"
        />
        <div
          v-if="colorShiftOnHover"
          class="color-overlay absolute inset-0 bg-gradient-to-tr from-pink-500/50 to-sky-500/50 opacity-0 transition-opacity duration-300 group-hover:opacity-30"
        />
      </div>
    </div>
  </div>
</template>
