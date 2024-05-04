<script setup>


definePageMeta({
    path: '/:user([@]\\w+)',
})


const nuxtApp = useNuxtApp()
const { account, id } = nuxtApp.$appwrite
const profile = ref(null)

const username = useRoute().params.user
console.log(username.trim())


const { data } = await useFetch(`/api/profile/${username}`)

console.log(data?.value)

if (!data?.value) {
    console.log("Not found")
} else {
    profile.value = data?.value
}




</script>

<template>
    <div>
        <nav class="flex justify-between items-center px-4 pt-5">
            <p class="text-3xl font-bold">fs.</p>
            <Avatar>
                <AvatarImage src="https://github.com/radix-vue.png" alt="@radix-vue" />
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>
        </nav>

        <main class="w-full flex flex-col items-center gap-2 mt-10">
            <Avatar class="h-[150px] w-[150px]">
                <AvatarImage
                    src="https://images.pexels.com/photos/7244112/pexels-photo-7244112.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                    alt="@radix-vue" />
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <h2 v-if="profile" class="font-[Arimo]">{{ profile.username }}</h2>
            <div class="space-x-2 font-[Poppins] font-bold">
                <ClientOnly>
                    <Button variant="outline">Edit Profile</Button>
                    <Button as-child>
                        <NuxtLink to="/upload">Upload</NuxtLink>
                    </Button>
                </ClientOnly>
            </div>
        </main>
    </div>
</template>