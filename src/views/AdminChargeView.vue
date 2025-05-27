<script setup>
import { reactive, onMounted, computed } from 'vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';
import BackButton from '@/components/BackButton.vue';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';

const toast = useToast();

const token = localStorage.getItem('token');
const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const state = reactive({
  chargeItems: [],
  chargeOwners: [],
  isLoading: true,
  error404: false,
  searchQuery: '',
  showNewForm: false,
  isEditMode: false,
  selectedItemId: null,
  newForm: {
    chargeowner_id: null,
    charge_type: '',
    charge_type_code: '',
    note: '',
    description: '',
    valid_from: '',
    valid_to: '',
    ...Object.fromEntries(Array.from({ length: 24 }, (_, i) => [`price${i + 1}`, 0])),
  },
});

const loadItems = async (chargeowner_id) => {
  state.isLoading = true;
  state.error404 = false;
  try {
    const response = await axiosInstance.get('/charge/chargeowner/' + chargeowner_id);
    state.chargeItems = response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      state.error404 = true;
      state.chargeItems = [];
    } else {
      toast.error('Failed to load charges. ' + error.message);
    }
  } finally {
    state.isLoading = false;
  }
};

const loadChargeOwners = async () => {
  state.isLoading = true;
  state.error404 = false;
  try {
    const response = await axiosInstance.get('/chargeowner');
    state.chargeOwners = response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      state.error404 = true;
      state.chargeOwners = [];
    } else {
      toast.error('Failed to load charge owners. ' + error.message);
    }
  } finally {
    state.isLoading = false;
  }
};

const createItem = async () => {
  try {
    await axiosInstance.post('/charge', state.newForm);
    toast.success('Charge created.');
    closeNewForm();
    await loadItems();
  } catch (error) {
    toast.error('Failed to create charge.');
  }
};

const updateItem = async () => {
  try {
    await axiosInstance.put(`/charge/${state.selectedItemId}`, state.newForm);
    toast.success('Charge updated.');
    closeNewForm();
    await loadItems();
  } catch (error) {
    toast.error('Failed to update charge.');
  }
};

const openNewForm = () => {
  state.isEditMode = false;
  state.selectedItemId = null;
  state.newForm = {
    chargeowner_id: null,
    charge_type: '',
    charge_type_code: '',
    note: '',
    description: '',
    valid_from: '',
    valid_to: '',
    ...Object.fromEntries(Array.from({ length: 24 }, (_, i) => [`price${i + 1}`, 0])),
  };
  state.showNewForm = true;
};

function formatDate(dateStr) {
  return dateStr ? dateStr.split('T')[0] : '';
}

const openEditForm = (item) => {
  state.isEditMode = true;
  state.selectedItemId = item.id;
  state.newForm = {
    chargeowner_id: item.chargeowner_id,
    charge_type: item.charge_type,
    charge_type_code: item.charge_type_code,
    note: item.note,
    description: item.description,
    valid_from: formatDate(item.valid_from),
    valid_to: formatDate(item.valid_to),
    ...Object.fromEntries(Array.from({ length: 24 }, (_, i) => [`price${i + 1}`, item[`price${i + 1}`] || 0])),
  };
  state.showNewForm = true;
};

const closeNewForm = () => {
  state.showNewForm = false;
};

const onChargeOwnerFilterChange = (event) => {
  loadItems(event.target.value);
};

const submitForm = () => {
  if (state.isEditMode) {
    updateItem();
  } else {
    createItem();
  }
};

onMounted(() => {
  loadChargeOwners();
});
</script>

