<script setup>
import { reactive, onMounted, ref } from 'vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';
import BackButton from '@/components/BackButton.vue';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';

// Reactive state for the device type management
const activeFirmwareIndex = ref(null);
const activeHardwareIndex = ref(null);

function setActiveFirmware(index) {
  state.form.firmwares.forEach((fw, i) => {
    fw.is_active = i === index;
  });
}

function setActiveHardware(index) {
  state.form.hardwares.forEach((hw, i) => {
    hw.is_active = i === index;
  });
}

const toast = useToast();
const token = localStorage.getItem('token');

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { Authorization: `Bearer ${token}` },
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
    description: '',
    firmwares: [],
    hardwares: [],
  },
});

const loadDeviceTypes = async () => {
  state.isLoading = true;
  state.error404 = false;
  try {
    const res = await axiosInstance.get('/devicetype/with_hw_fw');
    state.deviceTypes = res.data;
  } catch (error) {
    state.error404 = error.response?.status === 404;
    toast.error('Failed to load device types. ' + error.message);
  } finally {
    state.isLoading = false;
  }
};

const openNewForm = () => {
  state.form = {
    name: '',
    description: '',
    firmwares: [],
    hardwares: [],
  };
  state.selectedId = null;
  state.isEditMode = false;
  state.showForm = true;
};

const openEditForm = async (type) => {
  try {
    const { data } = await axiosInstance.get(`/devicetype/id/${type.id}`);
    const firmwareRes = await axiosInstance.get(`/firmware/by-devicetype/${type.id}`);
    const hardwareRes = await axiosInstance.get(`/hardware/by-devicetype/${type.id}`);

    state.form = {
      name: data.name,
      description: data.description ?? '',
      firmwares: firmwareRes.data,
      hardwares: hardwareRes.data,
    };

    // Set radio button selection
    activeFirmwareIndex.value = state.form.firmwares.findIndex(fw => fw.is_active);
    activeHardwareIndex.value = state.form.hardwares.findIndex(hw => hw.is_active);
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
    const { name, description, firmwares, hardwares } = state.form;
    const { data } = await axiosInstance.post('/devicetype', { name, description });
    const devicetypeId = data.id;

    await Promise.all([
      ...firmwares.map(fw =>
        axiosInstance.post('/firmware', { ...fw, devicetype_id: devicetypeId })
      ),
      ...hardwares.map(hw =>
        axiosInstance.post('/hardware', { ...hw, devicetype_id: devicetypeId })
      ),
    ]);

    toast.success('Device type created.');
    closeForm();
    await loadDeviceTypes();
  } catch (error) {
    toast.error('Failed to create device type.');
  }
};

