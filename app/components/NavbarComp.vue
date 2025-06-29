<script setup>
const props = defineProps({
    user: {
        type: Object || null,
    }
})

</script>

<template>
    <nav class="flex justify-between align-middle px-4 pt-4">
        <NuxtLink to="/" class="text-3xl font-bold">fs.</NuxtLink>
        <div v-if="props.user" class="flex align-middle gap-3">
            <ClientOnly>
            </ClientOnly>
            <Button as-child>
                <NuxtLink to="/upload">Upload</NuxtLink>
            </Button>
            <NuxtLink to="/profile">
                <Avatar>
                    <AvatarImage src="https://github.com/radix-vue.png" alt="@radix-vue" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            </NuxtLink>
        </div>
        <div v-else>
            <ClientOnly>
                <div class="flex align-middle gap-3">
                    <Button as-child>
                        <NuxtLink to="/login">Login</NuxtLink>
                    </Button>
                    <Button as-child variant="outline">
                        <NuxtLink to="/signup">Sign up</NuxtLink>
                    </Button>
                </div>
            </ClientOnly>
        </div>
    </nav>
</template>