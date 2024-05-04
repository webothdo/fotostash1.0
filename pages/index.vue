<script setup>
import useAppwriteUser from '~/composables/useAppwriteUser';
const curr = useUserStore()
onBeforeMount(() => {
    useAppwriteUser()
})
</script>

<template>
    <div>
        <h1>The home page</h1>
        <p>{{ curr.currentUser }}</p>
        <ClientOnly>
            <Button as-child>
                <NuxtLink to="/@radixvue">user</NuxtLink>
            </Button>
        </ClientOnly>
    </div>
</template>