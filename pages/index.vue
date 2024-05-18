<script setup>
import useAppwriteUser from '~/composables/useAppwriteUser';
const curr = useUserStore()
onMounted(() => {
})

const { data } = await useFetch("/api/approvePhoto", {
    method: "get",
    query: {
        type: "needsApproval"
    }
})
</script>

<template>
    <div>
        <HeaderComp />
        <button>fetch photos</button>
        <div v-if="data">{{ data }}</div>
    </div>
</template>