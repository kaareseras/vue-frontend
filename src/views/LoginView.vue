<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref(null)

const router = useRouter()
const auth = useAuthStore()

async function handleLogin() {
    error.value = null
    loading.value = true
    try {
        await auth.login(username.value, password.value)
        router.push('/') // Gå til forsiden efter login
    } catch (err) {
        error.value = 'Login mislykkedes. Tjek dine oplysninger.'
    } finally {
        loading.value = false
    }
}

async function forgotPassword() {
    router.push('/forgot-password')

}
</script>

<template>
    <div class="login-container">
        <section class="bg-green-50">
            <div class="container m-auto max-w-2xl py-24">
                <div class="bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0">
                    <form @submit.prevent="handleLogin">
                        <h2 class="text-3xl text-center font-semibold mb-6">Login</h2>
                        <div class="mb-4">
                            <label class="block text-gray-700 font-bold mb-2">Username:</label>
                            <input v-model="username" id="username" required  class="border rounded w-full py-2 px-3 mb-2" placeholder="my.mail@domain.com"/>
                        </div>
                        <div>
                            <label class="block text-gray-700 font-bold mb-2">Password:</label>
                            <input v-model="password" id="password" type="password" required class="border rounded w-full py-2 px-3 mb-2"/>
                        </div>
                        <button 
                        class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline"
                        type="submit" :disabled="loading">Login</button>
                        <p v-if="error" class="error">{{ error }}</p>
                    </form>

                    <p class="text-center text-gray-500 text-xs mt-4">Forgot your password? <router-link to="/forgot-password" class="text-green-500 hover:text-green-700">Password reset</router-link></p>
                    <p class="text-center text-gray-500 text-xs mt-4">Don't have an account? <router-link to="/usercreate" class="text-green-500 hover:text-green-700">Register</router-link></p>
                </div>
            </div>
        </section>

    </div>
</template>
