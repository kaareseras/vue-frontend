<script setup>
import jobData from '@/jobs.json';
import JobListing from './JobListing.vue';
import { reactive, defineProps, onMounted } from 'vue';
import axios from 'axios';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';

// Define props for the component
defineProps({
    limit: Number,
    showButton: {
        type: Boolean,
        default: false
    }
});

const state = reactive({
    jobs: [],
    isLoading : true
});

onMounted(async () => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/jobs`);
        state.jobs = response.data;
    } catch (error) {
        console.error('Error fetching job data:', error);
    } finally {
        state.isLoading = false;
    }
});
</script>


<template>

    <section class="bg-blue-50 px-4 py-10">
        <div class="container-xl lg:container mx-auto">
            <h2 class="text-3xl font-bold text-green-500 text-center mb-6">
                Browse Jobs
            </h2>
            <div v-if ="state.isLoading" class="text-center text-gray-500 py-6">
                <PulseLoader />
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <JobListing v-for="job in state.jobs.slice(0, limit || state.jobs.length)" :key="job.id" :job="job"/>                    
            </div>

        </div>
    </section>
    <section v-if="showButton" class="m-auto max-w-lg my-10 px-6">
      <a
        href="/jobs"
        class="block bg-black text-white text-center py-4 px-6 rounded-xl hover:bg-gray-700"
        >View All Jobs</a
      >
    </section>

</template>