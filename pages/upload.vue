<script setup>
import { fileToBase64 } from "file64"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"


definePageMeta({
    middleware: 'auth',
})

const show = ref(false)
const isLoading = ref(false)
const picture = ref('/')
const name = ref('')

const upload = async () => {
    isLoading.value = true
    let image = document.querySelector('#picture')?.files[0]
    const baseImage = await fileToBase64(image)
    const userId = useUserStore().user?.$id

    const data = await $fetch('/api/upload', {
        method: 'POST',
        body: {
            name: name.value,
            image: baseImage,
            userId: userId
        }
    })
    show.value = false
    name.value = ''
    isLoading.value = false
    console.log(data)
}

const inputChange = (e) => {
    if (e?.target?.files?.length > 0) {
        picture.value = URL.createObjectURL(e.target.files[0])
        // document.querySelector('#preview').srcset = URL.createObjectURL(
        //     e.target.files[0]
        // )
        show.value = true
    }
}

</script>

<template>
    <div>
        <main v-show="!show"
            class="w-[320px] h-[320px] border flex flex-col items-center justify-center gap-3 mx-auto rounded">
            <h2 class="font-bold text-2xl">Upload your picture</h2>
            <Input @change="inputChange" id="picture" type="file" class="w-1/2" />
        </main>
        <Card v-show="show" class="md:max-w-[600px] mx-auto">
            <CardHeader>
                <CardTitle>Upload your image</CardTitle>
            </CardHeader>
            <CardContent class="flex gap-3">
                <NuxtImg id="preview" :src="picture" class="w-[50%]" />
                <div class="w-[50%]">
                    <div class="space-y-2">
                        <Label for="name">Enter a descriptive name</Label>
                        <Input v-model="name" id="name" type="text" />
                    </div>
                    <div class="space-y-2 mt-3">
                        <Label for="name">Add a few tags<span class="text-slate-400 text-sm"> seperated with
                                comma</span></Label>
                        <Input id="name" type="text" />
                    </div>
                </div>
            </CardContent>
            <CardFooter class="flex justify-end">
                <ClientOnly>
                    <Button @click="upload" :disabled="isLoading">Upload</Button>
                </ClientOnly>
            </CardFooter>
        </Card>

    </div>
</template>