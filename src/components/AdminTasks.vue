<script setup>
import { reactive, defineProps, onMounted } from 'vue';

import AdminTask from '@/components/AdminTask.vue';


//https://primevue.org/icons/
const tasks = reactive([
  {
    title: 'User Management',
    description: 'Manage users and their roles',
    route: 'users',
    icon: 'pi-users'
  },
  {
    title: 'Device Management',
    description: 'Manage devices and their configurations',
    route: 'devices',
    icon: 'pi-tablet'
  },
]);

</script>


<template>

<section class="bg-blue-50 px-4 py-10">
        <div class="container-xl lg:container mx-auto">
            <h2 class="text-3xl font-bold text-green-500 text-center mb-6">
                Admin Dashboard
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AdminTask v-for="task in tasks" :key="task.title" :task="task" />
            </div>

        </div>
    </section>


</template>