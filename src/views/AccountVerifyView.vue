<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const status = ref('loading') // 'loading', 'success', 'error'
const message = ref('')

onMounted(async () => {
  const token = route.query.token
  const email = route.query.email

  if (!token || !email) {
    status.value = 'error'
    message.value = 'Ugyldigt link eller manglende data.'
    return
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/users/verify`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token, email })
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.detail || 'Bekræftelse mislykkedes')
    }

    status.value = 'success'
    message.value = 'Din konto er nu bekræftet! Du kan nu logge ind.'
  } catch (err) {
    status.value = 'error'
    message.value = err.message
  }
})
</script>

<template>
    <section class="bg-green-50 min-h-screen flex items-center justify-center">
      <div class="bg-white p-8 rounded-md shadow-md text-center max-w-md">
        <h2 class="text-2xl font-semibold mb-4">Konto Verifikation</h2>
  
        <div v-if="status === 'loading'" class="text-gray-600">Bekræfter din konto...</div>
        <div v-else-if="status === 'success'" class="text-green-600 font-bold">{{ message }}</div>
        <div v-else class="text-red-600 font-bold">{{ message }}</div>
  
        <RouterLink to="/login" class="mt-6 inline-block text-green-600 hover:underline" v-if="status !== 'loading'">
          Gå til login
        </RouterLink>
      </div>
    </section>
  </template>
  
