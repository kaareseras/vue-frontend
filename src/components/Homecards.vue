<script setup>
import Card from '../components/Card.vue';
import { RouterLink } from 'vue-router';
</script>

<template>
<section class="py-4">
      <div class="container-xl lg:container m-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg">
          <Card>
            <h2 class="text-2xl font-bold">Bought a Powergy device</h2>
            <p class="mt-2 mb-4">
              Clik here to register your device and start using it
            </p>
            <RouterLink
              to="/usercreate"
              class="inline-block bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-700"
            >
              Sign up
            </RouterLink>
          </Card>
          <Card bg="bg-green-100">
            <h2 class="text-2xl font-bold">Would like to know more?</h2>
            <p class="mt-2 mb-4">
              Find aout more about Powergy and how it can help you save energy
              and money.
            </p>
            <RouterLink
              to="/about"
              class="inline-block bg-green-500 text-white rounded-lg px-4 py-2 hover:bg-green-600"
            >
              Know more?
            </RouterLink>
          </Card>
        </div>
      </div>
    </section>

</template>