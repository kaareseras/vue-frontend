<script setup>
import { reactive, onMounted } from 'vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';
import BackButton from '@/components/BackButton.vue';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';
import { QrcodeStream } from 'vue-qrcode-reader';

const toast = useToast();

const token = localStorage.getItem('token');
const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const state = reactive({
  devices: [],
  chargeOwners: [],
  isLoading: true,
  error404: false,
  showNewForm: false,
  isEditMode: false,
  selectedUUID: '',
  useManualUUID: false,
  newForm: {
    name: '',
    user_id: null,
    chargeowner_id: null,
    PriceArea: '',
    Config: '',
    last_activity: '',
    created_at: '',
    is_adopted: false,
    adopted_at: '',
    is_blocked: false,
    blocked_at: '',
  },
});

const loadDevices = async () => {
  state.isLoading = true;
  state.error404 = false;
  try {
    const response = await axiosInstance.get('/device/all');
    state.devices = response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      state.error404 = true;
      state.devices = [];
    } else {
      toast.error('Failed to load devices. ' + error.message);
    }
  } finally {
    state.isLoading = false;
  }
};

const loadChargeOwners = async () => {
  try {
    const response = await axiosInstance.get('/chargeowner');
    state.chargeOwners = response.data;
  } catch (error) {
    toast.error('Failed to load charge owners.');
  }
};

const deleteDevice = async (uuid) => {
  if (!confirm('Are you sure you want to delete this device?')) return;
  try {
    await axiosInstance.delete(`/device/${uuid}`);
    toast.success('Device deleted.');
    await loadDevices();
  } catch (error) {
    toast.error('Failed to delete device.');
  }
};

const openNewForm = () => {
  state.selectedUUID = '';
  state.useManualUUID = false;
  state.newForm = {
    name: '',
    user_id: null,
    chargeowner_id: null,
    PriceArea: '',
    Config: '',
    last_activity: '',
    created_at: '',
    is_adopted: false,
    adopted_at: '',
    is_blocked: false,
    blocked_at: '',
  };
  state.isEditMode = false;
  state.showNewForm = true;
};

const onDetect = ([qr]) => {
  const uuid = qr.rawValue;
  state.selectedUUID = uuid;
  state.useManualUUID = false;
  toast.success('QR Code detected.');
};

const closeNewForm = () => {
  state.showNewForm = false;
  state.selectedUUID = '';
  state.useManualUUID = false;
};

const createDevice = async () => {
  if (!state.selectedUUID) {
    toast.error('UUID is required.');
    return;
  }

  try {
    await axiosInstance.post(`/device/${state.selectedUUID}`, {});
    toast.success('Device created.');
    closeNewForm();
    await loadDevices();
  } catch (error) {
    toast.error('Failed to create device.');
  }
};

const openEditForm = (device) => {
  state.selectedUUID = device.uuid;
  state.newForm = {
    name: device.name,
    user_id: device.user_id,
    chargeowner_id: device.chargeowner_id,
    PriceArea: device.PriceArea,
    Config: device.Config,
    last_activity: device.last_activity,
    created_at: device.created_at,
    is_adopted: device.is_adopted,
    adopted_at: device.adopted_at,
    is_blocked: device.is_blocked,
    blocked_at: device.blocked_at,
  };
  state.isEditMode = true;
  state.showNewForm = true;
};

const updateDevice = async () => {
  try {
    await axiosInstance.put(`/device/${state.selectedUUID}`, state.newForm);
    toast.success('Device updated.');
    closeNewForm();
    await loadDevices();
  } catch (error) {
    toast.error('Failed to update device.');
  }
};

const submitForm = () => {
  if (state.isEditMode) {
    updateDevice();
  } else {
    createDevice();
  }
};

onMounted(() => {
  loadDevices();
  loadChargeOwners();
});
</script>

