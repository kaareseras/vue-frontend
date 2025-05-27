import { createRouter, createWebHistory } from 'vue-router';
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



const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView
        },
        {
            path: '/user',
            name: 'UserSettings',
            component: UserSettingsView
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
            component: ResetPasswordView
        },  
        {
            path: '/admin',
            name: 'admin-dashboard',
            component: AdminDashboardView
        },       
        {
            path: '/admin/users',
            name: 'admin-user-management',
            component: AdminUserManagementView
        },
        {
            path: '/admin/charge-owners',
            name: 'charge-owners-management',
            component: AdminChargeOwnerView
        },
        {
            path: '/admin/charges',
            name: 'charge-management',
            component: AdminChargeView
        },
        {
            path: '/admin/tarifs',
            name: 'tarif-management',
            component: AdminTarifView
        },
        {
            path: '/admin/taxes',
            name: 'tax-management',
            component: AdminTaxView
        },
        {
            path: '/:catchAll(.*)',
            name: 'not-found',
            component: NotFoundView
        },
        

    ]
});

export default router;
