<script setup>
import { ref, defineProps } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

const props = defineProps({
  username: String,
  showRegister: Boolean,
});


const username = ref(props.username || '')
const password = ref('')
const loading = ref(false)
const error = ref(null)

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

username.value = auth.user.email || ''

async function forgotPassword() {
    try {
        const response = await fetch('http://localhost:8000/auth/forgot-password', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${auth.token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: username.value
            })
        })

        if (!response.ok) throw new Error('Failed to save changes')

        toast.success('Password reset email sent successfully!')
        router.push('/')
    } catch (err) {
        console.error(err)
        toast.error('Could not update user details.')
    }

}
</script>

<template>
    <div class="login-container">
        <section class="bg-green-50">
            <div class="container m-auto max-w-2xl py-24">
                <div class="bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0">
                    <form @submit.prevent="forgotPassword">
                        <h2 class="text-3xl text-center font-semibold mb-6">Reset Password</h2>
                        <div class="mb-4">
                            <label class="block text-gray-700 font-bold mb-2">Username:</label>
                            <input v-model="username" id="username" required  class="border rounded w-full py-2 px-3 mb-2" placeholder="my.mail@domain.com"/>
                        </div>
                        <button 
                        class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline"
                        type="submit" :disabled="loading">Send password reset mail</button>
                        <p v-if="error" class="error">{{ error }}</p>
                        <p class="text-center text-gray-500 text-xs mt-4">Don't have an account? <router-link to="/usercreate" class="text-green-500 hover:text-green-700">Register</router-link></p>
                    </form>

                </div>
            </div>
        </section>

    </div>
</template>
