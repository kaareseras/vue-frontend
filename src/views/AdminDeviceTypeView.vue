<script setup>
import { reactive, onMounted } from 'vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';
import BackButton from '@/components/BackButton.vue';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';

const toast = useToast();

const token = localStorage.getItem('token');
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const state = reactive({
  deviceTypes: [],
  isLoading: true,
  error404: false,
  showForm: false,
  isEditMode: false,
  selectedId: null,
  form: {
    name: '',
    hw_version: '',
    sw_version: '',
    sw_date: '',
  },
});

const loadDeviceTypes = async () => {
  state.isLoading = true;
  state.error404 = false;
  try {
    const res = await axiosInstance.get('/devicetype');
    state.deviceTypes = res.data;
  } catch (error) {
    if (error.response?.status === 404) {
      state.error404 = true;
      state.deviceTypes = [];
    } else {
      toast.error('Failed to load device types. ' + error.message);
    }
  } finally {
    state.isLoading = false;
  }
};

const openNewForm = () => {
  state.form = {
    name: '',
    hw_version: '',
    sw_version: '',
    sw_date: '',
  };
  state.selectedId = null;
  state.isEditMode = false;
  state.showForm = true;
};

const openEditForm = async (type) => {
  try {
    const { data } = await axiosInstance.get(`/devicetype/id/${type.id}`);
    state.form = {
      name: data.name,
      hw_version: data.hw_version ?? '',
      sw_version: data.sw_version ?? '',
      sw_date: data.sw_date ? data.sw_date.slice(0, 10) : '', // ISO to yyyy-mm-dd
    };
    state.selectedId = data.id;
    state.isEditMode = true;
    state.showForm = true;
  } catch (err) {
    toast.error('Failed to fetch device type details.');
  }
};

const closeForm = () => {
  state.showForm = false;
  state.selectedId = null;
};

const createDeviceType = async () => {
  try {
    await axiosInstance.post('/devicetype', state.form);
    toast.success('Device type created.');
    closeForm();
    await loadDeviceTypes();
  } catch (error) {
    toast.error('Failed to create device type.');
  }
};

const updateDeviceType = async () => {
  try {
    await axiosInstance.put(`/devicetype/${state.selectedId}`, state.form);
    toast.success('Device type updated.');
    closeForm();
    await loadDeviceTypes();
  } catch (error) {
    toast.error('Failed to update device type.');
  }
};

const deleteDeviceType = async (id) => {
  if (!confirm('Are you sure you want to delete this device type?')) return;
  try {
    await axiosInstance.delete(`/devicetype/${id}`);
    toast.success('Device type deleted.');
    await loadDeviceTypes();
  } catch (error) {
    toast.error('Failed to delete device type.');
  }
};

const submitForm = () => {
  state.isEditMode ? updateDeviceType() : createDeviceType();
};

onMounted(loadDeviceTypes);
</script>

<template>
  <section class="bg-blue-50 min-h-screen px-6 py-10">
    <BackButton />
    <h1 class="text-3xl font-bold text-blue-700 mb-4 text-center">Device Types</h1>

    <div class="flex justify-center mb-6">
      <button @click="openNewForm" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow">
        New Device Type
      </button>
    </div>

    <div v-if="state.isLoading" class="flex justify-center mt-10">
      <PulseLoader :loading="true" color="#2563EB" size="12px" />
    </div>

    <div v-else-if="state.error404 || state.deviceTypes.length === 0" class="text-center text-gray-500">
      No device types found.
    </div>

    <div v-else>
      <div class="overflow-x-auto bg-white rounded-xl shadow-md">
        <table class="min-w-full table-auto text-sm text-left text-gray-700">
          <thead class="bg-blue-100 text-blue-800 uppercase text-xs">
            <tr>
              <th class="px-6 py-4">ID</th>
              <th class="px-6 py-4">Name</th>
              <th class="px-6 py-4">HW Version</th>
              <th class="px-6 py-4">SW Version</th>
              <th class="px-6 py-4">SW Date</th>
              <th class="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="type in state.deviceTypes" :key="type.id" class="border-b hover:bg-blue-50 transition">
              <td class="px-6 py-4">{{ type.id }}</td>
              <td class="px-6 py-4">{{ type.name }}</td>
              <td class="px-6 py-4">{{ type.hw_version || '-' }}</td>
              <td class="px-6 py-4">{{ type.sw_version || '-' }}</td>
              <td class="px-6 py-4">{{ type.sw_date || '-' }}</td>
              <td class="px-6 py-4 flex gap-2">
                <button
                  @click="openEditForm(type)"
                  class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs"
                >
                  Edit
                </button>
                <button
                  @click="deleteDeviceType(type.id)"
                  class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="state.showForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-blue-700">
            {{ state.isEditMode ? 'Edit Device Type' : 'Add Device Type' }}
          </h2>
          <button @click="closeForm" class="text-gray-400 hover:text-red-500 text-2xl font-bold">&times;</button>
        </div>

        <form @submit.prevent="submitForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Name</label>
            <input v-model="state.form.name" class="w-full border px-3 py-2 rounded" required />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">HW Version</label>
            <input v-model="state.form.hw_version" class="w-full border px-3 py-2 rounded" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">SW Version</label>
            <input v-model="state.form.sw_version" class="w-full border px-3 py-2 rounded" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">SW Date</label>
            <input v-model="state.form.sw_date" type="date" class="w-full border px-3 py-2 rounded" />
          </div>

          <div class="flex justify-end gap-2 pt-4">
            <button type="button" @click="closeForm" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
              Cancel
            </button>
            <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              {{ state.isEditMode ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>
