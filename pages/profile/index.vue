<script setup>


definePageMeta({
    middleware: 'auth'
})


const nuxtApp = useNuxtApp()
const { account, id } = nuxtApp.$appwrite
// console.log(useAppwriteUser().then(res => console.log(res.value)))
const profile = ref(null)
const curr = useUserStore()


watchEffect(async () => {
    const usser = await account.get()

    const { data, error, pending } = await useFetch("/api/getLoggedInUserPhotos", {
        method: "GET",
        query: {
            userId: usser.$id
        }
    })

    profile.value = data?.value
    console.log("usser", usser)
    console.log("data", profile?.value)
})



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
            <h2 v-if="profile" class="font-[Arimo]">{{ profile }}</h2>
            <!-- <p>{{ data }}</p> -->
            <div class="space-x-2 font-[Poppins] font-bold">
                <ClientOnly>
                    <Button as-child variant="outline">
                        <NuxtLink to="/profile/settings">Edit Profile</NuxtLink>
                    </Button>
                    <Button as-child>
                        <NuxtLink to="/upload">Upload</NuxtLink>
                    </Button>
                </ClientOnly>
            </div>
        </main>
        <section id="user-images">
            <div v-if="profile" v-for="photo in profile">
                <div>
                    <NuxtImg height="max" width="200" :src="photo.url" />
                    <p>{{ photo.title }}</p>
                </div>
            </div>
        </section>
    </div>
</template>