<template>
  <section class="bg-blue-50 min-h-screen px-6 py-10">
    <BackButton />
    <h1 class="text-3xl font-bold text-blue-700 mb-4 text-center">Devices</h1>

    <div class="flex justify-center mb-6">
      <button @click="openNewForm" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow">
        New Device
      </button>
    </div>

    <div v-if="state.isLoading" class="flex justify-center mt-10">
      <PulseLoader :loading="true" color="#2563EB" size="12px" />
    </div>

    <div v-else-if="state.error404 || state.devices.length === 0" class="text-center text-gray-500">
      No devices found.
    </div>

    <div v-else>
      <div class="overflow-x-auto bg-white rounded-xl shadow-md">
        <table class="min-w-full table-auto text-sm text-left text-gray-700">
          <thead class="bg-blue-100 text-blue-800 uppercase text-xs">
            <tr>
              <th class="px-6 py-4">UUID</th>
              <th class="px-6 py-4">Name</th>
              <th class="px-6 py-4">Price Area</th>
              <th class="px-6 py-4">Adopted</th>
              <th class="px-6 py-4">Blocked</th>
              <th class="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="device in state.devices" :key="device.uuid" class="border-b hover:bg-blue-50 transition">
              <td class="px-6 py-4">{{ device.uuid }}</td>
              <td class="px-6 py-4">{{ device.name }}</td>
              <td class="px-6 py-4">{{ device.PriceArea }}</td>
              <td class="px-6 py-4">{{ device.is_adopted ? 'Yes' : 'No' }}</td>
              <td class="px-6 py-4">{{ device.is_blocked ? 'Yes' : 'No' }}</td>
              <td class="px-6 py-4 flex gap-2">
                <button
                  v-if="device.is_adopted"
                  @click="openEditForm(device)"
                  class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs"
                >
                  Edit
                </button>
                <button
                  @click="deleteDevice(device.uuid)"
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

    <!-- Modal -->
    <div v-if="state.showNewForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white p-6 rounded-xl shadow-lg w-full max-w-xl">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-blue-700">
            {{ state.isEditMode ? 'Edit Device' : 'Add Device' }}
          </h2>
          <button @click="closeNewForm" class="text-gray-400 hover:text-red-500 text-2xl font-bold">&times;</button>
        </div>

        <form @submit.prevent="submitForm" class="space-y-4">
          <!-- UUID Input -->
          <div v-if="!state.isEditMode">
            <label class="block text-sm font-medium mb-1">UUID</label>

            <div class="flex items-center gap-2">
              <input
                v-model="state.selectedUUID"
                :readonly="!state.useManualUUID"
                class="w-full border px-3 py-2 rounded bg-gray-100 text-gray-700"
                :class="{ 'bg-white text-black': state.useManualUUID }"
                placeholder="Scan QR or enter UUID"
              />
              <button
                type="button"
                @click="state.useManualUUID = !state.useManualUUID"
                class="text-sm px-2 py-1 rounded border hover:bg-gray-100"
              >
                {{ state.useManualUUID ? 'Use QR' : 'Enter Manually' }}
              </button>
            </div>

            <div v-if="!state.useManualUUID && !state.selectedUUID" class="border mt-2 rounded overflow-hidden">
              <QrcodeStream
                @detect="onDetect"
                :paused="!!state.selectedUUID"
                @init="(p) => p.catch(e => toast.error('Camera error: ' + e.message))"
              />
            </div>
          </div>

          <!-- Edit Fields -->
          <template v-if="state.isEditMode">
            <div>
              <label class="block text-sm font-medium mb-1">Name</label>
              <input v-model="state.newForm.name" class="w-full border px-3 py-2 rounded" />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Charge Owner</label>
              <select v-model="state.newForm.chargeowner_id" class="w-full border px-3 py-2 rounded">
                <option disabled value="">Select Owner</option>
                <option v-for="owner in state.chargeOwners" :key="owner.id" :value="owner.id">
                  {{ owner.name }} ({{ owner.glnnumber }})
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Price Area</label>
              <select v-model="state.newForm.PriceArea" class="w-full border px-3 py-2 rounded">
                <option value="DK1">DK1</option>
                <option value="DK2">DK2</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Config</label>
              <input v-model="state.newForm.Config" class="w-full border px-3 py-2 rounded" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Adopted</label>
                <input type="checkbox" v-model="state.newForm.is_adopted" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Blocked</label>
                <input type="checkbox" v-model="state.newForm.is_blocked" />
              </div>
            </div>
          </template>

          <!-- Submit Buttons -->
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
  </section>
</template>
