<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const form = reactive({
  password: '',
  repeatPassword: ''
})

const token = ref('')
const email = ref('')
const status = ref('ready') // 'ready', 'submitting', 'success', 'error'
const error = ref('')
const success = ref('')

const SPECIAL_CHARACTERS = ['@', '#', '$', '%', '=', ':', '?', '.', '/', '|', '~', '>', '!']

function isPasswordStrong(password) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    new RegExp(`[${SPECIAL_CHARACTERS.join('\\')}]`).test(password)
  )
}

const passwordMismatch = computed(() => form.password !== form.repeatPassword && form.repeatPassword.length > 0)
const passwordTooWeak = computed(() => form.password.length > 0 && !isPasswordStrong(form.password))

onMounted(() => {
  token.value = route.query.token
  email.value = route.query.email

  if (!token.value || !email.value) {
    status.value = 'error'
    error.value = 'Ugyldigt link – mangler token eller email.'
  }
})

async function handleReset() {
  error.value = ''
  success.value = ''
  status.value = 'submitting'

  if (passwordMismatch.value || passwordTooWeak.value) {
    error.value = 'Sørg for at dine passwords matcher og er stærke nok.'
    status.value = 'ready'
    return
  }

  try {
    const response = await fetch('/api/auth/reset-password', {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: token.value,
        email: email.value,
        password: form.password
      })
    })

    if (!response.ok) {
      const data = await response.json()

      throw new Error(data.detail || 'Nulstilling mislykkedes')
    }

    success.value = 'Adgangskoden er nulstillet! Du kan nu logge ind.'
    status.value = 'success'
    setTimeout(() => router.push('/login'), 4000)
  } catch (err) {
    error.value = err.message
    status.value = 'error'
  }
}
</script>

<template>
    <section class="bg-green-50 min-h-screen flex items-center justify-center">
      <div class="bg-white p-8 rounded-md shadow-md text-center max-w-md w-full">
        <h2 class="text-2xl font-semibold mb-6">Nulstil Adgangskode</h2>
  
        <form v-if="status === 'ready' || status === 'submitting'" @submit.prevent="handleReset">
          <div class="mb-4 text-left">
            <label class="block text-gray-700 font-bold mb-2">Ny adgangskode:</label>
            <input
              v-model="form.password"
              type="password"
              class="border rounded w-full py-2 px-3"
              required
              :class="{ 'border-red-500': passwordTooWeak }"
            />
          </div>
  
          <div class="mb-4 text-left">
            <label class="block text-gray-700 font-bold mb-2">Gentag adgangskode:</label>
            <input
              v-model="form.repeatPassword"
              type="password"
              class="border rounded w-full py-2 px-3"
              required
              :class="{ 'border-red-500': passwordMismatch }"
            />
          </div>
  
          <p v-if="passwordTooWeak" class="text-red-500 text-sm mb-2">
            Koden skal være mindst 8 tegn, have store og små bogstaver, tal og et specialtegn.
          </p>
          <p v-if="passwordMismatch" class="text-red-500 text-sm mb-2">Koderne matcher ikke.</p>
          <p v-if="error" class="text-red-500 text-sm mb-2">{{ error }}</p>
  
          <button
            type="submit"
            class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full w-full"
            :disabled="status === 'submitting'"
          >
            Nulstil adgangskode
          </button>
        </form>
  
        <div v-if="status === 'success'" class="text-green-600 font-semibold">
          {{ success }}
        </div>
        <div v-if="status === 'error' && !form.password" class="text-red-600 font-semibold">
          {{ error }}
        </div>
      </div>
    </section>
  </template>
  