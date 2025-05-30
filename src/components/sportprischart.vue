<script setup>
import { reactive, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import Chart from 'primevue/chart';

import { useToast } from 'vue-toastification';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';

const toast = useToast();

const copenhagenNow = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Copenhagen" });
const dkTime = new Date(copenhagenNow);

const isAfter14DKTime = dkTime.getHours() >= 14;

const maxDate = new Date();
if (isAfter14DKTime) {
    maxDate.setDate(maxDate.getDate() + 1);
}
const maxDateStr = maxDate.toISOString().substring(0, 10);

const token = localStorage.getItem('token');
const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}`,
    headers: {
        Authorization: `Bearer ${token}`,
    },
});

const today = new Date().toISOString().substring(0, 10);

const state = reactive({
    spotprices: [],
    isLoading: true,
    selectedDate: new Date().toISOString().substring(0, 10),
});

const loadSpotprices = async () => {
    state.isLoading = true;
    try {
        const [dk1Response, dk2Response] = await Promise.all([
            axiosInstance.get('/spotprice/date/area', {
                params: { qdate: state.selectedDate, pricearea: 'DK1' },
            }),
            axiosInstance.get('/spotprice/date/area', {
                params: { qdate: state.selectedDate, pricearea: 'DK2' },
            }),
        ]);

        state.spotprices = [...dk1Response.data, ...dk2Response.data];
    } catch (error) {
        toast.error('Fejl ved hentning af spotpriser: ' + error.message);
    } finally {
        state.isLoading = false;
    }
};

watch(() => state.selectedDate, loadSpotprices, { immediate: true });

const chartData = computed(() => {
    const dk1 = state.spotprices.filter(p => p.PriceArea === 'DK1');
    const dk2 = state.spotprices.filter(p => p.PriceArea === 'DK2');

    return {
        labels: [...new Set([...dk1, ...dk2]
            .map(p => new Date(p.HourDK).toLocaleTimeString('da-DK', {
                timeZone: 'Europe/Copenhagen',
                hour: '2-digit',
                minute: '2-digit'
            }))
        )].sort(),
        datasets: [
            {
                label: 'DK1',
                backgroundColor: '#42A5F5',
                data: dk1.map(p => p.SpotpriceDKK),
            },
            {
                label: 'DK2',
                backgroundColor: '#66BB6A',
                data: dk2.map(p => p.SpotpriceDKK),
            }
        ]
    };
});

const chartOptions = {
    responsive: true,
    plugins: {
        legend: { position: 'top' },
        title: {
            display: true,
            text: 'Spotpris per time (DK1 vs DK2)'
        }
    },
    scales: {
        y: { beginAtZero: true }
    }
};
</script>



<template>

    <h1 class="text-3xl font-bold text-blue-700 mb-6 text-center">Spotpris Overblik</h1>

    <!-- Date Picker -->
    <div class="flex justify-center mb-6">
        <input type="date" class="border px-4 py-2 rounded" v-model="state.selectedDate" :min="'2025-04-01'"
            :max="maxDateStr" />
    </div>

    <!-- Chart -->
    <div class="flex justify-center mb-10">
        <div class="w-full max-w-5xl bg-white p-6 rounded-xl shadow">
            <Chart type="bar" :data="chartData" :options="chartOptions" />
        </div>
    </div>

    <!-- Loading -->
    <div v-if="state.isLoading" class="text-center text-gray-500 py-6">
        <PulseLoader />
    </div>

</template>
