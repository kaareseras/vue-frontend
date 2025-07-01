<script setup>
import { reactive, defineProps, onMounted } from 'vue';

import AdminTask from '@/components/AdminTask.vue';


//https://primevue.org/icons/
const tasks = reactive([
  {
    title: 'User Management',
    description: 'Manage users and their roles',
    route: 'users',
    icon: 'pi-users'
  },
  {
    title: 'Device Management',
    description: 'Manage devices and their configurations',
    route: 'devices',
    icon: 'pi-tablet'
  },
    {
    title: 'DeviceType Management',
    description: 'Manage device types and their configurations',
    route: 'devicetype',
    icon: 'pi-copy'
  },
]);

const pricingTasks = reactive([
  {
    title: 'Charge Owner Management',
    description: 'Manage charge owners and their roles',
    route: 'charge-owners',
    icon: 'pi-crown'
  },
  {
    title: 'Charge Management',
    description: 'Manage charge devices and their configurations',
    route: 'charges',
    icon: 'pi-bolt'
  },
  {
    title: 'Tax Management',
    description: 'Manage charges and their configurations',
    route: 'taxes',
    icon: 'pi-wallet'
  },
  {
    title: 'Tarif Management',
    description: 'Manage tarifs and their configurations',
    route: 'tarifs',
    icon: 'pi-dollar'
  },
    {
    title: 'Spotprice Management',
    description: 'Manage spot prices and their configurations',
    route: 'spotprices',
    icon: 'pi-chart-line'
  },
]);

</script>


<template>

    <section class="bg-blue-50 px-4 py-10">
      <div class="container-xl lg:container mx-auto">
        <h2 class="text-3xl font-bold text-green-500 text-center mb-6">
          User/Device Administration
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AdminTask v-for="task in tasks" :key="task.title" :task="task" />
        </div>

      </div>
    </section>

    <section class="bg-blue-50 px-4 py-10">
      <div class="container-xl lg:container mx-auto">
        <h2 class="text-3xl font-bold text-green-500 text-center mb-6">
          Pricing Administration
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AdminTask v-for="task in pricingTasks" :key="task.title" :task="task" />
        </div>
      </div>
    </section>
</template>