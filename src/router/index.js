import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth'

import SplashView from '@/views/SplashView.vue';
import HomeView from '@/views/HomeView.vue';
import NotFoundView from '@/views/NotFoundView.vue';
import LoginView from '@/views/LoginView.vue'
import UserSettingsView from '@/views/UserSettingsView.vue'
import UserCreateView from '@/views/UserCreateView.vue';
import AccountVerifyView from '@/views/AccountVerifyView.vue';
import ForgotPasswordView from '@/views/ForgotPasswordView.vue';
import ResetPasswordView from '@/views/ResetPasswordView.vue';
import AdminDashboardView from '@/views/AdminDashboardView.vue';
import AdminUserManagementView from '@/views/AdminUserManagementView.vue';
import AdminChargeOwnerView from '@/views/AdminChargeOwnerView.vue';
import AdminChargeView from '@/views/AdminChargeView.vue';
import AdminTaxView from '@/views/AdminTaxView.vue'
import AdminTarifView from '@/views/AdminTarifView.vue'
import AdminSpotView from '@/views/AdminSpotView.vue'
import AdminDeviceView from '@/views/AdminDeviceView.vue';
import UserAdoptDeviceView from '@/views/UserAdoptDeviceView.vue';



const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'splash',
            component: SplashView
        },
        {
            path: '/home',
            name: 'home',
            component: HomeView,
            meta: { requiresAuth: true }
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView
        },
        {
            path: '/user',
            name: 'UserSettings',
            component: UserSettingsView,
            meta: { requiresAuth: true }
        },
        {
            path: '/usercreate',
            name: 'user-create',
            component: UserCreateView
        },
        {
            path: '/auth/account-verify',
            name: 'AccountVerify',
            component: AccountVerifyView
        },
        {
            path: '/forgot-password',
            name: 'forgot-password',
            component: ForgotPasswordView
        },
        {
            path: '/reset-password',
            name: 'reset-password',
            component: ResetPasswordView,
            meta: { requiresAuth: true }
        },  
        {
            path: '/admin',
            name: 'admin-dashboard',
            component: AdminDashboardView,
            meta: { requiresAuth: true }
        },       
        {
            path: '/admin/users',
            name: 'admin-user-management',
            component: AdminUserManagementView,
            meta: { requiresAuth: true }
        },
        {
            path: '/admin/charge-owners',
            name: 'charge-owners-management',
            component: AdminChargeOwnerView,
            meta: { requiresAuth: true }
        },
        {
            path: '/admin/charges',
            name: 'charge-management',
            component: AdminChargeView,
            meta: { requiresAuth: true }
        },
        {
            path: '/admin/tarifs',
            name: 'tarif-management',
            component: AdminTarifView,
            meta: { requiresAuth: true }
        },
        {
            path: '/admin/taxes',
            name: 'tax-management',
            component: AdminTaxView,
            meta: { requiresAuth: true }
        },
        {
            path: '/admin/spotprices',
            name: 'spot-management',
            component: AdminSpotView,
            meta: { requiresAuth: true }
        },
        {
            path: '/admin/devices',
            name: 'device-management',
            component: AdminDeviceView,
            meta: { requiresAuth: true }
        },
        {
            path: '/user/deviceadoption/:uuid?',
            name: 'device-adoption',
            component: UserAdoptDeviceView,
            meta: { requiresAuth: true }
        },
        {
            path: '/:catchAll(.*)',
            name: 'not-found',
            component: NotFoundView
        },
        

    ]
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    // Optionally store the path to redirect to after login
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router;
