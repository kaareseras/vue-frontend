<script setup>
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';
import { reactive, onMounted, computed } from 'vue';
import axios from 'axios';
import BackButton from '@/components/BackButton.vue';
import { useToast } from 'vue-toastification';
import { RouterLink } from 'vue-router';

const state = reactive({
  users: [],
  isLoading: true,
  searchQuery: '',
});

const toast = useToast();

// Axios config med token og baseURL
const token = localStorage.getItem('token');
const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Filteret liste baseret på søgning
const filteredUsers = computed(() => {
  return state.users.filter((user) =>
    user.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(state.searchQuery.toLowerCase())
  );
});

const loadUsers = async () => {
  state.isLoading = true;
  try {
    const response = await axiosInstance.get('/users');
    state.users = response.data;
  } catch (error) {
    toast.error('Failed to load users.');
  } finally {
    state.isLoading = false;
  }
};

const toggleActive = async (user) => {
  try {
    const updated = { ...user, is_active: !user.is_active };
    await axiosInstance.put(`/users/${user.id}`, updated);
    toast.success(`User ${updated.is_active ? 'activated' : 'deactivated'}`);
    await loadUsers();
  } catch (error) {
    toast.error('Failed to update user status.');
  }
};

const deleteUser = async (id) => {
  if (!confirm('Are you sure you want to delete this user?')) return;

  try {
    await axiosInstance.delete(`/users/${id}`);
    toast.success('User deleted successfully.');
    await loadUsers();
  } catch (error) {
    toast.error('Failed to delete user.');
  }
};

onMounted(() => {
  loadUsers();
});
</script>

<template>
  
  <section class="bg-green-50 min-h-screen px-6 py-10">
    <BackButton />
    <h1 class="text-3xl font-bold text-green-700 mb-6 text-center">All Users</h1>

    <!-- Search Bar -->
    <div class="mb-6 max-w-md mx-auto">
      <input
        v-model="state.searchQuery"
        type="text"
        placeholder="Search by name or email..."
        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>

    <div v-if="!state.isLoading">
      <div class="overflow-x-auto bg-white rounded-xl shadow-md">
        <table class="min-w-full table-auto text-sm text-left text-gray-700">
          <thead class="bg-green-100 text-green-800 uppercase text-xs">
            <tr>
              <th class="px-6 py-4">Name</th>
              <th class="px-6 py-4">Email</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4">Role</th>
              <th class="px-6 py-4">Created</th>
              <th class="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              class="border-b hover:bg-green-50 transition"
            >
              <td class="px-6 py-4 font-medium text-gray-900">{{ user.name }}</td>
              <td class="px-6 py-4">{{ user.email }}</td>
              <td class="px-6 py-4">
                <span
                  :class="user.is_active ? 'text-green-700 font-semibold' : 'text-red-600 font-semibold'"
                >
                  {{ user.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span
                  :class="user.is_admin ? 'text-yellow-700 font-semibold' : 'text-gray-500'"
                >
                  {{ user.is_admin ? 'Admin' : 'User' }}
                </span>
              </td>
              <td class="px-6 py-4 text-xs text-gray-500">
                {{ new Date(user.created_at).toLocaleDateString() }}
              </td>
              <td class="px-6 py-4 flex flex-wrap gap-2 justify-center">
                <RouterLink
                  :to="`/admin/users/${user.id}`"
                  class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                >
                  View
                </RouterLink>
                <button
                  @click="toggleActive(user)"
                  :class="user.is_active
                    ? 'bg-yellow-500 hover:bg-yellow-600'
                    : 'bg-green-500 hover:bg-green-600'"
                  class="text-white px-3 py-1 rounded text-xs"
                >
                  {{ user.is_active ? 'Deactivate' : 'Activate' }}
                </button>
                <RouterLink
                  :to="`/admin/users/edit/${user.id}`"
                  class="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-xs"
                >
                  Edit
                </RouterLink>
                <button
                  @click="deleteUser(user.id)"
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

    <div v-else class="text-center text-gray-500 py-6">
      <PulseLoader />
    </div>
  </section>
</template>
