<script setup>
import logo from '@/assets/img/logo.png';
import { RouterLink, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue';

const auth = useAuthStore()

let username = '';

if (auth.user) {
    username = auth.user.name
}

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
                            <RouterLink to="/home"
                                :class="[isActiveLink('/home') ? 'bg-green-900' : 'hover:bg-gray-900 hover:text-white', 'text-white', 'hover:text-white', 'rounded-md', 'px-3', 'py-2']">
                                <i class="pi pi-home"></i>
                            </RouterLink>



                            <RouterLink v-if="auth.isAdmin" to="/admin"
                                :class="[isActiveLink('/admin') ? 'bg-green-900' : 'hover:bg-gray-900', 'text-white', 'hover:text-white', 'rounded-md', 'px-3', 'py-2']">
                                <i class="pi pi-cog"></i>
                                Admin                                
                            </RouterLink>

                            <RouterLink v-if="auth.isAuthenticated" to="/user"
                                :class="[isActiveLink('/user') ? 'bg-green-900' : 'hover:bg-gray-900', 'text-white', 'hover:text-white', 'rounded-md', 'px-3', 'py-2']">
                                
                                <div v-if="auth.user">
                                    <i class="pi pi-user"></i>
                                    {{ auth.user.name }}
                                </div>
                                
                                                 
                            </RouterLink>

                            <RouterLink v-if="!auth.isAuthenticated" to="/UserCreate"
                                :class="[isActiveLink('/UserCreate') ? 'bg-green-900' : 'hover:bg-gray-900', 'text-white', 'hover:text-white', 'rounded-md', 'px-3', 'py-2']">
                                <i class="pi pi-user-plus"></i>
                                Sign up
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