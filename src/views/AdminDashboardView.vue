<script setup>
import AdminTasks from '@/components/AdminTasks.vue';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore()
</script>

<template>
    <AdminTasks v-if="auth.isAdmin" />
    <div v-else class="text-center text-gray-700">
        <h1 class="text-2xl font-bold">Admin Dashboard</h1>
        <p class="mt-4">You do not have permission to access this page.</p>
    </div>
</template>
