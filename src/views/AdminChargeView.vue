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

const loadItems = async (glnnumber) => {
  state.isLoading = true;
  state.error404 = false;
  try {
    const response = await axiosInstance.get('/charge/gln/' + glnnumber);
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

const openEditForm = (item) => {
  state.isEditMode = true;
  state.selectedItemId = item.id;
  state.newForm = { ...item };
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
    <div class="p-4">
      <BackButton />
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold text-blue-800">Charges</h1>
        <button @click="openNewForm" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded">
          + Add Charge
        </button>
      </div>

      <input type="text" v-model="state.searchQuery" placeholder="Search charges..."
        class="mb-4 px-3 py-2 border rounded w-full" />

      <div class="mb-4 flex items-center gap-4">
        <label class="font-medium text-gray-700">Filter by Charge Owner:</label>
        <select v-model="state.searchQuery" @change="onChargeOwnerFilterChange" class="border px-3 py-2 rounded">
          <option v-for="owner in state.chargeOwners" :key="owner.glnnumber" :value="owner.glnnumber">
            {{ owner.name }} ({{ owner.glnnumber }})
          </option>
        </select>
      </div>

      <div v-if="state.isLoading" class="flex justify-center mt-10">
        <PulseLoader :loading="true" color="#2563EB" size="12px" />
      </div>

      <div v-else-if="state.error404" class="text-center text-red-600">
        No charges found.
      </div>

      <table v-else class="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr class="bg-gray-100 text-left">
            <th class="border px-4 py-2">Charge Owner</th>
            <th class="border px-4 py-2">Type</th>
            <th class="border px-4 py-2">Code</th>
            <th class="border px-4 py-2">Valid From</th>
            <th class="border px-4 py-2">Valid To</th>
            <th class="border px-4 py-2">Price 1</th>
            <th class="border px-4 py-2">Price 2</th>
            <th class="border px-4 py-2">Note</th>
            <th class="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in state.chargeItems.filter(charge =>
            charge.charge_type?.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            charge.charge_type_code?.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            charge.note?.toLowerCase().includes(state.searchQuery.toLowerCase())
          )" :key="item.id" class="hover:bg-gray-50">
            <td class="border px-4 py-2">{{ item.chargeowner_id }}</td>
            <td class="border px-4 py-2">{{ item.charge_type }}</td>
            <td class="border px-4 py-2">{{ item.charge_type_code }}</td>
            <td class="border px-4 py-2">{{ item.valid_from }}</td>
            <td class="border px-4 py-2">{{ item.valid_to }}</td>
            <td class="border px-4 py-2">{{ item.price1 }}</td>
            <td class="border px-4 py-2">{{ item.price2 }}</td>
            <td class="border px-4 py-2">{{ item.note }}</td>
            <td class="border px-4 py-2">
              <button @click="openEditForm(item)" class="text-blue-600 hover:underline">
                Edit
              </button>
            </td>
          </tr>
        </tbody>
      </table>

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
                <option v-for="owner in state.chargeOwners" :key="owner.glnnumber" :value="owner.glnnumber">
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
                <input v-model.number="state.newForm[`price${i}`]" type="number"
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
