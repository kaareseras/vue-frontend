<script setup>
import logo from '@/assets/img/logo.png';
import { RouterLink, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const isActiveLink = (routePath) => {
    const route = useRoute();
    return route.path === routePath;
};
</script>

<template>

    <nav class="bg-green-700 border-b border-green-500">
        <div class="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div class="flex h-20 items-center justify-between">
                <div class="flex flex-1 items-center justify-center md:items-stretch md:justify-start">
                    <RouterLink class="flex flex-shrink-0 items-center mr-4" to="/">
                        <img class="h-10 w-auto" :src="logo" alt="Powergy logo" />
                        
                    </RouterLink>
                    <div class="md:ml-auto">
                        <div class="flex space-x-2">
                            <!-- home button  -->
                            <RouterLink to="/"
                                :class="[isActiveLink('/') ? 'bg-green-900' : 'hover:bg-gray-900 hover:text-white', 'text-white', 'hover:text-white', 'rounded-md', 'px-3', 'py-2']">
                                <i class="pi pi-home"></i>
                            </RouterLink>

                            <RouterLink to="/jobs"
                                :class="[isActiveLink('/jobs') ? 'bg-green-900' : 'hover:bg-gray-900', 'text-white', 'hover:text-white', 'rounded-md', 'px-3', 'py-2']">
                                Jobs</RouterLink>

                            <RouterLink to="/jobs/add"
                                :class="[isActiveLink('/jobs/add') ? 'bg-green-900' : 'hover:bg-gray-900', 'text-white', 'hover:text-white', 'rounded-md', 'px-3', 'py-2']">
                                Add Job</RouterLink>

                            <RouterLink v-if="auth.isAdmin" to="/admin"
                                :class="[isActiveLink('/admin') ? 'bg-green-900' : 'hover:bg-gray-900', 'text-white', 'hover:text-white', 'rounded-md', 'px-3', 'py-2']">
                                <i class="pi pi-cog"></i>
                                Admin                                
                            </RouterLink>

                            <RouterLink v-if="auth.isAuthenticated" to="/user"
                                :class="[isActiveLink('/user') ? 'bg-green-900' : 'hover:bg-gray-900', 'text-white', 'hover:text-white', 'rounded-md', 'px-3', 'py-2']">
                                <i class="pi pi-user"></i>
                                {{ auth.user.name}}                  
                            </RouterLink>

                            <RouterLink v-if="!auth.isAuthenticated" to="/UserCreate"
                                :class="[isActiveLink('/UserCreate') ? 'bg-green-900' : 'hover:bg-gray-900', 'text-white', 'hover:text-white', 'rounded-md', 'px-3', 'py-2']">
                                <i class="pi pi-user-plus"></i>
                                Register
                            </RouterLink>

                            <RouterLink v-if="!auth.isAuthenticated" to="/login"
                                :class="[isActiveLink('/login') ? 'bg-green-900' : 'hover:bg-gray-900', 'text-white', 'hover:text-white', 'rounded-md', 'px-3', 'py-2']">
                                <i class="pi pi-sign-in"></i>
                                Login
                            </RouterLink>


                        </div>
                    </div>
                </div>
            </div>
        </div>
    </nav>

</template>