const updateDeviceType = async () => {
  try {
    const { name, description, firmwares, hardwares } = state.form;

    // Update devicetype basic fields
    await axiosInstance.put(`/devicetype/${state.selectedId}`, { name, description });

    // Get current firmwares and hardwares from backend
    const [existingFirmwares, existingHardwares] = await Promise.all([
      axiosInstance.get(`/firmware/by-devicetype/${state.selectedId}`),
      axiosInstance.get(`/hardware/by-devicetype/${state.selectedId}`),
    ]);

    const existingFirmwareMap = new Map(existingFirmwares.data.map(fw => [fw.id, fw]));
    const existingHardwareMap = new Map(existingHardwares.data.map(hw => [hw.id, hw]));

    const formFirmwareIds = new Set();
    const formHardwareIds = new Set();

    // Handle firmwares
    await Promise.all(firmwares.map(async (fw) => {
      if (fw.id) {
        formFirmwareIds.add(fw.id);
        await axiosInstance.put(`/firmware/${fw.id}`, fw);
      } else {
        await axiosInstance.post('/firmware', { ...fw, devicetype_id: state.selectedId });
      }
    }));

    // Handle hardwares
    await Promise.all(hardwares.map(async (hw) => {
      if (hw.id) {
        formHardwareIds.add(hw.id);
        await axiosInstance.put(`/hardware/${hw.id}`, hw);
      } else {
        await axiosInstance.post('/hardware', { ...hw, devicetype_id: state.selectedId });
      }
    }));

    // Delete removed firmwares
    for (const [id] of existingFirmwareMap) {
      if (!formFirmwareIds.has(id)) {
        await axiosInstance.delete(`/firmware/${id}`);
      }
    }

    // Delete removed hardwares
    for (const [id] of existingHardwareMap) {
      if (!formHardwareIds.has(id)) {
        await axiosInstance.delete(`/hardware/${id}`);
      }
    }

    toast.success('Device type updated.');
    closeForm();
    await loadDeviceTypes();
  } catch (error) {
    console.error(error);
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

// Firmware / Hardware Helpers
const addFirmware = () => {
  state.form.firmwares.push({ version: '', filename: '', repo_url: '', is_active: true });
};
const removeFirmware = (index) => {
  state.form.firmwares.splice(index, 1);
};

const addHardware = () => {
  state.form.hardwares.push({ version: '', name: '', description: '', is_active: true });
};
const removeHardware = (index) => {
  state.form.hardwares.splice(index, 1);
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
              <th class="px-6 py-4">Name</th>
              <th class="px-6 py-4">Active HW Version</th>
              <th class="px-6 py-4">Active FW Version</th>
              <th class="px-6 py-4">Active FW Date</th>
              <th class="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="type in state.deviceTypes" :key="type.id" class="border-b hover:bg-blue-50 transition">
              <td class="px-6 py-4">{{ type.name }}</td>
              <td class="px-6 py-4">{{ type.hw_version || '-' }}</td>
              <td class="px-6 py-4">{{ type.fw_version || '-' }}</td>
                <td class="px-6 py-4">
                {{ type.fw_date ? new Date(type.fw_date).toLocaleDateString() : '-' }}
                </td>
              <td class="px-6 py-4 flex gap-2">
                <button @click="openEditForm(type)"
                  class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs">
                  Edit
                </button>
                <button @click="deleteDeviceType(type.id)"
                  class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs">
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

        <!-- Inside the Modal Form -->
        <form @submit.prevent="submitForm" class="space-y-4">

          <div>
            <label class="block text-sm font-medium mb-1">Name</label>
            <input v-model="state.form.name" class="w-full border px-3 py-2 rounded" required />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Description</label>
            <input v-model="state.form.description" class="w-full border px-3 py-2 rounded" />
          </div>

          <!-- Firmware Versions -->
          <div>
            <div class="flex justify-between items-center">
              <label class="block text-sm font-bold text-blue-700">Firmware Versions</label>
              <button @click.prevent="addFirmware" class="text-xs text-blue-600 hover:underline">+ Add</button>
            </div>
            <div v-for="(fw, index) in state.form.firmwares" :key="index" class="border p-2 mt-2 rounded space-y-2">
              <div>
                <label class="text-sm font-medium">Version</label>
                <input v-model="fw.version" placeholder="Version" class="w-full border px-2 py-1 rounded" />
              </div>
              <div>
                <label class="text-sm font-medium">Filename</label>
                <input v-model="fw.filename" placeholder="Filename" class="w-full border px-2 py-1 rounded" />
              </div>
              <div>
                <label class="text-sm font-medium">Repository URL</label>
                <input v-model="fw.repo_url" placeholder="Repo URL" class="w-full border px-2 py-1 rounded" />
              </div>
              <label class="flex items-center gap-2">
                <input type="radio" :name="'activeFirmware'" :value="index" v-model="activeFirmwareIndex"
                  @change="setActiveFirmware(index)" />
                Active
              </label>
              <button @click.prevent="removeFirmware(index)" class="text-red-500 text-xs">Remove</button>
            </div>
          </div>

          <!-- Hardware Versions -->
          <div>
            <div class="flex justify-between items-center mt-4">
              <label class="block text-sm font-bold text-blue-700">Hardware Versions</label>
              <button @click.prevent="addHardware" class="text-xs text-blue-600 hover:underline">+ Add</button>
            </div>
            <div v-for="(hw, index) in state.form.hardwares" :key="index" class="border p-2 mt-2 rounded space-y-2">
              <div>
                <label class="text-sm font-medium">Version</label>
                <input v-model="hw.version" placeholder="Version" class="w-full border px-2 py-1 rounded" />
              </div>
              <div>
                <label class="text-sm font-medium">Name</label>
                <input v-model="hw.name" placeholder="Name" class="w-full border px-2 py-1 rounded" />
              </div>
              <div>
                <label class="text-sm font-medium">Description</label>
                <input v-model="hw.description" placeholder="Description" class="w-full border px-2 py-1 rounded" />
              </div>
              <label class="flex items-center gap-2">
                <input type="radio" :name="'activeHardware'" :value="index" v-model="activeHardwareIndex"
                  @change="setActiveHardware(index)" />
                Active
              </label>
              <button @click.prevent="removeHardware(index)" class="text-red-500 text-xs">Remove</button>
            </div>
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
