<script setup>
import Navbar from '@/components/Navbar.vue';
import Fotter from '@/components/Fotter.vue';
import { RouterView } from 'vue-router';
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

onMounted(async () => {
  await auth.restoreToken()
});



</script>

<template>
  <Navbar />
  <RouterView />
  <Fotter />
</template>