<script setup>
</script>

<template>
    <nav class="flex justify-between items-center px-4 pt-5">
        <NuxtLink to="/" class="text-3xl font-bold">fs.</NuxtLink>
        <div class="flex align-middle gap-3">
            <ClientOnly>
                <Button as-child>
                    <NuxtLink to="/upload">Upload</NuxtLink>
                </Button>
            </ClientOnly>
            <Avatar>
                <AvatarImage src="https://github.com/radix-vue.png" alt="@radix-vue" />
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>
        </div>
    </nav>
</template>