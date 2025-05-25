<script setup>
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';
import { reactive, onMounted, computed } from 'vue';
import axios from 'axios';
import BackButton from '@/components/BackButton.vue';
import { useToast } from 'vue-toastification';

const toast = useToast();

const token = localStorage.getItem('token');
const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const state = reactive({
  chargeOwners: [],
  isLoading: true,
  error404: false,
  searchQuery: '',
  showNewForm: false,
  isEditMode: false,
  selectedOwnerId: null,
  newForm: {
    compagny: '',
    glnnumber: '',
    chargetype: '',
    chargetypecode: '',
    is_active: true,
  },
});

const loadChargeOwners = async () => {
  state.isLoading = true;
  state.error404 = false;
  try {
    const response = await axiosInstance.get('/chargeowner');
    state.chargeOwners = response.data;
    state.chargeOwners.sort((a, b) => a.compagny.localeCompare(b.compagny));
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

const filteredChargeOwners = computed(() => {
  return state.chargeOwners.filter((co) =>
    co.compagny.toLowerCase().includes(state.searchQuery.toLowerCase()) || co.glnnumber.toLowerCase().includes(state.searchQuery.toLowerCase())
  );
});

const createChargeOwner = async () => {
  try {
    await axiosInstance.post('/chargeowner', state.newForm);
    toast.success('Charge owner created.');
    closeNewForm();
    await loadChargeOwners();
  } catch (error) {
    toast.error('Failed to create charge owner.');
  }
};

const updateChargeOwner = async () => {
  try {
    await axiosInstance.put(`/chargeowner/${state.selectedOwnerId}`, state.newForm);
    toast.success('Charge owner updated.');
    closeNewForm();
    await loadChargeOwners();
  } catch (error) {
    toast.error('Failed to update charge owner.');
  }
};

const toggleActive = async (owner) => {
  try {
    const updated = { ...owner, is_active: !owner.is_active };
    await axiosInstance.put(`/chargeowner/${owner.id}`, updated);
    toast.success('Status updated.');
    await loadChargeOwners();
  } catch (error) {
    toast.error('Failed to update status.');
  }
};

const DeleteChargeOwner = async (owner) => {
  if (!confirm('Are you sure you want to delete this Chargeowner?')) return;
  try {
    await axiosInstance.delete(`/chargeowner/${owner.id}`);
    toast.success('Charge owner deleted.');
    await loadChargeOwners();
  } catch (error) {
    toast.error('Failed to delete charge owner.');
  }
};

const openNewForm = () => {
  state.isEditMode = false;
  state.selectedOwnerId = null;
  state.newForm = {
    name: '',
    company: '',
    glnnumber: '',
    type: '',
    chargetype: '',
    is_active: true,
  };
  state.showNewForm = true;
};

const openEditForm = (owner) => {
  state.isEditMode = true;
  state.selectedOwnerId = owner.id;
  state.newForm = { ...owner }; // copy existing owner to form
  state.showNewForm = true;
};

const closeNewForm = () => {
  state.showNewForm = false;
};

const submitChargeOwner = () => {
  if (state.isEditMode) {
    updateChargeOwner();
  } else {
    createChargeOwner();
  }
};

onMounted(() => {
  loadChargeOwners();
});
</script>


<template>
  <section class="bg-blue-50 min-h-screen px-6 py-10">
    <BackButton />
    <h1 class="text-3xl font-bold text-blue-700 mb-4 text-center">Charge Owners</h1>

    <!-- New Button -->
    <div class="flex justify-center mb-6">
      <button @click="openNewForm" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow">
        New Charge Owner
      </button>
    </div>

    <!-- Modal -->
    <div v-if="state.showNewForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white p-6 rounded-xl shadow-lg w-full max-w-xl">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-blue-700">
            {{ state.isEditMode ? 'Edit Charge Owner' : 'Create Charge Owner' }}
          </h2>
          <button @click="closeNewForm" class="text-gray-400 hover:text-red-500 text-2xl font-bold">&times;</button>
        </div>

        <form @submit.prevent="submitChargeOwner" class="space-y-4">
          <div>
            <label for="company" class="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input id="company" v-model="state.newForm.compagny" required class="w-full border px-4 py-2 rounded" />
          </div>

          <div>
            <label for="glnnumber" class="block text-sm font-medium text-gray-700 mb-1">GLN Number</label>
            <input id="glnnumber" v-model="state.newForm.glnnumber" required class="w-full border px-4 py-2 rounded" />
          </div>

          <div>
            <label for="type" class="block text-sm font-medium text-gray-700 mb-1">Charge Type</label>
            <input id="type" v-model="state.newForm.chargetype" class="w-full border px-4 py-2 rounded" />
          </div>

          <div>
            <label for="chargetype" class="block text-sm font-medium text-gray-700 mb-1">Charge Type Code</label>
            <input id="chargetype" v-model="state.newForm.chargetypecode" class="w-full border px-4 py-2 rounded" />
          </div>

          <div class="flex items-center gap-2">
            <input type="checkbox" v-model="state.newForm.is_active" id="is_active" />
            <label for="is_active" class="text-sm">Active</label>
          </div>

          <div class="flex justify-end gap-2">
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


    <!-- Search Bar -->
    <div class="mb-6 max-w-md mx-auto">
      <input v-model="state.searchQuery" type="text" placeholder="Search by company or GLN..."
        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>

    <!-- Table -->
    <div v-if="state.error404" class="text-center text-red-600 font-medium my-4">
      No charge owners found.
    </div>
    <div v-if="!state.isLoading">
      <div class="overflow-x-auto bg-white rounded-xl shadow-md">
        <table class="min-w-full table-auto text-sm text-left text-gray-700">
          <thead class="bg-blue-100 text-blue-800 uppercase text-xs">
            <tr>
              <th class="px-6 py-4">Compagny</th>
              <th class="px-6 py-4">GLN</th>
              <th class="px-6 py-4">Charge Type</th>
              <th class="px-6 py-4">Charge Type Code</th>
              <th class="px-6 py-4">Active</th>
              <th class="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="owner in filteredChargeOwners" :key="owner.id" class="border-b hover:bg-blue-50 transition">
              <td class="px-6 py-4">
                <input v-model="owner.compagny" class="bg-transparent w-full border-none focus:outline-none" />
              </td>
              <td class="px-6 py-4">
                <input v-model="owner.glnnumber" class="bg-transparent w-full border-none focus:outline-none" />
              </td>
              <td class="px-6 py-4">
                <input v-model="owner.chargetype" class="bg-transparent w-full border-none focus:outline-none" />
              </td>
              <td class="px-6 py-4">
                <input v-model="owner.chargetypecode" class="bg-transparent w-full border-none focus:outline-none" />
              </td>
              <td class="px-6 py-4">
                <span :class="owner.is_active ? 'text-green-700 font-semibold' : 'text-red-600 font-semibold'">
                  {{ owner.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 flex flex-wrap gap-2 justify-center">
                <button @click="toggleActive(owner)"
                  class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs">
                  {{ owner.is_active ? 'Deactivate' : 'Activate' }}
                </button>
                <button @click="openEditForm(owner)"
                  class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs">
                  Edit
                </button>

                <button @click="DeleteChargeOwner(owner)"
                  class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs">
                  Delete
                </button>
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
