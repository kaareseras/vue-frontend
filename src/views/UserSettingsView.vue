<script setup>
import { reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';

const auth = useAuthStore()
const router = useRouter()
const toast = useToast()

const state = reactive({
    isLoading: true,
});

// Reactive user object for binding form fields
const user = reactive({
    id: null,
    name: '',
    email: '',
    is_active: true,
    is_admin: false,
    created_at: ''
})

onMounted(async () => {
    try {
        const response = await fetch('/api/users/me', {
            headers: {
                Authorization: `Bearer ${auth.token}`
            }
        })
        if (!response.ok) throw new Error('Could not fetch user data')

        const userData = await response.json()
        Object.assign(user, userData) // Assign the fetched data to the reactive user object
    } catch (err) {
        console.error(err)
        toast.error('Error loading data')
        router.push('/login') // Redirect to login if fetching fails
    }
    finally {
        state.isLoading = false;
    }
})

async function saveChanges() {
    try {
        const response = await fetch('/api/users/update', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${auth.token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: user.name,
                email: user.email
            })
        })

        if (!response.ok) throw new Error('Failed to save changes')

        toast.success('User details updated successfully!')
    } catch (err) {
        console.error(err)
        toast.error('Could not update user details.')
    }

}





function logout() {
    auth.logout()
    toast.success('Logged out!')
    router.push('/')
}
</script>

<template>
    <div class="login-container">
        <section v-if="!state.isLoading" class="bg-green-50">
            <div class="container m-auto max-w-2xl py-24">
                <div class="bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0">
                    <h2 class="text-3xl text-center font-semibold mb-6">User Settings</h2>

                    <div v-if="user">
                        <!-- Update Username -->
                        <div class="mb-4">
                            <label class="block text-gray-700 font-bold mb-2">Username:</label>
                            <input v-model="user.name" class="border rounded w-full py-2 px-3" />
                        </div>

                        <!-- Update Email with Warning -->
                        <div class="mb-4">
                            <label class="block text-gray-700 font-bold mb-2">Email:</label>
                            <input v-model="user.email" class="border rounded w-full py-2 px-3" />
                            <p class="text-sm text-gray-500 mt-2">
                                Changing your email will invalidate your current session. A new verification link will
                                be sent to the new email.
                            </p>
                        </div>
                        <p class="text-center text-gray-500 text-xs mt-4">Forgot your password? <router-link to="/forgot-password"  class="text-green-500 hover:text-green-700">Password reset</router-link></p>

                        <button @click="saveChanges"
                            class="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full w-full">
                            <i class="pi pi-save mr-3"></i>
                            Save Changes
                        </button>

                        <button
                            class="mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full w-full"
                            @click="logout">

                            <i class="pi pi-sign-out mr-3"></i>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </section>
        <div v-if="state.isLoading" class="text-center text-gray-500 py-6">
            <PulseLoader />
        </div>
    </div>
</template>