<script setup>
import { reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { QrcodeStream } from 'vue-qrcode-reader';
import { useToast } from 'vue-toastification';
import BackButton from '@/components/BackButton.vue';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';
import Denmark from '@/components/Denmark.vue';

const toast = useToast();
const route = useRoute();
const router = useRouter();

const token = localStorage.getItem('token');
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        Authorization: `Bearer ${token}`,
    },
});

const state = reactive({
    uuid: route.params.uuid || '',
    chargeOwners: [],
    isLoading: false,
    showQrScanner: false,
    form: {
        name: '',
        chargeowner_id: '',
        price_area: 'DK1',
        is_electric_heated: false
    }
});

function handleRegionSelected(region) {
    state.form.price_area = region
}

const selectedChargeowner = computed(() => {
    return state.chargeOwners.find(owner => owner.id === state.form.chargeowner_id);
});

const loadChargeOwners = async () => {
    state.isLoading = true;
    try {
        const response = await axiosInstance.get('/chargeowner');
        state.chargeOwners = response.data;
    } catch (error) {
        toast.error('Failed to load charge owners.');
    } finally {
        state.isLoading = false;
    }
};

const onQrDetect = ([qr]) => {
    state.uuid = qr.rawValue;
    state.showQrScanner = false;
    toast.success('QR scanned!');
};

const submitAdoption = async () => {
    if (!state.uuid || !state.form.name || !state.form.chargeowner_id || !state.form.price_area) {
        toast.error('All fields are required.');
        return;
    }

    try {
        await axiosInstance.post(`/device/adopt/${state.uuid}`, {
            uuid: state.uuid,
            name: state.form.name,
            chargeowner_id: state.form.chargeowner_id,
            price_area: state.form.price_area,
            is_electric_heated: state.form.is_electric_heated
        });

        toast.success('Device adopted successfully!');
        router.push('/home');
    } catch (error) {
        toast.error('Failed to adopt device.');
    }
};

onMounted(() => {
    loadChargeOwners();
    if (!state.uuid) {
        state.showQrScanner = true;
    }
});
</script>

<template>
    <section class="bg-blue-50 min-h-screen px-6 py-10">
        <h1 class="text-3xl font-bold text-blue-700 mb-6 text-center">Adopt a Device</h1>

        <div v-if="state.isLoading" class="flex justify-center mt-10">
            <PulseLoader :loading="true" color="#2563EB" size="12px" />
        </div>

        <!-- QR SCANNER -->
        <div v-else-if="state.showQrScanner">
            <div class="bg-white rounded-xl p-6 max-w-xl mx-auto shadow-md">
                <h2 class="text-lg font-semibold text-center mb-4 text-blue-700">Scan Device QR Code</h2>
                <QrcodeStream @detect="onQrDetect" />
                <div class="text-center mt-4 text-sm text-gray-500">Scan the QR on the device to begin adoption.</div>
            </div>
        </div>

        <!-- FORM -->
        <div v-else class="bg-white rounded-xl p-6 max-w-xl mx-auto shadow-md">
            <form @submit.prevent="submitAdoption" class="space-y-4">
                <!-- UUID -->
                <div>
                    <label class="block text-sm font-medium mb-1 text-gray-700">Device UUID</label>
                    <input :value="state.uuid" disabled
                        class="w-full border px-3 py-2 rounded bg-gray-100 text-gray-700" />
                </div>

                <!-- Name -->
                <div>
                    <label class="block text-sm font-medium mb-1 text-gray-700">Device Name</label>
                    <input v-model="state.form.name" required placeholder="Enter a name for the device"
                        class="w-full border px-3 py-2 rounded" />
                </div>


                <!-- Price Area -->
                <div>
                    <label class="block text-sm font-medium mb-1 text-gray-700">Price Area</label>
                    <!-- Left: Denmark Map -->
                    <div class="flex justify-center">
                        <Denmark @region-selected="handleRegionSelected" />
                    </div>
                    <!-- 🧠 Bound to the same state -->
                    <select v-model="state.form.price_area" class="w-full border px-3 py-2 rounded" required>
                        <option value="DK1">DK1</option>
                        <option value="DK2">DK2</option>
                    </select>
                </div>

                <!-- Charge Owner -->
                <div>
                    <label class="block text-sm font-medium mb-1 text-gray-700">Charge Owner</label>
                    <select v-model="state.form.chargeowner_id" class="w-full border px-3 py-2 rounded" required>
                        <option value="" disabled>Select Charge Owner</option>
                        <option v-for="owner in state.chargeOwners" :key="owner.id" :value="owner.id">
                            {{ owner.compagny }} ({{ owner.glnnumber }})
                        </option>
                    </select>
                    <div v-if="selectedChargeowner" class="mt-1 text-sm text-blue-700">
                        Selected Owner: <strong>{{ selectedChargeowner.compagny }}</strong>
                    </div>
                </div>


                <!-- Electric Heating -->
                <div class="flex items-center gap-2">
                    <input id="electricHeated" type="checkbox" v-model="state.form.is_electric_heated"
                        class="border-gray-300" />
                    <label for="electricHeated" class="text-sm text-gray-700">
                        This is an electric heated house
                    </label>
                </div>

                <!-- Submit -->
                <div class="flex justify-end pt-4">
                    <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                        Adopt Device
                    </button>
                </div>
            </form>
        </div>
    </section>
</template>
