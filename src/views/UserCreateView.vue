<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

const toast = useToast()
const router = useRouter()

const form = reactive({
  username: '',
  email: '',
  password: '',
  repeatPassword: ''
})

const loading = ref(false)
const error = ref('')
const success = ref('')

// Samme specialtegn som serveren bruger
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

async function handleSignup() {
  error.value = ''
  success.value = ''
  loading.value = true

  if (passwordMismatch.value || passwordTooWeak.value) {
    error.value = 'Tjek at dine passwords matcher og er stærke nok.'
    loading.value = false
    return
  }

  try {
    const response = await fetch('http://api/users', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: form.username,
        email: form.email,
        password: form.password
      })
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.detail || 'Signup failed')
    }

    success.value = 'Signup successful! Please check your email to confirm your account.'
    form.username = ''
    form.email = ''
    form.password = ''
    form.repeatPassword = ''
    toast.success(success.value)
    router.push('/')

  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>


<template>
  <div class="login-container">
    <section class="bg-green-50">
      <div class="container m-auto max-w-2xl py-24">
        <div class="bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0">
          <form @submit.prevent="handleSignup">
            <h2 class="text-3xl text-center font-semibold mb-6">Create an Account</h2>

            <!-- Username -->
            <div class="mb-4">
              <label class="block text-gray-700 font-bold mb-2">Username:</label>
              <input v-model="form.username" id="username" required class="border rounded w-full py-2 px-3 mb-2"
                placeholder="Your name" />
            </div>

            <!-- Email -->
            <div class="mb-4">
              <label class="block text-gray-700 font-bold mb-2">Email:</label>
              <input v-model="form.email" id="email" type="email" required class="border rounded w-full py-2 px-3 mb-2"
                placeholder="you@example.com" />
            </div>

            <!-- Password -->
            <div class="mb-4">
              <label class="block text-gray-700 font-bold mb-2">Password:</label>
              <input v-model="form.password" id="password" type="password" required
                class="border rounded w-full py-2 px-3 mb-2" />
            </div>

            <!-- Repeat Password -->
            <div class="mb-4">
              <label class="block text-gray-700 font-bold mb-2">Repeat Password:</label>
              <input v-model="form.repeatPassword" type="password" required class="border rounded w-full py-2 px-3 mb-2"
                :class="{ 'border-red-500': passwordMismatch }" />
              <p v-if="passwordMismatch" class="text-red-500 text-sm">Passwords do not match</p>
            </div>

            <!-- Password strength error -->
            <p v-if="passwordTooWeak" class="text-red-500 text-sm mb-4">
              Password skal være mindst 8 tegn og indeholde store og små bogstaver, et tal og et specialtegn.
            </p>

            <!-- Submit -->
            <button
              class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline"
              type="submit" :disabled="loading || passwordMismatch || passwordTooWeak">
              Sign Up
            </button>

            <!-- Feedback -->
            <p v-if="error" class="text-red-500 mt-4 text-center">{{ error }}</p>
            <p v-if="success" class="text-green-600 mt-4 text-center">{{ success }}</p>
          </form>

          <p class="text-center text-gray-500 text-xs mt-4">Already have an account? <router-link to="/login"
              class="text-green-500 hover:text-green-700">Login</router-link></p>
        </div>
      </div>
    </section>
  </div>
</template>
