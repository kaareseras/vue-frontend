<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Card from '../components/Card.vue'
import { RouterLink, useRouter } from 'vue-router'

const devices = ref([])
const router = useRouter()

const token = localStorage.getItem('token')
const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  headers: {
    Authorization: `Bearer ${token}`,
  },
})

const fetchDevices = async () => {
  try {
    const response = await axiosInstance.get('/device')
    devices.value = response.data
  } catch (error) {
    console.error('Error fetching devices:', error)
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleString()
}

const showDetails = (device) => {
  router.push(`/device/${device.uuid}`)
}

onMounted(fetchDevices)
</script>
<template>
  <section class="py-4">
    <div class="container-xl lg:container m-auto">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg">
        <Card>
          <h2 class="text-2xl font-bold">Bought a Powergy device</h2>
          <p class="mt-2 mb-4">
            Click here to adopt your device and start using it
          </p>
          <RouterLink to="/user/deviceadoption" class="inline-block bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-700">
            Adopt Device
          </RouterLink>
        </Card>

        <!-- One card per device -->
        <Card v-for="device in devices" :key="device.uuid" class="min-h-[280px] overflow-hidden">
          <div class="flex h-full items-stretch gap-6">
            <!-- Left: Device Info -->
            <div class="flex-2 flex flex-col justify-between py-2">
              <div>
                <h2 class="text-2xl font-bold mb-2">{{ device.name }}</h2>
                <p><strong>UUID:</strong> {{ device.uuid }}</p>
                <p><strong>Created at:</strong> {{ formatDate(device.created_at) }}</p>
                <p><strong>Last activity:</strong> {{ formatDate(device.last_activity) }}</p>
              </div>
              <button class="inline-block bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-700 mt-4 w-fit"
                @click="showDetails(device)">
                Details
              </button>
            </div>

            <!-- Right: Big Tablet Icon -->
            <div class="flex-2 flex flex-col items-center justify-center min-w-[180px] p-2 flex-grow-0">
              <!-- Image -->
              <div class="md:w-1/2">
                <img src="@/assets/img/Device_sale_picture.png" alt="Device Sale"
                  class="w-full h-full object-cover rounded-lg" />
              </div>
            </div>
          </div>
        </Card>

      </div>
    </div>
  </section>
</template>
