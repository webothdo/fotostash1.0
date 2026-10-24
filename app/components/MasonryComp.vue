<script setup lang="ts">
import { onMounted, ref } from "vue";
import { X } from "lucide-vue-next";
import { gsap } from "gsap";
import {
  IMAGE_SIZES,
  imageKitSrcSet,
  imageKitUrl,
} from "@/lib/imagekit";

interface Item {
  slug?: string | null;
  id: string;
  img?: string;
  url: string;
  title?: string | null;
  height: number;
  width?: number | null;
  approved?: boolean | null;
  rejected?: boolean | null;
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
  removable?: boolean;
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
  removable: false,
});

const emit = defineEmits<{ (event: "remove", item: Item): void }>();

const root = ref<HTMLElement | null>(null);
const loadedImages = ref<Record<string, boolean>>({});

const imageUrl = (item: Item) => item.img ?? item.url;
const imageAlt = (item: Item) => item.title ?? "Photo";
const photoUrl = (item: Item) => `/photo/${item.slug ?? item.id}`;

const hasDimensions = (item: Item): item is Item & { width: number } =>
  typeof item.width === "number" && item.width > 0 && item.height > 0;

const aspectRatio = (item: Item) =>
  hasDimensions(item) ? `${item.width} / ${item.height}` : "3 / 2";

const statusLabel = (item: Item) =>
  item.rejected ? "Rejected" : "Pending review";

const markLoaded = (id: string) => {
  loadedImages.value[id] = true;
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
      class="group relative mb-4 break-inside-avoid"
    >
      <NuxtLink
        :to="photoUrl(item)"
        :aria-label="item.title ? `View ${item.title}` : 'View photo'"
        data-masonry-item
        class="relative block cursor-pointer overflow-hidden rounded-[10px] shadow-[0px_10px_50px_-10px_rgba(0,0,0,0.2)]"
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
          :src="imageKitUrl(imageUrl(item), 960)"
          :srcset="imageKitSrcSet(imageUrl(item))"
          :sizes="IMAGE_SIZES"
          :alt="imageAlt(item)"
          :width="item.width ?? undefined"
          :height="item.height ?? undefined"
          loading="lazy"
          decoding="async"
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
          <span
            v-if="item.approved === false"
            class="absolute left-2 top-2 rounded-full px-2.5 py-1 text-[11px] font-medium text-white shadow-sm"
            :class="item.rejected ? 'bg-destructive' : 'bg-amber-500'"
          >
            {{ statusLabel(item) }}
          </span>
        </div>
      </NuxtLink>

      <button
        v-if="removable"
        type="button"
        class="absolute right-2 top-2 z-10 flex size-8 items-center justify-center rounded-full bg-black/60 text-white opacity-100 shadow-sm backdrop-blur transition-opacity hover:bg-black/80 focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
        :aria-label="`Remove ${item.title || 'photo'} from this collection`"
        @click="emit('remove', item)"
      >
        <X class="size-4" />
      </button>
    </div>
  </div>
</template>
