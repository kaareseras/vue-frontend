<script setup>
import Navbar from '@/components/Navbar.vue';
import Footer from '@/components/Footer.vue';
import { RouterView } from 'vue-router';
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import ChatBot from '@/components/ChatBot.vue';

const auth = useAuthStore()

onMounted(async () => {
  await auth.restoreToken()
});



</script>

<template>
  <Navbar />
  <RouterView />
  <Footer />
  <ChatBot />
</template>