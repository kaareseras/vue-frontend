<script setup>
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';
import { reactive, onMounted, computed } from 'vue';
import axios from 'axios';
import BackButton from '@/components/BackButton.vue';
import { useToast } from 'vue-toastification';
import Chart from 'primevue/chart';

const toast = useToast();

const token = localStorage.getItem('token');
const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const chartData = computed(() => {
  return {
    labels: state.tarifs.map(t => t.valid_from.substring(0, 10)),
    datasets: [
      {
        label: 'Net Tarif',
        backgroundColor: '#42A5F5',
        data: state.tarifs.map(t => t.nettarif),
        stack: 'tarif'
      },
      {
        label: 'System Tarif',
        backgroundColor: '#66BB6A',
        data: state.tarifs.map(t => t.systemtarif),
        stack: 'tarif'
      }
    ]
  };
});

const chartOptions = {
  plugins: {
    legend: {
      position: 'top'
    },
    title: {
      display: true,
      text: 'Tarif Breakdown by Valid From Date'
    }
  },
  responsive: true,
  scales: {
    x: {
      stacked: true
    },
    y: {
      stacked: true
    }
  }
};

const state = reactive({
  tarifs: [],
  isLoading: true,
  error404: false,
  searchQuery: '',
  showNewForm: false,
  isEditMode: false,
  selectedTarifId: null,
  newForm: {
    valid_from: '',
    valid_to: '',
    nettarif: 0.0,
    systemtarif: 0.0,
    includingVAT: false,
  },
});

const loadTarifs = async () => {
  state.isLoading = true;
  try {
    const response = await axiosInstance.get('/tarif');
    state.tarifs = response.data;
  } catch (error) {
    state.error404 = error.response?.status === 404;
    toast.error('Failed to load tarifs. ' + error.message);
  } finally {
    state.isLoading = false;
  }
};

const filteredTarifs = computed(() =>
  state.tarifs.filter(t =>
    t.nettarif.toString().includes(state.searchQuery) ||
    t.systemtarif.toString().includes(state.searchQuery)
  )
);

const createTarif = async () => {
  try {
    await axiosInstance.post('/tarif', state.newForm);
    toast.success('Tarif created.');
    closeNewForm();
    await loadTarifs();
  } catch (error) {
    toast.error('Failed to create tarif.');
  }
};

const updateTarif = async () => {
  try {
    await axiosInstance.put(`/tarif/${state.selectedTarifId}`, state.newForm);
    toast.success('Tarif updated.');
    closeNewForm();
    await loadTarifs();
  } catch (error) {
    toast.error('Failed to update tarif.');
  }
};

const deleteTarif = async (tarif) => {
  if (!confirm('Delete this tarif entry?')) return;
  try {
    await axiosInstance.delete(`/tarif/${tarif.id}`);
    toast.success('Tarif deleted.');
    await loadTarifs();
  } catch (error) {
    toast.error('Failed to delete tarif.');
  }
};

const openNewForm = () => {
  state.isEditMode = false;
  state.selectedTarifId = null;
  state.newForm = {
    valid_from: '',
    valid_to: '',
    nettarif: 0.0,
    systemtarif: 0.0,
    includingVAT: false,
  };
  state.showNewForm = true;
};

const openEditForm = (tarif) => {
  state.isEditMode = true;
  state.selectedTarifId = tarif.id;
  state.newForm = {
    valid_from: formatDate(tarif.valid_from),
    valid_to: formatDate(tarif.valid_to),
    nettarif: tarif.nettarif,
    systemtarif: tarif.systemtarif,
    includingVAT: tarif.includingVAT,
  };
  state.showNewForm = true;
};

const closeNewForm = () => {
  state.showNewForm = false;
};

const submitTarif = () => {
  state.isEditMode ? updateTarif() : createTarif();
};

onMounted(() => {
  loadTarifs();
});

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toISOString().substring(0, 10);
};
</script>

<template>
  <section class="bg-gray-50 min-h-screen px-6 py-10">
    <BackButton />
    <h1 class="text-3xl font-bold text-blue-700 mb-6 text-center">Tarif Management</h1>

    <!-- New Button -->
    <div class="flex justify-center mb-6">
      <button @click="openNewForm" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow">
        New Tarif Entry
      </button>
    </div>

    <!-- Chart -->
    <div class="flex justify-center mb-10">
      <div class="w-full max-w-5xl bg-white p-6 rounded-xl shadow">
        <Chart type="bar" :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <div v-if="state.showNewForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white p-6 rounded-xl shadow-lg w-full max-w-xl">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-blue-700">{{ state.isEditMode ? 'Edit Tarif' : 'Create Tarif' }}</h2>
          <button @click="closeNewForm" class="text-gray-400 hover:text-red-500 text-2xl font-bold">&times;</button>
        </div>

        <form @submit.prevent="submitTarif" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Valid From</label>
            <input type="date" v-model="state.newForm.valid_from" class="w-full border px-4 py-2 rounded" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Valid To</label>
            <input type="date" v-model="state.newForm.valid_to" class="w-full border px-4 py-2 rounded" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Net Tarif</label>
            <input type="number" step="0.001" v-model="state.newForm.nettarif" required class="w-full border px-4 py-2 rounded" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">System Tarif</label>
            <input type="number" step="0.001" v-model="state.newForm.systemtarif" required class="w-full border px-4 py-2 rounded" />
          </div>

          <div class="flex items-center gap-2">
            <input type="checkbox" v-model="state.newForm.includingVAT" id="includingVAT" />
            <label for="includingVAT" class="text-sm">Including VAT</label>
          </div>

          <div class="flex justify-end gap-2">
            <button type="button" @click="closeNewForm" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              {{ state.isEditMode ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>


    <div v-if="state.error404" class="text-center text-red-600 font-medium my-4">
      No tarif entries found.
    </div>

    <div v-if="!state.isLoading">
      <div class="overflow-x-auto bg-white rounded-xl shadow-md">
        <table class="min-w-full table-auto text-sm text-left text-gray-700">
          <thead class="bg-blue-100 text-blue-800 uppercase text-xs">
            <tr>
              <th class="px-6 py-4">Valid From</th>
              <th class="px-6 py-4">Valid To</th>
              <th class="px-6 py-4">Net Tarif</th>
              <th class="px-6 py-4">System Tarif</th>
              <th class="px-6 py-4">VAT</th>
              <th class="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tarif in filteredTarifs" :key="tarif.id" class="border-b hover:bg-blue-50 transition">
              <td class="px-6 py-4">{{ tarif.valid_from?.substring(0, 10) }}</td>
              <td class="px-6 py-4">{{ tarif.valid_to?.substring(0, 10) }}</td>
              <td class="px-6 py-4">{{ tarif.nettarif.toFixed(3) }}</td>
              <td class="px-6 py-4">{{ tarif.systemtarif.toFixed(3) }}</td>
              <td class="px-6 py-4">{{ tarif.includingVAT ? 'Yes' : 'No' }}</td>
              <td class="px-6 py-4 flex gap-2">
                <button @click="openEditForm(tarif)" class="bg-green-500 text-white px-3 py-1 rounded text-xs">Edit</button>
                <button @click="deleteTarif(tarif)" class="bg-red-500 text-white px-3 py-1 rounded text-xs">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else class="text-center text-gray-500 py-6">
      <PulseLoader />
    </div>
  </section>
</template>
