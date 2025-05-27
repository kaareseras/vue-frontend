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
    labels: state.taxes.map(t => t.valid_from.substring(0, 10)),
    datasets: [
      {
        label: 'Net Tax Amount',
        backgroundColor: '#42A5F5',
        data: state.taxes.map(t => t.taxammount),
        stack: 'tax'
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
      text: 'Tax by Valid From Date'
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
  taxes: [],
  isLoading: true,
  error404: false,
  searchQuery: '',
  showNewForm: false,
  isEditMode: false,
  selectedTaxId: null,
  newForm: {
    valid_from: '',
    valid_to: '',
    taxammount: 0.0,
    includingVAT: false,
  },
});

const loadTaxes = async () => {
  state.isLoading = true;
  try {
    const response = await axiosInstance.get('/tax');
    state.taxes = response.data;
  } catch (error) {
    state.error404 = error.response?.status === 404;
    toast.error('Failed to load taxes. ' + error.message);
  } finally {
    state.isLoading = false;
  }
};

const filteredTaxes = computed(() =>
  state.taxes.filter(t =>
    t.taxammount.toString().includes(state.searchQuery)
  )
);

const createTax = async () => {
  try {
    await axiosInstance.post('/tax', state.newForm);
    toast.success('Tax created.');
    closeNewForm();
    await loadTaxes();
  } catch (error) {
    toast.error('Failed to create tax.');
  }
};

const updateTax = async () => {
  try {
    await axiosInstance.put(`/tax/${state.selectedTaxId}`, state.newForm);
    toast.success('Tax updated.');
    closeNewForm();
    await loadTaxes();
  } catch (error) {
    toast.error('Failed to update tax.');
  }
};

const deleteTax = async (tax) => {
  if (!confirm('Delete this tax entry?')) return;
  try {
    await axiosInstance.delete(`/tax/${tax.id}`);
    toast.success('Tax deleted.');
    await loadTaxes();
  } catch (error) {
    toast.error('Failed to delete tax.');
  }
};

const openNewForm = () => {
  state.isEditMode = false;
  state.selectedTaxId = null;
  state.newForm = {
    valid_from: '',
    valid_to: '',
    taxammount: 0.0,
    includingVAT: false,
  };
  state.showNewForm = true;
};

const openEditForm = (tax) => {
  state.isEditMode = true;
  state.selectedTaxId = tax.id;
  state.newForm = {
    valid_from: formatDate(tax.valid_from),
    valid_to: formatDate(tax.valid_to),
    taxammount: tax.taxammount,
    includingVAT: tax.includingVAT,
  };
  state.showNewForm = true;
};

const closeNewForm = () => {
  state.showNewForm = false;
};

const submitTax = () => {
  state.isEditMode ? updateTax() : createTax();
};

onMounted(() => {
  loadTaxes();
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
    <h1 class="text-3xl font-bold text-blue-700 mb-6 text-center">Tax Management</h1>

    <!-- New Button -->
    <div class="flex justify-center mb-6">
      <button @click="openNewForm" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow">
        New Tax Entry
      </button>
    </div>

      <!-- Chart -->
    <div class="flex justify-center mb-10">
      <div class="w-full max-w-5xl bg-white p-6 rounded-xl shadow">
        <Chart type="bar" :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <!-- Modal -->
    <div v-if="state.showNewForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white p-6 rounded-xl shadow-lg w-full max-w-xl">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-blue-700">{{ state.isEditMode ? 'Edit Tax' : 'Create Tax' }}</h2>
          <button @click="closeNewForm" class="text-gray-400 hover:text-red-500 text-2xl font-bold">&times;</button>
        </div>

        <form @submit.prevent="submitTax" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Valid From</label>
            <input type="date" v-model="state.newForm.valid_from" class="w-full border px-4 py-2 rounded" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Valid To</label>
            <input type="date" v-model="state.newForm.valid_to" class="w-full border px-4 py-2 rounded" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Tax Amount</label>
            <input type="number" step="0.01" v-model="state.newForm.taxammount" required class="w-full border px-4 py-2 rounded" />
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



    <!-- Table -->
    <div v-if="state.error404" class="text-center text-red-600 font-medium my-4">
      No tax entries found.
    </div>

    <div v-if="!state.isLoading">
      <div class="overflow-x-auto bg-white rounded-xl shadow-md">
        <table class="min-w-full table-auto text-sm text-left text-gray-700">
          <thead class="bg-blue-100 text-blue-800 uppercase text-xs">
            <tr>
              <th class="px-6 py-4">Valid From</th>
              <th class="px-6 py-4">Valid To</th>
              <th class="px-6 py-4">Amount</th>
              <th class="px-6 py-4">VAT</th>
              <th class="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tax in filteredTaxes" :key="tax.id" class="border-b hover:bg-blue-50 transition">
              <td class="px-6 py-4">{{ tax.valid_from?.substring(0, 10) }}</td>
              <td class="px-6 py-4">{{ tax.valid_to?.substring(0, 10) }}</td>
              <td class="px-6 py-4">{{ tax.taxammount.toFixed(3) }}</td>
              <td class="px-6 py-4">{{ tax.includingVAT ? 'Yes' : 'No' }}</td>
              <td class="px-6 py-4 flex gap-2">
                <button @click="openEditForm(tax)" class="bg-green-500 text-white px-3 py-1 rounded text-xs">Edit</button>
                <button @click="deleteTax(tax)" class="bg-red-500 text-white px-3 py-1 rounded text-xs">Delete</button>
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
