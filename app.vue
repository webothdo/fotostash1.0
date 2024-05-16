<script setup>
const user = useUserStore()


watchEffect(async () => {
  await user.init()
  await user.initProfile()

})

</script>

<template>
  <div class="w-dvw h-dvh px-1">
    <NavbarComp :user="user?.user" />
    <NuxtPage />
  </div>
</template>
