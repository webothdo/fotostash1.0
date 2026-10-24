<script setup lang="ts">
import { ref } from "vue";
import { Menu, Search } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const { user } = useAuth();
const mobileOpen = ref(false);
const searchTerm = ref("");
const router = useRouter();

const closeMobile = () => {
  mobileOpen.value = false;
};

const submitSearch = () => {
  const term = searchTerm.value.trim();
  closeMobile();
  return router.push({
    path: "/search",
    query: term ? { q: term } : undefined,
  });
};
</script>

<template>
  <nav
    class="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4"
  >
    <NuxtLink to="/" class="shrink-0 text-3xl font-bold leading-none">
      fs.
    </NuxtLink>

    <form
      class="hidden max-w-md flex-1 items-center md:flex"
      role="search"
      @submit.prevent="submitSearch"
    >
      <div class="relative w-full">
        <Search
          class="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          v-model="searchTerm"
          type="search"
          placeholder="Search photos"
          aria-label="Search photos"
          class="h-9 rounded-full border-transparent bg-muted/60 pl-8 shadow-none focus-visible:bg-background"
        />
      </div>
    </form>

    <div class="hidden items-center gap-3 md:flex">
      <template v-if="user?.id">
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
      </template>
      <template v-else>
        <Button as-child>
          <NuxtLink to="/api/login" external>Login</NuxtLink>
        </Button>
        <Button as-child variant="outline">
          <NuxtLink to="/api/register" external>Sign up</NuxtLink>
        </Button>
      </template>
    </div>

    <Sheet v-model:open="mobileOpen">
      <SheetTrigger as-child>
        <Button
          variant="ghost"
          size="icon"
          class="md:hidden"
          aria-label="Open menu"
        >
          <Menu class="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" class="w-72">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <form class="mt-5" role="search" @submit.prevent="submitSearch">
          <div class="relative">
            <Search
              class="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              v-model="searchTerm"
              type="search"
              placeholder="Search photos"
              aria-label="Search photos"
              class="h-9 pl-8"
            />
          </div>
        </form>

        <nav class="mt-4 flex flex-col gap-1 text-sm">
          <NuxtLink
            to="/search"
            class="rounded-md px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground"
            @click="closeMobile"
          >
            Search &amp; filters
          </NuxtLink>
          <NuxtLink
            to="/"
            class="rounded-md px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground"
            @click="closeMobile"
          >
            Browse
          </NuxtLink>

          <template v-if="user?.id">
            <NuxtLink
              to="/upload"
              class="rounded-md px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground"
              @click="closeMobile"
            >
              Upload
            </NuxtLink>
            <NuxtLink
              to="/profile"
              class="rounded-md px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground"
              @click="closeMobile"
            >
              Profile
            </NuxtLink>
            <NuxtLink
              to="/api/logout"
              external
              class="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              @click="closeMobile"
            >
              Log out
            </NuxtLink>
          </template>

          <template v-else>
            <NuxtLink
              to="/api/login"
              external
              class="rounded-md px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground"
              @click="closeMobile"
            >
              Log in
            </NuxtLink>
            <NuxtLink
              to="/api/register"
              external
              class="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              @click="closeMobile"
            >
              Sign up
            </NuxtLink>
          </template>
        </nav>
      </SheetContent>
    </Sheet>
  </nav>
</template>
