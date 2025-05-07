<script setup>
import { defineProps } from 'vue';
import { RouterLink } from 'vue-router';
// Replace this with a dynamic solution if you want different icons per task

const props = defineProps({
  task: Object
});
</script>

<template>
  <div class="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center space-y-4">
    <!-- Icon -->
    <div class="text-green-500">
      <!-- Large Icon using PrimeIcons -->
    <span :class="['pi', props.task.icon, 'text-green-500', 'text-6xl']"></span>
    </div>

    <!-- Title -->
    <h3 class="text-2xl font-bold text-gray-800">
      {{ props.task.title }}
    </h3>

    <!-- Description -->
    <p class="text-gray-600">
      {{ props.task.description }}
    </p>

    <!-- Divider -->
    <div class="w-full border-t border-gray-200"></div>

    <!-- Action Button -->
    <RouterLink
      :to="'/admin/' + props.task.route"
      class="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg text-sm"
    >
      Go to Task
    </RouterLink>
  </div>
</template>
