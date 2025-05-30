<script setup>
import { onMounted, ref } from 'vue';

const imageLoaded = ref(false);

onMounted(() => {
  setTimeout(() => {
    imageLoaded.value = true;
  }, 100);
});
</script>

<template>
  <div class="bg-green-50 flex items-center justify-center px-2 py-4">
    <div
      class="bg-white shadow-xl rounded-2xl overflow-hidden max-w-6xl w-11/12 flex flex-col md:flex-row transition-all duration-700 ease-in-out"
      :class="{ 'opacity-100 translate-y-0': imageLoaded, 'opacity-0 translate-y-6': !imageLoaded }"
    >
      <!-- Image -->
      <div class="md:w-1/2">
        <img
          src="@/assets/img/Device_sale_picture.png"
          alt="Device Sale"
          class="w-full h-full object-cover"
        />
      </div>

      <!-- Content -->
      <div class="md:w-1/2 p-6 md:p-8 flex flex-col justify-center bg-gradient-to-br from-green-100 to-green-200">
        <h1 class="text-2xl md:text-3xl font-bold text-green-800 mb-3">Velkommen!</h1>
        <p class="text-gray-700 mb-4 text-sm md:text-base leading-relaxed">
          Udforsk vores platform og administrer dine enheder, brugere og job med lethed. Brug navigationen til at komme i gang.
        </p>
        <router-link
          to="/login"
          class="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow-md text-sm md:text-base transition duration-300 w-max"
        >
          Login
        </router-link>
      </div>
    </div>
  </div>
</template>
