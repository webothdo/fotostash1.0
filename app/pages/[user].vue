<script setup>


definePageMeta({
    path: '/:user([@][\\w+\\-+]+)'
    // path: '/:user([@]\\w+)',
})


const nuxtApp = useNuxtApp()
const { account, id } = nuxtApp.$appwrite
const profile = ref(null)

const username = useRoute().params.user
console.log(username.trim())


const { data } = await useFetch(`/api/profile/${username}`)

const { data: photos } = await useFetch("/api/profile/photos", {
    method: "GET",
    query: {
        profileId: data?.value?.id
    }
})

console.log(photos?.value)

console.log(data?.value)

if (!data?.value) {
    console.log("Not found")
}


</script>

<template>
    <div>
        <main class="w-full flex flex-col items-center gap-2 mt-10">
            <Avatar class="h-[150px] w-[150px]">
                <AvatarImage
                    src="https://images.pexels.com/photos/7244112/pexels-photo-7244112.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                    alt="@radix-vue" />
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <h2 v-if="data" class="font-[Arimo]">{{ data?.username }}</h2>

        </main>
        <section id="user-images">
            <p v-if="!photos">This user does not have any photos</p>
            <div v-else v-for="photo in photos">
                <NuxtImg height="max" width="200" :src="photo.url" />
                <p>{{ photo.title }}</p>
            </div>
        </section>
    </div>
</template>