<template>
  <section class="bg-blue-50 min-h-screen px-6 py-10">
    <BackButton />
    <h1 class="text-3xl font-bold text-blue-700 mb-4 text-center">Charges</h1>

        <!-- New Button -->
    <div class="flex justify-center mb-6">
      <button @click="openNewForm" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow">
        New Charge
      </button>
    </div>

        <!-- Search Bar -->
    <div class="mb-6 max-w-md mx-auto">
      <select v-model="state.searchQuery" @change="onChargeOwnerFilterChange" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option v-for="owner in state.chargeOwners" :key="owner.glnnumber" :value="owner.id">
          {{ owner.compagny }} ({{ owner.glnnumber }})
        </option>
      </select>
    </div>



    <div v-if="state.isLoading" class="flex justify-center mt-10">
      <PulseLoader :loading="true" color="#2563EB" size="12px" />
    </div>

    <div v-else-if="state.error404" class="text-center text-red-600">
      No charges found.
    </div>
    <!-- Table -->
    <div v-else >
      <div class="overflow-x-auto bg-white rounded-xl shadow-md">
        <table class="min-w-full table-auto text-sm text-left text-gray-700">
          <thead class="bg-blue-100 text-blue-800 uppercase text-xs">
            <tr >
              <th class="px-6 py-4">Type</th>
              <th class="px-6 py-4">Code</th>
              <th class="px-6 py-4">Valid From</th>
              <th class="px-6 py-4">Valid To</th>
              <th class="px-6 py-4">Price 1</th>
              <th class="px-6 py-4">Price 2</th>
              <th class="px-6 py-4">Note</th>
              <th class="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in state.chargeItems" :key="item.id" class="border-b hover:bg-blue-50 transition">
              <td class="px-6 py-4">{{ item.charge_type }}</td>
              <td class="px-6 py-4">{{ item.charge_type_code }}</td>
              <td class="px-6 py-4">{{ item.valid_from }}</td>
              <td class="px-6 py-4">{{ item.valid_to }}</td>
              <td class="px-6 py-4">{{ item.price1 }}</td>
              <td class="px-6 py-4">{{ item.price2 }}</td>
              <td class="px-6 py-4">{{ item.note }}</td>
              <td class="px-6 py-4">
                <button @click="openEditForm(item)" class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs">
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal -->
      <div v-if="state.showNewForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-blue-700">
              {{ state.isEditMode ? 'Edit Charge' : 'Create Charge' }}
            </h2>
            <button @click="closeNewForm" class="text-gray-400 hover:text-red-500 text-2xl font-bold">&times;</button>
          </div>

          <form @submit.prevent="submitForm" class="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
            <div>
              <label class="block text-sm font-medium mb-1">Charge Owner ID</label>


              <select v-model="state.newForm.chargeowner_id" class="w-full border px-3 py-2 rounded">
                <option v-for="owner in state.chargeOwners" :key="owner.glnnumber" :value="owner.id">
                  {{ owner.name }} ({{ owner.glnnumber }})
                </option>
              </select>
            </div>



            <div>
              <label class="block text-sm font-medium mb-1">Charge Type</label>
              <input v-model="state.newForm.charge_type" class="w-full border px-3 py-2 rounded" />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Charge Type Code</label>
              <input v-model="state.newForm.charge_type_code" class="w-full border px-3 py-2 rounded" />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Note</label>
              <textarea v-model="state.newForm.note" class="w-full border px-3 py-2 rounded" rows="2"></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Description</label>
              <textarea v-model="state.newForm.description" class="w-full border px-3 py-2 rounded" rows="2"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Valid From</label>
                <input v-model="state.newForm.valid_from" type="date" class="w-full border px-3 py-2 rounded" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Valid To</label>
                <input v-model="state.newForm.valid_to" type="date" class="w-full border px-3 py-2 rounded" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div v-for="i in 24" :key="i">
                <label class="block text-sm font-medium mb-1">Price {{ i }}</label>
                <input v-model.number="state.newForm[`price${i}`]" type="decimal" step="0.001" required
                       :placeholder="`Price ${i}`"
                  class="w-full border px-3 py-2 rounded" />
              </div>
            </div>

            <div class="flex justify-end gap-2 pt-4">
              <button type="button" @click="closeNewForm" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                Cancel
              </button>
              <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                {{ state.isEditMode ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>
